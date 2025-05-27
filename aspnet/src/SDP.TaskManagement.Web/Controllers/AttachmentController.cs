using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using SDP.TaskManagement.Application.Abstractions;
using SDP.TaskManagement.Application.Dtos;
using SDP.TaskManagement.Application.Mappers;
using SDP.TaskManagement.Domain.Entities;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;

namespace SDP.TaskManagement.Web.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class AttachmentController : ControllerBase
{
    private readonly IRepository<Attachment> _attachmentRepository;
    private readonly IRepository<TaskItem> _taskRepository;
    private readonly IFileSystemService _fileSystemService;
    private readonly ILogger<AttachmentController> _logger;

    public AttachmentController(
        IRepository<Attachment> attachmentRepository,
        IRepository<TaskItem> taskRepository,
        IFileSystemService fileSystemService,
        ILogger<AttachmentController> logger)
    {
        _attachmentRepository = attachmentRepository;
        _taskRepository = taskRepository;
        _fileSystemService = fileSystemService;
        _logger = logger;
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<AttachmentDto>> GetAttachment(long id)
    {
        var userId = GetCurrentUserId();
        var attachment = await _attachmentRepository.GetByIdAsync(id);
        
        if (attachment == null)
            return NotFound();
            
        // Check if user has access to this attachment
        var task = await _taskRepository.GetByIdAsync(attachment.TaskItemId);
        if (task == null || !await CanAccessTaskAsync(task, userId))
            return Forbid();
            
        // Verify file exists
        var filePath = _fileSystemService.GetAttachmentPath(userId, attachment.TaskItemId, Path.GetFileName(attachment.FilePath));
        if (filePath == null)
            return NotFound("File not found on disk");
            
        return Ok(attachment.ToDto());
    }

    [HttpGet("task/{taskId}")]
    public async Task<ActionResult<IEnumerable<AttachmentDto>>> GetAttachmentsByTask(long taskId)
    {
        var userId = GetCurrentUserId();
        
        // Check if user has access to this task
        var task = await _taskRepository.GetByIdAsync(taskId);
        if (task == null || !await CanAccessTaskAsync(task, userId))
            return Forbid();
            
        var attachments = await _attachmentRepository.GetQueryable()
            .Where(a => a.TaskItemId == taskId)
            .ToListAsync();
        return Ok(attachments.Select(a => a.ToDto()));
    }

    [HttpPost("upload/{taskId}")]
    public async Task<ActionResult<AttachmentDto>> UploadAttachment(long taskId, IFormFile file)
    {
        var userId = GetCurrentUserId();
        
        // Check if user has access to this task
        var task = await _taskRepository.GetByIdAsync(taskId);
        if (task == null || !await CanAccessTaskAsync(task, userId))
            return Forbid();
            
        try
        {
            // Upload file
            var filePath = await _fileSystemService.UploadAttachmentAsync(userId, taskId, file);
            
            // Create attachment entity
            var attachment = new Attachment
            {
                FileName = file.FileName,
                FilePath = filePath,
                FileSize = file.Length,
                FileType = Path.GetExtension(file.FileName),
                UploadTime = DateTime.UtcNow,
                TaskItemId = taskId,
                UploadUserId = userId
            };
            
            // Save to database
            await _attachmentRepository.AddAsync(attachment);
            
            _logger.LogInformation("Attachment uploaded: {FileName} for task {TaskId} by user {UserId}", 
                file.FileName, taskId, userId);
                
            return CreatedAtAction(nameof(GetAttachment), new { id = attachment.Id }, attachment.ToDto());
        }
        catch (ArgumentException ex)
        {
            _logger.LogWarning(ex, "Invalid file upload attempt for task {TaskId} by user {UserId}", taskId, userId);
            return BadRequest(ex.Message);
        }
        catch (IOException ex)
        {
            _logger.LogError(ex, "File upload failed for task {TaskId} by user {UserId}", taskId, userId);
            return StatusCode(StatusCodes.Status500InternalServerError, "File upload failed");
        }
    }

    [HttpGet("download/{id}")]
    public async Task<IActionResult> DownloadAttachment(long id)
    {
        var userId = GetCurrentUserId();
        var attachment = await _attachmentRepository.GetByIdAsync(id);
        
        if (attachment == null)
            return NotFound();
            
        // Check if user has access to this attachment
        var task = await _taskRepository.GetByIdAsync(attachment.TaskItemId);
        if (task == null || !await CanAccessTaskAsync(task, userId))
            return Forbid();
            
        // Get file path
        var filePath = _fileSystemService.GetAttachmentPath(userId, attachment.TaskItemId, Path.GetFileName(attachment.FilePath));
        if (filePath == null || !System.IO.File.Exists(filePath))
            return NotFound("File not found on disk");
            
        // Validate user has access to this file
        if (!await _fileSystemService.ValidateUserFileAccessAsync(userId, filePath))
            return Forbid();
            
        var fileStream = new FileStream(filePath, FileMode.Open, FileAccess.Read);
        return File(fileStream, GetContentType(attachment.FileType), attachment.FileName);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteAttachment(long id)
    {
        var userId = GetCurrentUserId();
        var attachment = await _attachmentRepository.GetByIdAsync(id);
        
        if (attachment == null)
            return NotFound();
            
        // Check if user has access to this attachment
        var task = await _taskRepository.GetByIdAsync(attachment.TaskItemId);
        if (task == null || !await CanAccessTaskAsync(task, userId))
            return Forbid();
            
        // Only the uploader or task owner can delete attachments
        if (attachment.UploadUserId != userId && task.OwnerUserId != userId)
            return Forbid();
            
        // Delete file
        var fileName = Path.GetFileName(attachment.FilePath);
        var deleted = await _fileSystemService.DeleteAttachmentAsync(userId, attachment.TaskItemId, fileName);
        
        if (!deleted)
            _logger.LogWarning("File not found on disk for attachment {AttachmentId}", id);
            
        // Delete from database
        await _attachmentRepository.DeleteAsync(attachment.Id);
        
        _logger.LogInformation("Attachment deleted: {FileName} for task {TaskId} by user {UserId}", 
            attachment.FileName, attachment.TaskItemId, userId);
            
        return NoContent();
    }

    private long GetCurrentUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
        if (userIdClaim == null || !long.TryParse(userIdClaim.Value, out var userId))
            throw new UnauthorizedAccessException("User ID not found in token");
            
        return userId;
    }

    private Task<bool> CanAccessTaskAsync(TaskItem task, long userId)
    {
        // User can access task if they are the owner or assigned to the task
        return Task.FromResult(task.OwnerUserId == userId || 
               (task.Assignees != null && task.Assignees.Any(a => a.Id == userId)));
    }

    private string GetContentType(string fileExtension)
    {
        return fileExtension?.ToLowerInvariant() switch
        {
            ".jpg" or ".jpeg" => "image/jpeg",
            ".png" => "image/png",
            ".gif" => "image/gif",
            ".pdf" => "application/pdf",
            ".doc" => "application/msword",
            ".docx" => "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            ".xls" => "application/vnd.ms-excel",
            ".xlsx" => "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            ".txt" => "text/plain",
            _ => "application/octet-stream"
        };
    }
}

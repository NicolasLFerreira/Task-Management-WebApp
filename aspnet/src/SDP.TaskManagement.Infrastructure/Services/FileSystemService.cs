using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using SDP.TaskManagement.Application.Abstractions;
using SDP.TaskManagement.Infrastructure.Configuration;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;

namespace SDP.TaskManagement.Infrastructure.Services;

public class FileSystemService : IFileSystemService
{
    private readonly IWebHostEnvironment _environment;
    private readonly ILogger<FileSystemService> _logger;
    private readonly FileStorageOptions _options;
    private readonly string _baseAttachmentsPath;

    public FileSystemService(
        IWebHostEnvironment environment,
        ILogger<FileSystemService> logger,
        IOptions<FileStorageOptions> options)
    {
        _environment = environment;
        _logger = logger;
        _options = options.Value;
        _baseAttachmentsPath = Path.Combine(_environment.ContentRootPath, _options.BasePath);
        
        // Ensure base directory exists
        if (!Directory.Exists(_baseAttachmentsPath))
        {
            try
            {
                Directory.CreateDirectory(_baseAttachmentsPath);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to create base attachments directory at {Path}", _baseAttachmentsPath);
                throw new IOException($"Failed to create base attachments directory: {ex.Message}", ex);
            }
        }
    }

    public async Task<string> UploadProfilePhotoAsync(long userId, IFormFile file)
    {
        if (file == null || file.Length == 0)
            throw new ArgumentException("File is empty or null", nameof(file));
            
        ValidateFile(file);
        
        var userDir = GetUserProfilePhotoDirectory(userId);
        EnsureDirectoryExists(userDir);
        
        // Generate a unique filename to prevent overwriting
        var fileName = $"{Path.GetFileNameWithoutExtension(file.FileName)}_{DateTime.UtcNow.Ticks}{Path.GetExtension(file.FileName)}";
        var filePath = Path.Combine(userDir, fileName);
        
        try
        {
            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }
            
            _logger.LogInformation("Profile photo uploaded for user {UserId}: {FilePath}", userId, filePath);
            
            // Return the relative path for storage in the database
            return GetRelativePath(filePath);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to upload profile photo for user {UserId}", userId);
            throw new IOException($"Failed to upload profile photo: {ex.Message}", ex);
        }
    }

    public string GetProfilePhotoPath(long userId, string fileName)
    {
        if (string.IsNullOrEmpty(fileName))
            throw new ArgumentException("File name cannot be null or empty", nameof(fileName));
            
        var userDir = GetUserProfilePhotoDirectory(userId);
        var filePath = Path.Combine(userDir, fileName);
        
        if (!File.Exists(filePath))
        {
            _logger.LogWarning("Profile photo not found for user {UserId}: {FilePath}", userId, filePath);
            return string.Empty;
        }
        
        return filePath;
    }

    public Task<bool> DeleteProfilePhotoAsync(long userId, string fileName)
    {
        if (string.IsNullOrEmpty(fileName))
            throw new ArgumentException("File name cannot be null or empty", nameof(fileName));
            
        var userDir = GetUserProfilePhotoDirectory(userId);
        var filePath = Path.Combine(userDir, fileName);
        
        if (!File.Exists(filePath))
        {
            _logger.LogWarning("Profile photo not found for deletion for user {UserId}: {FilePath}", userId, filePath);
            return Task.FromResult(false);
        }
        
        try
        {
            File.Delete(filePath);
            _logger.LogInformation("Profile photo deleted for user {UserId}: {FilePath}", userId, filePath);
            return Task.FromResult(true);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to delete profile photo for user {UserId}: {FilePath}", userId, filePath);
            return Task.FromResult(false);
        }
    }

    public async Task<string> UploadAttachmentAsync(long userId, long taskId, IFormFile file)
    {
        if (file == null || file.Length == 0)
            throw new ArgumentException("File is empty or null", nameof(file));
            
        ValidateFile(file);
        
        var taskDir = GetUserTaskAttachmentsDirectory(userId, taskId);
        EnsureDirectoryExists(taskDir);
        
        // Generate a unique filename to prevent overwriting
        var fileName = $"{Path.GetFileNameWithoutExtension(file.FileName)}_{DateTime.UtcNow.Ticks}{Path.GetExtension(file.FileName)}";
        var filePath = Path.Combine(taskDir, fileName);
        
        try
        {
            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }
            
            _logger.LogInformation("Attachment uploaded for user {UserId}, task {TaskId}: {FilePath}", userId, taskId, filePath);
            
            // Return the relative path for storage in the database
            return GetRelativePath(filePath);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to upload attachment for user {UserId}, task {TaskId}", userId, taskId);
            throw new IOException($"Failed to upload attachment: {ex.Message}", ex);
        }
    }

    public string GetAttachmentPath(long userId, long taskId, string fileName)
    {
        if (string.IsNullOrEmpty(fileName))
            throw new ArgumentException("File name cannot be null or empty", nameof(fileName));
            
        var taskDir = GetUserTaskAttachmentsDirectory(userId, taskId);
        var filePath = Path.Combine(taskDir, fileName);
        
        if (!File.Exists(filePath))
        {
            _logger.LogWarning("Attachment not found for user {UserId}, task {TaskId}: {FilePath}", userId, taskId, filePath);
            return string.Empty;
        }
        
        return filePath;
    }

    public Task<bool> DeleteAttachmentAsync(long userId, long taskId, string fileName)
    {
        if (string.IsNullOrEmpty(fileName))
            throw new ArgumentException("File name cannot be null or empty", nameof(fileName));
            
        var taskDir = GetUserTaskAttachmentsDirectory(userId, taskId);
        var filePath = Path.Combine(taskDir, fileName);
        
        if (!File.Exists(filePath))
        {
            _logger.LogWarning("Attachment not found for deletion for user {UserId}, task {TaskId}: {FilePath}", userId, taskId, filePath);
            return Task.FromResult(false);
        }
        
        try
        {
            File.Delete(filePath);
            _logger.LogInformation("Attachment deleted for user {UserId}, task {TaskId}: {FilePath}", userId, taskId, filePath);
            return Task.FromResult(true);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to delete attachment for user {UserId}, task {TaskId}: {FilePath}", userId, taskId, filePath);
            return Task.FromResult(false);
        }
    }

    public Task<IEnumerable<string>> ListAttachmentsAsync(long userId, long taskId)
    {
        var taskDir = GetUserTaskAttachmentsDirectory(userId, taskId);
        
        if (!Directory.Exists(taskDir))
            return Task.FromResult(Enumerable.Empty<string>());
            
        try
        {
            return Task.FromResult(Directory.GetFiles(taskDir).Select(Path.GetFileName).Where(f => f != null).ToArray() as IEnumerable<string>);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to list attachments for user {UserId}, task {TaskId}", userId, taskId);
            throw new IOException($"Failed to list attachments: {ex.Message}", ex);
        }
    }

    public Task<bool> ValidateUserFileAccessAsync(long userId, string filePath)
    {
        if (string.IsNullOrEmpty(filePath))
            return Task.FromResult(false);
            
        // Normalize the path to prevent directory traversal attacks
        var normalizedPath = Path.GetFullPath(filePath);
        
        // Check if the file is in the user's directory
        var userProfileDir = GetUserProfilePhotoDirectory(userId);
        var userAttachmentsDir = GetUserAttachmentsDirectory(userId);
        
        return Task.FromResult(normalizedPath.StartsWith(userProfileDir) || normalizedPath.StartsWith(userAttachmentsDir));
    }

    private string GetUserProfilePhotoDirectory(long userId)
    {
        return Path.Combine(_baseAttachmentsPath, userId.ToString(), _options.ProfilePhotoDirectory);
    }

    private string GetUserAttachmentsDirectory(long userId)
    {
        return Path.Combine(_baseAttachmentsPath, userId.ToString(), _options.AttachmentsDirectory);
    }

    private string GetUserTaskAttachmentsDirectory(long userId, long taskId)
    {
        return Path.Combine(GetUserAttachmentsDirectory(userId), taskId.ToString());
    }

    private void EnsureDirectoryExists(string directoryPath)
    {
        if (!Directory.Exists(directoryPath))
        {
            try
            {
                Directory.CreateDirectory(directoryPath);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to create directory at {Path}", directoryPath);
                throw new IOException($"Failed to create directory: {ex.Message}", ex);
            }
        }
    }

    private void ValidateFile(IFormFile file)
    {
        // Check file size
        if (file.Length > _options.MaxFileSizeBytes)
        {
            throw new ArgumentException($"File size exceeds the maximum allowed size of {_options.MaxFileSizeBytes / 1024 / 1024} MB");
        }
        
        // Check file extension
        var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
        if (!_options.AllowedFileTypes.Contains(extension))
        {
            throw new ArgumentException($"File type {extension} is not allowed. Allowed types: {string.Join(", ", _options.AllowedFileTypes)}");
        }
    }

    private string GetRelativePath(string fullPath)
    {
        return fullPath.Replace(_environment.ContentRootPath, "").TrimStart(Path.DirectorySeparatorChar);
    }
}

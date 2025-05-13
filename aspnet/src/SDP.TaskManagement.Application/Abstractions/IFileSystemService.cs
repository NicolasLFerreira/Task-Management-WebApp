using Microsoft.AspNetCore.Http;
using System.Collections.Generic;
using System.IO;
using System.Threading.Tasks;

namespace SDP.TaskManagement.Application.Abstractions;

public interface IFileSystemService
{
    /// <summary>
    /// Uploads a file to the user's profile photo directory
    /// </summary>
    /// <param name="userId">The ID of the user</param>
    /// <param name="file">The file to upload</param>
    /// <returns>The path to the uploaded file</returns>
    Task<string> UploadProfilePhotoAsync(long userId, IFormFile file);
    
    /// <summary>
    /// Gets the full path to a user's profile photo
    /// </summary>
    /// <param name="userId">The ID of the user</param>
    /// <param name="fileName">The name of the file</param>
    /// <returns>The full path to the file</returns>
    string GetProfilePhotoPath(long userId, string fileName);
    
    /// <summary>
    /// Deletes a user's profile photo
    /// </summary>
    /// <param name="userId">The ID of the user</param>
    /// <param name="fileName">The name of the file to delete</param>
    /// <returns>True if the file was deleted, false otherwise</returns>
    Task<bool> DeleteProfilePhotoAsync(long userId, string fileName);
    
    /// <summary>
    /// Uploads a file to the user's attachments directory
    /// </summary>
    /// <param name="userId">The ID of the user</param>
    /// <param name="taskId">The ID of the task</param>
    /// <param name="file">The file to upload</param>
    /// <returns>The path to the uploaded file</returns>
    Task<string> UploadAttachmentAsync(long userId, long taskId, IFormFile file);
    
    /// <summary>
    /// Gets the full path to a user's attachment
    /// </summary>
    /// <param name="userId">The ID of the user</param>
    /// <param name="taskId">The ID of the task</param>
    /// <param name="fileName">The name of the file</param>
    /// <returns>The full path to the file</returns>
    string GetAttachmentPath(long userId, long taskId, string fileName);
    
    /// <summary>
    /// Deletes a user's attachment
    /// </summary>
    /// <param name="userId">The ID of the user</param>
    /// <param name="taskId">The ID of the task</param>
    /// <param name="fileName">The name of the file to delete</param>
    /// <returns>True if the file was deleted, false otherwise</returns>
    Task<bool> DeleteAttachmentAsync(long userId, long taskId, string fileName);
    
    /// <summary>
    /// Lists all files in a user's attachments directory for a specific task
    /// </summary>
    /// <param name="userId">The ID of the user</param>
    /// <param name="taskId">The ID of the task</param>
    /// <returns>A list of file names</returns>
    Task<IEnumerable<string>> ListAttachmentsAsync(long userId, long taskId);
    
    /// <summary>
    /// Validates that a user has access to a file
    /// </summary>
    /// <param name="userId">The ID of the user</param>
    /// <param name="filePath">The path to the file</param>
    /// <returns>True if the user has access to the file, false otherwise</returns>
    Task<bool> ValidateUserFileAccessAsync(long userId, string filePath);
}

using SDP.TaskManagement.Domain.Entities;

namespace SDP.TaskManagement.Application.Abstractions;

/// <summary>
/// Specialised operations for users.
/// </summary>
public interface IUserManager
{
    /// <summary>
    /// Checks if the email exists.
    /// </summary>
    Task<bool> DoesEmailExist(string email);

    /// <summary>
    /// Checks if the username exists.
    /// </summary>
    Task<bool> DoesUsernameExist(string username);

    /// <summary>
    /// Returns the User entity with the given email. Nullable.
    /// </summary>
    Task<User> GetUserByEmail(string email);

    /// <summary>
    /// Creates a new user with the name, email, and hashed password values.
    /// </summary>
    Task CreateNewUser(User user);
}

using Microsoft.EntityFrameworkCore;

using SDP.TaskManagement.Application.Abstractions;
using SDP.TaskManagement.Domain.Entities;

namespace SDP.TaskManagement.Infrastructure.Managers;

public class UserManager : IUserManager
{
    private readonly IRepository<User, Guid> _userRepository;

    public UserManager(IRepository<User, Guid> userRepository)
    {
        _userRepository = userRepository;
    }

    public async Task<bool> DoesEmailExist(string email)
    {
        return await _userRepository.GetQueryable()
                                    .Where(user => user.Email == email)
                                    .AnyAsync();
    }

    public async Task<bool> DoesUsernameExist(string username)
    {
        return await _userRepository.GetQueryable()
                                    .Where(user => user.Name == username)
                                    .AnyAsync();
    }

    public async Task<User> GetUserByEmail(string email)
    {
        return await _userRepository.GetQueryable()
                                    .Where(user => user.Email == email)
                                    .FirstAsync();
    }

    public async Task CreateNewUser(User user)
    {
        await _userRepository.AddAsync(user);
    }
}

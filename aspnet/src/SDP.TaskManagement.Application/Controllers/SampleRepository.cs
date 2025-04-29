using Microsoft.AspNetCore.Mvc;

using SDP.TaskManagement.Application.Abstractions;
using SDP.TaskManagement.Application.Dtos;
using SDP.TaskManagement.Application.Mappers;
using SDP.TaskManagement.Domain.Entities;

namespace SDP.TaskManagement.Application.Controllers;


/// <summary>
/// This controller is just for currently trying out db accessability.
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class SampleRepository : ControllerBase
{
    private readonly IRepository<User, Guid> _userRepository;

    public SampleRepository(IRepository<User, Guid> userRepository)
    {
        _userRepository = userRepository;
    }

    [HttpGet(Name = "GetUsers")]
    public ActionResult<List<UserDto>> GetUsers()
    {
        var result = _userRepository.GetQueryable().Select(user => UserMapper.ToDto(user)).ToList();

        return Ok(result);
    }
}

using Microsoft.AspNetCore.Mvc;

using SDP.TaskManagement.Application.Abstractions;
using SDP.TaskManagement.Domain.Entities;

namespace SDP.TaskManagement.Application.Controllers;


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
    public ActionResult<List<User>> GetUsers()
    {
        return Ok(_userRepository.GetQueryable().ToList());
    }
}

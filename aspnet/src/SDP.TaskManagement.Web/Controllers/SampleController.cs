using Microsoft.AspNetCore.Mvc;

using SDP.TaskManagement.Application.Abstractions;
using SDP.TaskManagement.Application.Dtos;
using SDP.TaskManagement.Application.Mappers;
using SDP.TaskManagement.Domain.Entities;

namespace SDP.TaskManagement.Web.Controllers
{

    /// <summary>
    /// This controller is just for currently trying out db accessability.
    /// </summary>
    [ApiController]
    [Route("api/[controller]")]
    public class SampleController : ControllerBase
    {
        private readonly IRepository<User> _userRepository;

        public SampleController(IRepository<User> userRepository)
        {
            _userRepository = userRepository;
        }

        [HttpGet("GetUsers")]
        public ActionResult<List<UserDto>> GetUsers()
        {
            var result = _userRepository.GetQueryable().Select(user => UserMapper.ToDto(user)).ToList();

            return Ok(result);
        }
    }
}

using Microsoft.AspNetCore.Mvc;

using SDP.TaskManagement.Application.Abstractions;
using SDP.TaskManagement.Application.Dtos;

namespace SDP.TaskManagement.Web.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AccountController : ControllerBase
{
    private readonly IAuthService _authService;

    public AccountController(IAuthService authService)
    {
        _authService = authService;
    }

    [HttpPost("login", Name = "Login")]
    public async Task<ActionResult<string>> Login(LoginDto loginDto)
    {
        var result = await _authService.LoginAsync(loginDto);

        if (result.Error != null)
        {
            return Unauthorized(result.Error);
        }

        return Ok(result.Result);
    }

    [HttpPost("register", Name = "Register")]
    public async Task<ActionResult<UserDto>> Register(RegisterDto registerDto)
    {
        var result = await _authService.RegisterAsync(registerDto);

        return result;
    }
}

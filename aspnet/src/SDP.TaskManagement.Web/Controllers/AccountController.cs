using Microsoft.AspNetCore.Mvc;

using SDP.TaskManagement.Application.Abstractions;
using SDP.TaskManagement.Application.Dtos;
using Microsoft.Extensions.Logging;

namespace SDP.TaskManagement.Web.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AccountController : ControllerBase
{
    private readonly IAuthService _authService;
    private readonly ILogger<AccountController> _logger;

    public AccountController(IAuthService authService, ILogger<AccountController> logger)
    {
        _authService = authService;
        _logger = logger;
    }

    [HttpPost("login", Name = "Login")]
    public async Task<ActionResult<string>> Login(LoginDto loginDto)
    {
        try
        {
            _logger.LogInformation("Login attempt for email: {Email}", loginDto.Email);
            
            var result = await _authService.LoginAsync(loginDto);

            if (result.Error != null)
            {
                _logger.LogWarning("Login failed for email {Email}: {Error}", loginDto.Email, result.Error);
                return BadRequest(new { message = result.Error });
            }

            _logger.LogInformation("Login successful for email: {Email}", loginDto.Email);
            return Ok(result.Result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during login for email {Email}", loginDto.Email);
            return StatusCode(500, new { message = "An error occurred during login: " + ex.Message });
        }
    }

    [HttpPost("register", Name = "Register")]
    public async Task<ActionResult<UserDto>> Register(RegisterDto registerDto)
    {
        try
        {
            _logger.LogInformation("Registration attempt for email: {Email}", registerDto.Email);
            
            var result = await _authService.RegisterAsync(registerDto);
            
            _logger.LogInformation("Registration successful for email: {Email}", registerDto.Email);
            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during registration for email {Email}", registerDto.Email);
            return BadRequest(new { message = ex.Message });
        }
    }
}

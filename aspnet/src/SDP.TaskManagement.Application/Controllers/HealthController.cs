using Microsoft.AspNetCore.Mvc;

namespace SDP.TaskManagement.Application.Controllers;

[ApiController]
[Route("api/[controller]")]
public class HealthController : ControllerBase
{
    [HttpGet(Name = "GetHealth")]
    public IActionResult GetHealth()
    {
        return Ok(new { status = "healthy", timestamp = DateTime.UtcNow });
    }
}

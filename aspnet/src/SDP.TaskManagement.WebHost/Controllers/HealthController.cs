using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Cors;

namespace SDP.TaskManagement.WebHost.Controllers;

[ApiController]
[Route("[controller]")]
public class HealthController : ControllerBase
{
    [HttpGet]
    [EnableCors(AppConfigurations.Cors.DefaultCorsPolicy)]
    public IActionResult Get()
    {
        return Ok(new { 
            status = "healthy",
            timestamp = DateTime.UtcNow,
            environment = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") ?? "Unknown"
        });
    }
}

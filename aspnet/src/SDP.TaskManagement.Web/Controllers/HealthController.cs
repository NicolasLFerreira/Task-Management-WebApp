using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc;

namespace SDP.TaskManagement.Web.Controllers;

[ApiController]
[Route("api/health")]
public class HealthController : ControllerBase
{
    private readonly IWebHostEnvironment _webHostEnvironment;

    public HealthController(IWebHostEnvironment webHostEnvironment)
    {
        _webHostEnvironment = webHostEnvironment;
    }

    [HttpGet]
    public IActionResult Get()
    {
        return Ok(new HealthDto
        {
            Status = "healthy",
            Timestamp = DateTime.UtcNow,
            EnvironmentName = _webHostEnvironment.EnvironmentName
        });
    }
}

public class HealthDto
{
    public required string Status { get; set; }
    public required DateTime Timestamp { get; set; }
    public required string EnvironmentName { get; set; }
}

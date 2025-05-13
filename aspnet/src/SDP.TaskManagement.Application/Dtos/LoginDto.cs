namespace SDP.TaskManagement.Application.Dtos;

public class LoginDto
{
    public required string Email { get; set; }
    public required string Password { get; set; }
    public bool RememberMe { get; set; }
}

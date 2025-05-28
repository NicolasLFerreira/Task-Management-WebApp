namespace SDP.TaskManagement.Application.Dtos.AssistanceDtos;

public class RegisterDto
{
    public required string Name { get; set; }
    public required string Email { get; set; }
    public required string Password { get; set; }
    public required string Username { get; set; }
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
}

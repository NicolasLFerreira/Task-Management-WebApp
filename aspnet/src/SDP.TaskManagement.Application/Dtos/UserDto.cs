using System;
using System.Collections.Generic;

namespace SDP.TaskManagement.Application.Dtos;

public class UserDto
{
    public long Id { get; set; }
    public required string Username { get; set; }
    public required string Email { get; set; }
    public required string FirstName { get; set; }
    public required string LastName { get; set; }
    public string? ProfilePhotoPath { get; set; }
    public DateTime CreationDate { get; set; }
    public DateTime? LastLogin { get; set; }
    
    // Helper properties
    public string FullName => $"{FirstName} {LastName}";
    public string Initials => $"{(string.IsNullOrEmpty(FirstName) ? "" : FirstName[0])}{(string.IsNullOrEmpty(LastName) ? "" : LastName[0])}";
}

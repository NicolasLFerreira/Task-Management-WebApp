namespace SDP.TaskManagement.Application.Dtos;

/// <summary>
/// Class for handling errors without the use of expensive exceptions.
/// </summary>
public class Option<TResult>
{
    public TResult? Result { get; set; }
    public string? Error { get; set; }
}

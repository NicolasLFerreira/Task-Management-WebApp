using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SDP.TaskManagement.Application.Abstractions;
using SDP.TaskManagement.Application.Dtos;
using SDP.TaskManagement.Domain.Entities;
using System.Security.Claims;

namespace SDP.TaskManagement.Web.Controllers;

[ApiController]
[Route("api/messages")]
[Authorize]
public class MessageController : ControllerBase
{
    private readonly IRepository<Message> _messageRepository;
    private readonly IRepository<User> _userRepository;

    public MessageController(
        IRepository<Message> messageRepository,
        IRepository<User> userRepository)
    {
        _messageRepository = messageRepository;
        _userRepository = userRepository;
    }

    [HttpGet]
    public async Task<ActionResult<List<MessageDto>>> GetUserMessages()
    {
        var userId = GetCurrentUserId();
        
        var messages = await _messageRepository.GetQueryable()
            .Where(m => m.SenderId == userId || m.RecipientId == userId)
            .Include(m => m.Sender)
            .OrderByDescending(m => m.SentDate)
            .ToListAsync();
            
        var messageDtos = new List<MessageDto>();
        
        foreach (var m in messages)
        {
            var sender = m.Sender;
            var recipient = await _userRepository.GetByIdAsync(m.RecipientId);
            
            messageDtos.Add(new MessageDto
            {
                Id = m.Id,
                SenderId = m.SenderId,
                SenderName = sender != null ? $"{sender.FirstName} {sender.LastName}" : "Unknown",
                RecipientId = m.RecipientId,
                RecipientName = recipient != null ? $"{recipient.FirstName} {recipient.LastName}" : "Unknown",
                Content = m.Content,
                CreationDate = m.SentDate,
                IsRead = m.IsRead
            });
        }
        
        return Ok(messageDtos);
    }

    [HttpGet("conversation/{userId}")]
    public async Task<ActionResult<List<MessageDto>>> GetConversation(long userId)
    {
        var currentUserId = GetCurrentUserId();
        
        var user = await _userRepository.GetByIdAsync(userId);
        
        if (user == null)
            return NotFound($"User with ID {userId} not found");
            
        var messages = await _messageRepository.GetQueryable()
            .Where(m => (m.SenderId == currentUserId && m.RecipientId == userId) ||
                        (m.SenderId == userId && m.RecipientId == currentUserId))
            .Include(m => m.Sender)
            .OrderBy(m => m.SentDate)
            .ToListAsync();
            
        var messageDtos = new List<MessageDto>();
        
        foreach (var m in messages)
        {
            var sender = m.Sender;
            var recipient = await _userRepository.GetByIdAsync(m.RecipientId);
            
            messageDtos.Add(new MessageDto
            {
                Id = m.Id,
                SenderId = m.SenderId,
                SenderName = sender != null ? $"{sender.FirstName} {sender.LastName}" : "Unknown",
                RecipientId = m.RecipientId,
                RecipientName = recipient != null ? $"{recipient.FirstName} {recipient.LastName}" : "Unknown",
                Content = m.Content,
                CreationDate = m.SentDate,
                IsRead = m.IsRead
            });
        }
        
        // Mark received messages as read
        var unreadMessages = messages.Where(m => m.RecipientId == currentUserId && !m.IsRead).ToList();
        foreach (var message in unreadMessages)
        {
            message.IsRead = true;
            await _messageRepository.UpdateAsync(message);
        }
        
        return Ok(messageDtos);
    }

    [HttpPost]
    public async Task<ActionResult<MessageDto>> SendMessage([FromBody] MessageDto messageDto)
    {
        var senderId = GetCurrentUserId();
        
        var receiver = await _userRepository.GetByIdAsync(messageDto.RecipientId);
        
        if (receiver == null)
            return NotFound($"Receiver with ID {messageDto.RecipientId} not found");
            
        var message = new Message
        {
            SenderId = senderId,
            RecipientId = messageDto.RecipientId,
            Content = messageDto.Content,
            SentDate = DateTime.UtcNow,
            IsRead = false
        };
        
        var result = await _messageRepository.AddAsync(message);
        
        if (!result)
            return BadRequest("Failed to send message");
            
        var sender = await _userRepository.GetByIdAsync(senderId);
        
        messageDto.Id = message.Id;
        messageDto.SenderId = senderId;
        messageDto.SenderName = sender != null ? $"{sender.FirstName} {sender.LastName}" : "Unknown";
        messageDto.RecipientName = $"{receiver.FirstName} {receiver.LastName}";
        messageDto.CreationDate = message.SentDate;
        messageDto.IsRead = message.IsRead;
        
        return CreatedAtAction(nameof(GetMessage), new { messageId = message.Id }, messageDto);
    }

    [HttpGet("{messageId}")]
    public async Task<ActionResult<MessageDto>> GetMessage(long messageId)
    {
        var userId = GetCurrentUserId();
        
        var message = await _messageRepository.GetQueryable()
            .Include(m => m.Sender)
            .FirstOrDefaultAsync(m => m.Id == messageId);
            
        if (message == null)
            return NotFound($"Message with ID {messageId} not found");
            
        // Check if user is sender or receiver
        if (message.SenderId != userId && message.RecipientId != userId)
            return Forbid("You don't have access to this message");
            
        var sender = message.Sender;
        var recipient = await _userRepository.GetByIdAsync(message.RecipientId);
            
        var messageDto = new MessageDto
        {
            Id = message.Id,
            SenderId = message.SenderId,
            SenderName = sender != null ? $"{sender.FirstName} {sender.LastName}" : "Unknown",
            RecipientId = message.RecipientId,
            RecipientName = recipient != null ? $"{recipient.FirstName} {recipient.LastName}" : "Unknown",
            Content = message.Content,
            CreationDate = message.SentDate,
            IsRead = message.IsRead
        };
        
        // Mark as read if user is receiver and message is unread
        if (message.RecipientId == userId && !message.IsRead)
        {
            message.IsRead = true;
            await _messageRepository.UpdateAsync(message);
            messageDto.IsRead = true;
        }
        
        return Ok(messageDto);
    }

    [HttpPost("{messageId}/read")]
    public async Task<ActionResult> MarkAsRead(long messageId)
    {
        var userId = GetCurrentUserId();
        
        var message = await _messageRepository.GetByIdAsync(messageId);
        
        if (message == null)
            return NotFound($"Message with ID {messageId} not found");
            
        // Check if user is receiver
        if (message.RecipientId != userId)
            return Forbid("You can only mark messages sent to you as read");
            
        message.IsRead = true;
        
        var result = await _messageRepository.UpdateAsync(message);
        
        if (!result)
            return BadRequest("Failed to mark message as read");
            
        return NoContent();
    }
    
    private long GetCurrentUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
        if (userIdClaim == null)
            throw new UnauthorizedAccessException("User ID not found in token");
            
        return long.Parse(userIdClaim.Value);
    }
}

using System;
using System.Collections.Generic;
using System.Linq;

namespace SDP.TaskManagement.Application.Dtos;

public class ChecklistDto
{
    public long Id { get; set; }
    public required string Title { get; set; }
    public long TaskItemId { get; set; }
    public DateTime CreationDate { get; set; }
    public long? CreatedByUserId { get; set; }
    public string? CreatedByName { get; set; }
    public List<ChecklistItemDto> Items { get; set; } = new List<ChecklistItemDto>();
    
    public int CompletedItemsCount => Items?.Count(i => i.IsChecked) ?? 0;
    public int TotalItemsCount => Items?.Count ?? 0;
}

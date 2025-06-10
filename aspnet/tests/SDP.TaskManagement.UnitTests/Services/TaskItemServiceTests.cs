using SDP.TaskManagement.Application.Abstractions;
using SDP.TaskManagement.Application.Dtos.AssistanceDtos;
using SDP.TaskManagement.Application.Services;
using SDP.TaskManagement.Domain.Entities;

namespace SDP.TaskManagement.UnitTests.Services;

public class TaskItemServiceTests
{
    private readonly Mock<IRepository<TaskItem>> _taskRepoMock;
    private readonly TaskItemService _service;

    public TaskItemServiceTests()
    {
        _taskRepoMock = new Mock<IRepository<TaskItem>>();
        _service = new TaskItemService(_taskRepoMock.Object);
    }

    [Fact]
    public async Task FilterByProperty_FiltersTasksCorrectly()
    {
        var userId = 1L;
        var tasks = new List<TaskItem>
    {
        new() { Title = "Important Task", Description = "Something", ProgressStatus = TaskItemStatus.Todo, Priority = TaskItemPriority.High, OwnerUserId = userId },
        new() { Title = "Other Task", Description = "None", ProgressStatus = TaskItemStatus.InProgress, Priority = TaskItemPriority.Medium, OwnerUserId = userId },
        new() { Title = "Wrong User", Description = "Nope", ProgressStatus = TaskItemStatus.Todo, Priority = TaskItemPriority.High, OwnerUserId = 2L }
    };

        _taskRepoMock.Setup(r => r.GetQueryable()).Returns(new TestAsyncEnumerable<TaskItem>(tasks));

        var input = new FilterTaskItemInputDto
        {
            Title = "Important",
            Status = TaskItemStatus.Todo,
            Priority = TaskItemPriority.High
        };

        var result = await _service.FilterByProperty(userId, input);

        Assert.Single(result);
        Assert.Equal("Important Task", result[0].Title);
    }

    [Fact]
    public async Task SearchByTitle_ReturnsMatchingTasks()
    {
        var userId = 1L;
        var tasks = new List<TaskItem>
    {
        new() { Title = "Fix bug", Description = "", OwnerUserId = userId },
        new() { Title = "Fix UI", Description = "", OwnerUserId = userId },
        new() { Title = "Review code", Description = "", OwnerUserId = userId },
        new() { Title = "Fix database", Description = "", OwnerUserId = 2L }
    };

        _taskRepoMock.Setup(r => r.GetQueryable()).Returns(new TestAsyncEnumerable<TaskItem>(tasks));

        var result = await _service.SearchByTitle(userId, "Fix");

        Assert.Equal(2, result.Count);
        Assert.All(result, t => Assert.Contains("Fix", t.Title));
    }
}
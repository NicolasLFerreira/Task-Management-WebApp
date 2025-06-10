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
    public async Task FilterByProperty_FiltersSingleTaskCorrectly()
    {
        // user defined
        long userId = 1;

        // mock data
        var tasks = new List<TaskItem>
        {
            new() { Title = "Correct User", Description = "Something", ProgressStatus = TaskItemStatus.Todo, Priority = TaskItemPriority.High, OwnerUserId = userId },
            new() { Title = "Other Task", Description = "None", ProgressStatus = TaskItemStatus.InProgress, Priority = TaskItemPriority.Medium, OwnerUserId = userId },
            new() { Title = "Wrong User", Description = "Nope", ProgressStatus = TaskItemStatus.Todo, Priority = TaskItemPriority.High, OwnerUserId = 2L }
        };

        // configures the mock repo
        _taskRepoMock.Setup(r => r.GetQueryable()).Returns(new TestAsyncEnumerable<TaskItem>(tasks));

        // mock input
        var input = new FilterTaskItemInputDto
        {
            Title = "User",
            Status = TaskItemStatus.Todo,
            Priority = TaskItemPriority.High
        };

        // invokes the filtering method
        var result = await _service.FilterByProperty(userId, input);

        // verifies results
        Assert.Single(result);
        Assert.Equal("Correct User", result[0].Title);
    }

    [Fact]
    public async Task FilterByProperty_FiltersMultipleTasksCorrectly()
    {
        // user defined
        long userId = 1;

        // mock data
        var tasks = new List<TaskItem>
        {
            new() { Title = "Correct Task 1", Description = "not same", ProgressStatus = TaskItemStatus.Todo, Priority = TaskItemPriority.High, OwnerUserId = userId },
            new() { Title = "Correct Task 2", Description = "", ProgressStatus = TaskItemStatus.Todo, Priority = TaskItemPriority.Medium, OwnerUserId = userId },
            new() { Title = "Correct Task 3", Description = "Something", ProgressStatus = TaskItemStatus.Todo, Priority = TaskItemPriority.Low, OwnerUserId = userId },
            new() { Title = "Other Task", Description = "None", ProgressStatus = TaskItemStatus.InProgress, Priority = TaskItemPriority.Medium, OwnerUserId = userId },
            new() { Title = "Wrong User", Description = "Nope", ProgressStatus = TaskItemStatus.Todo, Priority = TaskItemPriority.High, OwnerUserId = 2L }
        };

        // configures the mock repo
        _taskRepoMock.Setup(r => r.GetQueryable()).Returns(new TestAsyncEnumerable<TaskItem>(tasks));

        // mock input
        var input = new FilterTaskItemInputDto
        {
            Status = TaskItemStatus.Todo
        };

        // invokes the filtering method
        var result = await _service.FilterByProperty(userId, input);

        // expected
        string[] expectedTitles = ["Correct Task 1", "Correct Task 2", "Correct Task 3"];

        // verifies result
        Assert.Equal(3, result.Count);
        Assert.All(expectedTitles, title => Assert.Contains(result, r => r.Title == title));
    }

    [Fact]
    public async Task SearchByTitle_ReturnsMatchingTasks()
    {
        long userId = 1;
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
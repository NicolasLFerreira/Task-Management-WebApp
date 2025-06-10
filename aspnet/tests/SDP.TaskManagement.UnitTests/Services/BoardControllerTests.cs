using SDP.TaskManagement.UnitTests;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Http;
using Moq;
using Xunit;
using System.Threading.Tasks;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using SDP.TaskManagement.Web.Controllers;
using SDP.TaskManagement.Application.Abstractions;
using SDP.TaskManagement.Domain.Entities;
using SDP.TaskManagement.Application.Dtos;

public class BoardControllerTests
{
    private readonly Mock<IRepository<Board>> _boardRepoMock = new();
    private readonly Mock<IRepository<BoardMember>> _memberRepoMock = new();
    private readonly Mock<IBoardService> _boardServiceMock = new();

    private BoardController CreateControllerWithUser(long userId)
    {
        var controller = new BoardController(
            _boardRepoMock.Object,
            _memberRepoMock.Object,
            _boardServiceMock.Object
        );

        var user = new ClaimsPrincipal(new ClaimsIdentity(new[]
        {
            new Claim(ClaimTypes.NameIdentifier, userId.ToString())
        }, "mock"));

        controller.ControllerContext = new ControllerContext
        {
            HttpContext = new DefaultHttpContext { User = user }
        };

        return controller;
    }

    [Fact]
    public async Task UpdateBoard_ReturnsForbid_IfUserIsNotOwner()
    {
        var currentUserId = 123L;
        var board = new Board
        {
            Id = 1,
            Title = "Test Board",
            Description = "Should not be editable",
            OwnerId = 999
        };
        var dto = new BoardDto
        {
            Id = 1,
            Title = "Updated",
            Description = "Updated Desc",
            CreatedAt = System.DateTime.UtcNow,
            OwnerUsername = "user999"
        };

        _boardRepoMock.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(board);
        var controller = CreateControllerWithUser(currentUserId);

        var result = await controller.UpdateBoard(1, dto);

        Assert.IsType<ForbidResult>(result);
    }

    [Fact]
    public async Task GetUserBoards_ReturnsUserOwnedBoards()
    {
        var userId = 1L;
        var testUser = new User
        {
            Id = userId,
            Username = "user1",
            Email = "test@example.com",
            PasswordHash = "pwd",
            FirstName = "John",
            LastName = "Doe"
        };

        var boards = new List<Board>
        {
            new Board
            {
                Id = 1,
                Title = "Board 1",
                Description = "User's board",
                OwnerId = userId,
                Owner = testUser,
                CreatedAt = System.DateTime.UtcNow
            }
        };

        _boardRepoMock.Setup(r => r.GetQueryable()).Returns(new TestAsyncEnumerable<Board>(boards));
        // In the GetUserBoards_ReturnsUserOwnedBoards test method
        _memberRepoMock.Setup(r => r.GetQueryable()).Returns(new TestAsyncEnumerable<BoardMember>(new List<BoardMember>()));

        var controller = CreateControllerWithUser(userId);

        var result = await controller.GetUserBoards();

        var ok = Assert.IsType<OkObjectResult>(result.Result);
        var boardList = Assert.IsAssignableFrom<List<BoardDto>>(ok.Value);
        Assert.Single(boardList);
        Assert.Equal("Board 1", boardList[0].Title);
    }

    [Fact]
    public async Task DeleteBoard_ReturnsNoContent_WhenOwnerDeletes()
    {
        var userId = 1L;
        var boardId = 42L;
        var board = new Board
        {
            Id = boardId,
            Title = "Deletable Board",
            Description = "Some board",
            OwnerId = userId
        };

        _boardRepoMock.Setup(r => r.GetByIdAsync(boardId)).ReturnsAsync(board);
        _boardRepoMock.Setup(r => r.DeleteAsync(boardId)).ReturnsAsync(true);

        var controller = CreateControllerWithUser(userId);

        var result = await controller.DeleteBoard(boardId);

        Assert.IsType<NoContentResult>(result);
        _boardRepoMock.Verify(r => r.DeleteAsync(boardId), Times.Once);
    }
}

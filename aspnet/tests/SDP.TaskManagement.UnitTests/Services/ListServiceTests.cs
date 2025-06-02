using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Moq;
using Xunit;
using SDP.TaskManagement.Application.Abstractions;
using SDP.TaskManagement.Application.Dtos.AssistanceDtos;
using SDP.TaskManagement.Application.Services;
using SDP.TaskManagement.Domain.Entities;

namespace SDP.TaskManagement.Tests.Services
{
    public class ListServiceTests
    {
        private readonly Mock<IRepository<List>> _mockListRepo;
        private readonly Mock<IRepository<Board>> _mockBoardRepo;
        private readonly ListService _listService;

        public ListServiceTests()
        {
            _mockListRepo = new Mock<IRepository<List>>();
            _mockBoardRepo = new Mock<IRepository<Board>>();
            _listService = new ListService(_mockListRepo.Object, _mockBoardRepo.Object);
        }

        [Fact]
        public async Task CreateList_ValidDto_ReturnsNewList()
        {
            // Arrange
            var dto = new ListCreationDto { BoardId = 1, Title = "To Do", Position = 0 };
            _mockListRepo.Setup(r => r.AddAsync(It.IsAny<List>())).ReturnsAsync(true);

            // Act
            var result = await _listService.CreateList(dto, 123);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(dto.Title, result.Title);
            Assert.Equal(dto.BoardId, result.BoardId);
            Assert.Equal(dto.Position, result.Position);
            _mockListRepo.Verify(r => r.AddAsync(It.IsAny<List>()), Times.Once);
        }

        [Fact]
        public async Task CreateList_FailureInRepository_ReturnsNull()
        {
            // Arrange
            var dto = new ListCreationDto { BoardId = 1, Title = "In Progress", Position = 1 };
            _mockListRepo.Setup(r => r.AddAsync(It.IsAny<List>())).ReturnsAsync(false);

            // Act
            var result = await _listService.CreateList(dto, 123);

            // Assert
            Assert.Null(result);
        }

        [Fact]
        public async Task CreateListRange_ValidInput_ReturnsCreatedList()
        {
            // Arrange
            var dtos = new List<ListCreationDto>
            {
                new() { Title = "To Do", Position = 0, BoardId = 1 },
                new() { Title = "In Progress", Position = 1, BoardId = 1 }
            };
            _mockListRepo.Setup(r => r.AddRangeAsync(It.IsAny<IEnumerable<List>>())).ReturnsAsync(true);

            // Act
            var result = await _listService.CreateListRange(dtos, 123);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(2, result.Count);
            Assert.Contains(result, l => l.Title == "To Do");
            Assert.Contains(result, l => l.Title == "In Progress");
            _mockListRepo.Verify(r => r.AddRangeAsync(It.IsAny<IEnumerable<List>>()), Times.Once);
        }

        [Fact]
        public async Task CreateListRange_EmptyInput_ReturnsEmptyList()
        {
            // Arrange
            var dtos = new List<ListCreationDto>();

            // Act
            var result = await _listService.CreateListRange(dtos, 123);

            // Assert
            Assert.NotNull(result);
            Assert.Empty(result);
            _mockListRepo.Verify(r => r.AddRangeAsync(It.IsAny<IEnumerable<List>>()), Times.Never);
        }
    }
}

using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Moq;
using SDP.TaskManagement.Infrastructure.Configuration;
using SDP.TaskManagement.Infrastructure.Services;
using System.IO;
using System.Text;
using Xunit;
using FluentAssertions;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using FluentAssertions.Formatting;

namespace SDP.TaskManagement.UnitTests.Services
{
    public class FileSystemServiceTests
    {
        private readonly Mock<IWebHostEnvironment> _mockEnvironment;
        private readonly Mock<ILogger<FileSystemService>> _mockLogger;
        private readonly Mock<IOptions<FileStorageOptions>> _mockOptions;
        private readonly string _testBasePath;
        private readonly FileSystemService _fileSystemService;

        public FileSystemServiceTests()
        {
            // Setup test directory
            _testBasePath = Path.Combine(Path.GetTempPath(), "FileSystemServiceTests");
            Directory.CreateDirectory(_testBasePath);

            // Setup mocks
            _mockEnvironment = new Mock<IWebHostEnvironment>();
            _mockEnvironment.Setup(e => e.ContentRootPath).Returns(_testBasePath);

            _mockLogger = new Mock<ILogger<FileSystemService>>();

            var options = new FileStorageOptions
            {
                BasePath = "attachments",
                MaxFileSizeBytes = 5 * 1024 * 1024, // 5MB
                AllowedFileTypes = new[] { ".jpg", ".png", ".pdf" },
                ProfilePhotoDirectory = "profile-photos",
                AttachmentsDirectory = "attachments"
            };

            _mockOptions = new Mock<IOptions<FileStorageOptions>>();
            _mockOptions.Setup(o => o.Value).Returns(options);

            // Create service
            _fileSystemService = new FileSystemService(
                _mockEnvironment.Object,
                _mockLogger.Object,
                _mockOptions.Object);
        }

        [Fact]
        public async Task UploadProfilePhotoAsync_ValidFile_ReturnsRelativePath()
        {
            // Arrange
            long userId = 123;
            var fileName = "test-profile.jpg";
            var fileContent = "test file content";
            var mockFile = CreateMockFile(fileName, fileContent);

            // Act
            var result = await _fileSystemService.UploadProfilePhotoAsync(userId, mockFile.Object);

            // Assert
            result.Should().NotBeNull();

            if (OperatingSystem.IsMacOS())
            {
                result.Should().StartWith("attachments/123/profile-photos/");
            }

            if (OperatingSystem.IsWindows())
            {
                result.Should().StartWith("attachments\\123\\profile-photos\\");
            }

            result.Should().EndWith(".jpg");

            // Verify file was created
            var expectedDir = Path.Combine(_testBasePath, "attachments", "123", "profile-photos");
            Directory.Exists(expectedDir).Should().BeTrue();
            Directory.GetFiles(expectedDir).Should().HaveCountGreaterThan(0);
            Directory.GetFiles(expectedDir, "*.jpg").Should().HaveCountGreaterThan(0);

            // Cleanup
            Directory.Delete(Path.Combine(_testBasePath, "attachments"), true);
        }

        [Fact]
        public async Task DeleteProfilePhotoAsync_ExistingFile_ReturnsTrue()
        {
            // Arrange
            long userId = 456;
            var fileName = "profile-to-delete.jpg";

            // Create the directory and file first
            var userDir = Path.Combine(_testBasePath, "attachments", userId.ToString(), "profile-photos");
            Directory.CreateDirectory(userDir);
            var filePath = Path.Combine(userDir, fileName);
            File.WriteAllText(filePath, "test content");

            // Act
            var result = await _fileSystemService.DeleteProfilePhotoAsync(userId, fileName);

            // Assert
            Assert.True(result);
            Assert.False(File.Exists(filePath));

            // Cleanup
            Directory.Delete(Path.Combine(_testBasePath, "attachments"), true);
        }

        [Fact]
        public async Task ValidateUserFileAccessAsync_FileInUserDirectory_ReturnsTrue()
        {
            // Arrange
            long userId = 789;

            // Create the directory structure
            var userProfileDir = Path.Combine(_testBasePath, "attachments", userId.ToString(), "profile-photos");
            Directory.CreateDirectory(userProfileDir);

            var filePath = Path.Combine(userProfileDir, "valid-file.jpg");
            File.WriteAllText(filePath, "test content");

            // Act
            var result = await _fileSystemService.ValidateUserFileAccessAsync(userId, filePath);

            // Assert
            Assert.True(result);

            // Cleanup
            Directory.Delete(Path.Combine(_testBasePath, "attachments"), true);
        }

        private Mock<IFormFile> CreateMockFile(string fileName, string content)
        {
            var mockFile = new Mock<IFormFile>();
            var ms = new MemoryStream();
            var writer = new StreamWriter(ms);
            writer.Write(content);
            writer.Flush();
            ms.Position = 0;

            mockFile.Setup(f => f.FileName).Returns(fileName);
            mockFile.Setup(f => f.Length).Returns(ms.Length);
            mockFile.Setup(f => f.OpenReadStream()).Returns(ms);
            mockFile.Setup(f => f.ContentDisposition).Returns($"form-data; name=\"file\"; filename=\"{fileName}\"");

            mockFile.Setup(f => f.CopyToAsync(It.IsAny<Stream>(), It.IsAny<CancellationToken>()))
                .Callback<Stream, CancellationToken>((stream, token) =>
                {
                    ms.Position = 0;
                    ms.CopyTo(stream);
                })
                .Returns(Task.CompletedTask);

            return mockFile;
        }
    }
}

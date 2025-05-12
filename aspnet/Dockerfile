FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

# Copy csproj files and restore dependencies
COPY ["src/SDP.TaskManagement.WebHost/SDP.TaskManagement.WebHost.csproj", "src/SDP.TaskManagement.WebHost/"]
COPY ["src/SDP.TaskManagement.Web/SDP.TaskManagement.Web.csproj", "src/SDP.TaskManagement.Web/"]
COPY ["src/SDP.TaskManagement.Application/SDP.TaskManagement.Application.csproj", "src/SDP.TaskManagement.Application/"]
COPY ["src/SDP.TaskManagement.Domain/SDP.TaskManagement.Domain.csproj", "src/SDP.TaskManagement.Domain/"]
COPY ["src/SDP.TaskManagement.Infrastructure/SDP.TaskManagement.Infrastructure.csproj", "src/SDP.TaskManagement.Infrastructure/"]
RUN dotnet restore "src/SDP.TaskManagement.WebHost/SDP.TaskManagement.WebHost.csproj"

# Copy all source code
COPY . .
WORKDIR "/src/src/SDP.TaskManagement.WebHost"

# Create Controllers directory if it doesn't exist
RUN mkdir -p Controllers

# Add health check endpoint
RUN echo 'using Microsoft.AspNetCore.Mvc; \n\
namespace SDP.TaskManagement.WebHost.Controllers; \n\
\n\
[ApiController] \n\
[Route("[controller]")] \n\
public class HealthController : ControllerBase \n\
{ \n\
    [HttpGet] \n\
    public IActionResult Get() \n\
    { \n\
        return Ok(new { status = "healthy" }); \n\
    } \n\
}' > Controllers/HealthController.cs

# Build and publish
RUN dotnet build "SDP.TaskManagement.WebHost.csproj" -c Release -o /app/build
RUN dotnet publish "SDP.TaskManagement.WebHost.csproj" -c Release -o /app/publish

# Build runtime image
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS final
WORKDIR /app
COPY --from=build /app/publish .

# Install curl for health checks
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

EXPOSE 80
EXPOSE 443
ENTRYPOINT ["dotnet", "SDP.TaskManagement.WebHost.dll"]

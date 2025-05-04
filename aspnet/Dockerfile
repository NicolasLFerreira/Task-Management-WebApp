FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

# Copy csproj files and restore dependencies
COPY ["src/SDP.TaskManagement.WebHost/SDP.TaskManagement.WebHost.csproj", "src/SDP.TaskManagement.WebHost/"]
COPY ["src/SDP.TaskManagement.Application/SDP.TaskManagement.Application.csproj", "src/SDP.TaskManagement.Application/"]
COPY ["src/SDP.TaskManagement.Domain/SDP.TaskManagement.Domain.csproj", "src/SDP.TaskManagement.Domain/"]
COPY ["src/SDP.TaskManagement.Infrastructure/SDP.TaskManagement.Infrastructure.csproj", "src/SDP.TaskManagement.Infrastructure/"]

RUN dotnet restore "src/SDP.TaskManagement.WebHost/SDP.TaskManagement.WebHost.csproj"

# Copy all source code
COPY . .

# Build the application
WORKDIR "/src/src/SDP.TaskManagement.WebHost"
RUN dotnet build "SDP.TaskManagement.WebHost.csproj" -c Release -o /app/build

# Publish the application
FROM build AS publish
RUN dotnet publish "SDP.TaskManagement.WebHost.csproj" -c Release -o /app/publish

# Final image
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "SDP.TaskManagement.WebHost.dll"]

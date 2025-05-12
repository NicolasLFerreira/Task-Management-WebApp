# PowerShell script for orchestrating the Task Management Web App on Windows
# Save this file as run.ps1 in the root directory of your project

# Colors for output
$Green = "Green"
$Yellow = "Yellow"
$Red = "Red"
$Blue = "Cyan"

# Function to print section headers
function Print-Header($text) {
    Write-Host "`n=== $text ===`n" -ForegroundColor $Blue
}

# Function to print success messages
function Print-Success($text) {
    Write-Host "✓ $text" -ForegroundColor $Green
}

# Function to print warning messages
function Print-Warning($text) {
    Write-Host "⚠ $text" -ForegroundColor $Yellow
}

# Function to print error messages
function Print-Error($text) {
    Write-Host "✗ $text" -ForegroundColor $Red
}

# Function to check if Docker is running
function Check-Docker {
    Print-Header "Checking Docker"
    try {
        docker info | Out-Null
        Print-Success "Docker is running"
    } catch {
        Print-Error "Docker is not running. Please start Docker Desktop and try again."
        exit 1
    }
}

# Function to create .env file if it doesn't exist
function Create-EnvFile {
    Print-Header "Checking Environment Configuration"
    
    $EnvFile = "docker-scripts\.env"
    
    if (Test-Path $EnvFile) {
        Print-Success "Environment file exists at $EnvFile"
    } else {
        Print-Warning "Environment file not found. Creating default .env file..."
        
        $EnvContent = @"
# Database Configuration
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=taskmanagementdb
POSTGRES_PORT=5432

# Backend Configuration
BACKEND_PORT=7200
BACKEND_HTTPS_PORT=7201

# Frontend Configuration
FRONTEND_PORT=3000

# JWT Configuration
JWT_KEY=Must_Be_Changed_In_Prod
JWT_ISSUER=TaskManagementApp
JWT_AUDIENCE=TaskManagementUsers
JWT_LIFETIME=60
"@
        
        New-Item -Path $EnvFile -ItemType File -Force | Out-Null
        Set-Content -Path $EnvFile -Value $EnvContent
        
        Print-Success "Default .env file created at $EnvFile"
        Print-Warning "Please review the default values in the .env file and adjust as needed"
    }
}

# Function to check if init.sql exists, create if not
function Check-InitSql {
    Print-Header "Checking Database Initialization Script"
    
    $InitSql = "docker-scripts\init.sql"
    
    if (Test-Path $InitSql) {
        Print-Success "Database initialization script exists at $InitSql"
    } else {
        Print-Warning "Database initialization script not found. Creating default init.sql..."
        
        $SqlContent = @"
-- This script is executed when the PostgreSQL container is created
-- It can be used to create initial database objects or seed data

-- Create extension if not exists
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Add any additional initialization SQL here
"@
        
        New-Item -Path $InitSql -ItemType File -Force | Out-Null
        Set-Content -Path $InitSql -Value $SqlContent
        
        Print-Success "Default init.sql created at $InitSql"
    }
}

# Function to create favicon files to prevent 404 errors
function Create-FaviconFiles {
    Print-Header "Checking Favicon Files"
    
    $FaviconDir = "docker-scripts\favicon"
    
    if (Test-Path $FaviconDir) {
        Print-Success "Favicon directory exists at $FaviconDir"
    } else {
        Print-Warning "Favicon directory not found. Creating default favicon files..."
        
        New-Item -Path $FaviconDir -ItemType Directory -Force | Out-Null
        
        # Create empty favicon files to prevent 404 errors
        New-Item -Path "$FaviconDir\favicon.ico" -ItemType File -Force | Out-Null
        New-Item -Path "$FaviconDir\apple-touch-icon.png" -ItemType File -Force | Out-Null
        New-Item -Path "$FaviconDir\apple-touch-icon-precomposed.png" -ItemType File -Force | Out-Null
        
        Print-Success "Default favicon files created at $FaviconDir"
    }
}

# Function to start the application
function Start-Application {
    Print-Header "Starting Application"
    
    Push-Location docker-scripts
    
    # Pull latest images
    Print-Warning "Pulling latest images..."
    docker-compose pull db
    
    # Build and start containers
    Print-Warning "Building and starting containers..."
    
    # First, try to build just the backend to catch any build errors
    $backendBuild = docker-compose build backend
    if ($LASTEXITCODE -ne 0) {
        Print-Error "Failed to build backend. Check the error message above."
        Pop-Location
        exit 1
    }
    
    # Then build and start all services
    $startResult = docker-compose up -d --build
    if ($LASTEXITCODE -eq 0) {
        Print-Success "Application started successfully"
        Print-Header "Application URLs"
        
        # Get port values from .env file
        $envContent = Get-Content .env
        $frontendPort = ($envContent | Where-Object { $_ -match "FRONTEND_PORT" } | ForEach-Object { $_ -replace ".*=", "" }).Trim()
        $backendPort = ($envContent | Where-Object { $_ -match "BACKEND_PORT" } | ForEach-Object { $_ -replace ".*=", "" }).Trim()
        $postgresPort = ($envContent | Where-Object { $_ -match "POSTGRES_PORT" } | ForEach-Object { $_ -replace ".*=", "" }).Trim()
        
        if (-not $frontendPort) { $frontendPort = "3000" }
        if (-not $backendPort) { $backendPort = "7200" }
        if (-not $postgresPort) { $postgresPort = "5432" }
        
        Write-Host "Frontend: " -NoNewline
        Write-Host "http://localhost:$frontendPort" -ForegroundColor $Green
        
        Write-Host "Backend API: " -NoNewline
        Write-Host "http://localhost:$backendPort" -ForegroundColor $Green
        
        Write-Host "Backend Swagger: " -NoNewline
        Write-Host "http://localhost:$backendPort/swagger" -ForegroundColor $Green
        
        Write-Host "Database: " -NoNewline
        Write-Host "localhost:$postgresPort" -ForegroundColor $Green
        
        # Wait for services to be ready
        Print-Warning "Waiting for services to be ready..."
        Start-Sleep -Seconds 10
        
        # Check if services are running
        $psResult = docker-compose ps
        if ($psResult -match "Up") {
            Print-Success "All services are running"
        } else {
            Print-Warning "Some services may not be running. Check logs with '.\run.ps1 logs'"
        }
    } else {
        Print-Error "Failed to start application"
        Pop-Location
        exit 1
    }
    
    Pop-Location
}

# Function to stop the application
function Stop-Application {
    Print-Header "Stopping Application"
    
    Push-Location docker-scripts
    docker-compose down
    
    if ($LASTEXITCODE -eq 0) {
        Print-Success "Application stopped successfully"
    } else {
        Print-Error "Failed to stop application"
        exit 1
    }
    
    Pop-Location
}

# Function to show logs
function Show-Logs {
    Print-Header "Application Logs"
    
    Push-Location docker-scripts
    docker-compose logs -f
    Pop-Location
}

# Function to show frontend logs only
function Show-FrontendLogs {
    Print-Header "Frontend Logs"
    
    Push-Location docker-scripts
    docker-compose logs -f frontend
    Pop-Location
}

# Function to show backend logs only
function Show-BackendLogs {
    Print-Header "Backend Logs"
    
    Push-Location docker-scripts
    docker-compose logs -f backend
    Pop-Location
}

# Function to show database logs only
function Show-DbLogs {
    Print-Header "Database Logs"
    
    Push-Location docker-scripts
    docker-compose logs -f db
    Pop-Location
}

# Function to restart a specific service
function Restart-Service($service) {
    Print-Header "Restarting $service"
    
    Push-Location docker-scripts
    docker-compose restart $service
    
    if ($LASTEXITCODE -eq 0) {
        Print-Success "$service restarted successfully"
    } else {
        Print-Error "Failed to restart $service"
        exit 1
    }
    
    Pop-Location
}

# Function to check service health
function Check-Health {
    Print-Header "Checking Service Health"
    
    Push-Location docker-scripts
    
    # Check database
    $dbHealth = docker-compose exec db pg_isready -U postgres 2>$null
    if ($LASTEXITCODE -eq 0) {
        Print-Success "Database is healthy"
    } else {
        Print-Warning "Database may not be healthy. Check logs with '.\run.ps1 db-logs'"
    }
    
    # Check backend
    $backendHealth = docker-compose exec backend curl -s http://localhost:80/health 2>$null
    if ($LASTEXITCODE -eq 0) {
        Print-Success "Backend is healthy"
    } else {
        Print-Warning "Backend may not be healthy. Check logs with '.\run.ps1 backend-logs'"
    }
    
    # Get frontend port from .env file
    $envContent = Get-Content .env
    $frontendPort = ($envContent | Where-Object { $_ -match "FRONTEND_PORT" } | ForEach-Object { $_ -replace ".*=", "" }).Trim()
    if (-not $frontendPort) { $frontendPort = "3000" }
    
    # Check frontend
    try {
        $frontendResponse = Invoke-WebRequest -Uri "http://localhost:$frontendPort" -UseBasicParsing -TimeoutSec 5 -ErrorAction SilentlyContinue
        Print-Success "Frontend is healthy"
    } catch {
        Print-Warning "Frontend may not be healthy. Check logs with '.\run.ps1 frontend-logs'"
    }
    
    Pop-Location
}

# Function to clean up unused Docker resources
function Cleanup-DockerResources {
    Print-Header "Cleaning Up Docker Resources"
    
    # Remove unused containers
    Print-Warning "Removing unused containers..."
    docker container prune -f
    
    # Remove unused images
    Print-Warning "Removing unused images..."
    docker image prune -f
    
    # Remove unused volumes (be careful with this one)
    Print-Warning "Removing unused volumes..."
    docker volume prune -f
    
    Print-Success "Cleanup completed"
}

# Main script execution
Check-Docker
Create-EnvFile
Check-InitSql
Create-FaviconFiles

# Process command line arguments
$command = $args[0]

switch ($command) {
    "start" {
        Start-Application
    }
    "stop" {
        Stop-Application
    }
    "restart" {
        Stop-Application
        Start-Application
    }
    "restart-frontend" {
        Restart-Service "frontend"
    }
    "restart-backend" {
        Restart-Service "backend"
    }
    "restart-db" {
        Restart-Service "db"
    }
    "logs" {
        Show-Logs
    }
    "frontend-logs" {
        Show-FrontendLogs
    }
    "backend-logs" {
        Show-BackendLogs
    }
    "db-logs" {
        Show-DbLogs
    }
    "health" {
        Check-Health
    }
    "cleanup" {
        Cleanup-DockerResources
    }
    default {
        Print-Header "Task Management Web App Orchestration Script"
        Write-Host "Usage: .\run.ps1 [command]"
        Write-Host ""
        Write-Host "Commands:"
        Write-Host "  start           - Start the application"
        Write-Host "  stop            - Stop the application"
        Write-Host "  restart         - Restart the application"
        Write-Host "  restart-frontend - Restart only the frontend service"
        Write-Host "  restart-backend - Restart only the backend service"
        Write-Host "  restart-db      - Restart only the database service"
        Write-Host "  logs            - Show all application logs"
        Write-Host "  frontend-logs   - Show only frontend logs"
        Write-Host "  backend-logs    - Show only backend logs"
        Write-Host "  db-logs         - Show only database logs"
        Write-Host "  health          - Check the health of all services"
        Write-Host "  cleanup         - Clean up unused Docker resources"
        Write-Host ""
        Write-Host "If no command is provided, the application will be started."
        Write-Host ""
        
        # Default action is to start the application
        Start-Application
    }
}

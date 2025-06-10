function Write-Color {
    param([string]$Text, [string]$Color)
    Write-Host $Text -ForegroundColor $Color
}

function Print-Header { param($Text); Write-Color "`n=== $Text ===`n" "Cyan" }
function Print-Success { param($Text); Write-Color "SUCCESS: $Text" "Green" }
function Print-Warning { param($Text); Write-Color "WARNING: $Text" "Yellow" }
function Print-Error { param($Text); Write-Color "ERROR: $Text" "Red" }

function Check-Docker {
    Print-Header "Checking Docker"
    docker info > $null 2>&1
    if ($LASTEXITCODE -ne 0) {
        Print-Error "Docker is not running. Please start Docker and try again."
        exit 1
    }
    Print-Success "Docker is running"
}

function Create-EnvFile {
    Print-Header "Checking Environment Configuration"
    $envFile = "docker-scripts\.env"
    if (Test-Path $envFile) {
        Print-Success ".env file exists at $envFile"
    } else {
        Print-Warning ".env file not found. Creating default .env file..."
        @'
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
'@ | Set-Content $envFile
        Print-Success "Default .env file created at $envFile"
        Print-Warning "Please review the default values in the .env file and adjust as needed"
    }
}

function Check-InitSQL {
    Print-Header "Checking Database Initialization Script"
    $initSQL = "docker-scripts\init.sql"
    if (Test-Path $initSQL) {
        Print-Success "init.sql exists at $initSQL"
    } else {
        Print-Warning "init.sql not found. Creating default init.sql..."
        @'
-- This script is executed when the PostgreSQL container is created
-- It can be used to create initial database objects or seed data

-- Create extension if not exists
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Add any additional initialization SQL here
'@ | Set-Content $initSQL
        Print-Success "Default init.sql created at $initSQL"
    }
}

function Create-FaviconFiles {
    Print-Header "Checking Favicon Files"
    $dir = "docker-scripts\favicon"
    if (!(Test-Path $dir)) {
        Print-Warning "Favicon directory not found. Creating default favicon files..."
        New-Item -ItemType Directory -Path $dir | Out-Null
        New-Item -ItemType File -Path "$dir\favicon.ico" | Out-Null
        New-Item -ItemType File -Path "$dir\apple-touch-icon.png" | Out-Null
        New-Item -ItemType File -Path "$dir\apple-touch-icon-precomposed.png" | Out-Null
        Print-Success "Default favicon files created at $dir"
    } else {
        Print-Success "Favicon directory exists at $dir"
    }
}

function Start-Application {
    Print-Header "Starting Application"
    Push-Location "docker-scripts"
    Print-Warning "Pulling latest images..."
    docker-compose pull db
    Print-Warning "Building and starting containers..."
    docker-compose build backend
    if ($LASTEXITCODE -ne 0) {
        Print-Error "Failed to build backend."
        Pop-Location
        exit 1
    }
    docker-compose up -d --build
    if ($LASTEXITCODE -eq 0) {
        Print-Success "Application started successfully"
        Print-Header "Application URLs"

        $envLines = Get-Content ".env" | Where-Object { $_ -match "=" }
        $envMap = @{}
        foreach ($line in $envLines) {
            $parts = $line -split "=", 2
            if ($parts.Length -eq 2) {
                $envMap[$parts[0]] = $parts[1]
            }
        }

        $frontendPort = $envMap["FRONTEND_PORT"]
        $backendPort = $envMap["BACKEND_PORT"]
        $dbPort = $envMap["POSTGRES_PORT"]

        Write-Color "Frontend: http://localhost:$frontendPort" "Green"
        Write-Color "Backend API: http://localhost:$backendPort" "Green"
        Write-Color "Backend Swagger: http://localhost:$backendPort/swagger" "Green"
        Write-Color "Database: localhost:$dbPort" "Green"

        Print-Warning "Waiting for services to be ready..."
        Start-Sleep -Seconds 10

        if ((docker-compose ps) -match "Up") {
            Print-Success "All services are running"
        } else {
            Print-Warning "Some services may not be running. Check logs with 'run.ps1 logs'"
        }
    } else {
        Print-Error "Failed to start application"
    }
    Pop-Location
}

function Stop-Application {
    Print-Header "Stopping Application"
    Push-Location "docker-scripts"
    docker-compose down
    if ($LASTEXITCODE -eq 0) {
        Print-Success "Application stopped successfully"
    } else {
        Print-Error "Failed to stop application"
    }
    Pop-Location
}

function Restart-Service($Service) {
    Print-Header "Restarting $Service"
    Push-Location "docker-scripts"
    docker-compose restart $Service
    if ($LASTEXITCODE -eq 0) {
        Print-Success "$Service restarted successfully"
    } else {
        Print-Error "Failed to restart $Service"
    }
    Pop-Location
}

function Show-Logs { docker-compose -f "docker-scripts\docker-compose.yml" logs -f }
function Show-FrontendLogs { docker-compose -f "docker-scripts\docker-compose.yml" logs -f frontend }
function Show-BackendLogs { docker-compose -f "docker-scripts\docker-compose.yml" logs -f backend }
function Show-DBLogs { docker-compose -f "docker-scripts\docker-compose.yml" logs -f db }

function Check-Health {
    Print-Header "Checking Service Health"
    Push-Location "docker-scripts"
    docker-compose exec db pg_isready -U postgres > $null 2>&1
    if ($LASTEXITCODE -eq 0) { Print-Success "Database is healthy" } else { Print-Warning "Database may not be healthy." }

    docker-compose exec backend curl -s http://localhost:80/health > $null 2>&1
    if ($LASTEXITCODE -eq 0) { Print-Success "Backend is healthy" } else { Print-Warning "Backend may not be healthy." }

    $envLines = Get-Content ".env" | Where-Object { $_ -match "=" }
    $envMap = @{}
    foreach ($line in $envLines) {
        $parts = $line -split "=", 2
        if ($parts.Length -eq 2) {
            $envMap[$parts[0]] = $parts[1]
        }
    }
    $frontendPort = $envMap["FRONTEND_PORT"]
    curl -s "http://localhost:$frontendPort" > $null 2>&1
    if ($LASTEXITCODE -eq 0) { Print-Success "Frontend is healthy" } else { Print-Warning "Frontend may not be healthy." }

    Pop-Location
}

function Cleanup {
    Print-Header "Cleaning Up Docker Resources"
    Print-Warning "Removing unused containers..."
    docker container prune -f
    Print-Warning "Removing unused images..."
    docker image prune -f
    Print-Warning "Removing unused volumes..."
    docker volume prune -f
    Print-Success "Cleanup completed"
}

# ========== ENTRY POINT ==========
param(
    [string]$Command = "start"
)

Check-Docker
Create-EnvFile
Check-InitSQL
Create-FaviconFiles

switch ($Command.ToLower()) {
    "start"           { Start-Application }
    "stop"            { Stop-Application }
    "restart"         { Stop-Application; Start-Application }
    "restart-frontend"{ Restart-Service "frontend" }
    "restart-backend" { Restart-Service "backend" }
    "restart-db"      { Restart-Service "db" }
    "logs"            { Show-Logs }
    "frontend-logs"   { Show-FrontendLogs }
    "backend-logs"    { Show-BackendLogs }
    "db-logs"         { Show-DBLogs }
    "health"          { Check-Health }
    "cleanup"         { Cleanup }
    default {
        Print-Header "Usage"
        Write-Host "run.ps1 [start|stop|restart|restart-frontend|restart-backend|restart-db|logs|frontend-logs|backend-logs|db-logs|health|cleanup]"
        Start-Application
    }
}

# Task Management Web App Orchestration

This project includes orchestration scripts to run the full application stack (frontend, backend, and database) using Docker Compose.

## Prerequisites

- Docker and Docker Compose installed
- Git (for version control)

## Getting Started

### For Unix/Linux/macOS Users

1. Make the script executable:
   \`\`\`bash
   chmod +x run.sh
   \`\`\`

2. Start the application:
   \`\`\`bash
   ./run.sh start
   \`\`\`

### For Windows Users

1. Run the PowerShell script:
   ```powershell
   .\run.ps1 start
   \`\`\`

## Available Commands

Both scripts support the same commands:

- **Start**: `./run.sh start` or `.\run.ps1 start` - Starts all components
- **Stop**: `./run.sh stop` or `.\run.ps1 stop` - Stops all components
- **Restart**: `./run.sh restart` or `.\run.ps1 restart` - Restarts all components
- **Restart Frontend**: `./run.sh restart-frontend` or `.\run.ps1 restart-frontend` - Restarts only the frontend
- **Restart Backend**: `./run.sh restart-backend` or `.\run.ps1 restart-backend` - Restarts only the backend
- **Restart Database**: `./run.sh restart-db` or `.\run.ps1 restart-db` - Restarts only the database
- **Logs**: `./run.sh logs` or `.\run.ps1 logs` - Shows logs from all components
- **Frontend Logs**: `./run.sh frontend-logs` or `.\run.ps1 frontend-logs` - Shows only frontend logs
- **Backend Logs**: `./run.sh backend-logs` or `.\run.ps1 backend-logs` - Shows only backend logs
- **Database Logs**: `./run.sh db-logs` or `.\run.ps1 db-logs` - Shows only database logs
- **Health**: `./run.sh health` or `.\run.ps1 health` - Checks the health of all services
- **Cleanup**: `./run.sh cleanup` or `.\run.ps1 cleanup` - Cleans up unused Docker resources

## Configuration

The scripts automatically create a `.env` file in the `docker-scripts` directory if one doesn't exist. You can modify this file to change:

- Database credentials
- Port mappings
- JWT settings
- Other environment variables

## Troubleshooting

If you encounter issues:

1. Check the logs: `./run.sh logs` or `.\run.ps1 logs`
2. Verify Docker is running
3. Ensure ports specified in the .env file are available
4. Check network connectivity between containers

## Project Structure

- `client/task-management-webapp/` - Frontend React application
- `aspnet/` - Backend .NET application
- `docker-scripts/` - Docker Compose and related files
- `run.sh` - Bash script for Unix/Linux/macOS
- `run.ps1` - PowerShell script for Windows

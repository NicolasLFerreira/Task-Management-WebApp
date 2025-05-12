#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print section headers
print_header() {
    echo -e "\n${BLUE}=== $1 ===${NC}\n"
}

# Function to print success messages
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

# Function to print warning messages
print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

# Function to print error messages
print_error() {
    echo -e "${RED}✗ $1${NC}"
}

# Function to check if Docker is running
check_docker() {
    print_header "Checking Docker"
    if ! docker info > /dev/null 2>&1; then
        print_error "Docker is not running. Please start Docker and try again."
        exit 1
    fi
    print_success "Docker is running"
}

# Function to create .env file if it doesn't exist
create_env_file() {
    print_header "Checking Environment Configuration"
    
    ENV_FILE="docker-scripts/.env"
    
    if [ -f "$ENV_FILE" ]; then
        print_success "Environment file exists at $ENV_FILE"
    else
        print_warning "Environment file not found. Creating default .env file..."
        
        cat > "$ENV_FILE" << EOF
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
EOF
        
        print_success "Default .env file created at $ENV_FILE"
        print_warning "Please review the default values in the .env file and adjust as needed"
    fi
}

# Function to check if init.sql exists, create if not
check_init_sql() {
    print_header "Checking Database Initialization Script"
    
    INIT_SQL="docker-scripts/init.sql"
    
    if [ -f "$INIT_SQL" ]; then
        print_success "Database initialization script exists at $INIT_SQL"
    else
        print_warning "Database initialization script not found. Creating default init.sql..."
        
        cat > "$INIT_SQL" << EOF
-- This script is executed when the PostgreSQL container is created
-- It can be used to create initial database objects or seed data

-- Create extension if not exists
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Add any additional initialization SQL here
EOF
        
        print_success "Default init.sql created at $INIT_SQL"
    fi
}

# Function to create favicon files to prevent 404 errors
create_favicon_files() {
    print_header "Checking Favicon Files"
    
    FAVICON_DIR="docker-scripts/favicon"
    
    if [ -d "$FAVICON_DIR" ]; then
        print_success "Favicon directory exists at $FAVICON_DIR"
    else
        print_warning "Favicon directory not found. Creating default favicon files..."
        
        mkdir -p "$FAVICON_DIR"
        
        # Create empty favicon files to prevent 404 errors
        touch "$FAVICON_DIR/favicon.ico"
        touch "$FAVICON_DIR/apple-touch-icon.png"
        touch "$FAVICON_DIR/apple-touch-icon-precomposed.png"
        
        print_success "Default favicon files created at $FAVICON_DIR"
    fi
}

# Function to start the application
start_application() {
    print_header "Starting Application"
    
    cd docker-scripts
    
    # Pull latest images
    print_warning "Pulling latest images..."
    docker-compose pull db
    
    # Build and start containers
    print_warning "Building and starting containers..."
    
    # First, try to build just the backend to catch any build errors
    if ! docker-compose build backend; then
        print_error "Failed to build backend. Check the error message above."
        cd ..
        exit 1
    fi
    
    # Then build and start all services
    if docker-compose up -d --build; then
        print_success "Application started successfully"
        print_header "Application URLs"
        echo -e "Frontend: ${GREEN}http://localhost:$(grep FRONTEND_PORT .env | cut -d '=' -f2 || echo 3000)${NC}"
        echo -e "Backend API: ${GREEN}http://localhost:$(grep BACKEND_PORT .env | cut -d '=' -f2 || echo 7200)${NC}"
        echo -e "Backend Swagger: ${GREEN}http://localhost:$(grep BACKEND_PORT .env | cut -d '=' -f2 || echo 7200)/swagger${NC}"
        echo -e "Database: ${GREEN}localhost:$(grep POSTGRES_PORT .env | cut -d '=' -f2 || echo 5432)${NC}"
        
        # Wait for services to be ready
        print_warning "Waiting for services to be ready..."
        sleep 10
        
        # Check if services are running
        if docker-compose ps | grep -q "Up"; then
            print_success "All services are running"
        else
            print_warning "Some services may not be running. Check logs with './run.sh logs'"
        fi
    else
        print_error "Failed to start application"
        cd ..
        exit 1
    fi
    
    cd ..
}

# Function to stop the application
stop_application() {
    print_header "Stopping Application"
    
    cd docker-scripts
    docker-compose down
    
    if [ $? -eq 0 ]; then
        print_success "Application stopped successfully"
    else
        print_error "Failed to stop application"
        exit 1
    fi
    
    cd ..
}

# Function to show logs
show_logs() {
    print_header "Application Logs"
    
    cd docker-scripts
    docker-compose logs -f
    cd ..
}

# Function to show frontend logs only
show_frontend_logs() {
    print_header "Frontend Logs"
    
    cd docker-scripts
    docker-compose logs -f frontend
    cd ..
}

# Function to show backend logs only
show_backend_logs() {
    print_header "Backend Logs"
    
    cd docker-scripts
    docker-compose logs -f backend
    cd ..
}

# Function to show database logs only
show_db_logs() {
    print_header "Database Logs"
    
    cd docker-scripts
    docker-compose logs -f db
    cd ..
}

# Function to restart a specific service
restart_service() {
    local service=$1
    print_header "Restarting $service"
    
    cd docker-scripts
    docker-compose restart $service
    
    if [ $? -eq 0 ]; then
        print_success "$service restarted successfully"
    else
        print_error "Failed to restart $service"
        exit 1
    fi
    
    cd ..
}

# Function to check service health
check_health() {
    print_header "Checking Service Health"
    
    cd docker-scripts
    
    # Check database
    if docker-compose exec db pg_isready -U postgres > /dev/null 2>&1; then
        print_success "Database is healthy"
    else
        print_warning "Database may not be healthy. Check logs with './run.sh db-logs'"
    fi
    
    # Check backend
    if docker-compose exec backend curl -s http://localhost:80/health > /dev/null 2>&1; then
        print_success "Backend is healthy"
    else
        print_warning "Backend may not be healthy. Check logs with './run.sh backend-logs'"
    fi
    
    # Check frontend
    if curl -s http://localhost:$(grep FRONTEND_PORT .env | cut -d '=' -f2 || echo 3000) > /dev/null 2>&1; then
        print_success "Frontend is healthy"
    else
        print_warning "Frontend may not be healthy. Check logs with './run.sh frontend-logs'"
    fi
    
    cd ..
}

# Function to clean up unused Docker resources
cleanup() {
    print_header "Cleaning Up Docker Resources"
    
    # Remove unused containers
    print_warning "Removing unused containers..."
    docker container prune -f
    
    # Remove unused images
    print_warning "Removing unused images..."
    docker image prune -f
    
    # Remove unused volumes (be careful with this one)
    print_warning "Removing unused volumes..."
    docker volume prune -f
    
    print_success "Cleanup completed"
}

# Main script execution
check_docker
create_env_file
check_init_sql
create_favicon_files

# Process command line arguments
case "$1" in
    start)
        start_application
        ;;
    stop)
        stop_application
        ;;
    restart)
        stop_application
        start_application
        ;;
    restart-frontend)
        restart_service "frontend"
        ;;
    restart-backend)
        restart_service "backend"
        ;;
    restart-db)
        restart_service "db"
        ;;
    logs)
        show_logs
        ;;
    frontend-logs)
        show_frontend_logs
        ;;
    backend-logs)
        show_backend_logs
        ;;
    db-logs)
        show_db_logs
        ;;
    health)
        check_health
        ;;
    cleanup)
        cleanup
        ;;
    *)
        print_header "Task Management Web App Orchestration Script"
        echo "Usage: $0 [command]"
        echo ""
        echo "Commands:"
        echo "  start           - Start the application"
        echo "  stop            - Stop the application"
        echo "  restart         - Restart the application"
        echo "  restart-frontend - Restart only the frontend service"
        echo "  restart-backend - Restart only the backend service"
        echo "  restart-db      - Restart only the database service"
        echo "  logs            - Show all application logs"
        echo "  frontend-logs   - Show only frontend logs"
        echo "  backend-logs    - Show only backend logs"
        echo "  db-logs         - Show only database logs"
        echo "  health          - Check the health of all services"
        echo "  cleanup         - Clean up unused Docker resources"
        echo ""
        echo "If no command is provided, the application will be started."
        echo ""
        
        # Default action is to start the application
        start_application
        ;;
esac

exit 0

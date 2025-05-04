# Task Management Application

A comprehensive task management solution built with ASP.NET Core and React TypeScript, designed to help users organize and track their tasks efficiently.

![Task Management App](docs/images/app-screenshot.png)

## Features

- **User Authentication**
  - Secure registration and login
  - JWT-based authentication
  - Password hashing with BCrypt

- **Task Management**
  - Create, read, update, and delete tasks
  - Set task priorities (Low, Medium, High)
  - Track task status (Todo, In Progress, Completed)
  - Set due dates for tasks
  - Task descriptions and details

- **Organization & Filtering**
  - Search tasks by title or description
  - Filter tasks by status and priority
  - Sort tasks by due date, priority, title, or creation date
  - Dashboard with task summary and upcoming tasks

- **User Experience**
  - Responsive design for all devices
  - Dark mode support
  - User profile management
  - Intuitive UI with clear task status indicators

- **Security**
  - Protected API routes
  - Secure authentication flow
  - User-specific task isolation

## Technology Stack

### Backend
- **ASP.NET Core** - Web API framework
- **Entity Framework Core** - ORM for database operations
- **PostgreSQL** - Database
- **JWT Authentication** - For secure API access
- **BCrypt** - For password hashing
- **Docker** - Containerization

### Frontend
- **React** - UI library
- **TypeScript** - Type-safe JavaScript
- **React Router** - For navigation
- **Tailwind CSS** - For styling
- **Lucide React** - For icons
- **JWT Decode** - For token handling

## Setup Instructions

### Prerequisites
- [.NET 8 SDK](https://dotnet.microsoft.com/download)
- [Node.js](https://nodejs.org/) (v16 or later)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- [PostgreSQL](https://www.postgresql.org/) or Docker

### Backend Setup

1. **Clone the repository**
   \`\`\`bash
   git clone https://github.com/yourusername/task-management-app.git
   cd task-management-app
   \`\`\`

2. **Configure the database**
   - Update the connection string in `aspnet/src/SDP.TaskManagement.WebHost/appsettings.json`
   \`\`\`json
   "ConnectionStrings": {
     "DefaultConnection": "Host=localhost;Port=5432;Database=taskmanagementdb;Username=yourusername;Password=yourpassword;"
   }
   \`\`\`

3. **Configure JWT settings**
   - Update the JWT settings in `aspnet/src/SDP.TaskManagement.WebHost/appsettings.json`
   \`\`\`json
   "Jwt": {
     "Key": "your_secure_key_at_least_16_characters_long",
     "Issuer": "TaskManagementApp",
     "Audience": "TaskManagementUsers",
     "TokenLifetimeMinutes": "60"
   }
   \`\`\`

4. **Run migrations**
   \`\`\`bash
   cd aspnet/src/SDP.TaskManagement.WebHost
   dotnet ef database update
   \`\`\`

5. **Run the backend**
   \`\`\`bash
   dotnet run
   \`\`\`
   The API will be available at `https://localhost:7200`

### Frontend Setup

1. **Navigate to the frontend directory**
   \`\`\`bash
   cd client/task-management-webapp
   \`\`\`

2. **Install dependencies**
   \`\`\`bash
   npm install
   # or
   yarn
   \`\`\`

3. **Configure API URL**
   - Create a `.env` file in the frontend directory
   \`\`\`
   VITE_API_URL=https://localhost:7200/api
   \`\`\`

4. **Run the frontend**
   \`\`\`bash
   npm run dev
   # or
   yarn dev
   \`\`\`
   The application will be available at `http://localhost:5173`

### Docker Setup

For a quick setup using Docker:

1. **Configure environment variables**
   - Update the `.env` file in the root directory
   \`\`\`
   POSTGRES_USER=admin
   POSTGRES_PASSWORD=yourpassword
   JWT_KEY=your_secure_key_at_least_16_characters_long
   JWT_ISSUER=TaskManagementApp
   JWT_AUDIENCE=TaskManagementUsers
   JWT_LIFETIME=60
   \`\`\`

2. **Build and run with Docker Compose**
   \`\`\`bash
   docker-compose up -d
   \`\`\`
   - Frontend: `http://localhost:5173`
   - Backend: `http://localhost:7200`
   - Database: `localhost:5432`

## Usage Guide

### Authentication

1. **Register a new account**
   - Navigate to `/register`
   - Fill in your name, email, and password
   - Click "Create account"

2. **Login**
   - Navigate to `/login`
   - Enter your email and password
   - Click "Sign in"

### Task Management

1. **Create a new task**
   - Click "New Task" button
   - Fill in the task details (title, description, due date, priority, status)
   - Click "Create Task"

2. **View all tasks**
   - Navigate to `/tasks`
   - Use filters to sort and search tasks

3. **Update a task**
   - Click "Edit" on a task card
   - Update the task details
   - Click "Update Task"

4. **Change task status**
   - Click "Change Status" on a task card
   - The status will cycle through Todo → In Progress → Completed → Todo

5. **Delete a task**
   - Click "Delete" on a task card
   - Confirm deletion

### Dashboard

- View task summary (counts by status)
- See upcoming tasks sorted by due date

### User Profile

- View your profile information
- Update your name (email cannot be changed)

## API Documentation

### Authentication Endpoints

- `POST /api/Account/register` - Register a new user
- `POST /api/Account/login` - Login and get JWT token

### Task Endpoints

- `GET /api/TaskItem/{id}` - Get a specific task
- `GET /api/TaskItem/all` - Get all tasks for the current user
- `POST /api/TaskItem` - Create a new task
- `PUT /api/TaskItem/{id}` - Update a task
- `DELETE /api/TaskItem/{id}` - Delete a task

## Project Structure

### Backend

\`\`\`
aspnet/
├── src/
│   ├── SDP.TaskManagement.Application/
│   │   ├── Abstractions/       # Interfaces
│   │   ├── Controllers/        # API Controllers
│   │   ├── Dtos/               # Data Transfer Objects
│   │   ├── Mappers/            # Object Mappers
│   │   └── Services/           # Business Logic
│   ├── SDP.TaskManagement.Domain/
│   │   ├── Base/               # Base Classes
│   │   └── Entities/           # Domain Entities
│   ├── SDP.TaskManagement.Infrastructure/
│   │   ├── Managers/           # Domain Managers
│   │   ├── Persistence/        # Database Context
│   │   └── Repository/         # Data Access
│   └── SDP.TaskManagement.WebHost/
│       ├── Properties/         # Launch Settings
│       └── Program.cs          # Application Entry Point
\`\`\`

### Frontend

\`\`\`
client/task-management-webapp/
├── app/
│   ├── components/             # UI Components
│   │   ├── layout/             # Layout Components
│   │   ├── task/               # Task-related Components
│   │   └── ui/                 # UI Elements
│   ├── context/                # React Context
│   ├── routes/                 # Route Components
│   ├── services/               # API Services
│   ├── types/                  # TypeScript Types
│   └── utils/                  # Utility Functions
├── public/                     # Static Assets
└── package.json                # Dependencies
\`\`\`

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Acknowledgements

- [ASP.NET Core](https://docs.microsoft.com/en-us/aspnet/core/)
- [Entity Framework Core](https://docs.microsoft.com/en-us/ef/core/)
- [React](https://reactjs.org/)
- [React Router](https://reactrouter.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Lucide Icons](https://lucide.dev/)
- [JWT](https://jwt.io/)
- [BCrypt.Net](https://github.com/BcryptNet/bcrypt.net)
- [PostgreSQL](https://www.postgresql.org/)
- [Docker](https://www.docker.com/)

## License

This project is licensed under the MIT License - see the LICENSE file for details.
\`\`\`

```plaintext file="docs/images/app-screenshot.png" url="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/placeholder-ob7miW3mUreePYfXdVwkpFWHthzoR5.svg?height=600&width=800"

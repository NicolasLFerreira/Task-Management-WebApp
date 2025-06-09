
# Task Management Web App

A comprehensive web application designed for efficient task and project management. This application allows users and teams to organize, track, and collaborate on tasks seamlessly.

##  Key Features

*   **Dynamic Boards:** Create, view, and manage project boards.
    *   Edit board titles and descriptions.
*   **Interactive Lists:** Organize tasks within boards using customizable lists.
    *   Create and edit list titles.
*   **Task Management:** Create, update, and assign tasks.
    *   View task details, add comments, and manage attachments.
*   **Drag & Drop Functionality:**
    *   Reorder lists within a board.
    *   Reorder tasks within a list and move tasks between lists.
*   **"My Tasks" Page:** A personalized view for users to see all tasks assigned to them.
*   **User Authentication:** Secure login and registration system.
*   **Real-time Updates:** Changes made by users are reflected across the application in real-time.
*   **Notifications:**  Keep users informed about important updates.
*  **User Profiles:**
     * View and update user profiles.
     * Upload and manage profile pictures.
     * Password Reset
     * User preferences
*  **Header & Sidebar:**
    * To provide users with an intuitive and consistent layout, the application includes a clearly visible header and sidebar for navigation.

## Tech Stack

*   **Backend:** ASP.NET Core, C#
*   **Frontend:** React, TypeScript, Vite
*   **Database:** PostgreSQL (managed with Docker)
*   **API:** RESTful API for communication between frontend and backend.
*   **Styling:** ( Tailwind CSS)

## Getting Started

### Prerequisites

*   [.NET SDK](https://dotnet.microsoft.com/download)
*   [npm](https://www.npmjs.com/) 
*   [Docker and Docker Compose](https://www.docker.com/products/docker-desktop/) (for running the database)

---

### Setup & Running the Application

1.  **Clone the repository:**
    ```bash
    git clone <https://github.com/NicolasLFerreira/Task-Management-WebApp.git>
    cd TaskManagementWebApp
    ```

2.  **Setup and Run the Database:**
    Navigate to the database configuration directory and start the PostgreSQL container:
    ```bash
    cd database
    docker-compose up -d
    ```
    *(This assumes `database/docker-compose.yaml` sets up the PostgreSQL instance. Adjust if your setup is different, e.g., using `docker-scripts/docker-compose.yaml` for the database.)*

3.  **Setup and Run the Backend (ASP.NET Core):**
    Navigate to the ASP.NET WebHost project directory, restore dependencies, and run the application:
    ```bash
    cd ../aspnet/src/SDP.TaskManagement.WebHost
    dotnet restore
    dotnet run
    ```
    The backend API will typically be available at `http://localhost:7200` or `https://localhost:7201`. Check your `launchSettings.json` for the exact ports.

4.  **Setup and Run the Frontend (React):**
    Navigate to the client application directory, install dependencies, and start the development server:
    ```bash
    cd ../../../client/task-management-webapp
    npm install
    npm run dev
    ```
    The frontend application will typically be available at `http://localhost:3000` (default Vite port).

5.  **Access the Application:**
    Open your web browser and navigate to the frontend URL (e.g., `http://localhost:3000`).

---

## Project Structure (Simplified)

```
TaskManagementWebAppmain/
├── aspnet/                  # ASP.NET Core backend solution
│   ├── src/
│   │   ├── SDP.TaskManagement.Application/
│   │   ├── SDP.TaskManagement.Domain/
│   │   ├── SDP.TaskManagement.Infrastructure/
│   │   ├── SDP.TaskManagement.Web/         # API Controllers
│   │   └── SDP.TaskManagement.WebHost/     # Main web host project
│   └── tests/
├── client/                  # React frontend application
│   └── task-management-webapp/
│       ├── public/
│       ├── app/             # Main application source (components, pages, etc.)
│       ├── api-client/      # Generated API client
│       └── pages/                  # Route-based pages mapped to URLs
│   │   │   ├── Auth.tsx           # Login/Register page
│   │   │   ├── Boards.tsx         # Main project boards overview
│   │   │   ├── Chat.tsx           # Real-time team chat interface
│   │   │   ├── Dashboard.tsx      # User dashboard/home screen
│   │   │   ├── Home.tsx           # Landing or post-login screen
│   │   │   ├── MyTasks.tsx        # User’s personalized task list
│   │   │   ├── Notifications.tsx  # Notifications center
│   │   │   ├── Search.tsx         # Global search interface
│   │   │   ├── Settings.tsx       # User profile/settings management
│   │   │   └── Team.tsx           # Team members and collaboration features
├── database/                # Docker-compose for PostgreSQL
├── docker-scripts/          # Other Docker related scripts and configurations
├── README.md                # This file
└── ...                      # Other root level configuration or script files
```

---

##  Scripts

*   `run.sh` / `run.ps1`: (These scripts initialize and run the entire application stack. Use run.sh for macOS/Linux and run.ps1 for Windows (PowerShell). The script will automatically generate all necessary files, such as the .env configuration, and set up the full environment required to run the application).
*   `make-executable.sh`: (it makes the script executable for run.sh).

| Script               | Description |
|----------------------|-------------|
| `run.sh`             | Runs full-stack app on UNIX (backend, docker , frontend, DB) |
| `run.ps1`            | Same as above for Windows using PowerShell |
| `make-executable.sh` | Makes `run.sh` and other scripts executable |
| `docker-compose.yaml`| Configures and runs PostgreSQL container |
| `init.sql`           | Optional SQL seeding script for DB |
| `backup-db.sh`       | Optional script to back up database |

---

## API Documentation

Swagger UI is enabled for the backend.

* Visit `https://localhost:7200/swagger` to explore and test all available endpoints
* Includes routes for:
  * `GET /api/boards`
  * `POST /api/tasks`
  - `PUT /api/users/{id}`

For OpenAPI: `https://localhost:7200/swagger/v1/swagger.json`

---

##  Testing

### Backend
```bash
cd aspnet/tests
dotnet test
```

### Frontend
```bash
cd client/task-management-webapp
npm run test
```
### Other Ways to Run

```bash
chmod +x run.sh
./run.sh start/
``` 

--- 

##  Future Improvements

- [ ] Email notifications
- [ ] Team & Chat
- [ ] Mobile responsiveness
- [ ] User Preferences
- [ ] AI Connections


---

## Environment Variables

### Database (`database/.env`)
```env
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=taskmanagementdb
POSTGRES_PORT=5432
```

### Backend (`aspnet/.env`)
```env
BACKEND_PORT=7200
BACKEND_HTTPS_PORT=7201

# JWT Configuration
JWT_KEY=ThisIsAVeryLongSecretKeyForHS256SigningAlgorithm
JWT_ISSUER=TaskManagementApp
JWT_AUDIENCE=TaskManagementUsers
JWT_LIFETIME=60
```

### Frontend (`client/.env`)
```env
FRONTEND_PORT=3000
VITE_API_BASE_URL=http://localhost:7200
```





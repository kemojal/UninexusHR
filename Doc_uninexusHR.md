# UninexusHR Documentation

## Introduction
UninexusHR is a comprehensive Human Resources management system designed to streamline HR processes, enhance employee management, and improve overall organizational efficiency. This document provides a detailed guide to understanding, setting up, and using the UninexusHR platform.

## Getting Started

### Prerequisites
Before you begin, ensure you have the following installed:
- Node.js (v18 or higher)
- npm (v8 or higher)
- Python (v3.9 or higher)
- pip
- A relational database (e.g., PostgreSQL, MySQL)

### Installation Steps
1. **Clone the Repository:**
   ```bash
   git clone https://github.com/your-username/UninexusHR.git
   cd UninexusHR
   ```
2. **Backend Setup:**
   - Navigate to the `backend` directory:
     ```bash
     cd backend
     ```
   - Create a virtual environment:
     ```bash
     python -m venv venv
     source venv/bin/activate  # On Windows use `venv\Scripts\activate`
     ```
   - Install backend dependencies:
     ```bash
     pip install -r requirements.txt
     ```
   - Set up the database:
     - Create a `.env` file in the `backend` directory and configure database connection details.
     - Run database migrations:
       ```bash
       alembic upgrade head
       ```
   - Start the backend server:
     ```bash
     python -m app.main
     ```
3. **Frontend Setup:**
   - Navigate to the `frontend` directory:
     ```bash
     cd ../frontend
     ```
   - Install frontend dependencies:
     ```bash
     npm install
     ```
   - Start the frontend application:
     ```bash
     npm run dev
     ```

## Project Structure

### Backend
The backend is built using Python and FastAPI.
- **`backend/app/`**: Contains the main application logic.
  - **`api/`**: Defines API endpoints and routing.
    - **`v1/`**: Contains version 1 API endpoints.
  - **`core/`**: Includes core application configurations and security settings.
  - **`crud/`**: Contains data access logic for database interactions.
  - **`db/`**: Manages database connections and sessions.
  - **`models/`**: Defines database models using SQLAlchemy.
  - **`schemas/`**: Defines data validation schemas using Pydantic.
  - **`utils/`**: Contains utility functions for email, permissions, and security.
- **`backend/alembic/`**: Manages database migrations.
- **`backend/scripts/`**: Contains scripts for database setup and superuser creation.

### Frontend
The frontend is built using Next.js.
- **`frontend/app/`**: Contains the main application logic and page routing.
  - **`(auth)/`**: Contains authentication-related pages.
  - **`(dashboard)/`**: Contains dashboard pages.
  - **`accept-invitation/`**: Contains the accept invitation page.
- **`frontend/components/`**: Contains reusable UI components.
  - **`auth/`**: Contains authentication components.
  - **`dashboard/`**: Contains dashboard components.
  - **`forms/`**: Contains form components.
  - **`roles/`**: Contains role-related components.
  - **`shared/`**: Contains shared components.
  - **`ui/`**: Contains UI components.
- **`frontend/hooks/`**: Contains custom React hooks.
- **`frontend/lib/`**: Contains utility functions and API configurations.
- **`frontend/providers/`**: Contains React providers.
- **`frontend/store/`**: Contains application state management.
- **`frontend/types/`**: Contains TypeScript type definitions.

## Code Guidelines

### Backend
- Follow PEP 8 style guidelines for Python code.
- Use type hints for better code readability and maintainability.
- Write clear and concise docstrings for all functions and classes.
- Use consistent naming conventions for variables, functions, and classes.
- Implement proper error handling and logging.

### Frontend
- Follow React best practices.
- Use TypeScript for type safety.
- Write clear and concise comments for complex logic.
- Use consistent naming conventions for variables, functions, and components.
- Implement proper error handling and user feedback.

## Configuration

### Backend
- Environment variables are managed using a `.env` file in the `backend` directory.
- Key environment variables include:
  - `DATABASE_URL`: Database connection string.
  - `SECRET_KEY`: Secret key for JWT authentication.
  - `SMTP_HOST`: SMTP server host for email sending.
  - `SMTP_PORT`: SMTP server port.
  - `SMTP_USER`: SMTP server username.
  - `SMTP_PASSWORD`: SMTP server password.
  - `SMTP_FROM`: Email address to send emails from.
- Configuration settings are loaded from `backend/app/core/config.py`.

### Frontend
- Frontend configuration is managed in `frontend/next.config.js`.
- API base URL is configured in `frontend/lib/api.ts`.

## API Documentation

### Base URL
The base URL for the API is `http://localhost:8000/api/v1`.

### Endpoints

#### Organizations
- **GET /api/v1/organizations**: Retrieve a list of organizations.
- **POST /api/v1/organizations**: Create a new organization.
- **GET /api/v1/organizations/{org_id}**: Retrieve a specific organization by ID.
- **PUT /api/v1/organizations/{org_id}**: Update an existing organization.
- **DELETE /api/v1/organizations/{org_id}**: Delete an organization.

#### Users
- **GET /api/v1/users**: Retrieve a list of users.
- **POST /api/v1/users**: Create a new user.
- **GET /api/v1/users/{user_id}**: Retrieve a specific user by ID.
- **PUT /api/v1/users/{user_id}**: Update an existing user.
- **DELETE /api/v1/users/{user_id}**: Delete a user.

#### Auth
- **POST /api/v1/auth/login**: Authenticate a user and receive a JWT token.
- **POST /api/v1/auth/register**: Register a new user.

#### Invitations
- **POST /api/v1/invitations**: Create a new invitation.
- **GET /api/v1/invitations/{invitation_id}**: Retrieve a specific invitation by ID.
- **POST /api/v1/invitations/{invitation_id}/accept**: Accept an invitation.

#### Join Requests
- **POST /api/v1/organizations/{org_id}/join-requests**: Create a new join request.
- **GET /api/v1/organizations/{org_id}/join-requests**: List all join requests for an organization.
- **PUT /api/v1/organizations/{org_id}/join-requests/{request_id}**: Update join request status (approve/reject).
- **DELETE /api/v1/organizations/{org_id}/join-requests/{request_id}**: Delete a join request.

#### Dashboard
- **GET /api/v1/dashboard/stats**: Get dashboard statistics.

### Authentication
- API endpoints are protected using JWT authentication.
- Include the JWT token in the `Authorization` header as a `Bearer` token.

## Components

### Authentication Components
- **Login**: Handles user authentication.
- **Register**: Allows new users to register.

### Dashboard Components
- **Dashboard**: Main dashboard view displaying statistics and organization data.
- **OrganizationList**: Displays a list of organizations.
- **UserList**: Displays a list of users.

### Organization Components
- **OrganizationDetails**: Displays details of a specific organization.
- **MemberList**: Displays members of an organization.
- **RoleManagement**: Manages roles within an organization.

### Invitation Components
- **InvitationForm**: Form for creating new invitations.
- **InvitationList**: Displays a list of invitations.

### Join Request Components
- **JoinRequestForm**: Form for submitting join requests.
- **JoinRequestList**: Displays a list of join requests.

## Database
- The project uses a relational database (e.g., PostgreSQL, MySQL).
- Database models are defined using SQLAlchemy in the `backend/app/models/` directory.
- Database migrations are managed using Alembic in the `backend/alembic/` directory.
- Key database tables include:
  - `organizations`: Stores organization details.
  - `users`: Stores user details.
  - `user_organizations`: Stores user-organization relationships.
  - `roles`: Stores user roles.
  - `permissions`: Stores permissions.
  - `invitations`: Stores invitations.

## Deployment
1. **Build the Frontend:**
   ```bash
   cd frontend
   npm run build
   ```
2. **Deploy the Backend:**
   - Deploy the backend application to a suitable hosting service (e.g., Heroku, AWS, Google Cloud).
   - Ensure the database is properly configured and accessible.
3. **Deploy the Frontend:**
   - Deploy the frontend application to a hosting service (e.g., Vercel, Netlify).
   - Configure the frontend to point to the deployed backend API URL.

## Troubleshooting
- **Backend Issues:**
  - Check the logs in `backend/app.log` for errors.
  - Ensure that all environment variables are correctly set.
  - Verify database connection details.
  - Check for any database migration issues.
- **Frontend Issues:**
  - Check the browser console for JavaScript errors.
  - Ensure the API base URL is correctly configured.
  - Verify that all required dependencies are installed.
- **General Issues:**
  - Ensure that both the backend and frontend are running on the correct ports.
  - Check for any network connectivity issues.

## Additional Resources
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [Next.js Documentation](https://nextjs.org/docs)
- [SQLAlchemy Documentation](https://www.sqlalchemy.org/)
- [Alembic Documentation](https://alembic.sqlalchemy.org/en/latest/)
- [Pydantic Documentation](https://pydantic-docs.helpmanual.io/)

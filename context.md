## instructions

## VisaReady Appointment System

## Code Style and Structure

### Frontend
- Follow consistent naming conventions for components and files (e.g., PascalCase for components).
- Use functional components with hooks for state and lifecycle management.
- Maintain a clear folder structure that separates components, hooks, and utilities.
- Write CSS using Tailwind CSS utility classes for styling.
- Ensure code is linted using ESLint with the specified configuration.

#### Frontend Structure
```
frontend/
├── app/
├── components/
├── hooks/
├── lib/
├── middleware.ts
├── providers/
├── public/
├── store/
├── types/
├── README.md
├── package.json
└── tailwind.config.ts
```

### Backend
- Use PEP 8 style guide for Python code.
- Organize code into modules and packages logically.
- Follow RESTful principles for API design.
- Use type hints for function signatures to enhance code readability.
- Ensure proper error handling and logging throughout the application.

#### Backend Structure
```
backend/
├── alembic/
├── app/
├── scripts/
├── venv/
├── .env
├── alembic.ini
├── pyproject.toml
├── requirements.txt
└── setup.py
```

## Tech Stack
 - Frontend
   - React
   - Next.js (app directory)
   - TypeScript
   - Tailwind CSS
   - Shadcn UI
   - Framer Motion
   - Zod
   - React Hook Form
   - React Query
   - Axios
   - React Toastify
   - **Directory Structure**:
     - `app/`: Contains application-specific pages and components.
     - `components/`: Houses reusable UI components.
     - `hooks/`: Custom hooks for managing state and side effects.
     - `lib/`: Utility functions or libraries used across the application.
     - `middleware.ts`: Custom middleware for handling requests.
     - `providers/`: Context providers for managing global state.
     - `public/`: Static assets like images and fonts.
     - `store/`: State management files.
     - `types/`: Type definitions for TypeScript.
 - Backend
   - FastAPI
   - PostgreSQL
   - Express.js
   - JWT
   - **Directory Structure**:
     - `alembic/`: Contains migration scripts for database schema changes.
     - `app/`: The main application code, likely containing API routes, models, and services.
     - `scripts/`: Utility scripts for various tasks.
     - `venv/`: Virtual environment for managing dependencies.
     - **Important Files**:
       - `.env`: Environment variables for configuration.
       - `alembic.ini`: Configuration file for Alembic migrations.
       - `pyproject.toml`: Project metadata and dependencies.
       - `requirements.txt`: Lists Python package dependencies.
       - `setup.py`: Script for installing the package.

## Naming conventions
- [Add specific naming conventions for variables, functions, components, etc.]

## TypeScript usage
- [Describe how TypeScript is used in the project, including any specific patterns or practices]

## State management
- [Explain the state management approach, e.g., Redux, Context API, etc.]

## Syntax and formatting
- [Include any specific syntax and formatting guidelines]

## UI and Styling
- Use `npx shadcn@latest init` to initialize Shadcn
- Use `npx shadcn@latest add <component-name>` to add new Shadcn component

## Performance Optimization
- [Include strategies for optimizing performance]

## Error handling
- [Provide guidelines for error handling]

## Testing
- [Outline testing strategies and tools used]

## Git Usage
- [Include specific Git commands and workflows]

## Documentation
- [Mention how documentation is maintained and updated]

## Development workflow
- [Describe the development workflow]

## Deployment
- [Outline the deployment process]

## Windsurf specific
- .windsurfrules ...p-= 

## Table of Contents
- [Consider adding a table of contents for easier navigation]

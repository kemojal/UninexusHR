# UninexusHR Sample Roles and Permissions

## Default Permissions

### Member Management
- `view_members`: View organization members
- `invite_members`: Invite new members to the organization
- `remove_members`: Remove members from organization
- `manage_roles`: Assign and manage member roles

### Employee Management
- `view_employees`: View employee profiles and basic information
- `manage_employees`: Create, update, and archive employee records
- `view_salaries`: Access salary information
- `manage_salaries`: Update and manage salary information
- `view_attendance`: View employee attendance records
- `manage_attendance`: Manage attendance and time tracking

### Leave Management
- `view_leave`: View leave requests and balances
- `manage_leave`: Approve/reject leave requests
- `manage_leave_policies`: Configure leave policies and types

### Performance Management
- `view_performance`: View performance reviews and goals
- `manage_performance`: Create and manage performance reviews
- `manage_goals`: Set and track employee goals

### Document Management
- `view_documents`: View HR documents and policies
- `manage_documents`: Upload and manage HR documents
- `manage_templates`: Create and edit document templates

### Settings & Configuration
- `view_settings`: View organization settings
- `manage_settings`: Update organization settings
- `manage_departments`: Create and manage departments
- `manage_positions`: Create and manage job positions

## Sample Roles

### Administrator
**Description**: Full system access with all permissions
**Permissions**:
- All permissions

### HR Manager
**Description**: Manages all HR-related functions
**Permissions**:
- All employee management permissions
- All leave management permissions
- All performance management permissions
- All document management permissions
- `view_settings`
- `manage_departments`
- `manage_positions`

### HR Assistant
**Description**: Assists with day-to-day HR operations
**Permissions**:
- `view_employees`
- `view_attendance`
- `manage_attendance`
- `view_leave`
- `manage_leave`
- `view_documents`
- `manage_documents`

### Department Manager
**Description**: Manages their department's employees
**Permissions**:
- `view_members`
- `view_employees`
- `view_attendance`
- `manage_attendance`
- `view_leave`
- `manage_leave`
- `view_performance`
- `manage_performance`
- `manage_goals`

### Team Lead
**Description**: Manages their team members
**Permissions**:
- `view_members`
- `view_employees`
- `view_attendance`
- `view_leave`
- `manage_leave`
- `view_performance`
- `manage_goals`

### Employee
**Description**: Basic employee access
**Permissions**:
- `view_members`
- `view_documents`
- `view_attendance`
- `view_leave`
- `view_performance`

### Finance Manager
**Description**: Manages payroll and financial aspects
**Permissions**:
- `view_employees`
- `view_salaries`
- `manage_salaries`
- `view_attendance`
- `view_documents`
- `manage_documents`

## Permission Categories

1. **members**: Member-related permissions
2. **employees**: Employee management permissions
3. **leave**: Leave management permissions
4. **performance**: Performance management permissions
5. **documents**: Document management permissions
6. **settings**: System settings permissions
7. **departments**: Department management permissions
8. **positions**: Position management permissions
9. **analytics**: Analytics and reporting permissions
10. **billing**: Billing and financial permissions
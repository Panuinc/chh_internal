# Naming Conventions

This project follows strict naming conventions to maintain code consistency.

## General Rules

### Variables & Functions: `camelCase`
```javascript
// ✅ Good
const userName = "John";
const employeeId = "abc123";
function getUserById() {}

// ❌ Bad
const user_name = "John";
const employee_id = "abc123";
function get_user_by_id() {}
```

### Constants: `UPPER_SNAKE_CASE`
```javascript
// ✅ Good
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const DEFAULT_LIMIT = 20;

// ❌ Bad
const maxFileSize = 5 * 1024 * 1024;
const defaultLimit = 20;
```

### React Components: `PascalCase`
```javascript
// ✅ Good
function UserProfile() {}
const EmployeeCard = () => {};

// ❌ Bad
function userProfile() {}
const employeeCard = () => {};
```

### Classes: `PascalCase`
```javascript
// ✅ Good
class AppError extends Error {}
class ValidationError extends AppError {}

// ❌ Bad
class appError extends Error {}
class validation_error extends Error {}
```

### Database Models (Prisma): `PascalCase`
```prisma
// ✅ Good
model Employee { }
model Visitor { }

// ❌ Bad
model employee { }
model visitor { }
```

### Database Fields: `camelCase`
```prisma
// ✅ Good
employeeFirstName
visitorStatus

// ❌ Bad
employee_first_name
visitor_status
```

### API Routes: `kebab-case`
```
// ✅ Good
/api/hr/employee
/api/security/visitor

// ❌ Bad
/api/hr/employee-management
/api/security/visitor_management
```

### File Names
- **Components**: `PascalCase.jsx` (e.g., `UserProfile.jsx`)
- **Hooks**: `camelCase.js` (e.g., `useEmployee.js`)
- **Services**: `camelCase.js` (e.g., `employee.service.js`)
- **Utils**: `camelCase.js` (e.g., `formatDate.js`)
- **API Routes**: `route.js` (Next.js convention)

## Enforced by ESLint

Run `npm run lint` to check for naming convention violations.

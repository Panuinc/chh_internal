# CHH Internal API Documentation

## Overview

EverGreen Internal System - A comprehensive HR, Security, Warehouse, Production, and Sales management system.

**Base URL:** `http://localhost:3000` (development)

## Authentication

The API uses Next-Auth with JWT-based session authentication.

### Login
```http
POST /api/auth/callback/credentials
Content-Type: application/json

{
  "username": "string",
  "password": "string"
}
```

### Response Headers
All API responses include:
- `X-Request-ID`: Unique identifier for request tracking
- `X-RateLimit-Limit`: Maximum requests allowed
- `X-RateLimit-Remaining`: Remaining requests in current window

---

## API Endpoints

### HR Module

#### Employees
```http
# List all employees
GET /api/hr/employee?page=1&limit=20

# Get employee by ID
GET /api/hr/employee/{employeeId}

# Create employee
POST /api/hr/employee
Content-Type: application/json

{
  "employeeFirstName": "string",
  "employeeLastName": "string",
  "employeeEmail": "string",
  "employeeCreatedBy": "string (optional)"
}

# Update employee
PUT /api/hr/employee/{employeeId}
Content-Type: application/json

{
  "employeeFirstName": "string",
  "employeeLastName": "string",
  "employeeEmail": "string",
  "employeeStatus": "Active|Inactive",
  "employeeUpdatedBy": "string (optional)"
}
```

#### Accounts
```http
# List all accounts
GET /api/hr/account?page=1&limit=20

# Get account by ID
GET /api/hr/account/{accountId}

# Create account
POST /api/hr/account
Content-Type: application/json

{
  "accountEmployeeId": "string",
  "accountUsername": "string",
  "accountPassword": "string",
  "accountStatus": "Active|Inactive",
  "accountCreatedBy": "string (optional)"
}

# Update account
PUT /api/hr/account/{accountId}
Content-Type: application/json

{
  "accountUsername": "string",
  "accountStatus": "Active|Inactive",
  "accountUpdatedBy": "string (optional)"
}
```

#### Departments
```http
GET /api/hr/department
GET /api/hr/department/{departmentId}
POST /api/hr/department
PUT /api/hr/department/{departmentId}
```

#### Permissions
```http
GET /api/hr/permission
GET /api/hr/permission/{permissionId}
POST /api/hr/permission
PUT /api/hr/permission/{permissionId}
```

#### Assigns
```http
GET /api/hr/assign
GET /api/hr/assign/employee/{employeeId}
POST /api/hr/assign
```

### Security Module

#### Visitors
```http
# List all visitors
GET /api/security/visitor?page=1&limit=20

# Get visitor by ID
GET /api/security/visitor/{visitorId}

# Create visitor (multipart/form-data)
POST /api/security/visitor
Content-Type: multipart/form-data

Form fields:
- visitorFirstName: string
- visitorLastName: string
- visitorCompany: string
- visitorCarRegistration: string
- visitorProvince: string
- visitorContactUserId: string
- visitorContactReason: Shipping|BillingChequeCollection|JobApplication|ProductPresentation|Meeting|Other
- visitorCreatedBy: string
- visitorPhoto: File (optional, max 5MB)
- visitorDocumentPhotos: File[] (optional, max 5MB each)

# Update visitor
PUT /api/security/visitor/{visitorId}
Content-Type: multipart/form-data

# Quick checkout
POST /api/security/visitor/{visitorId}/checkout
Content-Type: application/json

{
  "updatedBy": "string"
}
```

#### Patrols
```http
GET /api/security/patrol
POST /api/security/patrol
Content-Type: multipart/form-data

Form fields:
- patrolQrCodeInfo: string
- patrolNote: string
- patrolCreatedBy: string
- patrolPicture: File (optional, max 5MB)
```

### Warehouse Module

#### Finished Goods
```http
GET /api/warehouse/finishedGoods
GET /api/warehouse/finishedGoods/{id}
POST /api/warehouse/finishedGoods
PUT /api/warehouse/finishedGoods/{id}
```

#### Raw Materials
```http
GET /api/warehouse/rawMaterial
GET /api/warehouse/rawMaterial/{id}
POST /api/warehouse/rawMaterial
PUT /api/warehouse/rawMaterial/{id}
```

#### Packing
```http
GET /api/warehouse/packing
GET /api/warehouse/packing/{id}
POST /api/warehouse/packing
PUT /api/warehouse/packing/{id}
```

#### Supply
```http
GET /api/warehouse/supply
GET /api/warehouse/supply/{id}
POST /api/warehouse/supply
PUT /api/warehouse/supply/{id}
```

### Sales Module

#### Sales Order Online
```http
GET /api/sales/salesOrderOnline
GET /api/sales/salesOrderOnline/{id}
POST /api/sales/salesOrderOnline
PUT /api/sales/salesOrderOnline/{id}
```

### System

#### Health Check
```http
GET /api/health

Response:
{
  "status": "healthy|degraded",
  "checks": {
    "database": { "status": "healthy", "responseTime": "5ms" },
    "businessCentral": { "status": "healthy", "responseTime": "120ms" },
    "printer": { "status": "healthy", "responseTime": "15ms" },
    "environment": { "status": "healthy" }
  },
  "info": {
    "nodeVersion": "v20.x.x",
    "platform": "linux",
    "uptime": "120 minutes"
  }
}
```

---

## Error Responses

### Standard Error Format
```json
{
  "error": "Error message",
  "details": {} // Optional validation details
}
```

### HTTP Status Codes
| Code | Meaning |
|------|---------|
| 200 | OK |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 409 | Conflict |
| 422 | Unprocessable Entity |
| 429 | Too Many Requests |
| 500 | Internal Server Error |
| 503 | Service Unavailable |

### Common Errors
```json
// Validation Error (400)
{
  "error": "Invalid input",
  "details": {
    "employeeEmail": ["Invalid email format"]
  }
}

// Not Found (404)
{
  "error": "Employee not found"
}

// Conflict (409)
{
  "error": "employeeEmail 'john@example.com' already exists"
}

// Rate Limit (429)
{
  "error": "Too many requests. Please try again later.",
  "retryAfter": 60
}
```

---

## Rate Limiting

| Endpoint Type | Limit | Window |
|--------------|-------|--------|
| General API | 100 requests | 60 seconds |
| Strict API | 20 requests | 60 seconds |
| Authentication | 5 attempts | 5 minutes |
| File Upload | 10 uploads | 60 seconds |

---

## File Upload

### Limits
- Maximum file size: 5MB
- Allowed types: `image/jpeg`, `image/png`, `image/webp`, `image/gif`
- Allowed extensions: `.jpg`, `.jpeg`, `.png`, `.webp`, `.gif`, `.pdf`

### Example (cURL)
```bash
curl -X POST http://localhost:3000/api/security/visitor \
  -H "Content-Type: multipart/form-data" \
  -F "visitorFirstName=John" \
  -F "visitorLastName=Doe" \
  -F "visitorCompany=Acme" \
  -F "visitorCarRegistration=ABC123" \
  -F "visitorProvince=Bangkok" \
  -F "visitorContactUserId=user123" \
  -F "visitorContactReason=Meeting" \
  -F "visitorCreatedBy=admin123" \
  -F "visitorPhoto=@photo.jpg"
```

---

## Permissions

### Permission Format
Permissions follow the pattern: `module.resource.action`

Examples:
- `hr.view` - View HR module
- `hr.employee.create` - Create employees
- `security.visitor.edit` - Edit visitors
- `warehouse.packing.view` - View packing

### Super Admin
Users with `superadmin` permission have access to all resources.

---

## WebSocket / Real-time

Currently not implemented. All operations are HTTP-based.

---

## Changelog

### v1.0.0
- Initial API release
- HR, Security, Warehouse, Sales modules
- JWT authentication
- File upload support
- Rate limiting
- Request ID tracking

# CHH Internal System - Agent Guide

## Project Overview

CHH Internal System (EverGreen Internal Management System) is a comprehensive enterprise web application for managing HR, Security, Warehouse, Production, and Sales operations. Built with Next.js 16, it features role-based access control (RBAC), modular architecture, and integrations with external services like LINE, Microsoft Business Central, and Thailand Post EMS.

**Project Type**: Next.js 16 Full-Stack Application (App Router)  
**Language**: JavaScript (ES2024)  
**Primary Region**: Thailand (ICT timezone support)

---

## Technology Stack

| Category | Technology |
|----------|------------|
| Framework | Next.js 16.0.8 |
| Runtime | Node.js 20+ |
| Language | JavaScript (ES2024) |
| React | 19.2.1 |
| Database | MySQL 8.0 |
| ORM | Prisma 6.18.0 |
| Auth | Next-Auth v5 (Beta) |
| UI Library | HeroUI 2.8.5 |
| Styling | Tailwind CSS v4 |
| Animation | Framer Motion |
| Icons | Lucide React |
| Charts | Recharts |
| PDF | jsPDF + html-to-image |
| QR/Barcode | html5-qrcode, react-barcode |
| Logging | Winston + Daily Rotate File |
| Validation | Zod 4.1.13 |
| Compiler | Babel React Compiler |

---

## Project Structure

```
chh_internal/
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── (auth)/              # Auth group routes
│   │   │   ├── signIn/          # Login page
│   │   │   └── forbidden/       # 403 page
│   │   ├── (pages)/             # Main application pages
│   │   │   ├── home/            # Dashboard home
│   │   │   ├── hr/              # HR module (employee, account, department, role, permission)
│   │   │   ├── security/        # Security module (visitor, patrol)
│   │   │   ├── warehouse/       # Warehouse module (packing, supply, finishedGoods, rawMaterial)
│   │   │   ├── production/      # Production module (doorBom)
│   │   │   ├── sales/           # Sales module (salesOrderOnline, memo)
│   │   │   ├── accounting/      # Accounting module (checkTagEMS)
│   │   │   └── profile/         # User profile
│   │   ├── api/                 # API routes
│   │   │   ├── auth/            # Next-Auth handlers
│   │   │   ├── hr/              # HR APIs
│   │   │   ├── security/        # Security APIs
│   │   │   ├── warehouse/       # Warehouse APIs
│   │   │   ├── sales/           # Sales APIs
│   │   │   ├── accounting/      # Accounting APIs
│   │   │   ├── uploads/         # File upload handler
│   │   │   └── health/          # Health check endpoint
│   │   ├── layout.jsx           # Root layout
│   │   ├── page.jsx             # Root redirect
│   │   ├── providers.jsx        # React context providers
│   │   ├── error.js             # Error boundary
│   │   ├── not-found.jsx        # 404 page
│   │   ├── loading.js           # Loading UI
│   │   ├── sitemap.js           # SEO sitemap
│   │   └── robots.js            # SEO robots
│   │
│   ├── components/              # Shared components
│   │   ├── layout/              # Layout components (ModuleLayout, ModulePage, SubMenu)
│   │   ├── ui/                  # UI components (Loading, Toast, NotFound)
│   │   ├── table/               # Table component
│   │   ├── providers/           # Context providers (TokenRefreshProvider)
│   │   └── chainWay/            # RFID printer components
│   │
│   ├── features/                # Feature-based modules
│   │   ├── auth/                # Authentication feature
│   │   ├── hr/                  # HR feature (components, hooks, services, schemas)
│   │   ├── security/            # Security feature
│   │   ├── warehouse/           # Warehouse feature
│   │   ├── production/          # Production feature
│   │   ├── sales/               # Sales feature
│   │   ├── accounting/          # Accounting feature
│   │   ├── home/                # Home dashboard
│   │   └── profile/             # Profile feature
│   │
│   ├── hooks/                   # Global React hooks
│   ├── lib/                     # Utility libraries
│   │   ├── auth.js              # Next-Auth configuration
│   │   ├── auth-messages.js     # Auth error messages
│   │   ├── prisma.js            # Prisma client singleton
│   │   ├── logger.node.js       # Winston logger (Node.js)
│   │   ├── rateLimiter.js       # Rate limiting
│   │   ├── sanitize.js          # Input sanitization (DOMPurify)
│   │   ├── validators.js        # Input validators
│   │   ├── getLocalNow.js       # Thailand timezone helper
│   │   ├── fileStore.js         # File upload utilities
│   │   ├── lineNotify.js        # LINE notification service
│   │   ├── env.js               # Environment validation
│   │   ├── zodSchema.js         # Zod utilities
│   │   ├── requestContext.js    # Request ID tracking
│   │   ├── retry.js             # Retry logic
│   │   ├── hero.js              # HeroUI configuration
│   │   ├── bc/                  # Business Central integration
│   │   ├── chainWay/            # ChainWay RFID printer integration
│   │   └── shared/              # Shared utilities
│   │       ├── constants.js     # HTTP status, pagination
│   │       ├── errors.js        # Error classes
│   │       ├── hooks.js         # Shared React hooks
│   │       ├── schema.js        # Shared Zod schemas
│   │       ├── server.js        # Server-side utilities
│   │       ├── logger.js        # Logger factory
│   │       ├── logger-node.js   # Node.js logger
│   │       └── logger-edge.js   # Edge runtime logger
│   │
│   ├── config/                  # Configuration files
│   │   ├── app.config.js        # App constants
│   │   └── menu.config.js       # Navigation & permission config
│   │
│   ├── style/                   # Global styles
│   │   └── globals.css          # Tailwind + custom styles
│   │
│   ├── utils/                   # Utility functions (client-side)
│   └── middleware.js            # Next.js middleware (auth, RBAC)
│
├── prisma/
│   ├── schema.prisma            # Database schema
│   └── seed.js                  # Seed default permissions
│
├── docs/
│   ├── API_DOCUMENTATION.md     # API reference
│   ├── NAMING_CONVENTIONS.md    # Code style guide
│   └── RBAC_MIGRATION_GUIDE.md  # RBAC migration docs
│
├── public/                      # Static assets
├── logs/                        # Application logs (production)
├── Dockerfile                   # Multi-stage Docker build
├── next.config.js               # Next.js configuration
├── eslint.config.mjs            # ESLint configuration
├── jsconfig.json                # Path aliases (@/*)
├── postcss.config.mjs           # PostCSS + Tailwind v4
└── package.json                 # Dependencies
```

---

## Build and Development Commands

```bash
# Development
npm run dev              # Start development server (localhost:3000)

# Build
npm run build            # Build for production (standalone output)
npm run start            # Start production server

# Code Quality
npm run lint             # Run ESLint (enforces naming conventions)

# Database
npx prisma generate      # Generate Prisma client
npx prisma migrate dev   # Run database migrations
npx prisma db seed       # Seed default permissions
npx prisma studio        # Open Prisma Studio
```

---

## Code Style Guidelines

### Naming Conventions (Enforced by ESLint)

| Type | Convention | Example |
|------|------------|---------|
| Variables & Functions | `camelCase` | `getUserById`, `employeeName` |
| Constants | `UPPER_SNAKE_CASE` | `MAX_FILE_SIZE`, `DEFAULT_LIMIT` |
| React Components | `PascalCase` | `UserProfile.jsx`, `EmployeeList` |
| Classes | `PascalCase` | `AppError`, `ValidationError` |
| Database Models | `PascalCase` | `Employee`, `Visitor` |
| Database Fields | `camelCase` | `employeeFirstName`, `visitorStatus` |
| API Routes | `kebab-case` | `/api/hr/employee`, `/api/security/visitor` |
| File Names (Components) | `PascalCase.jsx` | `EmployeeForm.jsx` |
| File Names (Hooks) | `camelCase.js` | `useEmployee.js` |
| File Names (Services) | `camelCase.js` | `employee.service.js` |
| File Names (API Routes) | `route.js` | Next.js convention |

### Import Order
1. Built-in modules
2. Third-party packages
3. Internal absolute imports (`@/lib/*`, `@/config/*`)
4. Internal relative imports
5. Feature imports (`@/features/*`)

---

## Architecture Patterns

### Feature-Based Organization

Each feature in `src/features/` follows a consistent structure:

```
features/[feature]/
├── components/           # React components (PascalCase.jsx)
├── hooks/               # React hooks (camelCase.js)
├── services/            # Business logic (entity.service.js)
├── schemas/             # Zod validation schemas
└── index.js             # Public API exports
```

### Service Layer Pattern

Services implement a standardized pattern with Repository, Service, and Use Case layers:

```javascript
// Repository: Database access
export const EmployeeRepository = {
  async findMany(skip, take) { /* ... */ },
  async findById(id) { /* ... */ },
  async create(data) { /* ... */ },
  async update(id, data) { /* ... */ },
};

// Service: Business logic
export const EmployeeService = {
  async getPaginated(skip, take) { /* ... */ },
  async ensureEmailNotDuplicate(email) { /* ... */ },
};

// Use Case: Orchestration
export async function GetAllUseCase(page, limit) { /* ... */ }
export async function CreateUseCase(data) { /* ... */ }
```

### API Route Pattern

```javascript
// src/app/api/hr/employee/route.js
import { createRouteHandler } from "@/lib/shared/server";
import * as EmployeeService from "@/features/hr/services/employee.service";

const routeHandler = createRouteHandler({
  getAllUseCase: EmployeeService.GetAllUseCase,
  createUseCase: EmployeeService.CreateUseCase,
});

export const GET = routeHandler.GET;
export const POST = routeHandler.POST;
```

---

## Authentication & RBAC

### Authentication

- **Provider**: Next-Auth v5 (Auth.js) with Credentials strategy
- **Session**: JWT-based with 15-minute access token
- **Refresh Token**: Database-stored with metadata (IP, user agent)
- **Password**: bcryptjs hashing

### RBAC System

Permission format: `module.resource.action`

Examples:
- `hr.view` - View HR module
- `hr.employee.create` - Create employees
- `security.visitor.edit` - Edit visitors
- `superadmin` - Full access

### Permission Hierarchy

1. Super Admin: Has `superadmin` permission → full access
2. Module Access: Permission like `hr.view` → access module
3. Resource Action: Permission like `hr.employee.create` → specific action
4. Wildcard: `hr.*` grants all HR permissions

---

## Database Schema

### Main Entities

| Entity | Description |
|--------|-------------|
| `Employee` | Employee information, department relation |
| `Account` | Login credentials linked to Employee |
| `Department` | Organizational departments |
| `Permission` | RBAC permissions |
| `Role` | RBAC roles |
| `RolePermission` | Role-Permission junction table |
| `EmployeeRole` | Employee-Role junction table |
| `Visitor` | Security visitor tracking |
| `Patrol` | Security patrol records |
| `SalesMemo` | Sales memo with approval workflow |
| `EMSTracking` | Thailand Post EMS tracking |
| `RefreshToken` | JWT refresh tokens |

### Database Conventions

- Primary keys: `entityId` with CUID default
- Timestamps: `entityCreatedAt`, `entityUpdatedAt`
- Audit fields: `entityCreatedBy`, `entityUpdatedBy` (employee ID)
- Soft delete: `entityStatus` enum (Active/Inactive)
- Foreign keys: Indexed with `onDelete: Cascade` where appropriate

---

## Environment Variables

```bash
# Required
DATABASE_URL=mysql://user:pass@host:3306/database
AUTH_SECRET=your-secret-key
AUTH_URL=http://localhost:3000/
NEXT_PUBLIC_BASE_URL=http://localhost:3000/
NEXT_PUBLIC_APP_URL=192.168.1.252:3000/

# LINE Integration
LINE_CHANNEL_ACCESS_TOKEN=xxx
LINE_VISITOR_GROUP_ID=xxx

# Business Central (Optional)
BC_AUTH_URL=...
BC_CLIENT_ID=...
BC_CLIENT_SECRET=...
BC_SCOPE=...
BC_BASE_URL=...
BC_TENANT_ID=...
BC_ENVIRONMENT=Production
BC_COMPANY=...

# RFID Printer (Optional)
RFID_PRINTER_IP=169.254.112.200
RFID_PRINTER_PORT=9100

# Thailand Post EMS (Optional)
THAILAND_POST_API_KEY=xxx
```

---

## Security Considerations

### Implemented Security Measures

1. **Authentication**: JWT with short-lived access tokens (15 min)
2. **Authorization**: RBAC with middleware enforcement
3. **Rate Limiting**: 100 req/min general, 5 auth attempts/5min
4. **Input Sanitization**: DOMPurify for HTML content
5. **SQL Injection**: Prisma ORM protection
6. **Path Traversal**: File upload validation
7. **Security Headers**: CSP, XSS, CSRF protection (next.config.js)
8. **File Upload**: 5MB limit, type/extension validation
9. **Request Tracking**: X-Request-ID header for audit

### Security Headers (Configured in next.config.js)

- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `X-XSS-Protection: 1; mode=block`
- `Content-Security-Policy`: Strict CSP rules

---

## Testing

Currently, the project uses:
- **Linting**: ESLint for code quality
- **Manual Testing**: No automated test suite configured

To add tests, consider:
- Jest for unit testing
- React Testing Library for component testing
- Playwright for E2E testing

---

## Deployment

### Docker Deployment

Multi-stage Dockerfile:
1. `deps`: Install dependencies
2. `builder`: Build the application with Prisma
3. `runner`: Production image (standalone output)

```bash
# Build
docker build -t chh-internal .

# Run
docker run -p 3000:3000 \
  -e DATABASE_URL=... \
  -e AUTH_SECRET=... \
  chh-internal
```

### Standalone Output

The application builds to `.next/standalone/` for minimal deployment footprint.

---

## External Integrations

| Service | Purpose | Location |
|---------|---------|----------|
| LINE Messaging API | Visitor notifications | `src/lib/lineNotify.js` |
| Microsoft Business Central | ERP data sync | `src/lib/bc/` |
| Thailand Post EMS | Package tracking | Accounting module |
| ChainWay RFID Printer | Packing label printing | `src/lib/chainWay/` |

---

## Common Tasks

### Adding a New Module

1. Add module to `src/config/menu.config.js`
2. Create `src/features/[module]/` with components, hooks, services, schemas
3. Create pages in `src/app/(pages)/[module]/`
4. Create API routes in `src/app/api/[module]/`

### Adding a New Permission

1. Add permission to `menu.config.js` (module or action)
2. Seed permission via Prisma seed or manual insert
3. Assign permission to roles in UI

### Adding a New API Endpoint

1. Create service function in `src/features/[module]/services/`
2. Create `route.js` in `src/app/api/[module]/[resource]/`
3. Use `createRouteHandler` from `@/lib/shared/server`

---

## Troubleshooting

### Common Issues

1. **Prisma Client not found**: Run `npx prisma generate`
2. **Database connection failed**: Check `DATABASE_URL` format
3. **Auth errors**: Verify `AUTH_SECRET` is set
4. **Permission denied**: Check RBAC permissions in database

### Log Locations

- Development: Console output
- Production: `logs/` directory with daily rotation

### Debug Mode

Set `BC_DEBUG=true` for Business Central debugging.

---

## Documentation References

- [Next.js 16 Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Next-Auth Documentation](https://authjs.dev/)
- [HeroUI Documentation](https://heroui.com/)
- [Tailwind CSS v4 Documentation](https://tailwindcss.com/)

---

## License

Internal use only - CHH Organization

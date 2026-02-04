# CHH Internal System

EverGreen Internal Management System - A comprehensive web application for HR, Security, Warehouse, Production, and Sales management.

## 🚀 Features

- **HR Module**: Employee management, accounts, departments, permissions
- **Security Module**: Visitor tracking, patrol management
- **Warehouse Module**: Raw materials, finished goods, packing, supply
- **Production Module**: Door BOM management
- **Sales Module**: Sales order online
- **Authentication**: JWT-based with role-based access control (RBAC)
- **File Upload**: Secure image/document upload with validation
- **Notifications**: LINE integration for real-time alerts

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: JavaScript (ES2024)
- **Database**: MySQL + Prisma ORM
- **Authentication**: Next-Auth v5
- **UI Library**: HeroUI
- **Styling**: Tailwind CSS v4
- **Logging**: Winston
- **Container**: Docker

## 📋 Prerequisites

- Node.js 20+
- MySQL 8.0+
- npm or yarn

## 🚀 Getting Started

### 1. Clone & Install

```bash
git clone <repository-url>
cd chh_internal
npm install
```

### 2. Environment Setup

Copy `.env.example` to `.env` and configure:

```bash
# Database
DATABASE_URL=mysql://user:password@localhost:3306/evergreen

# Authentication
AUTH_SECRET=your-secret-key
AUTH_URL=http://localhost:3000/

# App URLs
NEXT_PUBLIC_BASE_URL=http://localhost:3000/
NEXT_PUBLIC_APP_URL=192.168.1.252:3000/

# LINE Integration (Optional)
LINE_CHANNEL_ACCESS_TOKEN=your-token
LINE_VISITOR_GROUP_ID=your-group-id

# Business Central (Optional)
BC_AUTH_URL=https://login.microsoftonline.com/...
BC_CLIENT_ID=...
BC_CLIENT_SECRET=...
BC_SCOPE=https://api.businesscentral.dynamics.com/.default
BC_BASE_URL=https://api.businesscentral.dynamics.com/v2.0
BC_TENANT_ID=...
BC_ENVIRONMENT=Production
BC_COMPANY=...

# RFID Printer (Optional)
RFID_PRINTER_IP=169.254.112.200
RFID_PRINTER_PORT=9100
```

### 3. Database Setup

```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev

# Seed default permissions
npx prisma db seed
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 🐳 Docker Deployment

### Build & Run

```bash
# Build image
docker build -t chh-internal .

# Run container
docker run -p 3000:3000 \
  -e DATABASE_URL=mysql://... \
  -e AUTH_SECRET=... \
  chh-internal
```

### Docker Compose (Recommended)

```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=mysql://root:password@db:3306/evergreen
      - AUTH_SECRET=your-secret
      - NEXT_PUBLIC_BASE_URL=http://localhost:3000/
    depends_on:
      - db
  
  db:
    image: mysql:8.0
    environment:
      - MYSQL_ROOT_PASSWORD=password
      - MYSQL_DATABASE=evergreen
    volumes:
      - mysql_data:/var/lib/mysql

volumes:
  mysql_data:
```

## 📁 Project Structure

```
chh_internal/
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── (auth)/          # Auth routes (signIn, forbidden)
│   │   ├── (pages)/         # Main app pages
│   │   │   ├── hr/          # HR module
│   │   │   ├── security/    # Security module
│   │   │   ├── warehouse/   # Warehouse module
│   │   │   ├── production/  # Production module
│   │   │   └── sales/       # Sales module
│   │   └── api/             # API routes
│   ├── components/          # Shared components
│   ├── config/              # App configuration
│   ├── hooks/               # React hooks
│   ├── lib/                 # Utility libraries
│   ├── schemas/             # Zod validation schemas
│   ├── services/            # Business logic
│   └── style/               # Global styles
├── prisma/
│   ├── schema.prisma        # Database schema
│   └── seed.js              # Default data
├── public/                  # Static assets
└── logs/                    # Application logs
```

## 📚 Documentation

- [API Documentation](API_DOCUMENTATION.md) - Complete API reference
- [Naming Conventions](NAMING_CONVENTIONS.md) - Code style guide

## 🔒 Security Features

- ✅ JWT-based authentication
- ✅ Role-based access control (RBAC)
- ✅ Rate limiting (100 req/min default)
- ✅ Input sanitization (DOMPurify)
- ✅ SQL injection protection
- ✅ Path traversal prevention
- ✅ File upload validation (5MB limit, type checking)
- ✅ Security headers (CSP, XSS, etc.)
- ✅ Request ID tracking for audit

## 🧪 Testing

```bash
# Run linting
npm run lint

# Build for production
npm run build

# Start production server
npm start
```

## 📊 Monitoring

### Health Check Endpoint
```bash
curl http://localhost:3000/api/health
```

### Logs
Logs are stored in:
- Console (development)
- `logs/` directory with daily rotation (production)

## 🔄 Continuous Improvement

See [TODO.md](TODO.md) for planned features and improvements.

## 🤝 Contributing

1. Follow [Naming Conventions](NAMING_CONVENTIONS.md)
2. Run `npm run lint` before committing
3. Write meaningful commit messages
4. Test your changes thoroughly

## 📝 License

Internal use only - CHH Organization

## 🆘 Support

For issues or questions, contact the development team.

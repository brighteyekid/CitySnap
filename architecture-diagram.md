# Civic Problem Solver - System Architecture Diagram (IEEE Format)

## System Overview
**System Name:** Civic Problem Solver Platform  
**Version:** 1.0.0  
**Date:** 2024  
**Architecture Style:** Microservices with Client-Server Pattern  

## Architecture Components

### 1. Presentation Layer (Client-Side)
```
┌─────────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER                       │
├─────────────────────────────────────────────────────────────┤
│  React Frontend Application (Port 3000)                    │
│  ┌─────────────────┐ ┌─────────────────┐ ┌───────────────┐ │
│  │   Components    │ │     Pages       │ │    Hooks      │ ��
│  │   - UI Elements │ │   - Dashboard   │ │  - Custom     │ │
│  │   - Forms       │ │   - Problem Map │ │    React      │ │
│  │   - Navigation  │ │   - Reports     │ │    Hooks      │ │
│  └─────────────────┘ └─────────────────┘ └───────────────┘ │
│                                                             │
│  Technology Stack:                                          │
│  - React 18.2.0 (UI Framework)                            │
│  - TypeScript 5.0.2 (Type Safety)                         │
│  - Vite 4.4.5 (Build Tool)                                │
│  - TailwindCSS 3.3.3 (Styling)                            │
│  - React Router DOM 6.15.0 (Routing)                      │
│  - React Leaflet 4.2.1 (Maps)                             │
│  - Framer Motion 10.16.1 (Animations)                     │
│  - React Query 3.39.3 (State Management)                  │
│  - Axios 1.5.0 (HTTP Client)                              │
└─────────────────────────────────────────────────────────────┘
```

### 2. Application Layer (Server-Side)
```
┌─────────────────────────────────────────────────────────────┐
│                    APPLICATION LAYER                        │
├─────────────────────────────────────────────────────────────┤
│  Node.js Backend API Server (Port 5000)                    │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌────────┐ │
│  │ Controllers │ │   Routes    │ │ Middleware  │ │ Models │ │
│  │ - Problem   │ │ - API       │ │ - Auth      │ │ - User │ │
│  │ - User      │ │   Endpoints │ │ - CORS      │ │ - Issue│ │
│  │ - Auth      │ │ - REST API  │ │ - Rate      │ │ - Report│ │
│  │ - Report    │ │             │ │   Limiting  │ │        │ │
│  └─────────────┘ └─────────────┘ └─────────────┘ └────────┘ │
│                                                             │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐           │
│  │  Services   │ │    Utils    │ │    Types    │           │
│  │ - Business  │ │ - Helpers   │ │ - TypeScript│           │
│  │   Logic     │ │ - Validators│ │   Interfaces│           │
│  │ - External  │ │ - Formatters│ │ - Data      │           │
│  │   APIs      │ │             │ │   Models    │           │
│  └─────────────┘ └─────────────┘ └─────────────┘           │
│                                                             │
│  Technology Stack:                                          │
│  - Node.js with Express 4.18.2                            │
│  - TypeScript 5.1.6                                       │
│  - JWT Authentication (jsonwebtoken 9.0.2)                │
│  - BCrypt (bcryptjs 2.4.3) for password hashing          │
│  - Express Validator 7.0.1                                │
│  - Helmet 7.0.0 (Security)                                │
│  - Morgan 1.10.0 (Logging)                                │
│  - Multer 1.4.5 (File Upload)                             │
│  - Sharp 0.32.5 (Image Processing)                        │
│  - Node-cron 3.0.2 (Scheduled Tasks)                      │
└─────────────────────────────────────────────────────────────┘
```

### 3. Data Layer
```
┌─────────────────────────────────────────────────────────────┐
│                      DATA LAYER                             │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────────┐    ┌─────────────────────────────┐ │
│  │   MongoDB Database  │    │      Redis Cache            │ │
│  │   (Port 27017)      │    │      (Port 6379)            │ │
│  │                     │    │                             │ │
│  │  Collections:       │    │  - Session Storage          │ │
│  │  - users            │    │  - Temporary Data           │ │
│  │  - problems         │    │  - Rate Limiting            │ │
│  │  - reports          │    │  - Caching Layer            │ │
│  │  - categories       │    │                             │ │
│  │  - locations        │    │                             │ │
│  │                     │    │                             │ │
│  │  Features:          │    │  Technology:                │ │
│  │  - Document Store   │    │  - Redis 7-alpine           │ │
│  │  - Geospatial       │    │  - In-memory Database       │ │
│  │  - Indexing         │    │  - Key-Value Store          │ │
│  │  - Aggregation      │    │                             │ │
│  └─────────────────────┘    └─────────────────────────────┘ │
│                                                             │
│  Database Driver: Mongoose 7.5.0                           │
└─────────────────────────────────────────────────────────────┘
```

### 4. Infrastructure Layer
```
┌─────────────────────────────────────────────────────────────┐
│                  INFRASTRUCTURE LAYER                       │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────────┐    ┌─────────────────────────────┐ │
│  │  Nginx Proxy        │    │   External Services         │ │
│  │  (Ports 80/443)     │    │                             │ │
│  │                     │    │  ┌─────────────────────────┐ │
│  │  - Load Balancing   │    │  │   Cloudinary CDN        │ │
│  │  - SSL Termination  │    │  ���   - Image Storage       │ │
│  │  - Static Files     │    │  │   - Image Processing    │ │
│  │  - Reverse Proxy    │    │  │   - Media Delivery      │ │
│  │  - Compression      │    │  └─────────────────────────┘ │
│  │                     │    │                             │ │
│  └─────────────────────┘    │  ┌─────────────────────────┐ │
│                              │  │   Mapbox/Leaflet        │ │
│  ┌─────────────────────┐    │  │   - Interactive Maps    │ │
│  │  Docker Containers  │    │  │   - Geolocation         │ │
│  │                     │    │  │   - Mapping Services    │ │
│  │  - civic-frontend   │    │  └─────────────────────────┘ │
│  │  - civic-backend    │    │                             │ │
│  │  - civic-mongodb    │    │                             │ │
│  │  - civic-redis      │    │                             │ │
│  │  - civic-nginx      │    │                             │ │
│  │                     │    │                             │ │
│  │  Network: bridge    │    │                             │ │
│  └─────────────────────┘    └─────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## System Architecture Flow

```
┌─────────────┐    HTTP/HTTPS     ┌─────────────┐
│   Client    │ ◄──────────────► │    Nginx    │
│  (Browser)  │    (Port 80/443)  │   Proxy     │
└─────────────┘                   └─────────────┘
                                         │
                                         ▼
┌─────────────┐    Static Files   ┌─────────────┐
│   React     │ ◄──────────────── │   Frontend  │
│ Application │    (Port 3000)    │  Container  │
└─────────────┘                   └────────────���┘
       │                                 │
       │ API Calls (Axios)              │
       ▼                                 ▼
┌─────────────┐    REST API       ┌─────────────┐
│   Backend   │ ◄──────────────── │   Express   │
│    API      │    (Port 5000)    │   Server    │
└─────────────┘                   └─────────────┘
       │                                 │
       ├─────────────────────────────────┤
       │                                 │
       ▼                                 ▼
┌─────────────┐                   ┌─────────────┐
│   MongoDB   │                   │    Redis    │
│  Database   │                   │    Cache    │
│ (Port 27017)│                   │ (Port 6379) │
└─────────────┘                   └─────────────┘
```

## Component Interactions

### 1. User Authentication Flow
```
Client → Frontend → Backend API → JWT Service → Database
                                      ↓
Client ← Frontend ← Backend API ← Token Response
```

### 2. Problem Reporting Flow
```
Client → Form Submission → Backend API → Validation → Database
                                    ↓
Client ← Response ← Backend API ← Success/Error
```

### 3. Map Integration Flow
```
Client → Map Component → Leaflet → Geolocation API
                    ↓
Backend API → Location Service → Database Storage
```

## Security Architecture

### Authentication & Authorization
- JWT-based authentication
- BCrypt password hashing
- Express Rate Limiting
- CORS configuration
- Helmet security headers

### Data Protection
- Input validation (Express Validator)
- SQL injection prevention (Mongoose ODM)
- File upload restrictions (Multer)
- Environment variable protection

## Deployment Architecture

### Containerization (Docker)
- Multi-container application
- Docker Compose orchestration
- Isolated network (civic-network)
- Volume persistence for data
- Health checks and restart policies

### Scalability Considerations
- Horizontal scaling capability
- Load balancing via Nginx
- Caching layer (Redis)
- CDN integration (Cloudinary)
- Database indexing and optimization

## Technology Stack Summary

| Layer | Technology | Version | Purpose |
|-------|------------|---------|---------|
| Frontend | React | 18.2.0 | UI Framework |
| Frontend | TypeScript | 5.0.2 | Type Safety |
| Frontend | Vite | 4.4.5 | Build Tool |
| Backend | Node.js | Latest | Runtime |
| Backend | Express | 4.18.2 | Web Framework |
| Backend | TypeScript | 5.1.6 | Type Safety |
| Database | MongoDB | 7.0 | Document Store |
| Cache | Redis | 7-alpine | In-memory Cache |
| Proxy | Nginx | Alpine | Reverse Proxy |
| Container | Docker | Latest | Containerization |

## Performance Considerations

### Frontend Optimization
- Code splitting with Vite
- Lazy loading of components
- Image optimization
- Bundle size optimization

### Backend Optimization
- Connection pooling (MongoDB)
- Caching strategies (Redis)
- Rate limiting
- Compression middleware

### Database Optimization
- Proper indexing
- Query optimization
- Connection management
- Data aggregation pipelines

---

**Document Version:** 1.0  
**Last Updated:** 2024  
**Architecture Review:** Pending  
**Compliance:** IEEE 1471-2000 Standard
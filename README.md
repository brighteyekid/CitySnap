# Civic Problem Solver Platform

A comprehensive full-stack web application that enables citizens to report local civic issues and allows authorities to track and resolve them efficiently. Built with modern technologies and designed for scalability, transparency, and community engagement.

## 🌟 Features

### For Citizens
- **Easy Issue Reporting**: Upload photos, add descriptions, and automatically capture location
- **Smart Duplicate Prevention**: AI-powered clustering prevents duplicate reports
- **Community Validation**: Upvote and validate issues reported by others
- **Real-time Tracking**: Monitor the status of reported issues
- **Gamification**: Earn points, badges, and climb leaderboards
- **Mobile-Friendly**: Responsive design works on all devices

### For Authorities
- **Comprehensive Dashboard**: View all issues with advanced filtering
- **Interactive Map**: Visualize issues geographically with color-coded status
- **Priority Management**: Automatic priority calculation based on community input
- **Status Updates**: Move issues through workflow stages
- **Analytics**: Detailed insights and performance metrics
- **Hotspot Detection**: Identify areas with high issue density

### For Administrators
- **User Management**: Manage citizen and authority accounts
- **System Analytics**: Comprehensive reporting and data export
- **Badge Management**: Award special recognition to active users
- **Webhook Integration**: Connect with third-party systems
- **Performance Monitoring**: Track system health and usage

## 🏗️ Architecture

### Frontend (React + TypeScript + Vite)
- **Modern UI**: Clean, intuitive interface built with TailwindCSS
- **Interactive Maps**: Leaflet.js integration for geographic visualization
- **Real-time Updates**: Live status updates and notifications
- **Progressive Web App**: Offline capabilities and mobile optimization
- **Accessibility**: WCAG compliant design

### Backend (Node.js + Express + TypeScript)
- **RESTful API**: Well-documented endpoints with OpenAPI specification
- **Smart Clustering**: Geospatial and image-based duplicate detection
- **Image Processing**: Automatic compression and perceptual hashing
- **Gamification Engine**: Points, levels, badges, and leaderboards
- **Background Jobs**: Automated priority calculation and cleanup
- **Security**: Rate limiting, authentication, and input validation

### Database (MongoDB)
- **Geospatial Indexing**: Efficient location-based queries
- **Flexible Schema**: Adaptable to changing requirements
- **Aggregation Pipeline**: Complex analytics and reporting
- **Horizontal Scaling**: Ready for high-volume deployments

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- MongoDB 7.0+
- Cloudinary account (for image storage)
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd civic-problem-solver
   ```

2. **Set up the backend**
   ```bash
   cd server
   npm install
   cp .env.example .env
   # Edit .env with your configuration
   npm run dev
   ```

3. **Set up the frontend**
   ```bash
   cd ../client
   npm install
   cp .env.example .env.local
   # Edit .env.local with your configuration
   npm run dev
   ```

4. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000
   - API Documentation: http://localhost:5000/docs

### Docker Deployment

For production deployment with Docker:

```bash
# Copy environment files
cp server/.env.example server/.env
cp client/.env.example client/.env.local

# Edit environment files with your configuration
# Then start all services
docker-compose up -d
```

Access the application at http://localhost

## 📱 Usage

### Reporting an Issue

1. **Navigate to the reporting form**
2. **Fill in issue details**:
   - Title and description
   - Category (waste, road, water, electricity, safety, other)
   - Upload 1-5 photos
3. **Location is captured automatically** (or manually adjust)
4. **Submit the report**

The system will:
- Process and compress images
- Check for similar existing issues
- Calculate priority based on various factors
- Notify nearby users (if enabled)

### Tracking Issues

1. **View the dashboard** to see all issues
2. **Use filters** to find specific issues:
   - Status (reported, in-progress, resolved)
   - Category
   - Location radius
   - Date range
3. **Click on map pins** to see issue details
4. **Upvote or validate** issues you've encountered

### Authority Workflow

1. **Review reported issues** on the dashboard
2. **Assign issues** to team members
3. **Update status** as work progresses:
   - Mark as "In Progress" when work begins
   - Add estimated resolution time
   - Mark as "Resolved" when completed
4. **View analytics** to track performance

## 🎮 Gamification System

### Points System
- **Report Issue**: 10 points
- **Validate Issue**: 5 points
- **Upvote Issue**: 2 points
- **Resolve Issue** (authorities): 20 points
- **First Report**: 15 bonus points
- **Area Report**: 15 bonus points

### Badges
- **First Reporter**: Report your first issue
- **Community Helper**: Validate 10 issues
- **Civic Champion**: Report 25 issues
- **Problem Solver**: Resolve 10 issues (authorities)
- **Super Validator**: Validate 50 issues
- **Dedicated Reporter**: Report 100 issues
- **Community Leader**: Reach 1000 points

### Leaderboards
- Global rankings by points
- Weekly and monthly competitions
- Category-specific leaderboards
- Authority performance rankings

## 🔧 Configuration

### Environment Variables

#### Backend (.env)
```env
# Server
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173

# Database
MONGODB_URI=mongodb://localhost:27017/civic-problem-solver

# Authentication
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRE=30d

# Image Storage
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Optional: Webhooks
WEBHOOK_URL=https://your-webhook-endpoint.com
WEBHOOK_SECRET=your-webhook-secret
```

#### Frontend (.env.local)
```env
VITE_API_URL=http://localhost:5000/api
VITE_MAPBOX_TOKEN=your-mapbox-token
VITE_APP_NAME=Civic Problem Solver
```

## 📊 API Documentation

### Core Endpoints

#### Issues
- `POST /api/issues/report` - Report new issue
- `GET /api/issues` - List issues with filtering
- `GET /api/issues/:id` - Get issue details
- `PATCH /api/issues/:id/status` - Update status
- `POST /api/issues/:id/upvote` - Upvote issue
- `POST /api/issues/:id/validate` - Validate issue

#### Users
- `POST /api/users/register` - User registration
- `POST /api/users/login` - User login
- `GET /api/users/me` - Current user profile
- `GET /api/users/leaderboard` - Gamification leaderboard

#### Analytics (Authority/Admin)
- `GET /api/analytics/dashboard` - Dashboard metrics
- `GET /api/analytics/hotspots` - Issue hotspots
- `GET /api/analytics/export` - Export data

### Request Examples

#### Report Issue
```javascript
const formData = new FormData();
formData.append('title', 'Pothole on Main Street');
formData.append('description', 'Large pothole causing issues');
formData.append('category', 'road');
formData.append('location[latitude]', '40.7128');
formData.append('location[longitude]', '-74.0060');
formData.append('images', imageFile);

fetch('/api/issues/report', {
  method: 'POST',
  body: formData,
  headers: { 'Authorization': 'Bearer ' + token }
});
```

#### Get Issues
```javascript
const params = new URLSearchParams({
  status: 'reported',
  category: 'road',
  lat: '40.7128',
  lng: '-74.0060',
  radius: '1000'
});

fetch(`/api/issues?${params}`);
```

## 🔒 Security Features

- **Authentication**: JWT-based with role-based access control
- **Rate Limiting**: Prevents spam and abuse
- **Input Validation**: Comprehensive request validation
- **Image Security**: File type and size validation
- **CORS Protection**: Configurable cross-origin policies
- **Security Headers**: Helmet.js integration
- **Password Security**: bcrypt hashing with salt

## 📈 Performance Optimizations

- **Database Indexing**: Optimized queries for geospatial data
- **Image Compression**: Automatic resizing and optimization
- **Caching**: Redis integration for session management
- **CDN Integration**: Cloudinary for image delivery
- **Lazy Loading**: Frontend component optimization
- **Bundle Splitting**: Optimized JavaScript delivery

## 🧪 Testing

### Backend Testing
```bash
cd server
npm test
npm run test:coverage
```

### Frontend Testing
```bash
cd client
npm test
npm run test:e2e
```

### Integration Testing
```bash
docker-compose -f docker-compose.test.yml up --abort-on-container-exit
```

## 📦 Deployment

### Production Checklist

1. **Environment Configuration**
   - Set strong JWT secrets
   - Configure production database
   - Set up Cloudinary for image storage
   - Configure email service (optional)

2. **Security Setup**
   - Enable HTTPS with SSL certificates
   - Configure firewall rules
   - Set up monitoring and logging
   - Enable backup procedures

3. **Performance Optimization**
   - Configure CDN
   - Set up database replication
   - Enable caching layers
   - Configure load balancing

### Docker Production Deployment

```bash
# Production environment
docker-compose -f docker-compose.prod.yml up -d

# With SSL and custom domain
docker-compose -f docker-compose.prod.yml -f docker-compose.ssl.yml up -d
```

### Cloud Deployment Options

- **AWS**: ECS, RDS, S3, CloudFront
- **Google Cloud**: Cloud Run, Cloud SQL, Cloud Storage
- **Azure**: Container Instances, Cosmos DB, Blob Storage
- **DigitalOcean**: App Platform, Managed Databases

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Workflow

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

### Code Standards

- **TypeScript**: Strict mode enabled
- **ESLint**: Airbnb configuration
- **Prettier**: Code formatting
- **Husky**: Pre-commit hooks
- **Conventional Commits**: Commit message format

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: Check the `/docs` folder
- **Issues**: Create a GitHub issue
- **Discussions**: Use GitHub Discussions
- **Email**: support@civicproblem.com

## 🗺️ Roadmap

### Phase 1 (Current)
- ✅ Core issue reporting and tracking
- ✅ Smart clustering and deduplication
- ✅ Gamification system
- ✅ Basic analytics dashboard

### Phase 2 (Next)
- 🔄 Real-time notifications
- 🔄 Mobile app (React Native)
- 🔄 Advanced analytics
- 🔄 Multi-language support

### Phase 3 (Future)
- 📋 AI-powered issue categorization
- 📋 Predictive maintenance
- 📋 Integration with city systems
- 📋 Citizen engagement tools

## 🙏 Acknowledgments

- **OpenStreetMap**: Map data
- **Leaflet**: Interactive maps
- **Cloudinary**: Image processing
- **MongoDB**: Database platform
- **React**: Frontend framework
- **Node.js**: Backend runtime

---

**Built with ❤️ for better communities**
# Civic Problem Solver - Backend API

A comprehensive Node.js/Express backend for the Civic Problem Solver platform, featuring issue reporting, clustering, gamification, and analytics.

## Features

### Core Functionality
- **Issue Reporting**: Citizens can report civic issues with images, location, and descriptions
- **Smart Clustering**: Automatically groups similar issues to avoid duplicates
- **Status Tracking**: Authorities can update issue status (Reported → In Progress → Resolved)
- **Community Validation**: Users can upvote and validate issues
- **Gamification**: Points, levels, badges, and leaderboards
- **Analytics**: Comprehensive dashboard for authorities and admins

### Technical Features
- **Image Processing**: Automatic compression and perceptual hashing
- **Geospatial Queries**: Location-based issue filtering and clustering
- **Rate Limiting**: Prevents spam and abuse
- **Authentication**: JWT-based auth with role-based access control
- **Real-time Updates**: WebSocket support for live updates
- **Webhook Integration**: Third-party integrations
- **Background Jobs**: Automated priority recalculation and cleanup

## API Endpoints

### Issues
- `POST /api/issues/report` - Report a new issue
- `GET /api/issues` - Get all issues with filtering
- `GET /api/issues/:id` - Get specific issue with clustered issues
- `PATCH /api/issues/:id/status` - Update issue status (Authority/Admin)
- `POST /api/issues/:id/upvote` - Upvote an issue
- `POST /api/issues/:id/validate` - Validate an issue
- `GET /api/issues/stats` - Get issue statistics

### Users
- `POST /api/users/register` - Register new user
- `POST /api/users/login` - User login
- `GET /api/users/me` - Get current user profile
- `PUT /api/users/profile` - Update user profile
- `GET /api/users/leaderboard` - Get gamification leaderboard
- `GET /api/users/:id/stats` - Get user statistics
- `GET /api/users/:id/activity` - Get user activity
- `POST /api/users/:id/badge` - Award badge (Admin)

### Analytics (Authority/Admin only)
- `GET /api/analytics/dashboard` - Get dashboard analytics
- `GET /api/analytics/authority-performance` - Get authority performance metrics
- `GET /api/analytics/hotspots` - Get issue hotspots
- `GET /api/analytics/export` - Export analytics data

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd civic-problem-solver/server
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Set up MongoDB**
   - Install MongoDB locally or use MongoDB Atlas
   - Update `MONGODB_URI` in your `.env` file

5. **Set up Cloudinary** (for image storage)
   - Create a Cloudinary account
   - Add your credentials to `.env`

## Environment Variables

```env
# Server Configuration
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173

# Database
MONGODB_URI=mongodb://localhost:27017/civic-problem-solver

# JWT
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRE=30d

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret

# Optional: Webhook Configuration
WEBHOOK_URL=https://your-webhook-endpoint.com/webhook
WEBHOOK_SECRET=your-webhook-secret
```

## Running the Application

### Development
```bash
npm run dev
```

### Production
```bash
npm run build
npm start
```

### Testing
```bash
npm test
```

## Project Structure

```
src/
├── controllers/          # Request handlers
│   ├── issueController.ts
│   ├── userController.ts
│   └── analyticsController.ts
├── middleware/           # Express middleware
│   ├── auth.ts
│   ├── errorHandler.ts
│   └── upload.ts
├── models/              # MongoDB schemas
│   ├── Issue.ts
│   └── User.ts
├── routes/              # API routes
│   ├── issueRoutes.ts
│   ├── userRoutes.ts
│   └── analyticsRoutes.ts
├── services/            # Business logic services
│   ├── analyticsService.ts
│   ├── cronService.ts
│   ├── gamificationService.ts
│   ├── notificationService.ts
│   └── webhookService.ts
├── types/               # TypeScript type definitions
│   └── index.ts
├── utils/               # Utility functions
│   ├── clusteringUtils.ts
│   └── imageUtils.ts
└── app.ts              # Main application file
```

## Key Features Explained

### Issue Clustering
The system automatically clusters similar issues based on:
- Geographic proximity (configurable radius)
- Image similarity (perceptual hashing)
- Category matching
- Time window

### Gamification System
- **Points**: Earned for reporting, validating, and resolving issues
- **Levels**: Calculated based on total points
- **Badges**: Awarded for specific achievements
- **Leaderboard**: Ranked by points with filtering options

### Image Processing
- Automatic compression and resizing
- Perceptual hashing for duplicate detection
- Cloudinary integration for storage
- Support for JPEG, PNG, and WebP formats

### Rate Limiting
- General API: 100 requests per 15 minutes
- Issue reporting: 10 reports per hour
- Configurable limits per endpoint

### Background Jobs
- Priority recalculation (hourly)
- Badge checking (every 6 hours)
- Anonymous user cleanup (daily)
- Analytics generation (daily)
- Weekly summaries (weekly)

## Database Schema

### Issue Schema
```typescript
{
  title: string;
  description: string;
  category: 'waste' | 'road' | 'water' | 'electricity' | 'safety' | 'other';
  status: 'reported' | 'in-progress' | 'resolved';
  location: {
    type: 'Point';
    coordinates: [longitude, latitude];
  };
  images: string[];
  imageHashes: string[];
  reportedBy: ObjectId;
  upvotes: ObjectId[];
  validations: ObjectId[];
  priority: number;
  isAreaReport: boolean;
  clusteredWith: ObjectId[];
  // ... timestamps and other fields
}
```

### User Schema
```typescript
{
  username: string;
  email: string;
  password: string;
  role: 'citizen' | 'authority' | 'admin';
  profile: {
    firstName?: string;
    lastName?: string;
    avatar?: string;
    phone?: string;
  };
  gamification: {
    points: number;
    level: number;
    badges: string[];
    reportsSubmitted: number;
    validationsGiven: number;
    issuesResolved: number;
  };
  // ... other fields
}
```

## API Usage Examples

### Report an Issue
```javascript
const formData = new FormData();
formData.append('title', 'Pothole on Main Street');
formData.append('description', 'Large pothole causing traffic issues');
formData.append('category', 'road');
formData.append('location[latitude]', '40.7128');
formData.append('location[longitude]', '-74.0060');
formData.append('images', imageFile);

fetch('/api/issues/report', {
  method: 'POST',
  body: formData,
  headers: {
    'Authorization': 'Bearer ' + token
  }
});
```

### Get Issues with Filtering
```javascript
const params = new URLSearchParams({
  status: 'reported',
  category: 'road',
  lat: '40.7128',
  lng: '-74.0060',
  radius: '1000',
  page: '1',
  limit: '20'
});

fetch(`/api/issues?${params}`);
```

### Update Issue Status
```javascript
fetch('/api/issues/123/status', {
  method: 'PATCH',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + token
  },
  body: JSON.stringify({
    status: 'in-progress',
    estimatedResolutionTime: '2024-01-15T10:00:00Z'
  })
});
```

## Security Features

- **Helmet.js**: Security headers
- **CORS**: Cross-origin resource sharing
- **Rate Limiting**: Prevents abuse
- **Input Validation**: Express-validator
- **JWT Authentication**: Secure token-based auth
- **Password Hashing**: bcrypt with salt
- **Image Validation**: File type and size limits

## Monitoring and Logging

- **Morgan**: HTTP request logging
- **Error Handling**: Centralized error middleware
- **Health Check**: `/health` endpoint
- **Analytics**: Built-in analytics dashboard

## Deployment

### Docker
```bash
docker build -t civic-problem-solver-backend .
docker run -p 5000:5000 civic-problem-solver-backend
```

### Environment-specific Configurations
- Development: Auto-reload with nodemon
- Production: Compiled TypeScript with PM2
- Testing: In-memory database

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For support and questions:
- Create an issue on GitHub
- Check the documentation
- Review the API examples above
// MongoDB initialization script
db = db.getSiblingDB('civic-problem-solver');

// Create collections
db.createCollection('users');
db.createCollection('issues');

// Create indexes for better performance
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ username: 1 }, { unique: true });
db.users.createIndex({ 'gamification.points': -1 });
db.users.createIndex({ location: '2dsphere' });

db.issues.createIndex({ location: '2dsphere' });
db.issues.createIndex({ status: 1, reportedAt: -1 });
db.issues.createIndex({ category: 1, status: 1 });
db.issues.createIndex({ reportedBy: 1, reportedAt: -1 });
db.issues.createIndex({ priority: -1 });

// Create default admin user
db.users.insertOne({
  username: 'admin',
  email: 'admin@civicproblem.com',
  password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6UP9Dv/u2O', // password: admin123
  role: 'admin',
  profile: {
    firstName: 'System',
    lastName: 'Administrator'
  },
  gamification: {
    points: 1000,
    level: 10,
    badges: ['System Admin'],
    reportsSubmitted: 0,
    validationsGiven: 0,
    issuesResolved: 0
  },
  isVerified: true,
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date()
});

// Create sample authority user
db.users.insertOne({
  username: 'authority1',
  email: 'authority@civicproblem.com',
  password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6UP9Dv/u2O', // password: admin123
  role: 'authority',
  profile: {
    firstName: 'City',
    lastName: 'Authority'
  },
  gamification: {
    points: 500,
    level: 5,
    badges: ['Problem Solver'],
    reportsSubmitted: 0,
    validationsGiven: 0,
    issuesResolved: 25
  },
  isVerified: true,
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date()
});

print('Database initialized successfully!');
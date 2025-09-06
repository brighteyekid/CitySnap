import { CategoryInfo, StatusInfo } from '../types';

export const CATEGORIES: CategoryInfo[] = [
  {
    id: 'waste',
    name: 'Waste Management',
    icon: 'Trash2',
    color: 'text-brown-600',
    description: 'Garbage collection, littering, illegal dumping'
  },
  {
    id: 'road',
    name: 'Road Infrastructure',
    icon: 'Construction',
    color: 'text-gray-600',
    description: 'Potholes, damaged roads, traffic signs'
  },
  {
    id: 'water',
    name: 'Water & Drainage',
    icon: 'Droplets',
    color: 'text-blue-600',
    description: 'Water leaks, drainage issues, flooding'
  },
  {
    id: 'electricity',
    name: 'Electrical',
    icon: 'Zap',
    color: 'text-yellow-600',
    description: 'Street lights, power outages, electrical hazards'
  },
  {
    id: 'safety',
    name: 'Public Safety',
    icon: 'AlertTriangle',
    color: 'text-red-600',
    description: 'Safety hazards, security concerns, emergency issues'
  },
  {
    id: 'other',
    name: 'Other',
    icon: 'FileText',
    color: 'text-purple-600',
    description: 'Other civic issues not covered above'
  }
];

export const STATUSES: StatusInfo[] = [
  {
    id: 'reported',
    name: 'Reported',
    color: 'text-red-800',
    bgColor: 'bg-red-100',
    description: 'Issue has been reported and is awaiting review'
  },
  {
    id: 'in-progress',
    name: 'In Progress',
    color: 'text-yellow-800',
    bgColor: 'bg-yellow-100',
    description: 'Issue is being actively worked on'
  },
  {
    id: 'resolved',
    name: 'Resolved',
    color: 'text-green-800',
    bgColor: 'bg-green-100',
    description: 'Issue has been successfully resolved'
  }
];

export const PRIORITY_LEVELS = [
  { value: 1, label: 'Very Low', color: 'bg-green-100 text-green-800' },
  { value: 2, label: 'Low', color: 'bg-green-100 text-green-800' },
  { value: 3, label: 'Low', color: 'bg-green-100 text-green-800' },
  { value: 4, label: 'Medium', color: 'bg-yellow-100 text-yellow-800' },
  { value: 5, label: 'Medium', color: 'bg-yellow-100 text-yellow-800' },
  { value: 6, label: 'Medium', color: 'bg-yellow-100 text-yellow-800' },
  { value: 7, label: 'High', color: 'bg-red-100 text-red-800' },
  { value: 8, label: 'High', color: 'bg-red-100 text-red-800' },
  { value: 9, label: 'Very High', color: 'bg-red-100 text-red-800' },
  { value: 10, label: 'Critical', color: 'bg-red-100 text-red-800' }
];

export const USER_RANKS = [
  { min: 0, max: 49, name: 'Newcomer', color: 'text-gray-600', icon: '🌱' },
  { min: 50, max: 199, name: 'Helper', color: 'text-blue-600', icon: '🤝' },
  { min: 200, max: 499, name: 'Guardian', color: 'text-green-600', icon: '🛡️' },
  { min: 500, max: 999, name: 'Hero', color: 'text-purple-600', icon: '🦸' },
  { min: 1000, max: Infinity, name: 'Champion', color: 'text-yellow-600', icon: '👑' }
];

export const BADGES = [
  { id: 'first-report', name: 'First Reporter', icon: '🎯', description: 'Submitted your first issue report' },
  { id: 'validator', name: 'Community Validator', icon: '✅', description: 'Validated 10 community reports' },
  { id: 'frequent-reporter', name: 'Frequent Reporter', icon: '📊', description: 'Submitted 25+ issue reports' },
  { id: 'area-expert', name: 'Area Expert', icon: '🗺️', description: 'Reported multiple issues in your area' },
  { id: 'safety-champion', name: 'Safety Champion', icon: '🚨', description: 'Focused on safety-related issues' },
  { id: 'environmental-guardian', name: 'Environmental Guardian', icon: '🌍', description: 'Focused on environmental issues' },
  { id: 'community-leader', name: 'Community Leader', icon: '👥', description: 'High community engagement' },
  { id: 'problem-solver', name: 'Problem Solver', icon: '🔧', description: 'Helped resolve community issues' }
];

export const MAP_CONFIG = {
  DEFAULT_CENTER: [40.7128, -74.0060] as [number, number], // New York City
  DEFAULT_ZOOM: 13,
  MIN_ZOOM: 3,
  MAX_ZOOM: 18,
  CLUSTER_RADIUS: 50,
  MAX_CLUSTER_RADIUS: 80
};

export const GEOLOCATION_OPTIONS: PositionOptions = {
  enableHighAccuracy: true,
  timeout: 10000,
  maximumAge: 300000 // 5 minutes
};

export const FILE_UPLOAD_CONFIG = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  MAX_FILES: 5,
  ACCEPTED_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
  ACCEPTED_EXTENSIONS: ['.jpg', '.jpeg', '.png', '.webp']
};

export const API_ENDPOINTS = {
  ISSUES: '/issues',
  USERS: '/users',
  AUTH: '/auth',
  UPLOAD: '/upload'
};

export const LOCAL_STORAGE_KEYS = {
  TOKEN: 'token',
  USER: 'user',
  THEME: 'theme',
  LANGUAGE: 'language',
  LOCATION: 'lastKnownLocation'
};

export const PAGINATION_CONFIG = {
  DEFAULT_PAGE_SIZE: 20,
  PAGE_SIZE_OPTIONS: [10, 20, 50, 100]
};

export const DEBOUNCE_DELAY = 300; // milliseconds

export const TOAST_CONFIG = {
  DURATION: 4000,
  POSITION: 'top-right' as const
};
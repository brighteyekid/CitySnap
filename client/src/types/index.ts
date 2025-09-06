export interface User {
  _id: string;
  username: string;
  email: string;
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
  location?: {
    type: 'Point';
    coordinates: [number, number];
  };
  isVerified: boolean;
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
  rank?: number;
}

export interface Issue {
  _id: string;
  title: string;
  description: string;
  category: 'waste' | 'road' | 'water' | 'electricity' | 'safety' | 'other';
  status: 'reported' | 'in-progress' | 'resolved';
  location: {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
  };
  address?: string;
  images: string[];
  imageHashes: string[];
  reportedBy: User;
  reportedAt: string;
  updatedAt: string;
  upvotes: User[];
  validations: User[];
  priority: number;
  isAreaReport: boolean;
  clusteredWith: Issue[];
  assignedTo?: User;
  resolvedAt?: string;
  estimatedResolutionTime?: string;
  upvoteCount?: number;
  validationCount?: number;
}

export interface CreateIssueData {
  title: string;
  description: string;
  category: Issue['category'];
  location: {
    latitude: number;
    longitude: number;
  };
  address?: string;
  isAreaReport?: boolean;
  images: File[];
}

export interface IssueFilters {
  status?: Issue['status'];
  category?: Issue['category'];
  priority?: number;
  lat?: number;
  lng?: number;
  radius?: number;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
  errors?: Array<{ msg: string; param: string }>;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface IssueStats {
  overview: {
    totalIssues: number;
    reportedIssues: number;
    inProgressIssues: number;
    resolvedIssues: number;
  };
  byCategory: Array<{
    _id: string;
    count: number;
    resolved: number;
  }>;
}

export interface LeaderboardEntry extends User {
  rank: number;
}

export interface Location {
  latitude: number;
  longitude: number;
}

export interface MapBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

export interface NotificationSettings {
  emailNotifications: boolean;
  pushNotifications: boolean;
  issueUpdates: boolean;
  communityActivity: boolean;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => void;
  updateProfile: (profileData: Partial<User['profile']>) => Promise<void>;
  isLoading: boolean;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  role?: User['role'];
  profile?: Partial<User['profile']>;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface UpdateStatusData {
  status: Issue['status'];
  estimatedResolutionTime?: string;
  assignedTo?: string;
}

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export interface GeolocationPosition {
  coords: {
    latitude: number;
    longitude: number;
    accuracy: number;
  };
  timestamp: number;
}

export interface CategoryInfo {
  id: Issue['category'];
  name: string;
  icon: string;
  color: string;
  description: string;
}

export interface StatusInfo {
  id: Issue['status'];
  name: string;
  color: string;
  bgColor: string;
  description: string;
}
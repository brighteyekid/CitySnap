import { format, formatDistanceToNow, isValid, parseISO } from 'date-fns';
import { CATEGORIES, STATUSES, PRIORITY_LEVELS, USER_RANKS } from './constants';
import { Issue, User, CategoryInfo, StatusInfo, Location } from '../types';

/**
 * Format date to readable string
 */
export const formatDate = (date: string | Date, formatStr: string = 'MMM dd, yyyy'): string => {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return isValid(dateObj) ? format(dateObj, formatStr) : 'Invalid date';
  } catch {
    return 'Invalid date';
  }
};

/**
 * Format date to relative time (e.g., "2 hours ago")
 */
export const formatRelativeTime = (date: string | Date): string => {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return isValid(dateObj) ? formatDistanceToNow(dateObj, { addSuffix: true }) : 'Unknown time';
  } catch {
    return 'Unknown time';
  }
};

/**
 * Get category information by ID
 */
export const getCategoryInfo = (categoryId: string): CategoryInfo => {
  return CATEGORIES.find(cat => cat.id === categoryId) || CATEGORIES[CATEGORIES.length - 1];
};

/**
 * Get status information by ID
 */
export const getStatusInfo = (statusId: string): StatusInfo => {
  return STATUSES.find(status => status.id === statusId) || STATUSES[0];
};

/**
 * Get priority level information
 */
export const getPriorityInfo = (priority: number) => {
  return PRIORITY_LEVELS.find(level => level.value === priority) || PRIORITY_LEVELS[0];
};

/**
 * Get user rank based on points
 */
export const getUserRank = (points: number) => {
  return USER_RANKS.find(rank => points >= rank.min && points <= rank.max) || USER_RANKS[0];
};

/**
 * Calculate distance between two coordinates (Haversine formula)
 */
export const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

/**
 * Convert degrees to radians
 */
const toRadians = (degrees: number): number => {
  return degrees * (Math.PI / 180);
};

/**
 * Format distance to human readable string
 */
export const formatDistance = (distanceKm: number): string => {
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)}m`;
  }
  return `${distanceKm.toFixed(1)}km`;
};

/**
 * Validate file type and size
 */
export const validateFile = (file: File, maxSizeMB: number = 10, allowedTypes: string[] = ['image/jpeg', 'image/png', 'image/webp']): { valid: boolean; error?: string } => {
  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: 'Invalid file type. Please upload JPEG, PNG, or WebP images.' };
  }
  
  if (file.size > maxSizeMB * 1024 * 1024) {
    return { valid: false, error: `File size must be less than ${maxSizeMB}MB.` };
  }
  
  return { valid: true };
};

/**
 * Generate a random color for map markers
 */
export const getMarkerColor = (status: Issue['status']): string => {
  switch (status) {
    case 'reported':
      return '#ef4444'; // red
    case 'in-progress':
      return '#f59e0b'; // yellow
    case 'resolved':
      return '#10b981'; // green
    default:
      return '#6b7280'; // gray
  }
};

/**
 * Truncate text to specified length
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
};

/**
 * Debounce function
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

/**
 * Get current user location
 */
export const getCurrentLocation = (): Promise<Location> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by this browser.'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        });
      },
      (error) => {
        reject(error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      }
    );
  });
};

/**
 * Format file size to human readable string
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Generate initials from name
 */
export const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map(word => word.charAt(0).toUpperCase())
    .join('')
    .substring(0, 2);
};

/**
 * Check if user can edit issue
 */
export const canEditIssue = (issue: Issue, user: User | null): boolean => {
  if (!user) return false;
  
  return (
    user.role === 'admin' ||
    user.role === 'authority' ||
    issue.reportedBy._id === user._id
  );
};

/**
 * Check if user can update issue status
 */
export const canUpdateStatus = (user: User | null): boolean => {
  if (!user) return false;
  return user.role === 'admin' || user.role === 'authority';
};

/**
 * Generate a unique ID
 */
export const generateId = (): string => {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
};

/**
 * Capitalize first letter of string
 */
export const capitalize = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

/**
 * Convert camelCase to Title Case
 */
export const camelToTitle = (str: string): string => {
  return str
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (str) => str.toUpperCase())
    .trim();
};

/**
 * Check if string is valid email
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Generate avatar URL from initials
 */
export const generateAvatarUrl = (name: string, size: number = 40): string => {
  const initials = getInitials(name);
  const colors = ['#f56565', '#ed8936', '#ecc94b', '#48bb78', '#38b2ac', '#4299e1', '#667eea', '#9f7aea'];
  const color = colors[name.length % colors.length];
  
  return `https://ui-avatars.com/api/?name=${initials}&size=${size}&background=${color.substring(1)}&color=fff&bold=true`;
};

/**
 * Sort array by multiple criteria
 */
export const multiSort = <T>(array: T[], ...sortFunctions: ((a: T, b: T) => number)[]): T[] => {
  return array.sort((a, b) => {
    for (const sortFn of sortFunctions) {
      const result = sortFn(a, b);
      if (result !== 0) return result;
    }
    return 0;
  });
};

/**
 * Group array by key
 */
export const groupBy = <T, K extends keyof T>(array: T[], key: K): Record<string, T[]> => {
  return array.reduce((groups, item) => {
    const group = String(item[key]);
    groups[group] = groups[group] || [];
    groups[group].push(item);
    return groups;
  }, {} as Record<string, T[]>);
};
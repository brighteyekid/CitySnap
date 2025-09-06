import { useQuery, useMutation, useQueryClient } from 'react-query';
import { issueService } from '../services/issueService';
import { Issue, IssueFilters, CreateIssueData, UpdateStatusData } from '../types';
import toast from 'react-hot-toast';

// Query keys
export const ISSUE_QUERY_KEYS = {
  all: ['issues'] as const,
  lists: () => [...ISSUE_QUERY_KEYS.all, 'list'] as const,
  list: (filters: IssueFilters) => [...ISSUE_QUERY_KEYS.lists(), filters] as const,
  details: () => [...ISSUE_QUERY_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...ISSUE_QUERY_KEYS.details(), id] as const,
  stats: () => [...ISSUE_QUERY_KEYS.all, 'stats'] as const,
  nearby: (lat: number, lng: number, radius: number) => 
    [...ISSUE_QUERY_KEYS.all, 'nearby', lat, lng, radius] as const,
};

// Get issues with filters
export const useIssues = (filters: IssueFilters = {}) => {
  return useQuery(
    ISSUE_QUERY_KEYS.list(filters),
    () => issueService.getIssues(filters),
    {
      keepPreviousData: true,
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  );
};

// Get single issue
export const useIssue = (id: string) => {
  return useQuery(
    ISSUE_QUERY_KEYS.detail(id),
    () => issueService.getIssue(id),
    {
      enabled: !!id,
      staleTime: 2 * 60 * 1000, // 2 minutes
    }
  );
};

// Get issue statistics
export const useIssueStats = () => {
  return useQuery(
    ISSUE_QUERY_KEYS.stats(),
    () => issueService.getIssueStats(),
    {
      staleTime: 10 * 60 * 1000, // 10 minutes
    }
  );
};

// Get nearby issues
export const useNearbyIssues = (lat: number, lng: number, radius: number = 5000) => {
  return useQuery(
    ISSUE_QUERY_KEYS.nearby(lat, lng, radius),
    () => issueService.getNearbyIssues(lat, lng, radius),
    {
      enabled: !!(lat && lng),
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  );
};

// Create issue mutation
export const useCreateIssue = () => {
  const queryClient = useQueryClient();

  return useMutation(
    ({ issueData, onProgress }: { issueData: CreateIssueData; onProgress?: (progress: number) => void }) =>
      issueService.createIssue(issueData, onProgress),
    {
      onSuccess: (data) => {
        // Invalidate and refetch issues
        queryClient.invalidateQueries(ISSUE_QUERY_KEYS.lists());
        queryClient.invalidateQueries(ISSUE_QUERY_KEYS.stats());
        
        toast.success(data.message || 'Issue reported successfully!');
      },
      onError: (error: any) => {
        const message = error.response?.data?.error || 'Failed to report issue';
        toast.error(message);
      },
    }
  );
};

// Update issue status mutation
export const useUpdateIssueStatus = () => {
  const queryClient = useQueryClient();

  return useMutation(
    ({ id, statusData }: { id: string; statusData: UpdateStatusData }) =>
      issueService.updateIssueStatus(id, statusData),
    {
      onSuccess: (data, variables) => {
        // Update the specific issue in cache
        queryClient.setQueryData(
          ISSUE_QUERY_KEYS.detail(variables.id),
          { success: true, data: data.data }
        );
        
        // Invalidate lists to refresh
        queryClient.invalidateQueries(ISSUE_QUERY_KEYS.lists());
        queryClient.invalidateQueries(ISSUE_QUERY_KEYS.stats());
        
        toast.success('Issue status updated successfully!');
      },
      onError: (error: any) => {
        const message = error.response?.data?.error || 'Failed to update issue status';
        toast.error(message);
      },
    }
  );
};

// Upvote issue mutation
export const useUpvoteIssue = () => {
  const queryClient = useQueryClient();

  return useMutation(
    (id: string) => issueService.upvoteIssue(id),
    {
      onSuccess: (data, id) => {
        // Update the issue in cache
        queryClient.setQueryData(
          ISSUE_QUERY_KEYS.detail(id),
          (oldData: any) => {
            if (oldData?.data) {
              return {
                ...oldData,
                data: {
                  ...oldData.data,
                  upvoteCount: data.data.upvotes,
                  userUpvoted: data.data.userUpvoted
                }
              };
            }
            return oldData;
          }
        );
        
        // Invalidate lists to refresh counts
        queryClient.invalidateQueries(ISSUE_QUERY_KEYS.lists());
      },
      onError: (error: any) => {
        const message = error.response?.data?.error || 'Failed to upvote issue';
        toast.error(message);
      },
    }
  );
};

// Validate issue mutation
export const useValidateIssue = () => {
  const queryClient = useQueryClient();

  return useMutation(
    (id: string) => issueService.validateIssue(id),
    {
      onSuccess: (data, id) => {
        // Update the issue in cache
        queryClient.setQueryData(
          ISSUE_QUERY_KEYS.detail(id),
          (oldData: any) => {
            if (oldData?.data) {
              return {
                ...oldData,
                data: {
                  ...oldData.data,
                  validationCount: data.data.validations
                }
              };
            }
            return oldData;
          }
        );
        
        // Invalidate lists to refresh counts
        queryClient.invalidateQueries(ISSUE_QUERY_KEYS.lists());
        
        toast.success('Issue validated successfully!');
      },
      onError: (error: any) => {
        const message = error.response?.data?.error || 'Failed to validate issue';
        toast.error(message);
      },
    }
  );
};
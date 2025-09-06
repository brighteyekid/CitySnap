import { useState, useCallback } from 'react';
import { useMutation, useQuery } from 'react-query';
import { mlService } from '../services/mlService';

export interface MLPrediction {
  class: string;
  confidence: number;
  bbox?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export interface ImageVerificationResult {
  isValid: boolean;
  predictions: MLPrediction[];
  suggestedCategory?: string;
  confidence: number;
  message: string;
}

export interface BatchVerificationResult {
  allValid: boolean;
  validCount: number;
  totalCount: number;
  results: ImageVerificationResult[];
  message: string;
}

export const useMLVerification = () => {
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResults, setVerificationResults] = useState<ImageVerificationResult[]>([]);

  // Single image verification
  const verifyImageMutation = useMutation(
    ({ image, category, description }: { 
      image: File; 
      category: string; 
      description?: string; 
    }) => mlService.verifyImage(image, category, description),
    {
      onMutate: () => {
        setIsVerifying(true);
      },
      onSettled: () => {
        setIsVerifying(false);
      },
      onSuccess: (result) => {
        setVerificationResults([result]);
      },
      onError: (error) => {
        console.error('Image verification failed:', error);
        setVerificationResults([]);
      }
    }
  );

  // Multiple images verification
  const verifyImagesMutation = useMutation(
    ({ images, category, description }: { 
      images: File[]; 
      category: string; 
      description?: string; 
    }) => mlService.verifyImages(images, category, description),
    {
      onMutate: () => {
        setIsVerifying(true);
      },
      onSettled: () => {
        setIsVerifying(false);
      },
      onSuccess: (result) => {
        setVerificationResults(result.results);
      },
      onError: (error) => {
        console.error('Batch image verification failed:', error);
        setVerificationResults([]);
      }
    }
  );

  // Submit feedback
  const submitFeedbackMutation = useMutation(
    ({ 
      issueId, 
      actualCategory, 
      userFeedback, 
      predictions, 
      imagePath 
    }: {
      issueId?: string;
      actualCategory: string;
      userFeedback: 'correct' | 'incorrect';
      predictions: MLPrediction[];
      imagePath?: string;
    }) => mlService.submitFeedback({
      issueId,
      actualCategory,
      userFeedback,
      predictions,
      imagePath
    })
  );

  // Verify single image
  const verifyImage = useCallback(
    async (image: File, category: string, description?: string) => {
      try {
        const result = await verifyImageMutation.mutateAsync({
          image,
          category,
          description
        });
        return result;
      } catch (error) {
        throw error;
      }
    },
    [verifyImageMutation]
  );

  // Verify multiple images
  const verifyImages = useCallback(
    async (images: File[], category: string, description?: string) => {
      try {
        const result = await verifyImagesMutation.mutateAsync({
          images,
          category,
          description
        });
        return result;
      } catch (error) {
        throw error;
      }
    },
    [verifyImagesMutation]
  );

  // Submit feedback
  const submitFeedback = useCallback(
    async (
      actualCategory: string,
      userFeedback: 'correct' | 'incorrect',
      predictions: MLPrediction[],
      issueId?: string,
      imagePath?: string
    ) => {
      try {
        await submitFeedbackMutation.mutateAsync({
          issueId,
          actualCategory,
          userFeedback,
          predictions,
          imagePath
        });
      } catch (error) {
        throw error;
      }
    },
    [submitFeedbackMutation]
  );

  // Clear verification results
  const clearResults = useCallback(() => {
    setVerificationResults([]);
  }, []);

  return {
    // State
    isVerifying,
    verificationResults,
    
    // Actions
    verifyImage,
    verifyImages,
    submitFeedback,
    clearResults,
    
    // Mutation states
    isSubmittingFeedback: submitFeedbackMutation.isLoading,
    feedbackError: submitFeedbackMutation.error,
    verificationError: verifyImageMutation.error || verifyImagesMutation.error
  };
};

// Hook for ML service health
export const useMLHealth = () => {
  return useQuery(
    'ml-health',
    mlService.getHealth,
    {
      refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
      staleTime: 2 * 60 * 1000, // Consider data stale after 2 minutes
    }
  );
};

// Hook for supported categories
export const useMLCategories = () => {
  return useQuery(
    'ml-categories',
    mlService.getSupportedCategories,
    {
      staleTime: 10 * 60 * 1000, // Categories don't change often
    }
  );
};

// Hook for ML statistics
export const useMLStats = () => {
  return useQuery(
    'ml-stats',
    mlService.getStats,
    {
      refetchInterval: 10 * 60 * 1000, // Refetch every 10 minutes
      staleTime: 5 * 60 * 1000,
    }
  );
};
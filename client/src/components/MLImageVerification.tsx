import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Loader, Eye, RefreshCw } from 'lucide-react';
import { useMLVerification } from '../hooks/useMLVerification';
import { motion, AnimatePresence } from 'framer-motion';

interface MLImageVerificationProps {
  images: File[];
  selectedCategory: string;
  description?: string;
  onVerificationComplete: (isValid: boolean, results: any[]) => void;
  onVerificationStart?: () => void;
}

const MLImageVerification: React.FC<MLImageVerificationProps> = ({
  images,
  selectedCategory,
  description,
  onVerificationComplete,
  onVerificationStart
}) => {
  const [showDetails, setShowDetails] = useState(false);
  const [hasVerified, setHasVerified] = useState(false);
  
  const {
    isVerifying,
    verificationResults,
    verifyImages,
    verificationError,
    clearResults
  } = useMLVerification();

  // Auto-verify when images or category change
  useEffect(() => {
    if (images.length > 0 && selectedCategory && !isVerifying) {
      handleVerification();
    }
  }, [images, selectedCategory]);

  const handleVerification = async () => {
    if (images.length === 0 || !selectedCategory) return;

    try {
      setHasVerified(false);
      onVerificationStart?.();
      
      const result = await verifyImages(images, selectedCategory, description);
      
      setHasVerified(true);
      onVerificationComplete(result.allValid, result.results);
    } catch (error) {
      console.error('Verification failed:', error);
      setHasVerified(true);
      // In case of error, allow the user to proceed (fail open)
      onVerificationComplete(true, []);
    }
  };

  const handleRetry = () => {
    clearResults();
    handleVerification();
  };

  const getVerificationStatus = () => {
    if (isVerifying) return 'verifying';
    if (verificationError) return 'error';
    if (!hasVerified) return 'pending';
    
    const allValid = verificationResults.every(result => result.isValid);
    return allValid ? 'valid' : 'invalid';
  };

  const getStatusIcon = () => {
    const status = getVerificationStatus();
    
    switch (status) {
      case 'verifying':
        return <Loader className="h-5 w-5 text-blue-500 animate-spin" />;
      case 'valid':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'invalid':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'error':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      default:
        return <AlertTriangle className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusMessage = () => {
    const status = getVerificationStatus();
    
    switch (status) {
      case 'verifying':
        return 'Verifying images with AI...';
      case 'valid':
        return 'All images verified successfully!';
      case 'invalid':
        const invalidCount = verificationResults.filter(r => !r.isValid).length;
        return `${invalidCount} of ${verificationResults.length} images need attention`;
      case 'error':
        return 'Verification service temporarily unavailable';
      default:
        return 'Waiting for verification...';
    }
  };

  const getStatusColor = () => {
    const status = getVerificationStatus();
    
    switch (status) {
      case 'verifying':
        return 'border-blue-200 bg-blue-50';
      case 'valid':
        return 'border-green-200 bg-green-50';
      case 'invalid':
        return 'border-red-200 bg-red-50';
      case 'error':
        return 'border-yellow-200 bg-yellow-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  if (images.length === 0) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`border rounded-lg p-4 ${getStatusColor()}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {getStatusIcon()}
          <div>
            <h3 className="text-sm font-medium text-gray-900">
              AI Image Verification
            </h3>
            <p className="text-sm text-gray-600">
              {getStatusMessage()}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {verificationResults.length > 0 && (
            <button
              type="button"
              onClick={() => setShowDetails(!showDetails)}
              className="text-sm text-blue-600 hover:text-blue-800 flex items-center space-x-1"
            >
              <Eye className="h-4 w-4" />
              <span>{showDetails ? 'Hide' : 'Show'} Details</span>
            </button>
          )}
          
          {(verificationError || getVerificationStatus() === 'invalid') && (
            <button
              type="button"
              onClick={handleRetry}
              disabled={isVerifying}
              className="text-sm text-gray-600 hover:text-gray-800 flex items-center space-x-1"
            >
              <RefreshCw className={`h-4 w-4 ${isVerifying ? 'animate-spin' : ''}`} />
              <span>Retry</span>
            </button>
          )}
        </div>
      </div>

      <AnimatePresence>
        {showDetails && verificationResults.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 space-y-3"
          >
            {verificationResults.map((result, index) => (
              <div
                key={index}
                className={`p-3 rounded-lg border ${
                  result.isValid 
                    ? 'border-green-200 bg-green-50' 
                    : 'border-red-200 bg-red-50'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      {result.isValid ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-500" />
                      )}
                      <span className="text-sm font-medium">
                        Image {index + 1}
                      </span>
                      {result.confidence > 0 && (
                        <span className="text-xs text-gray-500">
                          {(result.confidence * 100).toFixed(1)}% confidence
                        </span>
                      )}
                    </div>
                    
                    <p className="text-sm text-gray-700 mb-2">
                      {result.message}
                    </p>
                    
                    {result.predictions.length > 0 && (
                      <div className="text-xs text-gray-600">
                        <span className="font-medium">Detected: </span>
                        {result.predictions.map((pred, i) => (
                          <span key={i}>
                            {pred.class} ({(pred.confidence * 100).toFixed(1)}%)
                            {i < result.predictions.length - 1 ? ', ' : ''}
                          </span>
                        ))}
                      </div>
                    )}
                    
                    {result.suggestedCategory && result.suggestedCategory !== selectedCategory && (
                      <div className="mt-2 text-xs text-blue-600">
                        <span className="font-medium">Suggested category: </span>
                        {result.suggestedCategory}
                      </div>
                    )}
                  </div>
                  
                  <div className="ml-4">
                    <img
                      src={URL.createObjectURL(images[index])}
                      alt={`Preview ${index + 1}`}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Progress indicator */}
      {isVerifying && (
        <div className="mt-3">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{ width: '60%' }} />
          </div>
        </div>
      )}

      {/* Error message */}
      {verificationError && (
        <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
            <p className="text-sm text-yellow-800">
              {verificationError instanceof Error 
                ? verificationError.message 
                : 'Verification failed. You can still submit your report.'}
            </p>
          </div>
        </div>
      )}

      {/* Help text */}
      <div className="mt-3 text-xs text-gray-500">
        Our AI helps verify that uploaded images match the selected category to improve report quality.
      </div>
    </motion.div>
  );
};

export default MLImageVerification;
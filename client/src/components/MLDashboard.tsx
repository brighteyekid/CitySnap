import React from 'react';
import { Brain, CheckCircle, XCircle, TrendingUp, Activity } from 'lucide-react';
import { useMLStats, useMLHealth } from '../hooks/useMLVerification';
import LoadingSpinner from './LoadingSpinner';

const MLDashboard: React.FC = () => {
  const { data: mlStats, isLoading: statsLoading, error: statsError } = useMLStats();
  const { data: mlHealth, isLoading: healthLoading, error: healthError } = useMLHealth();

  if (statsLoading || healthLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-center">
          <LoadingSpinner size="lg" />
          <span className="ml-2 text-gray-600">Loading ML Dashboard...</span>
        </div>
      </div>
    );
  }

  if (statsError || healthError) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center text-red-600">
          <XCircle className="h-5 w-5 mr-2" />
          <span>Unable to load ML dashboard data</span>
        </div>
      </div>
    );
  }

  const getHealthStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'text-green-600 bg-green-100';
      case 'degraded':
        return 'text-yellow-600 bg-yellow-100';
      case 'unhealthy':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getHealthIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-4 w-4" />;
      case 'degraded':
        return <Activity className="h-4 w-4" />;
      case 'unhealthy':
        return <XCircle className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Brain className="h-6 w-6 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900">
              AI Verification System
            </h2>
          </div>
          
          {mlHealth && (
            <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm ${getHealthStatusColor(mlHealth.status)}`}>
              {getHealthIcon(mlHealth.status)}
              <span className="capitalize">{mlHealth.status}</span>
            </div>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          {/* Total Verifications */}
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Total Verifications</p>
                <p className="text-2xl font-bold text-blue-900">
                  {mlStats?.totalVerifications || 0}
                </p>
              </div>
              <Activity className="h-8 w-8 text-blue-600" />
            </div>
          </div>

          {/* Successful Verifications */}
          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Successful</p>
                <p className="text-2xl font-bold text-green-900">
                  {mlStats?.successfulVerifications || 0}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </div>

          {/* Failed Verifications */}
          <div className="bg-red-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-600">Failed</p>
                <p className="text-2xl font-bold text-red-900">
                  {mlStats?.failedVerifications || 0}
                </p>
              </div>
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
          </div>

          {/* Accuracy Rate */}
          <div className="bg-purple-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">Accuracy Rate</p>
                <p className="text-2xl font-bold text-purple-900">
                  {mlStats?.accuracyRate ? `${mlStats.accuracyRate.toFixed(1)}%` : '0%'}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-600" />
            </div>
          </div>
        </div>

        {/* Category Breakdown */}
        {mlStats?.categoryBreakdown && Object.keys(mlStats.categoryBreakdown).length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Verifications by Category
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(mlStats.categoryBreakdown).map(([category, count]) => (
                <div key={category} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700 capitalize">
                      {category}
                    </span>
                    <span className="text-lg font-bold text-gray-900">
                      {count}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* System Status */}
        {mlHealth && (
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              System Status
            </h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    {getHealthIcon(mlHealth.status)}
                    <span className="font-medium capitalize">
                      {mlHealth.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    {mlHealth.message}
                  </p>
                  <p className="text-xs text-gray-500">
                    Last checked: {new Date(mlHealth.lastCheck).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Help Text */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h4 className="text-sm font-medium text-blue-900 mb-2">
            How AI Verification Works
          </h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Images are analyzed using computer vision models</li>
            <li>• The system detects civic issues like potholes, garbage, etc.</li>
            <li>• Verification ensures images match the selected category</li>
            <li>• This helps maintain report quality and reduces false reports</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default MLDashboard;
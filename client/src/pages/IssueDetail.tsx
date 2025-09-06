import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import { 
  ArrowLeft, 
  MapPin, 
  Clock, 
  User, 
  ThumbsUp, 
  CheckCircle, 
  Edit,
  Calendar,
  AlertTriangle
} from 'lucide-react';
import { useIssue, useUpvoteIssue, useValidateIssue, useUpdateIssueStatus } from '../hooks/useIssues';
import { useAuth } from '../hooks/useAuth';
import { formatDate, formatRelativeTime, getCategoryInfo, getStatusInfo, getPriorityInfo, canUpdateStatus } from '../utils/helpers';
import { MAP_CONFIG } from '../utils/constants';
import LoadingSpinner from '../components/LoadingSpinner';

const IssueDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [selectedImage, setSelectedImage] = useState(0);
  const [showStatusUpdate, setShowStatusUpdate] = useState(false);

  const { data, isLoading, error } = useIssue(id!);
  const upvoteMutation = useUpvoteIssue();
  const validateMutation = useValidateIssue();
  const updateStatusMutation = useUpdateIssueStatus();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !data?.data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Issue Not Found</h1>
          <p className="text-gray-600 mb-4">The issue you're looking for doesn't exist or has been removed.</p>
          <Link to="/" className="btn-primary">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const issue = data.data;
  const categoryInfo = getCategoryInfo(issue.category);
  const statusInfo = getStatusInfo(issue.status);
  const priorityInfo = getPriorityInfo(issue.priority);

  const handleUpvote = () => {
    if (user) {
      upvoteMutation.mutate(issue._id);
    }
  };

  const handleValidate = () => {
    if (user) {
      validateMutation.mutate(issue._id);
    }
  };

  const handleStatusUpdate = (newStatus: string) => {
    updateStatusMutation.mutate({
      id: issue._id,
      statusData: { status: newStatus as any }
    });
    setShowStatusUpdate(false);
  };

  const userHasUpvoted = user && issue.upvotes.some(upvote => upvote._id === user._id);
  const userHasValidated = user && issue.validations.some(validation => validation._id === user._id);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center space-x-4">
            <Link to="/" className="text-gray-600 hover:text-gray-900">
              <ArrowLeft className="h-6 w-6" />
            </Link>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900">{issue.title}</h1>
              <div className="flex items-center space-x-4 mt-2">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusInfo.bgColor} ${statusInfo.color}`}>
                  {statusInfo.name}
                </span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${priorityInfo.color}`}>
                  Priority {issue.priority}
                </span>
                <span className="text-sm text-gray-600">
                  {categoryInfo.icon} {categoryInfo.name}
                </span>
              </div>
            </div>
            {canUpdateStatus(user) && (
              <button
                onClick={() => setShowStatusUpdate(!showStatusUpdate)}
                className="btn-secondary flex items-center space-x-2"
              >
                <Edit className="h-4 w-4" />
                <span>Update Status</span>
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Images */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="aspect-w-16 aspect-h-9">
                <img
                  src={issue.images[selectedImage]}
                  alt={`Issue image ${selectedImage + 1}`}
                  className="w-full h-96 object-cover"
                />
              </div>
              {issue.images.length > 1 && (
                <div className="p-4">
                  <div className="flex space-x-2 overflow-x-auto">
                    {issue.images.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedImage(index)}
                        className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 ${
                          selectedImage === index ? 'border-blue-500' : 'border-gray-200'
                        }`}
                      >
                        <img
                          src={image}
                          alt={`Thumbnail ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Description */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Description</h2>
              <p className="text-gray-700 whitespace-pre-wrap">{issue.description}</p>
            </div>

            {/* Map */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Location</h2>
              <div className="h-64 rounded-lg overflow-hidden">
                <MapContainer
                  center={[issue.location.coordinates[1], issue.location.coordinates[0]]}
                  zoom={15}
                  style={{ height: '100%', width: '100%' }}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  />
                  <Marker position={[issue.location.coordinates[1], issue.location.coordinates[0]]} />
                </MapContainer>
              </div>
              {issue.address && (
                <div className="mt-4 flex items-center text-gray-600">
                  <MapPin className="h-4 w-4 mr-2" />
                  <span>{issue.address}</span>
                </div>
              )}
            </div>

            {/* Clustered Issues */}
            {issue.clusteredWith && issue.clusteredWith.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Related Reports ({issue.clusteredWith.length})
                </h2>
                <p className="text-gray-600 text-sm mb-4">
                  This issue has been clustered with similar reports in the area.
                </p>
                <div className="space-y-3">
                  {issue.clusteredWith.map((clusteredIssue, index) => (
                    <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <img
                        src={clusteredIssue.images?.[0] || '/placeholder.jpg'}
                        alt="Related issue"
                        className="w-12 h-12 object-cover rounded"
                      />
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{clusteredIssue.title}</h4>
                        <p className="text-sm text-gray-600">
                          Reported {formatRelativeTime(clusteredIssue.reportedAt)}
                        </p>
                      </div>
                      <Link
                        to={`/issues/${clusteredIssue._id}`}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        View →
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Actions */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Community Actions</h2>
              <div className="space-y-3">
                <button
                  onClick={handleUpvote}
                  disabled={!user || upvoteMutation.isLoading}
                  className={`w-full flex items-center justify-center space-x-2 py-2 px-4 rounded-lg font-medium transition-colors ${
                    userHasUpvoted
                      ? 'bg-blue-100 text-blue-800 border border-blue-200'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  } disabled:opacity-50`}
                >
                  <ThumbsUp className="h-4 w-4" />
                  <span>{userHasUpvoted ? 'Upvoted' : 'Upvote'}</span>
                  <span className="bg-white px-2 py-1 rounded text-sm">
                    {issue.upvotes.length}
                  </span>
                </button>

                <button
                  onClick={handleValidate}
                  disabled={!user || userHasValidated || validateMutation.isLoading}
                  className={`w-full flex items-center justify-center space-x-2 py-2 px-4 rounded-lg font-medium transition-colors ${
                    userHasValidated
                      ? 'bg-green-100 text-green-800 border border-green-200'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  } disabled:opacity-50`}
                >
                  <CheckCircle className="h-4 w-4" />
                  <span>{userHasValidated ? 'Validated' : 'Validate'}</span>
                  <span className="bg-white px-2 py-1 rounded text-sm">
                    {issue.validations.length}
                  </span>
                </button>
              </div>

              {!user && (
                <p className="text-sm text-gray-600 mt-3">
                  <Link to="/login" className="text-blue-600 hover:text-blue-800">
                    Sign in
                  </Link>{' '}
                  to upvote and validate issues
                </p>
              )}
            </div>

            {/* Status Update Panel */}
            {showStatusUpdate && canUpdateStatus(user) && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Update Status</h2>
                <div className="space-y-2">
                  {['reported', 'in-progress', 'resolved'].map((status) => (
                    <button
                      key={status}
                      onClick={() => handleStatusUpdate(status)}
                      disabled={updateStatusMutation.isLoading}
                      className={`w-full text-left py-2 px-3 rounded-lg transition-colors ${
                        issue.status === status
                          ? 'bg-blue-100 text-blue-800'
                          : 'hover:bg-gray-100'
                      }`}
                    >
                      {getStatusInfo(status).name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Issue Details */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Issue Details</h2>
              <div className="space-y-3 text-sm">
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600">Reported by:</span>
                  <span className="font-medium">{issue.reportedBy.username}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600">Reported:</span>
                  <span className="font-medium">{formatDate(issue.reportedAt)}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600">Last updated:</span>
                  <span className="font-medium">{formatRelativeTime(issue.updatedAt)}</span>
                </div>
                {issue.isAreaReport && (
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600">Area-wide issue</span>
                  </div>
                )}
                {issue.resolvedAt && (
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-gray-600">Resolved:</span>
                    <span className="font-medium">{formatDate(issue.resolvedAt)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IssueDetail;
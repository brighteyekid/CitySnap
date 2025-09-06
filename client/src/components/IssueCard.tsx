import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Clock, ThumbsUp, CheckCircle, User } from 'lucide-react';
import { Issue } from '../types';
import { formatRelativeTime, getCategoryInfo, getStatusInfo, getPriorityInfo } from '../utils/helpers';

interface IssueCardProps {
  issue: Issue;
}

const IssueCard: React.FC<IssueCardProps> = ({ issue }) => {
  const categoryInfo = getCategoryInfo(issue.category);
  const statusInfo = getStatusInfo(issue.status);
  const priorityInfo = getPriorityInfo(issue.priority);

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      {/* Image */}
      <div className="relative h-48">
        <img
          src={issue.images[0]}
          alt={issue.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-3 left-3">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusInfo.bgColor} ${statusInfo.color}`}>
            {statusInfo.name}
          </span>
        </div>
        <div className="absolute top-3 right-3">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${priorityInfo.color}`}>
            Priority {issue.priority}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
            {issue.title}
          </h3>
          <span className="text-lg ml-2" title={categoryInfo.name}>
            {categoryInfo.icon}
          </span>
        </div>

        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
          {issue.description}
        </p>

        {/* Address */}
        {issue.address && (
          <div className="flex items-center text-sm text-gray-500 mb-3">
            <MapPin className="h-4 w-4 mr-1" />
            <span className="truncate">{issue.address}</span>
          </div>
        )}

        {/* Stats */}
        <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <ThumbsUp className="h-4 w-4 mr-1" />
              <span>{issue.upvotes?.length || 0}</span>
            </div>
            <div className="flex items-center">
              <CheckCircle className="h-4 w-4 mr-1" />
              <span>{issue.validations?.length || 0}</span>
            </div>
            {issue.clusteredWith && issue.clusteredWith.length > 0 && (
              <div className="flex items-center">
                <User className="h-4 w-4 mr-1" />
                <span>+{issue.clusteredWith.length}</span>
              </div>
            )}
          </div>
          <div className="flex items-center">
            <Clock className="h-4 w-4 mr-1" />
            <span>{formatRelativeTime(issue.reportedAt)}</span>
          </div>
        </div>

        {/* Reporter */}
        <div className="flex items-center justify-between">
          <div className="flex items-center text-sm text-gray-600">
            <div className="h-6 w-6 bg-gray-300 rounded-full flex items-center justify-center mr-2">
              <span className="text-xs font-medium">
                {issue.reportedBy.username.charAt(0).toUpperCase()}
              </span>
            </div>
            <span>by {issue.reportedBy.username}</span>
          </div>
          
          <Link
            to={`/issues/${issue._id}`}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            View Details →
          </Link>
        </div>
      </div>
    </div>
  );
};

export default IssueCard;
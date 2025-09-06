import React from 'react';
import { User, Settings, Award, BarChart3 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { getUserRank } from '../utils/helpers';
import LoadingSpinner from '../components/LoadingSpinner';

const Profile: React.FC = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Not authenticated</h1>
          <p className="text-gray-600 mt-2">Please log in to view your profile.</p>
        </div>
      </div>
    );
  }

  const userRank = getUserRank(user.gamification.points);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Profile Header */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="flex items-center space-x-6">
            <div className="h-24 w-24 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-3xl font-bold text-white">
                {user.profile.firstName?.charAt(0) || user.username.charAt(0)}
              </span>
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900">
                {user.profile.firstName && user.profile.lastName
                  ? `${user.profile.firstName} ${user.profile.lastName}`
                  : user.username}
              </h1>
              <p className="text-gray-600">@{user.username}</p>
              <div className="flex items-center space-x-4 mt-2">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${userRank.color} bg-opacity-10`}>
                  {userRank.icon} {userRank.name}
                </span>
                <span className="text-sm text-gray-600">
                  Level {user.gamification.level}
                </span>
                <span className="text-sm text-gray-600 capitalize">
                  {user.role}
                </span>
              </div>
            </div>
            <button className="btn-secondary flex items-center space-x-2">
              <Settings className="h-4 w-4" />
              <span>Edit Profile</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Stats Cards */}
          <div className="lg:col-span-2 space-y-6">
            {/* Gamification Stats */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <BarChart3 className="h-5 w-5 mr-2" />
                Community Impact
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {user.gamification.points}
                  </div>
                  <div className="text-sm text-gray-600">Total Points</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {user.gamification.reportsSubmitted}
                  </div>
                  <div className="text-sm text-gray-600">Reports</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {user.gamification.validationsGiven}
                  </div>
                  <div className="text-sm text-gray-600">Validations</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {user.gamification.issuesResolved}
                  </div>
                  <div className="text-sm text-gray-600">Resolved</div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
              <div className="space-y-4">
                <div className="text-center py-8 text-gray-500">
                  <BarChart3 className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>Activity tracking coming soon!</p>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Badges */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Award className="h-5 w-5 mr-2" />
                Badges
              </h2>
              {user.gamification.badges.length > 0 ? (
                <div className="grid grid-cols-2 gap-3">
                  {user.gamification.badges.map((badge, index) => (
                    <div
                      key={index}
                      className="text-center p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="text-2xl mb-1">🏆</div>
                      <div className="text-xs text-gray-600">{badge}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-gray-500">
                  <Award className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">No badges yet</p>
                  <p className="text-xs">Keep contributing to earn badges!</p>
                </div>
              )}
            </div>

            {/* Account Info */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <User className="h-5 w-5 mr-2" />
                Account Info
              </h2>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-gray-600">Email:</span>
                  <div className="font-medium">{user.email}</div>
                </div>
                <div>
                  <span className="text-gray-600">Member since:</span>
                  <div className="font-medium">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <div>
                  <span className="text-gray-600">Status:</span>
                  <div className="font-medium">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      user.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {user.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
                {user.isVerified && (
                  <div>
                    <span className="text-gray-600">Verification:</span>
                    <div className="font-medium">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        Verified
                      </span>
                    </div>
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

export default Profile;
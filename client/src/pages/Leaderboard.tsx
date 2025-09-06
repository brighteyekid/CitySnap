import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { Trophy, Medal, Award, Star, TrendingUp } from 'lucide-react';
import { userService } from '../services/userService';
import { LeaderboardEntry } from '../types';
import { getUserRank } from '../utils/helpers';
import LoadingSpinner from '../components/LoadingSpinner';

const Leaderboard: React.FC = () => {
  const [timeframe, setTimeframe] = useState<'all' | 'week' | 'month'>('all');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery(
    ['leaderboard', timeframe, page],
    () => userService.getLeaderboard(page, 20, timeframe),
    {
      keepPreviousData: true,
    }
  );

  const leaderboard = data?.data || [];

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-6 w-6 text-yellow-500" />;
      case 2:
        return <Medal className="h-6 w-6 text-gray-400" />;
      case 3:
        return <Award className="h-6 w-6 text-amber-600" />;
      default:
        return <span className="text-lg font-bold text-gray-600">#{rank}</span>;
    }
  };

  const getRankBadge = (rank: number) => {
    if (rank <= 3) {
      const colors = {
        1: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        2: 'bg-gray-100 text-gray-800 border-gray-200',
        3: 'bg-amber-100 text-amber-800 border-amber-200'
      };
      return `px-3 py-1 rounded-full text-sm font-medium border ${colors[rank as keyof typeof colors]}`;
    }
    return 'px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 border border-blue-200';
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Trophy className="h-12 w-12 text-yellow-500" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Community Leaderboard</h1>
          <p className="text-gray-600 mt-2">
            Recognizing our most active community members
          </p>
        </div>

        {/* Timeframe Filter */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="flex flex-wrap justify-center gap-4">
            {[
              { value: 'all', label: 'All Time' },
              { value: 'month', label: 'This Month' },
              { value: 'week', label: 'This Week' }
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  setTimeframe(option.value as typeof timeframe);
                  setPage(1);
                }}
                className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                  timeframe === option.value
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Leaderboard */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <LoadingSpinner />
            </div>
          ) : leaderboard.length === 0 ? (
            <div className="text-center py-12">
              <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No data available</h3>
              <p className="text-gray-600">
                Be the first to contribute to your community!
              </p>
            </div>
          ) : (
            <>
              {/* Top 3 Podium */}
              {page === 1 && leaderboard.length >= 3 && (
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-8">
                  <div className="flex justify-center items-end space-x-8">
                    {/* Second Place */}
                    <div className="text-center">
                      <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mb-3 mx-auto">
                        <span className="text-2xl font-bold text-gray-700">
                          {leaderboard[1]?.username.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="bg-gray-100 rounded-lg p-4 min-h-[100px] flex flex-col justify-between">
                        <div>
                          <Medal className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                          <h3 className="font-semibold text-gray-900">
                            {leaderboard[1]?.profile.firstName || leaderboard[1]?.username}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {leaderboard[1]?.gamification.points} points
                          </p>
                        </div>
                        <div className="mt-2">
                          <span className={getUserRank(leaderboard[1]?.gamification.points).color}>
                            {getUserRank(leaderboard[1]?.gamification.points).icon}{' '}
                            {getUserRank(leaderboard[1]?.gamification.points).name}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* First Place */}
                    <div className="text-center">
                      <div className="w-24 h-24 bg-yellow-200 rounded-full flex items-center justify-center mb-3 mx-auto">
                        <span className="text-3xl font-bold text-yellow-800">
                          {leaderboard[0]?.username.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4 min-h-[120px] flex flex-col justify-between">
                        <div>
                          <Trophy className="h-10 w-10 text-yellow-500 mx-auto mb-2" />
                          <h3 className="font-bold text-gray-900 text-lg">
                            {leaderboard[0]?.profile.firstName || leaderboard[0]?.username}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {leaderboard[0]?.gamification.points} points
                          </p>
                        </div>
                        <div className="mt-2">
                          <span className={getUserRank(leaderboard[0]?.gamification.points).color}>
                            {getUserRank(leaderboard[0]?.gamification.points).icon}{' '}
                            {getUserRank(leaderboard[0]?.gamification.points).name}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Third Place */}
                    <div className="text-center">
                      <div className="w-20 h-20 bg-amber-200 rounded-full flex items-center justify-center mb-3 mx-auto">
                        <span className="text-2xl font-bold text-amber-800">
                          {leaderboard[2]?.username.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="bg-amber-50 rounded-lg p-4 min-h-[100px] flex flex-col justify-between">
                        <div>
                          <Award className="h-8 w-8 text-amber-600 mx-auto mb-2" />
                          <h3 className="font-semibold text-gray-900">
                            {leaderboard[2]?.profile.firstName || leaderboard[2]?.username}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {leaderboard[2]?.gamification.points} points
                          </p>
                        </div>
                        <div className="mt-2">
                          <span className={getUserRank(leaderboard[2]?.gamification.points).color}>
                            {getUserRank(leaderboard[2]?.gamification.points).icon}{' '}
                            {getUserRank(leaderboard[2]?.gamification.points).name}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Full Leaderboard Table */}
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Rank
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Points
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Reports
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Validations
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Level
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {leaderboard.map((user) => {
                      const userRank = getUserRank(user.gamification.points);
                      return (
                        <tr key={user._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              {getRankIcon(user.rank)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="h-10 w-10 bg-blue-600 rounded-full flex items-center justify-center">
                                <span className="text-sm font-medium text-white">
                                  {user.username.charAt(0).toUpperCase()}
                                </span>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {user.profile.firstName || user.username}
                                </div>
                                <div className={`text-xs ${userRank.color}`}>
                                  {userRank.icon} {userRank.name}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-semibold text-gray-900">
                              {user.gamification.points.toLocaleString()}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {user.gamification.reportsSubmitted}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {user.gamification.validationsGiven}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={getRankBadge(user.rank)}>
                              Level {user.gamification.level}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {data?.pagination && data.pagination.pages > 1 && (
                <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                  <div className="flex-1 flex justify-between sm:hidden">
                    <button
                      onClick={() => setPage(Math.max(1, page - 1))}
                      disabled={page === 1}
                      className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setPage(Math.min(data.pagination.pages, page + 1))}
                      disabled={page === data.pagination.pages}
                      className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                    >
                      Next
                    </button>
                  </div>
                  <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm text-gray-700">
                        Showing{' '}
                        <span className="font-medium">
                          {(page - 1) * 20 + 1}
                        </span>{' '}
                        to{' '}
                        <span className="font-medium">
                          {Math.min(page * 20, data.pagination.total)}
                        </span>{' '}
                        of{' '}
                        <span className="font-medium">
                          {data.pagination.total}
                        </span>{' '}
                        results
                      </p>
                    </div>
                    <div>
                      <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                        <button
                          onClick={() => setPage(Math.max(1, page - 1))}
                          disabled={page === 1}
                          className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                        >
                          Previous
                        </button>
                        <button
                          onClick={() => setPage(Math.min(data.pagination.pages, page + 1))}
                          disabled={page === data.pagination.pages}
                          className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                        >
                          Next
                        </button>
                      </nav>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
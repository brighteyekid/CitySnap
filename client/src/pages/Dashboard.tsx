import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Icon } from 'leaflet';
import { Plus, Filter, BarChart3, MapPin, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { useIssues, useIssueStats } from '../hooks/useIssues';
import { useGeolocation } from '../hooks/useGeolocation';
import { Issue, IssueFilters } from '../types';
import { formatRelativeTime, getCategoryInfo, getStatusInfo, getMarkerColor } from '../utils/helpers';
import { MAP_CONFIG } from '../utils/constants';
import IssueCard from '../components/IssueCard';
import FilterPanel from '../components/FilterPanel';
import LoadingSpinner from '../components/LoadingSpinner';

// Fix for default markers in react-leaflet
delete (Icon.Default.prototype as any)._getIconUrl;
Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const Dashboard: React.FC = () => {
  const [filters, setFilters] = useState<IssueFilters>({});
  const [showFilters, setShowFilters] = useState(false);
  const [mapView, setMapView] = useState(true);
  
  const { location, getCurrentPosition } = useGeolocation(true);
  const { data: issuesData, isLoading: issuesLoading } = useIssues(filters);
  const { data: statsData, isLoading: statsLoading } = useIssueStats();

  const issues = issuesData?.data || [];
  const stats = statsData?.data;

  // Create custom markers for different statuses
  const createMarkerIcon = (status: Issue['status']) => {
    const color = getMarkerColor(status);
    return new Icon({
      iconUrl: `data:image/svg+xml;base64,${btoa(`
        <svg width="25" height="41" viewBox="0 0 25 41" xmlns="http://www.w3.org/2000/svg">
          <path fill="${color}" stroke="#fff" stroke-width="2" d="M12.5 0C5.6 0 0 5.6 0 12.5c0 12.5 12.5 28.5 12.5 28.5s12.5-16 12.5-28.5C25 5.6 19.4 0 12.5 0z"/>
          <circle fill="#fff" cx="12.5" cy="12.5" r="6"/>
        </svg>
      `)}`,
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
    });
  };

  const mapCenter: [number, number] = location 
    ? [location.latitude, location.longitude]
    : MAP_CONFIG.DEFAULT_CENTER;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Civic Issues Dashboard</h1>
              <p className="text-gray-600 mt-1">
                Track and resolve community issues in your area
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="btn-secondary flex items-center space-x-2"
              >
                <Filter className="h-4 w-4" />
                <span>Filters</span>
              </button>
              <button
                onClick={() => setMapView(!mapView)}
                className="btn-secondary flex items-center space-x-2"
              >
                {mapView ? <BarChart3 className="h-4 w-4" /> : <MapPin className="h-4 w-4" />}
                <span>{mapView ? 'List View' : 'Map View'}</span>
              </button>
              <Link to="/report" className="btn-primary flex items-center space-x-2">
                <Plus className="h-4 w-4" />
                <span>Report Issue</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <BarChart3 className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Issues</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.overview.totalIssues}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-red-100 rounded-lg">
                  <AlertCircle className="h-6 w-6 text-red-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Reported</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.overview.reportedIssues}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Clock className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">In Progress</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.overview.inProgressIssues}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Resolved</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.overview.resolvedIssues}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filter Panel */}
      {showFilters && (
        <FilterPanel
          filters={filters}
          onFiltersChange={setFilters}
          onClose={() => setShowFilters(false)}
        />
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        {mapView ? (
          /* Map View */
          <div className="bg-white rounded-lg shadow-lg overflow-hidden" style={{ height: '600px' }}>
            {issuesLoading ? (
              <div className="flex items-center justify-center h-full">
                <LoadingSpinner />
              </div>
            ) : (
              <MapContainer
                center={mapCenter}
                zoom={MAP_CONFIG.DEFAULT_ZOOM}
                style={{ height: '100%', width: '100%' }}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                
                {/* User location marker */}
                {location && (
                  <Marker position={[location.latitude, location.longitude]}>
                    <Popup>
                      <div className="text-center">
                        <p className="font-medium">Your Location</p>
                      </div>
                    </Popup>
                  </Marker>
                )}
                
                {/* Issue markers */}
                {issues.map((issue) => (
                  <Marker
                    key={issue._id}
                    position={[issue.location.coordinates[1], issue.location.coordinates[0]]}
                    icon={createMarkerIcon(issue.status)}
                  >
                    <Popup maxWidth={300}>
                      <div className="p-2">
                        <div className="flex items-start space-x-3">
                          <img
                            src={issue.images[0]}
                            alt={issue.title}
                            className="w-16 h-16 object-cover rounded-lg"
                          />
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-gray-900 truncate">
                              {issue.title}
                            </h3>
                            <p className="text-sm text-gray-600 mt-1">
                              {getCategoryInfo(issue.category).name}
                            </p>
                            <div className="flex items-center space-x-2 mt-2">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusInfo(issue.status).bgColor} ${getStatusInfo(issue.status).color}`}>
                                {getStatusInfo(issue.status).name}
                              </span>
                              <span className="text-xs text-gray-500">
                                {formatRelativeTime(issue.reportedAt)}
                              </span>
                            </div>
                            <Link
                              to={`/issues/${issue._id}`}
                              className="inline-block mt-2 text-sm text-blue-600 hover:text-blue-800"
                            >
                              View Details →
                            </Link>
                          </div>
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            )}
          </div>
        ) : (
          /* List View */
          <div className="space-y-6">
            {issuesLoading ? (
              <div className="flex items-center justify-center py-12">
                <LoadingSpinner />
              </div>
            ) : issues.length === 0 ? (
              <div className="text-center py-12">
                <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No issues found</h3>
                <p className="text-gray-600 mb-4">
                  No issues match your current filters. Try adjusting your search criteria.
                </p>
                <Link to="/report" className="btn-primary">
                  Report the First Issue
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {issues.map((issue) => (
                  <IssueCard key={issue._id} issue={issue} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
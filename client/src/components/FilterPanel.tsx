import React from 'react';
import { X } from 'lucide-react';
import { IssueFilters } from '../types';
import { CATEGORIES, STATUSES } from '../utils/constants';

interface FilterPanelProps {
  filters: IssueFilters;
  onFiltersChange: (filters: IssueFilters) => void;
  onClose: () => void;
}

const FilterPanel: React.FC<FilterPanelProps> = ({ filters, onFiltersChange, onClose }) => {
  const updateFilter = (key: keyof IssueFilters, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const clearFilters = () => {
    onFiltersChange({});
  };

  return (
    <div className="bg-white border-b shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Filters</h3>
          <div className="flex items-center space-x-2">
            <button
              onClick={clearFilters}
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              Clear All
            </button>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              value={filters.status || ''}
              onChange={(e) => updateFilter('status', e.target.value || undefined)}
              className="input-field"
            >
              <option value="">All Statuses</option>
              {STATUSES.map((status) => (
                <option key={status.id} value={status.id}>
                  {status.name}
                </option>
              ))}
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <select
              value={filters.category || ''}
              onChange={(e) => updateFilter('category', e.target.value || undefined)}
              className="input-field"
            >
              <option value="">All Categories</option>
              {CATEGORIES.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.icon} {category.name}
                </option>
              ))}
            </select>
          </div>

          {/* Priority Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Min Priority
            </label>
            <select
              value={filters.priority || ''}
              onChange={(e) => updateFilter('priority', e.target.value ? parseInt(e.target.value) : undefined)}
              className="input-field"
            >
              <option value="">Any Priority</option>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((priority) => (
                <option key={priority} value={priority}>
                  {priority}+ Priority
                </option>
              ))}
            </select>
          </div>

          {/* Sort Options */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sort By
            </label>
            <select
              value={`${filters.sortBy || 'reportedAt'}-${filters.sortOrder || 'desc'}`}
              onChange={(e) => {
                const [sortBy, sortOrder] = e.target.value.split('-');
                updateFilter('sortBy', sortBy);
                updateFilter('sortOrder', sortOrder);
              }}
              className="input-field"
            >
              <option value="reportedAt-desc">Newest First</option>
              <option value="reportedAt-asc">Oldest First</option>
              <option value="priority-desc">Highest Priority</option>
              <option value="priority-asc">Lowest Priority</option>
              <option value="upvotes-desc">Most Upvoted</option>
              <option value="validations-desc">Most Validated</option>
            </select>
          </div>
        </div>

        {/* Location Filter */}
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Search Radius (km)
          </label>
          <div className="flex items-center space-x-4">
            <input
              type="range"
              min="1"
              max="50"
              value={filters.radius ? filters.radius / 1000 : 5}
              onChange={(e) => updateFilter('radius', parseInt(e.target.value) * 1000)}
              className="flex-1"
            />
            <span className="text-sm text-gray-600 w-16">
              {filters.radius ? (filters.radius / 1000).toFixed(0) : 5} km
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilterPanel;
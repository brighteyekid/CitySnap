import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import { Camera, MapPin, Upload, X, AlertCircle } from 'lucide-react';
import { useCreateIssue } from '../hooks/useIssues';
import { useGeolocation } from '../hooks/useGeolocation';
import { CreateIssueData } from '../types';
import { CATEGORIES, MAP_CONFIG } from '../utils/constants';
import { validateFile } from '../utils/helpers';
import LoadingSpinner from '../components/LoadingSpinner';
import CategoryIcon from '../components/CategoryIcon';
import toast from 'react-hot-toast';

interface FormData extends Omit<CreateIssueData, 'images'> {
  images: FileList;
}

const ReportIssue: React.FC = () => {
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [mapPosition, setMapPosition] = useState<[number, number] | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();
  const { location, getCurrentPosition, isLoading: locationLoading } = useGeolocation();
  const createIssueMutation = useCreateIssue();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch
  } = useForm<FormData>();

  const watchedLocation = watch('location');

  // Map click handler component
  const MapClickHandler = () => {
    useMapEvents({
      click: (e) => {
        const { lat, lng } = e.latlng;
        setMapPosition([lat, lng]);
        setValue('location.latitude', lat);
        setValue('location.longitude', lng);
      },
    });
    return null;
  };

  // Handle image selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles: File[] = [];
    const errors: string[] = [];

    files.forEach((file) => {
      const validation = validateFile(file);
      if (validation.valid) {
        validFiles.push(file);
      } else {
        errors.push(`${file.name}: ${validation.error}`);
      }
    });

    if (errors.length > 0) {
      alert(errors.join('\n'));
    }

    setSelectedImages((prev) => [...prev, ...validFiles].slice(0, 5)); // Max 5 images
  };

  // Remove image
  const removeImage = (index: number) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
  };

  // Get current location
  const handleGetLocation = async () => {
    try {
      await getCurrentPosition();
      toast.success('Location detected successfully!');
    } catch (error: any) {
      console.error('Failed to get location:', error);
      let errorMessage = 'Unable to get your location';
      
      if (error.code === 1) {
        errorMessage = 'Location access denied. Please enable location services in your browser.';
      } else if (error.code === 2) {
        errorMessage = 'Location unavailable. Please try again or select manually on the map.';
      } else if (error.code === 3) {
        errorMessage = 'Location request timed out. Please try again.';
      }
      
      toast.error(errorMessage);
    }
  };

  // Set location from geolocation
  React.useEffect(() => {
    if (location && !mapPosition) {
      setMapPosition([location.latitude, location.longitude]);
      setValue('location.latitude', location.latitude);
      setValue('location.longitude', location.longitude);
    }
  }, [location, mapPosition, setValue]);

  // Form submission
  const onSubmit = async (data: FormData) => {
    if (selectedImages.length === 0) {
      alert('Please select at least one image');
      return;
    }

    if (!data.location.latitude || !data.location.longitude) {
      alert('Please select a location on the map');
      return;
    }

    setIsSubmitting(true);

    try {
      const issueData: CreateIssueData = {
        ...data,
        images: selectedImages
      };

      await createIssueMutation.mutateAsync({
        issueData,
        onProgress: setUploadProgress
      });

      navigate('/');
    } catch (error) {
      console.error('Failed to create issue:', error);
    } finally {
      setIsSubmitting(false);
      setUploadProgress(0);
    }
  };

  const mapCenter: [number, number] = mapPosition || 
    (location ? [location.latitude, location.longitude] : MAP_CONFIG.DEFAULT_CENTER);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Report a Civic Issue</h1>
          <p className="text-gray-600 mt-2">
            Help improve your community by reporting local issues
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Form Fields */}
            <div className="space-y-6">
              {/* Issue Title */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Issue Details</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Issue Title *
                    </label>
                    <input
                      {...register('title', {
                        required: 'Title is required',
                        minLength: { value: 5, message: 'Title must be at least 5 characters' },
                        maxLength: { value: 200, message: 'Title must be less than 200 characters' }
                      })}
                      type="text"
                      className={`input-field ${errors.title ? 'border-red-500' : ''}`}
                      placeholder="Brief description of the issue"
                    />
                    {errors.title && (
                      <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category *
                    </label>
                    <select
                      {...register('category', { required: 'Category is required' })}
                      className={`input-field ${errors.category ? 'border-red-500' : ''}`}
                    >
                      <option value="">Select a category</option>
                      {CATEGORIES.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                    {errors.category && (
                      <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description *
                    </label>
                    <textarea
                      {...register('description', {
                        required: 'Description is required',
                        minLength: { value: 10, message: 'Description must be at least 10 characters' },
                        maxLength: { value: 1000, message: 'Description must be less than 1000 characters' }
                      })}
                      rows={4}
                      className={`input-field ${errors.description ? 'border-red-500' : ''}`}
                      placeholder="Provide detailed information about the issue"
                    />
                    {errors.description && (
                      <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Address (Optional)
                    </label>
                    <input
                      {...register('address')}
                      type="text"
                      className="input-field"
                      placeholder="Street address or landmark"
                    />
                  </div>

                  <div className="flex items-center">
                    <input
                      {...register('isAreaReport')}
                      type="checkbox"
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 block text-sm text-gray-900">
                      This is an area-wide issue (affects multiple locations)
                    </label>
                  </div>
                </div>
              </div>

              {/* Image Upload */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Photos *</h2>
                
                <div className="space-y-4">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                      id="image-upload"
                    />
                    <label htmlFor="image-upload" className="cursor-pointer">
                      <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-sm text-gray-600">
                        Click to upload images or drag and drop
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        PNG, JPG, WebP up to 10MB each (max 5 images)
                      </p>
                    </label>
                  </div>

                  {/* Image Previews */}
                  {selectedImages.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      {selectedImages.map((image, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={URL.createObjectURL(image)}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-24 object-cover rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {selectedImages.length === 0 && (
                    <div className="flex items-center text-sm text-red-600">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      At least one image is required
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column - Map */}
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">Location *</h2>
                  <button
                    type="button"
                    onClick={handleGetLocation}
                    disabled={locationLoading}
                    className="btn-secondary flex items-center space-x-2"
                  >
                    {locationLoading ? (
                      <LoadingSpinner size="sm" />
                    ) : (
                      <MapPin className="h-4 w-4" />
                    )}
                    <span>Use My Location</span>
                  </button>
                </div>

                <div className="h-96 rounded-lg overflow-hidden border">
                  <MapContainer
                    center={mapCenter}
                    zoom={MAP_CONFIG.DEFAULT_ZOOM}
                    style={{ height: '100%', width: '100%' }}
                  >
                    <TileLayer
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    />
                    <MapClickHandler />
                    {mapPosition && (
                      <Marker position={mapPosition} />
                    )}
                  </MapContainer>
                </div>

                <p className="text-sm text-gray-600 mt-2">
                  Click on the map to select the exact location of the issue
                </p>

                {/* Coordinates Display */}
                {mapPosition && (
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">
                      Selected coordinates: {mapPosition[0].toFixed(6)}, {mapPosition[1].toFixed(6)}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-center">
            <button
              type="submit"
              disabled={isSubmitting || selectedImages.length === 0 || !mapPosition}
              className="btn-primary px-8 py-3 text-lg flex items-center space-x-2"
            >
              {isSubmitting ? (
                <>
                  <LoadingSpinner size="sm" />
                  <span>Submitting... {uploadProgress > 0 && `${uploadProgress}%`}</span>
                </>
              ) : (
                <>
                  <Camera className="h-5 w-5" />
                  <span>Submit Report</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReportIssue;
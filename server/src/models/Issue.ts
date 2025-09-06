import mongoose, { Document, Schema } from 'mongoose';

export interface IIssue extends Document {
  title: string;
  description: string;
  category: 'waste' | 'road' | 'water' | 'electricity' | 'safety' | 'other';
  status: 'reported' | 'in-progress' | 'resolved';
  location: {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
  };
  address?: string;
  images: string[];
  imageHashes: string[];
  reportedBy: mongoose.Types.ObjectId;
  reportedAt: Date;
  updatedAt: Date;
  upvotes: mongoose.Types.ObjectId[];
  validations: mongoose.Types.ObjectId[];
  priority: number;
  isAreaReport: boolean;
  clusteredWith: mongoose.Types.ObjectId[];
  assignedTo?: mongoose.Types.ObjectId;
  resolvedAt?: Date;
  estimatedResolutionTime?: Date;
}

const IssueSchema = new Schema<IIssue>({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000
  },
  category: {
    type: String,
    required: true,
    enum: ['waste', 'road', 'water', 'electricity', 'safety', 'other']
  },
  status: {
    type: String,
    required: true,
    enum: ['reported', 'in-progress', 'resolved'],
    default: 'reported'
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      required: true
    },
    coordinates: {
      type: [Number],
      required: true,
      validate: {
        validator: function(coords: number[]) {
          return coords.length === 2 && 
                 coords[0] >= -180 && coords[0] <= 180 && // longitude
                 coords[1] >= -90 && coords[1] <= 90;     // latitude
        },
        message: 'Invalid coordinates'
      }
    }
  },
  address: {
    type: String,
    trim: true
  },
  images: [{
    type: String,
    required: true
  }],
  imageHashes: [{
    type: String,
    required: true
  }],
  reportedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  reportedAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  upvotes: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  validations: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  priority: {
    type: Number,
    default: 1,
    min: 1,
    max: 10
  },
  isAreaReport: {
    type: Boolean,
    default: false
  },
  clusteredWith: [{
    type: Schema.Types.ObjectId,
    ref: 'Issue'
  }],
  assignedTo: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  resolvedAt: {
    type: Date
  },
  estimatedResolutionTime: {
    type: Date
  }
}, {
  timestamps: true
});

// Create geospatial index for location-based queries
IssueSchema.index({ location: '2dsphere' });

// Create compound indexes for efficient queries
IssueSchema.index({ status: 1, reportedAt: -1 });
IssueSchema.index({ category: 1, status: 1 });
IssueSchema.index({ reportedBy: 1, reportedAt: -1 });

// Pre-save middleware to update the updatedAt field
IssueSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Virtual for upvote count
IssueSchema.virtual('upvoteCount').get(function() {
  return this.upvotes.length;
});

// Virtual for validation count
IssueSchema.virtual('validationCount').get(function() {
  return this.validations.length;
});

// Virtual for unique reporter count (including clustered issues)
IssueSchema.virtual('uniqueReporterCount').get(function() {
  // This would need to be populated in queries
  return 1; // Placeholder
});

export default mongoose.model<IIssue>('Issue', IssueSchema);
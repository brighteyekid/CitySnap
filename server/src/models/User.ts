import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  username: string;
  email: string;
  password: string;
  role: 'citizen' | 'authority' | 'admin';
  profile: {
    firstName?: string;
    lastName?: string;
    avatar?: string;
    phone?: string;
  };
  gamification: {
    points: number;
    level: number;
    badges: string[];
    reportsSubmitted: number;
    validationsGiven: number;
    issuesResolved: number;
  };
  location?: {
    type: 'Point';
    coordinates: [number, number];
  };
  isVerified: boolean;
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
  calculateLevel(): number;
}

const UserSchema = new Schema<IUser>({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 30
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  role: {
    type: String,
    enum: ['citizen', 'authority', 'admin'],
    default: 'citizen'
  },
  profile: {
    firstName: {
      type: String,
      trim: true,
      maxlength: 50
    },
    lastName: {
      type: String,
      trim: true,
      maxlength: 50
    },
    avatar: {
      type: String
    },
    phone: {
      type: String,
      trim: true
    }
  },
  gamification: {
    points: {
      type: Number,
      default: 0
    },
    level: {
      type: Number,
      default: 1
    },
    badges: [{
      type: String
    }],
    reportsSubmitted: {
      type: Number,
      default: 0
    },
    validationsGiven: {
      type: Number,
      default: 0
    },
    issuesResolved: {
      type: Number,
      default: 0
    }
  },
  location: {
    type: {
      type: String,
      enum: ['Point']
    },
    coordinates: {
      type: [Number],
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
  isVerified: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date
  }
}, {
  timestamps: true
});

// Create indexes
UserSchema.index({ email: 1 });
UserSchema.index({ username: 1 });
UserSchema.index({ 'gamification.points': -1 });
UserSchema.index({ location: '2dsphere' });

// Hash password before saving
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Compare password method
UserSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// Virtual for full name
UserSchema.virtual('fullName').get(function() {
  return `${this.profile.firstName || ''} ${this.profile.lastName || ''}`.trim();
});

// Virtual for rank calculation
UserSchema.virtual('rank').get(function() {
  const points = this.gamification.points;
  if (points >= 1000) return 'Champion';
  if (points >= 500) return 'Hero';
  if (points >= 200) return 'Guardian';
  if (points >= 50) return 'Helper';
  return 'Newcomer';
});

// Method to calculate level based on points
UserSchema.methods.calculateLevel = function() {
  const points = this.gamification.points;
  return Math.floor(points / 100) + 1;
};

// Update level before saving
UserSchema.pre('save', function(next) {
  this.gamification.level = this.calculateLevel();
  next();
});

export default mongoose.model<IUser>('User', UserSchema);
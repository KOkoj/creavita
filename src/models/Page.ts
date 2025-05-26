import mongoose, { Schema, Document } from 'mongoose';

export interface PageDocument extends Document {
  slug: string;
  title: string;
  content: string;
  image?: string;
  metaDescription: string;
  lastUpdated: Date;
}

const pageSchema = new Schema({
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    required: true
  },
  image: {
    type: String,
    required: false
  },
  metaDescription: {
    type: String,
    required: true,
    default: '',
    maxlength: 160
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
});

// Use a safer approach to create models that prevents duplicates
let Page: mongoose.Model<PageDocument>;

try {
  // Use existing model if it exists
  Page = mongoose.model<PageDocument>('Page');
} catch {
  // Create new model if it doesn't exist
  Page = mongoose.model<PageDocument>('Page', pageSchema);
}

export default Page; 
import mongoose, { Document, Model } from 'mongoose';

// Interface for the Image document
export interface IImage extends Document {
  title: string;
  description: string;
  category: string;
  url: string;
  createdAt: Date;
}

const imageSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  url: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Explicitly type the model
const ImageModel: Model<IImage> = mongoose.models.Image || mongoose.model<IImage>('Image', imageSchema);

export default ImageModel; 
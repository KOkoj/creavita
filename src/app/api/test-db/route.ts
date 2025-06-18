import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import mongoose from 'mongoose';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    console.log('Testing MongoDB connection...');
    
    // Check environment variables
    const hasMongoUri = !!process.env.MONGODB_URI;
    const mongoUriPrefix = process.env.MONGODB_URI?.substring(0, 20) + '...';
    
    // Connect to database
    await connectDB();
    
    // Get connection state
    const connectionState = mongoose.connection.readyState;
    const connectionStates = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting'
    };
    
    // Get connection info
    const connectionInfo = {
      host: mongoose.connection.host,
      port: mongoose.connection.port,
      name: mongoose.connection.name,
      readyState: connectionStates[connectionState as keyof typeof connectionStates],
      models: Object.keys(mongoose.models)
    };
    
    console.log('MongoDB connection successful!');
    
    return NextResponse.json({ 
      success: true, 
      message: 'MongoDB connection successful!',
      connectionInfo,
      environment: {
        hasMongoUri,
        mongoUriPrefix,
        nodeEnv: process.env.NODE_ENV,
        hasUploadCode: !!process.env.UPLOAD_CODE
      }
    });
  } catch (error) {
    console.error('MongoDB connection failed:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error',
      environment: {
        hasMongoUri: !!process.env.MONGODB_URI,
        nodeEnv: process.env.NODE_ENV,
        hasUploadCode: !!process.env.UPLOAD_CODE
      }
    }, { status: 500 });
  }
} 
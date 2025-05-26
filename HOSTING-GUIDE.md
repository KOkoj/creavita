# Hosting Guide - Image Gallery

## Files to Upload
Upload these folders and files to your hosting server:
- `.next/` folder
- `public/` folder
- `package.json` file
- `next.config.js` file

## Server Requirements
- Node.js version 18 or newer
- NPM or Yarn package manager
- MongoDB database (local or MongoDB Atlas)

## Installation Steps

1. **Upload Files**: Upload all the files mentioned above to your hosting server

2. **Install Dependencies**: On your server, run this command in the project folder:
   ```
   npm install --production
   ```

3. **Create Environment File**: Create a file named `.env.local` with this content:
   ```
   # MongoDB Connection
   MONGODB_URI=mongodb://username:password@hostname:port/database

   # Application Settings
   NODE_ENV=production
   
   # Security (create a secure password)
   ACCESS_CODE=your-admin-access-code-here
   ```
   
   Replace the values with your actual database details and desired admin code.

4. **Create Uploads Directory**: Make sure this directory exists:
   ```
   public/uploads
   ```

5. **Start the Server**: Run this command to start the application:
   ```
   npm start
   ```

6. The application should now be running on port 3000. Configure your web server (Apache, Nginx) to proxy requests to this port.

## Important URLs
- Main gallery: `/`
- Admin access: `/access` (protected by the ACCESS_CODE you set)

## Common Issues
- If images don't appear, check if the MongoDB connection is working
- Make sure the `public/uploads` directory has write permissions
- Check server logs if you encounter any errors 
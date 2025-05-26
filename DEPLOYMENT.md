# Deployment Guide for Image Gallery Application

This guide will help you deploy your Next.js Image Gallery application to a production environment.

## Preparing for Deployment

### 1. Environment Setup

Create a `.env.local` file in your project root with the following:

```
# Database Configuration
MONGODB_URI=mongodb://username:password@hostname:port/database

# Application Configuration
NODE_ENV=production
NEXT_PUBLIC_BASE_URL=https://your-domain.com

# Security (generate a strong random string for these values)
JWT_SECRET=your-jwt-secret-here
ACCESS_CODE=your-admin-access-code-here
```

Replace the placeholders with your actual values.

### 2. Build the Application

Run the deployment preparation script:

```bash
npm run prepare-deploy
```

This will:
- Create necessary directories
- Build the application for production
- Generate a standalone output in `.next/standalone`

## Deployment Options

### Option 1: Vercel (Recommended for Next.js)

1. Install Vercel CLI: `npm install -g vercel`
2. Run `vercel` in your project root
3. Follow the prompts to link your project
4. Set up environment variables in the Vercel dashboard

For more details, see: https://vercel.com/docs/frameworks/nextjs

### Option 2: Netlify

1. Create a `netlify.toml` file in your project root:

```toml
[build]
  command = "npm run build"
  publish = ".next"

[build.environment]
  NODE_VERSION = "18"

[[plugins]]
  package = "@netlify/plugin-nextjs"
```

2. Deploy using Netlify CLI or connect your Git repository

For more details, see: https://docs.netlify.com/frameworks/nextjs/overview/

### Option 3: Traditional Hosting

1. Build the project: `npm run build`
2. Copy the following to your hosting server:
   - `.next/` folder
   - `public/` folder
   - `package.json`
   - `next.config.js`
3. Install dependencies on the server: `npm install --production`
4. Start the server: `npm start`

## Database Hosting

### MongoDB Atlas

1. Create a free account at https://www.mongodb.com/cloud/atlas
2. Create a new cluster
3. Set up database access (create a user with password)
4. Get your connection string from the Connect dialog
5. Add your IP address to the IP Access List
6. Update your `MONGODB_URI` environment variable

## Production Considerations

### Security

- Use HTTPS for your domain
- Set up proper CORS headers
- Ensure your MongoDB is secured with proper authentication
- Regularly update dependencies

### Performance

- Consider a CDN for serving images
- Implement proper caching strategies
- Monitor server performance

### Maintenance

- Set up logging
- Create database backups
- Monitor error rates and performance metrics

## Troubleshooting

If you encounter issues after deployment:

1. Check server logs: `npm logs` (on Vercel/Netlify)
2. Verify environment variables are set correctly
3. Ensure MongoDB connection is working
4. Check for build errors in deployment logs

For additional help, contact the project maintainer or create an issue on GitHub. 
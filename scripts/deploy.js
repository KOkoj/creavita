#!/usr/bin/env node
/**
 * Deployment script to prepare the project for production
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Ensure the public/uploads directory exists
const uploadsDir = path.join(process.cwd(), 'public/uploads');
if (!fs.existsSync(uploadsDir)) {
  console.log('Creating uploads directory...');
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Run the production build
console.log('Building for production...');
try {
  execSync('npm run build', { stdio: 'inherit' });
  console.log('Build completed successfully!');
} catch (error) {
  console.error('Build failed:', error);
  process.exit(1);
}

console.log('\n=== DEPLOYMENT CHECKLIST ===');
console.log('✓ Your application is built and ready for deployment');
console.log('✓ Standalone output created (.next/standalone)');
console.log('\nBefore deploying, make sure you:');
console.log('1. Set up environment variables on your hosting platform');
console.log('2. Configure your MongoDB connection string');
console.log('3. Update image domains in next.config.js if needed');
console.log('\nFor deployment instructions with popular hosting providers:');
console.log('- Vercel: https://vercel.com/docs/frameworks/nextjs');
console.log('- Netlify: https://docs.netlify.com/frameworks/nextjs/overview/');
console.log('- DigitalOcean: https://docs.digitalocean.com/developer-center/deploy-a-next.js-application/');
console.log('\nEnjoy your deployed image gallery!'); 
#!/usr/bin/env node
/**
 * Script to create a deployment package
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('Preparing deployment package...');

// 1. Build the project
try {
  console.log('Building the project...');
  execSync('npm run build', { stdio: 'inherit' });
} catch (error) {
  console.error('Build failed:', error);
  process.exit(1);
}

// 2. Create a deployment directory
const deployDir = path.join(process.cwd(), 'deployment-package');
try {
  console.log('Creating deployment package directory...');
  if (fs.existsSync(deployDir)) {
    fs.rmSync(deployDir, { recursive: true, force: true });
  }
  fs.mkdirSync(deployDir, { recursive: true });
  
  // Create public/uploads directory
  fs.mkdirSync(path.join(deployDir, 'public', 'uploads'), { recursive: true });
} catch (error) {
  console.error('Failed to create directories:', error);
  process.exit(1);
}

// 3. Copy necessary files
try {
  console.log('Copying files...');
  
  // Copy .next folder
  fs.cpSync(path.join(process.cwd(), '.next'), path.join(deployDir, '.next'), { recursive: true });
  
  // Copy public folder (except uploads contents)
  fs.readdirSync(path.join(process.cwd(), 'public')).forEach(file => {
    if (file !== 'uploads') {
      const srcPath = path.join(process.cwd(), 'public', file);
      const destPath = path.join(deployDir, 'public', file);
      
      if (fs.lstatSync(srcPath).isDirectory()) {
        fs.cpSync(srcPath, destPath, { recursive: true });
      } else {
        fs.copyFileSync(srcPath, destPath);
      }
    }
  });
  
  // Copy package.json and next.config.js
  fs.copyFileSync(
    path.join(process.cwd(), 'package.json'), 
    path.join(deployDir, 'package.json')
  );
  
  fs.copyFileSync(
    path.join(process.cwd(), 'next.config.js'), 
    path.join(deployDir, 'next.config.js')
  );
  
  // Copy hosting guide
  fs.copyFileSync(
    path.join(process.cwd(), 'HOSTING-GUIDE.md'), 
    path.join(deployDir, 'HOSTING-GUIDE.md')
  );
  
  // Create a sample .env.local file
  const envContent = `# MongoDB Connection
MONGODB_URI=mongodb://username:password@hostname:port/database

# Application Settings
NODE_ENV=production

# Security (create a secure password)
ACCESS_CODE=your-admin-access-code-here
`;

  fs.writeFileSync(path.join(deployDir, '.env.local.example'), envContent);
  
} catch (error) {
  console.error('Failed to copy files:', error);
  process.exit(1);
}

console.log('Deployment package created successfully!');
console.log(`Package location: ${deployDir}`);
console.log('');
console.log('Send this entire folder to your hosting provider.');
console.log('Refer to HOSTING-GUIDE.md for installation instructions.'); 
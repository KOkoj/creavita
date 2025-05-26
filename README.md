# Dynamic Image Gallery

A beautiful, responsive image gallery application built with Next.js, featuring dynamic filtering, animations, and shared-code protected image management via an admin page.

## Features

- **Public read-only gallery** at the root `/`
- **Admin gallery page** at `/access`:
    - Requires shared code entry
    - Displays all images with hover controls
    - Image editing (title, description, category) via inline modal
    - Image deletion (removes file and database record)
- Category-based filtering (in public gallery)
- Smooth animations using Framer Motion
- Image upload functionality (available after entering code on `/access`)
- MongoDB integration for data persistence
- Modern UI with Tailwind CSS

## Prerequisites

- Node.js 18+ and npm
- MongoDB instance (local or Atlas)

## Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
MONGODB_URI=your_mongodb_connection_string
UPLOAD_CODE=your-secret-admin-code
```

Replace `your-secret-admin-code` with a secure code of your choice. This code grants access to the admin gallery at `/access`.

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd dynamic-image-gallery # Adjust directory name if needed
```

2. Install dependencies:
```bash
npm install
```

3. Create the uploads directory if it doesn't exist:
```bash
mkdir -p public/uploads 
```

4. Start the development server:
```bash
npm run dev
```

The public gallery will be available at `http://localhost:3000`.
The admin gallery/access page is at `http://localhost:3000/access`.

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── images/
│   │   │   ├── [id]/   # API routes for specific images (PUT, DELETE)
│   │   │   └── route.ts # API routes for image collection (GET, POST)
│   │   └── verify/     # Access code verification API
│   ├── access/         # Admin page (access code form + gallery with controls)
│   └── page.tsx        # Public read-only home page
├── components/
│   └── ImageGallery.tsx # Read-only gallery component for public page
├── lib/               # MongoDB connection utility
├── models/            # MongoDB models
└── public/
    └── uploads/        # Directory for uploaded images
```

## API Endpoints

- `GET /api/images` - Get all images
- `POST /api/images` - Upload a new image (protected by access code via cookie)
- `PUT /api/images/:id` - Update an existing image (protected)
- `DELETE /api/images/:id` - Delete an image (protected)
- `POST /api/verify` - Verify access code and set cookie
- `GET /api/verify/status` - Check if access cookie is set (Used by admin page implicitly)

## Usage

1. **Public View:** Navigate to `http://localhost:3000` to see the read-only gallery.
2. **Admin Access:** Navigate to `http://localhost:3000/access`.
3. Enter the `UPLOAD_CODE` defined in your `.env.local` file.
4. Upon successful verification, the page will display the image gallery with Edit/Delete controls on hover.
5. **Upload:** Use the upload form (which should ideally be added to the `/access` page after authorization) to add new images.
6. **Edit/Delete:** Use the buttons on the image cards in the `/access` gallery.

## Technologies Used

- Next.js 13+ (App Router)
- React 18+
- TypeScript
- MongoDB with Mongoose
- Tailwind CSS
- Framer Motion

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 

<div className="bg-red-500 text-white p-4">
  If you see a red box with white text, Tailwind is working!
</div>

## Deployment

### Preparing for Deployment

1. Set up environment variables by creating a `.env.local` file with the following:

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

2. Build the application for production:

```bash
npm run prepare-deploy
```

3. Deploy the `.next` folder to your hosting provider.

### Hosting Recommendations

This application can be deployed to various hosting platforms:

- **Vercel**: Easiest option for Next.js applications (automatic deployments from Git)
- **Netlify**: Good alternative with simple deployment process
- **DigitalOcean App Platform**: For more control over your infrastructure
- **AWS, Google Cloud, or Azure**: For enterprise-level deployments

### MongoDB Hosting

For the database, consider using:

- **MongoDB Atlas**: Managed MongoDB service with a free tier
- **Self-hosted MongoDB**: For more control (requires server management)

Remember to update the `MONGODB_URI` environment variable with your production database connection string.

### Image Storage

In production, consider using a cloud storage service for images instead of storing them locally:

- **AWS S3**
- **Cloudinary**
- **Google Cloud Storage**

This will require changes to the image upload and retrieval logic. 
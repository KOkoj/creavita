'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import UploadForm from '@/components/UploadForm';

export default function Upload() {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/verify/status')
      .then(res => {
        if (!res.ok) {
          throw new Error('Failed to fetch status');
        }
        return res.json();
      })
      .then(({ authorized }) => {
        if (!authorized) {
          router.replace('/access');
        } else {
          setIsAuthorized(true);
        }
      })
      .catch(() => {
        router.replace('/access'); // Redirect on error as well
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p>Loading...</p>
      </div>
    );
  }

  if (!isAuthorized) {
    return null; // Or a message indicating redirection
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Upload Image</h1>
        <UploadForm />
      </div>
    </div>
  );
} 
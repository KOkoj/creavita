import { useState, useEffect } from 'react';

export function useAuthorized() {
  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/verify/status')
      .then(res => {
         if (!res.ok) {
             console.error('Auth status check failed:', res.status);
             return { authorized: false }; 
         }
         return res.json();
      })
      .then(({ authorized }) => {
          setAuthorized(authorized);
      })
      .catch(err => {
          console.error('Error fetching auth status:', err);
          setAuthorized(false);
      })
      .finally(() => {
          setLoading(false);
      });
  }, []);

  return { authorized, loading }; // Return loading state as well for better UX
} 
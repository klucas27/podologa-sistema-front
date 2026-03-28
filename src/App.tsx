import React from 'react';
import { RouterProvider } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import RateLimitToast from '@/components/ui/RateLimitToast';
import { router } from '@/routes';

function App() {
  return (
    <AuthProvider>
      <RateLimitToast />
      <RouterProvider router={router} />
    </AuthProvider>
  );
}

export default App;

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { useEffect } from 'react';

// Pages
import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard';

// Components
import PrivateRoute from './components/PrivateRoute';

// Store
import { useAuthStore } from './store/authStore';

const queryClient = new QueryClient();

function App() {
  const { token, getCurrentUser } = useAuthStore();

  useEffect(() => {
    if (token) {
      getCurrentUser().catch(() => {
        // Token invalid, user will be logged out by the store
      });
    }
  }, [token]);

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/auth" element={<AuthPage />} />

          {/* Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />

          {/* Redirect */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>

      {/* Toaster for notifications */}
      <Toaster
        position="top-right"
        reverseOrder={false}
        gutter={8}
        toastOptions={{
          duration: 4000,
          style: {
            background: '#1F2937',
            color: '#fff',
            border: '1px solid #374151',
          },
          success: {
            style: {
              background: '#10B981',
            },
          },
          error: {
            style: {
              background: '#EF4444',
            },
          },
        }}
      />
    </QueryClientProvider>
  );
}

export default App;

import { Routes, Route, Navigate, createBrowserRouter, RouterProvider } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { routerConfig } from './router/config';
import { AuthProvider, useAuth } from './context/AuthContext';

// Pages publiques
import Welcome from './components/Welcome';
import Login from './components/Login';

// Pages protégées
import Home from './components/Home';
import DepartmentDashboard from './components/DepartmentDashboard';
import DepartmentDetail from './components/DepartmentDetail';

const App = () => {
  const router = createBrowserRouter([
    {
      path: '/',
      element: <Welcome />
    },
    {
      path: '/login',
      element: <Login />
    },
    {
      path: '/admin/home',
      element: <ProtectedRoute adminOnly={true}><Home /></ProtectedRoute>
    },
    {
      path: '/home',
      element: <ProtectedRoute><Home /></ProtectedRoute>
    },
    {
      path: '/departement/:id',
      element: <ProtectedRoute><DepartmentDashboard /></ProtectedRoute>
    },
    {
      path: '/admin/departments/:id',
      element: <ProtectedRoute adminOnly={true}><DepartmentDashboard /></ProtectedRoute>
    },
    {
      path: '/admin/departments/:id/detail',
      element: <ProtectedRoute adminOnly={true}><DepartmentDetail /></ProtectedRoute>
    },
    {
      path: '*',
      element: <Navigate to="/" replace />
    }
  ], routerConfig);

  return (
    <AuthProvider>
      <div className="min-h-screen bg-gray-50">
        <ToastContainer 
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
        <RouterProvider router={router} />
      </div>
    </AuthProvider>
  );
};

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const token = localStorage.getItem('token');
  const userType = localStorage.getItem('user_type');
  
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  
  if (adminOnly && userType !== 'admin') {
    return <Navigate to="/home" replace />;
  }
  
  return children;
};

export default App;

import React from 'react';
import { Toaster } from 'react-hot-toast';
import { Routes, Route, Link } from 'react-router-dom';
import { AuthProvider, useAuth } from './auth/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ErrorBoundary from './components/ErrorBoundary';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import PostPage from './pages/PostPage';
import CreatePostPage from './pages/CreatePostPage';
import EditPostPage from './pages/EditPostPage';
import VerifyPending from './pages/VerifyPending';
import VerifySuccess from './pages/VerifySuccess';
import MedicalFlashcardsPage from './pages/MedicalFlashcardsPage';
import MedicalQuestionsPage from './pages/MedicalQuestionsPage';
import './index.css';

// Simple protected route wrapper
const ProtectedRoute = ({ element }) => {
  const { user } = useAuth();
  return user ? element : <Navigate to="/login" replace />;
};

function App() {
  return (
    <React.StrictMode>
      <AuthProvider>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          
          <main className="container mx-auto px-4 pt-20 pb-16">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/posts/:id" element={<PostPage />} />
              <Route path="/verify-pending" element={<VerifyPending />} />
              <Route path="/verify-success" element={<VerifySuccess />} />

              {/* Protected Routes */}
              <Route 
                path="/profile" 
                element={
                  <ErrorBoundary>
                    <ProtectedRoute element={<ProfilePage />} />
                  </ErrorBoundary>
                } 
              />
              <Route 
                path="/posts/new" 
                element={
                  <ErrorBoundary>
                    <ProtectedRoute element={<CreatePostPage />} />
                  </ErrorBoundary>
                } 
              />
              <Route 
                path="/posts/:id/edit" 
                element={
                  <ErrorBoundary>
                    <ProtectedRoute element={<EditPostPage />} />
                  </ErrorBoundary>
                } 
              />

              {/* Catch-all 404 */}
              <Route path="*" element={
                <div className="glass-panel p-8 text-center">
                  <h1 className="text-2xl font-bold mb-4">404 - Not Found</h1>
                  <Link to="/" className="btn btn-primary">
                    Return Home
                  </Link>
                </div>
              } />

              <Route 
                path="/medical-flashcards" 
                element={
                  <ErrorBoundary>
                    <MedicalFlashcardsPage />
                    <Toaster position="bottom-right" />
                  </ErrorBoundary>
                } 
              />

              <Route 
                path="/medical-questions" 
                element={
                  <ErrorBoundary>
                    <MedicalQuestionsPage />
                  </ErrorBoundary>
                } 
              />
            </Routes>
          </main>

          <Footer />
        </div>
      </AuthProvider>
    </React.StrictMode>
  );
}

export default App;
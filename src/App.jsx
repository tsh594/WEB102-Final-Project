import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './auth/AuthContext';
import PrivateRoute from './components/PrivateRoute'; // Only import once
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
import DiscussionPage from './pages/DiscussionPage';
import VerifyPending from './pages/VerifyPending';
import VerifySuccess from './pages/VerifySuccess';

function App() {
  return (
    <React.StrictMode>
      <AuthProvider>
        <ErrorBoundary>
          <div className="min-h-screen bg-gray-50">
            <Navbar />
            
            <main className="container mx-auto px-4 pt-20 pb-16">
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/posts/:id" element={<PostPage />} />
                <Route path="/discussions/:id" element={<DiscussionPage />} />
                <Route path="/verify-pending" element={<VerifyPending />} />
                <Route path="/verify-success" element={<VerifySuccess />} />

                {/* Protected Routes */}
                <Route element={<PrivateRoute />}>
                  <Route path="/profile" element={<ProfilePage />} />
                  <Route path="/posts/new" element={<CreatePostPage />} />
                  <Route path="/posts/:id/edit" element={<EditPostPage />} />
                  <Route path="/discussions/new" element={<DiscussionPage mode="create" />} />
                  <Route path="/discussions/:id/edit" element={<DiscussionPage mode="edit" />} />
                </Route>
              </Routes>
            </main>

            <Footer />
          </div>
        </ErrorBoundary>
      </AuthProvider>
    </React.StrictMode>
  );
}

export default App;
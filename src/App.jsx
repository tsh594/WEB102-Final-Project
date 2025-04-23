import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './auth/AuthContext';
import { PrivateRoute } from './auth/PrivateRoute';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DiscussionPage from './pages/DiscussionPage';
import Navbar from './components/Navbar';
import VerifyPending from './pages/VerifyPending';
import VerifySuccess from './pages/VerifySuccess';
import CreatePostPage from './pages/CreatePostPage';
import EditPostPage from './pages/EditPostPage';
import PostPage from './pages/PostPage';
import ProfilePage from './pages/ProfilePage';
import Avatar from './components/Avatar';
import './index.css'; // Make sure this import exists

function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/discussions/:id" element={<DiscussionPage />} />
            <Route path="/posts/:id" element={<PostPage />} />
            <Route path="/verify-pending" element={<VerifyPending />} />
            <Route path="/verify-success" element={<VerifySuccess />} />

            {/* Protected Routes */}
            <Route element={<PrivateRoute />}>
              <Route path="/discussions/new" element={<DiscussionPage mode="create" />} />
              <Route path="/discussions/:id/edit" element={<DiscussionPage mode="edit" />} />
              <Route path="/posts/new" element={<CreatePostPage />} />
              <Route path="/posts/:id/edit" element={<EditPostPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/avatar" element={<Avatar />} />
            </Route>
          </Routes>
        </main>
      </div>
    </AuthProvider>
  );
}

export default App;
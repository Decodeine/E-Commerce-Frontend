import React, { useState, useEffect } from "react";
import { Routes, Route, Link, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import PersonalDetails from "./PersonalDetails";
import AddressManager from "./AddressManager";
import UserPreferences from "./UserPreferences";
import ActivityDashboard from "./ActivityDashboard";
import PrivateRoute from "../Utilities/PrivateRoute";
import { showToast } from "../../store/actions/storeActions";
import { accountsApi } from "../../services/accountsApi";
import "./css/Profile.css";

interface UserProfile {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  avatar?: string;
  date_joined: string;
  last_login: string | null;
  is_verified?: boolean;
}

interface RootState {
  auth: {
    token: string | null;
    isAuthenticated: boolean;
  };
}

const Profile: React.FC = () => {
  const location = useLocation();
  const dispatch = useDispatch();
  const { token, isAuthenticated } = useSelector((state: RootState) => state.auth);
  
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [avatarLoading, setAvatarLoading] = useState(false);

  const navigationItems = [
    { 
      path: "", 
      label: "Personal Details", 
      icon: "👤",
      description: "Manage your personal information"
    },
    { 
      path: "addresses", 
      label: "Address Book", 
      icon: "🏠",
      description: "Manage your delivery and billing addresses"
    },
    { 
      path: "preferences", 
      label: "Preferences", 
      icon: "⚙️",
      description: "Customize your shopping experience"
    },
    { 
      path: "activity", 
      label: "Activity", 
      icon: "📊",
      description: "View your account activity and history"
    }
  ];

  useEffect(() => {
    if (isAuthenticated && token) {
      fetchUserProfile();
    }
  }, [isAuthenticated, token]);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const user = await accountsApi.getUserProfile();
      setUserProfile(user);
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
      dispatch(showToast({
        message: 'Failed to load profile information',
        type: 'error'
      }));
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type and size
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!allowedTypes.includes(file.type)) {
      dispatch(showToast({
        message: 'Please upload a valid image file (JPEG, PNG, or WebP)',
        type: 'error'
      }));
      return;
    }

    if (file.size > maxSize) {
      dispatch(showToast({
        message: 'File size must be less than 5MB',
        type: 'error'
      }));
      return;
    }

    try {
      setAvatarLoading(true);
      const formData = new FormData();
      formData.append('avatar', file);
      
      const response = await accountsApi.uploadAvatar(formData);
      
      setUserProfile(prev => prev ? { ...prev, avatar: response.avatar } : null);
      
      dispatch(showToast({
        message: 'Profile picture updated successfully',
        type: 'success'
      }));
    } catch (error) {
      console.error('Failed to upload avatar:', error);
      dispatch(showToast({
        message: 'Failed to update profile picture',
        type: 'error'
      }));
    } finally {
      setAvatarLoading(false);
    }
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getCurrentNavItem = () => {
    const currentPath = location.pathname.split('/').pop() || '';
    return navigationItems.find(item => item.path === currentPath) || navigationItems[0];
  };

  if (!isAuthenticated) {
    return (
      <div className="profile-container">
        <div className="profile-content">
          <h2>Please log in to view your profile</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      {/* Profile Header */}
      <div className="profile-header">
        <div className="profile-header-content">
          <div className="profile-avatar-section">
            <div className="profile-avatar" onClick={() => document.getElementById('avatar-upload')?.click()}>
              {avatarLoading ? (
                <div className="loading-skeleton" style={{ width: '100%', height: '100%', borderRadius: '50%' }} />
              ) : userProfile?.avatar ? (
                <img src={userProfile.avatar} alt="Profile" />
              ) : (
                userProfile && getInitials(userProfile.first_name, userProfile.last_name)
              )}
              {!avatarLoading && (
                <div className="avatar-upload-overlay">
                  📷 Upload
                </div>
              )}
            </div>
            <input
              id="avatar-upload"
              type="file"
              accept="image/*"
              onChange={handleAvatarUpload}
              className="avatar-upload-input"
            />
          </div>
          
          <div className="profile-info">
            {loading ? (
              <>
                <div className="loading-skeleton" style={{ width: '200px', height: '2.5rem', marginBottom: '0.5rem' }} />
                <div className="loading-skeleton" style={{ width: '300px', height: '1.2rem', marginBottom: '1rem' }} />
                <div className="loading-skeleton" style={{ width: '150px', height: '1rem' }} />
              </>
            ) : userProfile ? (
              <>
                <h1 className="profile-name">
                  {userProfile.first_name} {userProfile.last_name}
                  {userProfile.is_verified && <span style={{ marginLeft: '0.5rem' }}>✅</span>}
                </h1>
                <p className="profile-email">{userProfile.email}</p>
                <div className="profile-meta">
                  <div className="profile-meta-item">
                    <span>📅</span>
                    <span>Joined {formatDate(userProfile.date_joined)}</span>
                  </div>
                  {userProfile.last_login && (
                    <div className="profile-meta-item">
                      <span>🕒</span>
                      <span>Last active {formatDate(userProfile.last_login)}</span>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <h1 className="profile-name">Profile</h1>
                <p className="profile-email">Loading...</p>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="profile-navigation">
        {navigationItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`profile-nav-item ${
              location.pathname.endsWith(item.path) || 
              (item.path === '' && location.pathname.endsWith('/profile'))
                ? 'active' 
                : ''
            }`}
            title={item.description}
          >
            <span>{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>

      {/* Content */}
      <div className="profile-content">
        <Routes>
          <Route
            path="/"
            element={
              <PrivateRoute>
                <PersonalDetails userProfile={userProfile} onProfileUpdate={fetchUserProfile} />
              </PrivateRoute>
            }
          />
          <Route
            path="/addresses"
            element={
              <PrivateRoute>
                <AddressManager />
              </PrivateRoute>
            }
          />
          <Route
            path="/preferences"
            element={
              <PrivateRoute>
                <UserPreferences />
              </PrivateRoute>
            }
          />
          <Route
            path="/activity"
            element={
              <PrivateRoute>
                <ActivityDashboard />
              </PrivateRoute>
            }
          />
        </Routes>
      </div>
    </div>
  );
};

export default Profile;
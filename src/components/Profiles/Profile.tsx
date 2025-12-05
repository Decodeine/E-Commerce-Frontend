import React, { useState, useEffect } from "react";
import { Routes, Route, Link, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUser,
  faHome,
  faCog,
  faChartLine,
  faCamera,
  faCheckCircle
} from "@fortawesome/free-solid-svg-icons";
import PersonalDetails from "./PersonalDetails";
import AddressManager from "./AddressManager";
import UserPreferences from "./UserPreferences";
import ActivityDashboard from "./ActivityDashboard";
import PrivateRoute from "../Utilities/PrivateRoute";
import { showToast } from "../../store/actions/storeActions";
import { accountsApi } from "../../services/accountsApi";
import Card from "../UI/Card/Card";
import Loading from "../UI/Loading/Loading";
import { API_PATH } from "../../backend_url";

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
  const isAuthed = Boolean(token || localStorage.getItem('accessToken') || localStorage.getItem('token') || isAuthenticated);
  
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [avatarLoading, setAvatarLoading] = useState(false);

  const navigationItems = [
    { 
      path: "", 
      label: "Personal Details", 
      icon: faUser,
      description: "Manage your personal information"
    },
    { 
      path: "addresses", 
      label: "Address Book", 
      icon: faHome,
      description: "Manage your delivery and billing addresses"
    },
    { 
      path: "preferences", 
      label: "Preferences", 
      icon: faCog,
      description: "Customize your shopping experience"
    },
    { 
      path: "activity", 
      label: "Activity", 
      icon: faChartLine,
      description: "View your account activity and history"
    }
  ];

  useEffect(() => {
    if (isAuthed) {
      fetchUserProfile();
    } else {
      setLoading(false);
    }
  }, [isAuthed]);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      console.log('Fetching user profile...', { isAuthed, token: token ? 'exists' : 'null' });
      
      // Check if we have a token before making the API call
      const hasToken = token || localStorage.getItem('accessToken') || localStorage.getItem('token');
      if (!hasToken) {
        console.warn('No token found, skipping profile fetch');
        setLoading(false);
        return;
      }
      
      const user = await accountsApi.getUserProfile();
      console.log('User profile fetched:', user);
      
      if (user) {
        setUserProfile(user);
      } else {
        console.warn('User profile returned null or undefined');
      }
    } catch (error: any) {
      console.error('Failed to fetch user profile:', error);
      
      // If it's an auth error, don't show toast - let the auth check handle it
      if (error?.response?.status === 401 || error?.response?.status === 403) {
        console.warn('Authentication error, user may need to login again');
        setLoading(false);
        return;
      }
      
      const errorMessage = error?.response?.data?.detail || 
                          error?.response?.data?.message || 
                          error?.message ||
                          'Failed to load profile information';
      dispatch(showToast({
        message: errorMessage,
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

  const getAvatarUrl = (avatar: string | undefined) => {
    if (!avatar) return '';
    if (avatar.startsWith('http://') || avatar.startsWith('https://')) {
      return avatar;
    }
    if (avatar.startsWith('/media/') || avatar.startsWith('/static/')) {
      const backendBaseUrl = API_PATH.replace('/api/', '');
      return `${backendBaseUrl}${avatar}`;
    }
    return `/${avatar}`;
  };

  if (!isAuthed) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 py-12">
        <Card className="p-8 text-center">
          <h2 className="mb-4 text-2xl font-bold text-slate-900">Please log in to view your profile</h2>
          <Link to="/login">
            <button className="rounded-lg bg-blue-600 px-6 py-2 font-semibold text-white transition-colors hover:bg-blue-700">
              Go to Login
            </button>
          </Link>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 py-12">
        <Loading variant="spinner" size="lg" text="Loading your profile..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Profile Header */}
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
          <div className="flex flex-col items-center gap-6 md:flex-row md:items-start">
            {/* Avatar Section */}
            <div className="relative">
              <div 
                className="relative h-32 w-32 cursor-pointer overflow-hidden rounded-full border-4 border-white bg-blue-100 shadow-lg transition-all hover:shadow-xl"
                onClick={() => document.getElementById('avatar-upload')?.click()}
              >
                {avatarLoading ? (
                  <div className="flex h-full w-full items-center justify-center bg-slate-200">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
                  </div>
                ) : userProfile?.avatar ? (
                  <img 
                    src={getAvatarUrl(userProfile.avatar)} 
                    alt="Profile" 
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      const fallback = target.nextElementSibling as HTMLElement;
                      if (fallback) fallback.style.display = 'flex';
                    }}
                  />
                ) : (
                  userProfile && (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-blue-500 to-blue-700 text-4xl font-bold text-white">
                      {getInitials(userProfile.first_name, userProfile.last_name)}
                    </div>
                  )
                )}
                {!avatarLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity hover:opacity-100">
                    <div className="flex flex-col items-center gap-1 text-white">
                      <FontAwesomeIcon icon={faCamera} className="text-xl" />
                      <span className="text-xs font-medium">Upload</span>
                    </div>
                  </div>
                )}
              </div>
              <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
              />
            </div>
            
            {/* Profile Info */}
            <div className="flex-1 text-center md:text-left">
              {userProfile ? (
                <>
                  <div className="mb-2 flex items-center justify-center gap-2 md:justify-start">
                    <h1 className="text-3xl font-bold text-slate-900">
                      {userProfile.first_name} {userProfile.last_name}
                    </h1>
                    {userProfile.is_verified && (
                      <FontAwesomeIcon icon={faCheckCircle} className="text-blue-600" title="Verified" />
                    )}
                  </div>
                  <p className="mb-4 text-lg text-slate-600">{userProfile.email}</p>
                  <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-slate-600 md:justify-start">
                    <div className="flex items-center gap-2">
                      <span>📅</span>
                      <span>Joined {formatDate(userProfile.date_joined)}</span>
                    </div>
                    {userProfile.last_login && (
                      <div className="flex items-center gap-2">
                        <span>🕒</span>
                        <span>Last active {formatDate(userProfile.last_login)}</span>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <h1 className="text-3xl font-bold text-slate-900">Profile</h1>
                  <p className="text-slate-600">Loading...</p>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <nav className="flex gap-1 overflow-x-auto">
            {navigationItems.map((item) => {
              const isActive = location.pathname.endsWith(item.path) || 
                              (item.path === '' && location.pathname.endsWith('/profile'));
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-2 whitespace-nowrap border-b-2 px-4 py-4 text-sm font-medium transition-colors ${
                    isActive
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-slate-600 hover:border-slate-300 hover:text-slate-900'
                  }`}
                  title={item.description}
                >
                  <FontAwesomeIcon icon={item.icon} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
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

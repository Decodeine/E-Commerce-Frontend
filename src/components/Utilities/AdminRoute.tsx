import React, { useEffect, useState, useRef } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { accountsApi } from "../../services/accountsApi";
import Loading from "../UI/Loading/Loading";

interface AdminRouteProps {
  children: React.ReactElement;
}

interface RootState {
  auth: {
    token: string | null;
  };
}

const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  const location = useLocation();
  const { token } = useSelector((state: RootState) => state.auth);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [checking, setChecking] = useState(true);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    let isMounted = true;
    let checkCompleted = false;
    
    const checkAdminStatus = async () => {
      const hasToken = token || localStorage.getItem('accessToken') || localStorage.getItem('token');
      
      if (!hasToken) {
        if (isMounted) {
          setIsAdmin(false);
          setChecking(false);
        }
        return;
      }

      try {
        const user = await accountsApi.getUserProfile();
        console.log('🔍 Admin check - User profile:', user);
        // Check if user is staff/admin (backend should return is_staff or is_superuser)
        const adminStatus = (user as any).is_staff || (user as any).is_superuser || false;
        console.log('🔍 Admin check - Admin status:', adminStatus, 'is_staff:', (user as any).is_staff, 'is_superuser:', (user as any).is_superuser);
        
        checkCompleted = true;
        
        // Clear timeout since check completed successfully
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }
        
        if (isMounted) {
          setIsAdmin(adminStatus);
          setChecking(false);
        }
      } catch (error: any) {
        console.error('❌ Error checking admin status:', error);
        
        checkCompleted = true;
        
        // Clear timeout since check completed (with error)
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }
        
        if (isMounted) {
          setIsAdmin(false);
          setChecking(false);
        }
      }
    };

    // Timeout fallback - only deny if still checking after 10 seconds
    timeoutRef.current = setTimeout(() => {
      if (isMounted && !checkCompleted) {
        console.warn('⚠️ Admin check timeout - denying access');
        setIsAdmin(false);
        setChecking(false);
      }
    }, 10000);

    checkAdminStatus();
    
    return () => {
      isMounted = false;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [token]);

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loading variant="spinner" size="lg" text="Checking admin access..." />
      </div>
    );
  }

  if (!isAdmin) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return children;
};

export default AdminRoute;

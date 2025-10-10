"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from "react";
import { User } from "@/types";

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
}

interface AuthContextType extends AuthState {
  login: (
    email: string,
    password: string
  ) => Promise<{ success: boolean; error?: string }>;
  register: (
    email: string,
    password: string,
    name: string
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<{ success: boolean; error?: string }>;
  refreshUser: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
    isAuthenticated: false,
  });

  // Fetch user data from API - JWT cookie is the source of truth
  const fetchUserData = useCallback(async (): Promise<User | null> => {
    try {
      const response = await fetch("/api/auth/me", {
        method: "GET",
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data.user) {
          return data.data.user;
        }
      }
      return null;
    } catch (error) {
      console.error("Error fetching user data:", error);
      return null;
    }
  }, []);

  // Initialize auth state - simplified without localStorage cache
  const initializeAuth = useCallback(async () => {
    try {
      const user = await fetchUserData();

      setAuthState({
        user,
        loading: false,
        error: null,
        isAuthenticated: !!user,
      });
    } catch (error) {
      console.error("Auth initialization error:", error);
      setAuthState({
        user: null,
        loading: false,
        error: "Failed to check authentication status",
        isAuthenticated: false,
      });
    }
  }, [fetchUserData]);

  // Initialize on mount
  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  // Login function
  const login = useCallback(async (email: string, password: string) => {
    setAuthState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          email,
          password,
          anonymous_user_id:
            localStorage.getItem("anonymous_user_id") || undefined,
        }),
      });

      const data = await response.json();

      if (data.success && data.data.user) {
        const user = data.data.user;
        // Clear anonymous user ID after successful login
        localStorage.removeItem("anonymous_user_id");
        setAuthState({
          user,
          loading: false,
          error: null,
          isAuthenticated: true,
        });
        return { success: true };
      } else {
        setAuthState((prev) => ({
          ...prev,
          loading: false,
          error: data.error?.message || "Login failed",
        }));
        return {
          success: false,
          error: data.error?.message || "Login failed",
        };
      }
    } catch (_error) {
      const errorMessage = "Error during login, please try again";
      console.error(_error);
      setAuthState((prev) => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }));
      return { success: false, error: errorMessage };
    }
  }, []);

  // Register function
  const register = useCallback(
    async (email: string, password: string, name: string) => {
      setAuthState((prev) => ({ ...prev, loading: true, error: null }));

      try {
        const response = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            email,
            password,
            name,
            anonymous_user_id:
              localStorage.getItem("anonymous_user_id") || undefined,
          }),
        });

        const data = await response.json();

        if (data.success) {
          // Registration successful, but user might need email verification
          if (data.user) {
            const user = data.user;
            setAuthState({
              user,
              loading: false,
              error: null,
              isAuthenticated: true,
            });
            // Clear anonymous id after successful registration
            localStorage.removeItem("anonymous_user_id");
          } else {
            setAuthState((prev) => ({
              ...prev,
              loading: false,
            }));
          }
          return { success: true };
        } else {
          setAuthState((prev) => ({
            ...prev,
            loading: false,
            error: data.error?.message || "Registration failed",
          }));
          return {
            success: false,
            error: data.error?.message || "Registration failed",
          };
        }
      } catch (_error) {
        const errorMessage = "Error during registration, please try again";
        console.error(_error);
        setAuthState((prev) => ({
          ...prev,
          loading: false,
          error: errorMessage,
        }));
        return { success: false, error: errorMessage };
      }
    },
    []
  );

  // Logout function
  const logout = useCallback(async () => {
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });

      const data = await response.json();

      // Clear state regardless of API response
      // Clear anonymous user ID from localStorage on logout
      localStorage.removeItem("anonymous_user_id");
      setAuthState({
        user: null,
        loading: false,
        error: null,
        isAuthenticated: false,
      });

      if (data.success) {
        return { success: true };
      } else {
        return {
          success: false,
          error: data.error?.message || "Logout failed",
        };
      }
    } catch (error) {
      // Even if logout API fails, clear local state
      // Clear anonymous user ID from localStorage even if logout API fails
      localStorage.removeItem("anonymous_user_id");
      console.error("Logout api failed", error);
      setAuthState({
        user: null,
        loading: false,
        error: null,
        isAuthenticated: false,
      });
      return { success: false, error: "Network error during logout" };
    }
  }, []);

  // Refresh user data
  const refreshUser = useCallback(async () => {
    try {
      const user = await fetchUserData();
      setAuthState((prev) => ({
        ...prev,
        user,
        loading: false,
        isAuthenticated: !!user,
      }));
    } catch (error) {
      console.error("Error refreshing user data:", error);
    }
  }, [fetchUserData]);

  // Clear error
  const clearError = useCallback(() => {
    setAuthState((prev) => ({ ...prev, error: null }));
  }, []);

  const contextValue: AuthContextType = {
    ...authState,
    login,
    register,
    logout,
    refreshUser,
    clearError,
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

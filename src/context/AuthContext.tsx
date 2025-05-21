import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User, AuthState, LoginFormData, RegisterFormData } from "@/features/auth/types";
import { v4 as uuidv4 } from "uuid";

interface AuthContextType extends AuthState {
  login: (data: LoginFormData) => Promise<void>;
  register: (data: RegisterFormData) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = "auth_user";

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    const loadUser = () => {
      try {
        const storedUser = localStorage.getItem(LOCAL_STORAGE_KEY);
        
        if (storedUser) {
          const user = JSON.parse(storedUser) as User;
          setState({
            user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } else {
          setState(prev => ({ ...prev, isLoading: false }));
        }
      } catch (error) {
        console.error("Error loading user from localStorage:", error);
        setState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: "Failed to load user data",
        });
      }
    };

    loadUser();
  }, []);

  const login = async (data: LoginFormData) => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      // Get users from localStorage
      const usersData = localStorage.getItem("users");
      const users: Record<string, User & { password: string }> = usersData ? JSON.parse(usersData) : {};
      
      // Find user by email
      const foundUser = Object.values(users).find(u => u.email === data.email);
      
      if (!foundUser) {
        throw new Error("Invalid email or password");
      }
      
      if (foundUser.password !== data.password) {
        throw new Error("Invalid email or password");
      }

      // Remove password from user object before storing
      const { password, ...userWithoutPassword } = foundUser;
      
      // Store user in localStorage
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(userWithoutPassword));
      
      // Update state
      setState({
        user: userWithoutPassword,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      setState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: error instanceof Error ? error.message : "Login failed",
      });
      throw error;
    }
  };

  const register = async (data: RegisterFormData) => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      // Get existing users from localStorage
      const usersData = localStorage.getItem("users");
      const users: Record<string, User & { password: string }> = usersData ? JSON.parse(usersData) : {};
      
      // Check if email already exists
      const emailExists = Object.values(users).some(u => u.email === data.email);
      if (emailExists) {
        throw new Error("Email already exists");
      }
      
      // Check if username already exists
      const usernameExists = Object.values(users).some(u => u.username === data.username);
      if (usernameExists) {
        throw new Error("Username already exists");
      }
      
      // Validate password match
      if (data.password !== data.confirmPassword) {
        throw new Error("Passwords do not match");
      }
      
      // Create new user
      const newUser: User & { password: string } = {
        id: uuidv4(),
        username: data.username,
        email: data.email,
        name: data.name || data.username,
        password: data.password, // In a real app, you'd hash this
        avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.username}`,
      };
      
      // Add user to users object
      users[newUser.id] = newUser;
      
      // Save updated users to localStorage
      localStorage.setItem("users", JSON.stringify(users));
      
      // Remove password from user object before storing in auth
      const { password, ...userWithoutPassword } = newUser;
      
      // Store user in auth localStorage
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(userWithoutPassword));
      
      // Update state
      setState({
        user: userWithoutPassword,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : "Registration failed",
      }));
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    setState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });
  };

  const contextValue = {
    ...state,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
} 
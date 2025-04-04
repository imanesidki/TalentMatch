import { jwtDecode } from 'jwt-decode';
import Cookies from 'js-cookie';

// Base URL from environment variable or fallback
// When running in Docker, the browser can't resolve 'backend' hostname
// So we need to use 'localhost' for client-side requests
const isClient = typeof window !== 'undefined';
const API_URL = isClient 
  ? 'http://localhost:8000/api' 
  : (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api');

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  firstname: string;
  lastname: string;
  email: string;
  password: string;
}

export interface ProfileUpdateData {
  firstname?: string;
  lastname?: string;
  email?: string;
}

export interface PasswordUpdateData {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

export interface UserData {
  id: number;
  email: string;
  firstname: string;
  lastname: string;
  is_active: boolean;
}

export interface DecodedToken {
  sub: string;  // email
  exp: number;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
}

// Set authentication token
export function setToken(token: string): void {
  if (typeof window === 'undefined') return;
  
  // Set in cookies as the primary storage method
  Cookies.set('auth_token', token, { expires: 7, path: '/' });
  Cookies.set('ls_auth_token', token, { expires: 7, path: '/' });
}

// Clear authentication token
export function clearToken(): void {
  if (typeof window === 'undefined') return;
  
  // Clear cookies
  Cookies.remove('auth_token', { path: '/' });
  Cookies.remove('ls_auth_token', { path: '/' });
}

// Login user
export async function login(credentials: LoginCredentials): Promise<AuthResponse> {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(credentials),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to login');
  }

  const data = await response.json();
  
  // Store token in cookies
  setToken(data.access_token);
  
  return data;
}

// Register user
export async function register(userData: RegisterData): Promise<any> {
  const response = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(userData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to register');
  }

  return await response.json();
}

// Logout user
export async function logout(): Promise<void> {
  try {
    // Call logout endpoint
    await fetch(`${API_URL}/auth/logout`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getToken()}`,
      },
      credentials: 'include',
    });
  } catch (error) {
    console.log('Logout error:', error);
  } finally {
    // Clear tokens from cookies
    clearToken();
    
    // Redirect to sign in page
    window.location.href = '/signin';
  }
}

// Check if user is authenticated
export function isAuthenticated(): boolean {
  if (typeof window === 'undefined') return false;
  
  // Check cookies for token
  const token = Cookies.get('auth_token') || Cookies.get('ls_auth_token');
  
  if (!token) return false;
  
  try {
    const decoded = jwtDecode<DecodedToken>(token);
    const currentTime = Math.floor(Date.now() / 1000);
    
    // Check if token is expired
    if (decoded.exp < currentTime) {
      clearToken();
      return false;
    }
    
    return true;
  } catch (error) {
    clearToken();
    return false;
  }
}

// Get authentication token
export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return Cookies.get('auth_token') || Cookies.get('ls_auth_token') || null;
}

// Get authenticated user info
export function getAuthUser(): { email: string } | null {
  if (typeof window === 'undefined') return null;
  
  const token = getToken();
  if (!token) return null;
  
  try {
    const decoded = jwtDecode<DecodedToken>(token);
    return { email: decoded.sub };
  } catch (error) {
    return null;
  }
}

// Get full user profile
export async function getUserProfile(): Promise<UserData> {
  const token = getToken();
  if (!token) {
    throw new Error('Not authenticated');
  }

  const response = await fetch(`${API_URL}/auth/me`, {
    headers: {
      'Authorization': `Bearer ${token}`
    },
    credentials: 'include'
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to fetch profile');
  }

  return await response.json();
}

// Update user profile
export async function updateUserProfile(profileData: ProfileUpdateData): Promise<UserData> {
  const token = getToken();
  if (!token) {
    throw new Error('Not authenticated');
  }

  const response = await fetch(`${API_URL}/auth/me`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    credentials: 'include',
    body: JSON.stringify(profileData)
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to update profile');
  }

  return await response.json();
}

// Update user password
export async function updatePassword(passwordData: PasswordUpdateData): Promise<void> {
  const token = getToken();
  if (!token) {
    throw new Error('Not authenticated');
  }

  const response = await fetch(`${API_URL}/auth/me/password`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    credentials: 'include',
    body: JSON.stringify(passwordData)
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to update password');
  }
}

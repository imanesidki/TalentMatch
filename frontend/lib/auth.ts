import { jwtDecode } from 'jwt-decode';
import Cookies from 'js-cookie';

// Base URL from environment variable or fallback
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

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

export interface AuthResponse {
  access_token: string;
  token_type: string;
}

export interface DecodedToken {
  sub: string;  // email
  exp: number;  // expiration timestamp
}

// Set token in both localStorage and cookie
function setToken(token: string): void {
  if (typeof window === 'undefined') return;
  
  // Set in localStorage
  localStorage.setItem('auth_token', token);
  
  // Set in cookie for middleware access (7 day expiry)
  Cookies.set('ls_auth_token', token, { expires: 7, path: '/' });
  Cookies.set('auth_token', token, { expires: 7, path: '/' });
  
  // Force a cookie-change event by setting a dummy cookie
  Cookies.set('auth_timestamp', Date.now().toString(), { path: '/' });
}

// Clear token from both localStorage and cookie
function clearToken(): void {
  if (typeof window === 'undefined') return;
  
  // Clear from localStorage
  localStorage.removeItem('auth_token');
  
  // Clear from cookies
  Cookies.remove('ls_auth_token', { path: '/' });
  Cookies.remove('auth_token', { path: '/' });
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
  
  // Store token in both localStorage and cookie
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
    console.error('Logout error:', error);
  } finally {
    // Clear tokens from both localStorage and cookies
    clearToken();
    
    // Redirect to sign in page
    window.location.href = '/signin';
  }
}

// Check if user is authenticated
export function isAuthenticated(): boolean {
  if (typeof window === 'undefined') return false;
  
  // First check cookies (which are accessible to middleware)
  const cookieToken = Cookies.get('auth_token') || Cookies.get('ls_auth_token');
  // Then check localStorage
  const localToken = localStorage.getItem('auth_token');
  
  const token = cookieToken || localToken;
  
  if (!token) return false;
  
  try {
    const decoded = jwtDecode<DecodedToken>(token);
    const currentTime = Math.floor(Date.now() / 1000);
    
    // Check if token is expired
    if (decoded.exp < currentTime) {
      clearToken();
      return false;
    }
    
    // If token was only in one place, sync it to both
    if (cookieToken && !localToken) {
      localStorage.setItem('auth_token', cookieToken);
    } else if (localToken && !cookieToken) {
      Cookies.set('auth_token', localToken, { expires: 7, path: '/' });
      Cookies.set('ls_auth_token', localToken, { expires: 7, path: '/' });
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
  return localStorage.getItem('auth_token');
}

// Get authenticated user info
export function getAuthUser(): { email: string } | null {
  if (typeof window === 'undefined') return null;
  
  const token = localStorage.getItem('auth_token');
  if (!token) return null;
  
  try {
    const decoded = jwtDecode<DecodedToken>(token);
    return { email: decoded.sub };
  } catch (error) {
    return null;
  }
} 
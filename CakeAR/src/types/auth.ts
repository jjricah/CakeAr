export interface RegisterData {
  name: string;
  email: string;
  phone: string;
  password: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role?: string;
}

export interface LoginResponse {
  success: boolean;
  token: string;
  name: string;
  message?: string;
}

export interface AuthError {
  message: string;
  errors?: { [key: string]: string };
}

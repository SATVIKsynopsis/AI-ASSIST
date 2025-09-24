// Types for the AI Teacher Assistant application

export interface AnalysisRequest {
  slideText: string;
  studentAnswers: string;
}

export interface AnalysisResponse {
  misconceptions: string[];
  slideWeaknesses: string[];
  improvements: string[];
  summary: string;
  success: boolean;
  error?: string;
}

export interface UploadFormData {
  file: File | null;
  studentAnswers: string;
}

export interface PDFInfo {
  pageCount: number;
  textLength: number;
  preview: string;
}

export interface APIError {
  error: string;
  details?: string;
}

// Authentication and User Types
export type UserRole = 'teacher' | 'student';

export interface User {
  id: string;
  _id?: string; // MongoDB _id field
  email: string;
  name: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

export interface Teacher extends User {
  role: 'teacher';
  institution?: string;
  subject?: string;
  classes?: string[];
}

export interface Student extends User {
  role: 'student';
  grade?: string;
  school?: string;
  teacherId?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
  role: UserRole;
}

export interface SignupData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: UserRole;
  institution?: string;
  subject?: string;
  grade?: string;
  school?: string;
}

export interface AuthResponse {
  success: boolean;
  user?: User;
  token?: string;
  error?: string;
}
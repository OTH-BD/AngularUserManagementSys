/**
 * User entity model
 * Represents a user in the system with all required properties
 */
export interface User {
  id?: number;
  name: string;
  email: string;
  age: number;
  gender: Gender;
  createdAt?: Date;
  updatedAt?: Date;
  isActive?: boolean;
}

/**
 * Gender enumeration for type safety
 */
export type Gender = 'male' | 'female' | 'other';

/**
 * User form data interface
 * Used for form validation and user input
 */
export interface UserFormData {
  name: string;
  email: string;
  age: number;
  gender: Gender | '';
}

/**
 * User creation request interface
 */
export interface CreateUserRequest extends Omit<User, 'id' | 'createdAt' | 'updatedAt'> {
  // Additional properties for user creation if needed
}

/**
 * User update request interface
 */
export interface UpdateUserRequest extends Partial<Omit<User, 'id' | 'createdAt' | 'updatedAt'>> {
  id: number;
}

/**
 * User list query parameters
 */
export interface UserQueryParams {
  page?: number;
  limit?: number;
  sortBy?: keyof User;
  sortOrder?: 'asc' | 'desc';
  search?: string;
  gender?: Gender;
}

/**
 * API response wrapper for user operations
 */
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  errors?: string[];
}

/**
 * User statistics interface
 */
export interface UserStatistics {
  total: number;
  maleCount: number;
  femaleCount: number;
  otherCount: number;
  averageAge: number;
  ageRange: {
    min: number;
    max: number;
  };
}

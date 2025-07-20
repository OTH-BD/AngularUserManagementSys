import { Injectable, inject, computed, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { User, UserFormData, UserStatistics, Gender } from '../models/user.model';
import { UserApiService } from '../services/user-api.service';
import { NotificationService } from '../services/notification.service';

/**
 * Professional user store using Angular signals
 * Manages user state, CRUD operations, and computed statistics
 */
@Injectable({
  providedIn: 'root'
})
export class UserStore {
  private readonly userApiService = inject(UserApiService);
  private readonly notificationService = inject(NotificationService);

  // State signals
  private readonly _users = signal<User[]>([]);
  private readonly _isLoading = signal<boolean>(false);
  private readonly _error = signal<string | null>(null);

  // Public readonly signals
  readonly users = this._users.asReadonly();
  readonly isLoading = this._isLoading.asReadonly();
  readonly error = this._error.asReadonly();

  // Computed statistics
  readonly statistics = computed((): UserStatistics => {
    const usersList = this._users();
    const total = usersList.length;
    
    if (total === 0) {
      return {
        total: 0,
        maleCount: 0,
        femaleCount: 0,
        otherCount: 0,
        averageAge: 0,
        ageRange: { min: 0, max: 0 }
      };
    }

    const maleCount = usersList.filter(u => u.gender === 'male').length;
    const femaleCount = usersList.filter(u => u.gender === 'female').length;
    const otherCount = usersList.filter(u => u.gender === 'other').length;
    
    const ages = usersList.map(u => u.age);
    const averageAge = Math.round(ages.reduce((sum, age) => sum + age, 0) / total);
    const ageRange = {
      min: Math.min(...ages),
      max: Math.max(...ages)
    };

    return {
      total,
      maleCount,
      femaleCount,
      otherCount,
      averageAge,
      ageRange
    };
  });

  /**
   * Type guard to check if value is a valid Gender
   */
  private isValidGender(value: string): value is Gender {
    return value === 'male' || value === 'female' || value === 'other';
  }

  /**
   * Load all users from API
   */
  async loadUsers(): Promise<void> {
    this._isLoading.set(true);
    this._error.set(null);
    
    try {
      const users = await firstValueFrom(this.userApiService.getUsers());
      this._users.set(users || []);
      
      console.log(`Loaded ${users?.length || 0} users successfully`);
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load users';
      this._error.set(errorMessage);
      console.error('Error loading users:', error);
      throw error;
    } finally {
      this._isLoading.set(false);
    }
  }

  /**
   * Create a new user
   * @param formData - User form data
   * @returns Promise resolving to created user
   */
  async createUser(formData: UserFormData): Promise<User> {
    this._isLoading.set(true);
    this._error.set(null);
    
    try {
      // Validate required fields
      if (!this.isValidGender(formData.gender)) {
        throw new Error('Valid gender is required');
      }

      const createRequest = {
        name: formData.name,
        email: formData.email,
        age: formData.age,
        gender: formData.gender,
        isActive: true
      };
      
      const newUser = await firstValueFrom(this.userApiService.createUser(createRequest));
      
      if (newUser) {
        // Add to local state
        this._users.update(users => [...users, newUser]);
        
        console.log(`User created successfully:`, newUser);
        return newUser;
      }
      
      throw new Error('Failed to create user - no response');
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create user';
      this._error.set(errorMessage);
      console.error('Error creating user:', error);
      throw error;
    } finally {
      this._isLoading.set(false);
    }
  }

  /**
   * Update an existing user
   * @param id - User ID
   * @param formData - Updated user data
   * @returns Promise resolving to updated user
   */
  async updateUser(id: number, formData: UserFormData): Promise<User> {
    this._isLoading.set(true);
    this._error.set(null);
    
    try {
      // Validate required fields
      if (!this.isValidGender(formData.gender)) {
        throw new Error('Valid gender is required');
      }

      const updateRequest = {
        id: id,
        name: formData.name,
        email: formData.email,
        age: formData.age,
        gender: formData.gender
      };
      
      const updatedUser = await firstValueFrom(this.userApiService.updateUser(updateRequest));
      
      if (updatedUser) {
        // Update local state
        this._users.update(users => 
          users.map(user => user.id === id ? updatedUser : user)
        );
        
        console.log(`User updated successfully:`, updatedUser);
        return updatedUser;
      }
      
      throw new Error('Failed to update user - no response');
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update user';
      this._error.set(errorMessage);
      console.error('Error updating user:', error);
      throw error;
    } finally {
      this._isLoading.set(false);
    }
  }

  /**
   * Delete a user
   * @param id - User ID to delete
   */
  async deleteUser(id: number): Promise<void> {
    this._isLoading.set(true);
    this._error.set(null);
    
    try {
      await firstValueFrom(this.userApiService.deleteUser(id));
      
      // Remove from local state
      this._users.update(users => users.filter(user => user.id !== id));
      
      console.log(`User with ID ${id} deleted successfully`);
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete user';
      this._error.set(errorMessage);
      console.error('Error deleting user:', error);
      throw error;
    } finally {
      this._isLoading.set(false);
    }
  }

  /**
   * Get user by ID
   * @param id - User ID
   * @returns User or undefined if not found
   */
  getUserById(id: number): User | undefined {
    return this._users().find(user => user.id === id);
  }

  /**
   * Clear error state
   */
  clearError(): void {
    this._error.set(null);
  }

  /**
   * Reset store to initial state
   */
  reset(): void {
    this._users.set([]);
    this._isLoading.set(false);
    this._error.set(null);
  }
}

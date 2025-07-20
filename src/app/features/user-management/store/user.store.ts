import { Injectable, computed, signal, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Observable, BehaviorSubject, EMPTY } from 'rxjs';
import { catchError, finalize, tap } from 'rxjs/operators';
import { 
  User, 
  CreateUserRequest, 
  UpdateUserRequest, 
  UserStatistics,
  UserQueryParams 
} from '../../../core/models/user.model';
import { UserApiService } from '../../../core/services/user-api.service';
import { NotificationService } from '../../../core/services/notification.service';

/**
 * Loading states for different operations
 */
export interface UserLoadingState {
  loading: boolean;
  creating: boolean;
  updating: boolean;
  deleting: boolean;
  exporting: boolean;
}

/**
 * Error states for user operations
 */
export interface UserErrorState {
  general: string | null;
  create: string | null;
  update: string | null;
  delete: string | null;
  export: string | null;
}

/**
 * Professional user store with comprehensive state management
 * Follows Angular/RxJS best practices with signals for reactive updates
 */
@Injectable({
  providedIn: 'root'
})
export class UserStore {
  // Private state signals
  private readonly _users = signal<User[]>([]);
  private readonly _loadingState = signal<UserLoadingState>({
    loading: false,
    creating: false,
    updating: false,
    deleting: false,
    exporting: false
  });
  private readonly _errorState = signal<UserErrorState>({
    general: null,
    create: null,
    update: null,
    delete: null,
    export: null
  });
  private readonly _selectedUser = signal<User | null>(null);
  private readonly _queryParams = signal<UserQueryParams>({});

  // Public computed signals
  public readonly users = this._users.asReadonly();
  public readonly loadingState = this._loadingState.asReadonly();
  public readonly errorState = this._errorState.asReadonly();
  public readonly selectedUser = this._selectedUser.asReadonly();
  public readonly queryParams = this._queryParams.asReadonly();

  // Computed statistics
  public readonly statistics = computed<UserStatistics>(() => {
    const users = this._users();
    const total = users.length;
    
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

    const maleCount = users.filter(u => u.gender === 'male').length;
    const femaleCount = users.filter(u => u.gender === 'female').length;
    const otherCount = users.filter(u => u.gender === 'other').length;
    
    const ages = users.map(u => u.age);
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

  // Computed filtered users based on query params
  public readonly filteredUsers = computed<User[]>(() => {
    const users = this._users();
    const params = this._queryParams();
    
    let filtered = [...users];

    // Apply search filter
    if (params.search) {
      const searchTerm = params.search.toLowerCase();
      filtered = filtered.filter(user =>
        user.name.toLowerCase().includes(searchTerm) ||
        user.email.toLowerCase().includes(searchTerm) ||
        user.age.toString().includes(searchTerm)
      );
    }

    // Apply gender filter
    if (params.gender) {
      filtered = filtered.filter(user => user.gender === params.gender);
    }

    // Apply sorting
    if (params.sortBy) {
      filtered.sort((a, b) => {
        const aValue = a[params.sortBy!];
        const bValue = b[params.sortBy!];
        
        if (typeof aValue === 'string' && typeof bValue === 'string') {
          return params.sortOrder === 'desc' 
            ? bValue.localeCompare(aValue)
            : aValue.localeCompare(bValue);
        }
        
        if (typeof aValue === 'number' && typeof bValue === 'number') {
          return params.sortOrder === 'desc' 
            ? bValue - aValue 
            : aValue - bValue;
        }
        
        return 0;
      });
    }

    return filtered;
  });

  constructor() {
    this.loadUsers();
  }

  // Inject services
  private readonly userApiService = inject(UserApiService);
  private readonly notificationService = inject(NotificationService);

  /**
   * Load all users from the API
   */
  public loadUsers(): void {
    this.setLoadingState({ loading: true });
    this.clearError('general');

    this.userApiService.getUsers()
      .pipe(
        tap((users: User[]) => this._users.set(users)),
        catchError(error => {
          this.setError('general', error.message);
          this.notificationService.showError('Failed to load users');
          return EMPTY;
        }),
        finalize(() => this.setLoadingState({ loading: false }))
      )
      .subscribe();
  }

  /**
   * Create a new user
   * @param userData - User creation data
   */
  public createUser(userData: CreateUserRequest): void {
    this.setLoadingState({ creating: true });
    this.clearError('create');

    this.userApiService.createUser(userData)
      .pipe(
        tap((newUser: User) => {
          this._users.update(users => [...users, newUser]);
          this.notificationService.showSuccess(`User "${newUser.name}" created successfully!`);
        }),
        catchError(error => {
          this.setError('create', error.message);
          this.notificationService.showError('Failed to create user');
          return EMPTY;
        }),
        finalize(() => this.setLoadingState({ creating: false }))
      )
      .subscribe();
  }

  /**
   * Update an existing user
   * @param userData - User update data
   */
  public updateUser(userData: UpdateUserRequest): void {
    this.setLoadingState({ updating: true });
    this.clearError('update');

    this.userApiService.updateUser(userData)
      .pipe(
        tap((updatedUser: User) => {
          this._users.update(users => 
            users.map(user => user.id === updatedUser.id ? updatedUser : user)
          );
          this.notificationService.showSuccess(`User "${updatedUser.name}" updated successfully!`);
        }),
        catchError(error => {
          this.setError('update', error.message);
          this.notificationService.showError('Failed to update user');
          return EMPTY;
        }),
        finalize(() => this.setLoadingState({ updating: false }))
      )
      .subscribe();
  }

  /**
   * Delete a user by ID
   * @param id - User ID to delete
   */
  public deleteUser(id: number): void {
    const userToDelete = this._users().find(u => u.id === id);
    if (!userToDelete) return;

    this.setLoadingState({ deleting: true });
    this.clearError('delete');

    this.userApiService.deleteUser(id)
      .pipe(
        tap(() => {
          this._users.update(users => users.filter(user => user.id !== id));
          this.notificationService.showSuccess(`User "${userToDelete.name}" deleted successfully!`);
        }),
        catchError(error => {
          this.setError('delete', error.message);
          this.notificationService.showError('Failed to delete user');
          return EMPTY;
        }),
        finalize(() => this.setLoadingState({ deleting: false }))
      )
      .subscribe();
  }

  /**
   * Select a user for editing or viewing
   * @param user - User to select
   */
  public selectUser(user: User | null): void {
    this._selectedUser.set(user);
  }

  /**
   * Update query parameters for filtering
   * @param params - New query parameters
   */
  public updateQueryParams(params: Partial<UserQueryParams>): void {
    this._queryParams.update(current => ({ ...current, ...params }));
  }

  /**
   * Clear all filters
   */
  public clearFilters(): void {
    this._queryParams.set({});
  }

  /**
   * Set export loading state
   * @param isExporting - Export loading state
   */
  public setExportingState(isExporting: boolean): void {
    this.setLoadingState({ exporting: isExporting });
  }

  /**
   * Private method to update loading state
   * @param state - Partial loading state to update
   */
  private setLoadingState(state: Partial<UserLoadingState>): void {
    this._loadingState.update(current => ({ ...current, ...state }));
  }

  /**
   * Private method to set error state
   * @param type - Error type
   * @param message - Error message
   */
  private setError(type: keyof UserErrorState, message: string): void {
    this._errorState.update(current => ({ ...current, [type]: message }));
  }

  /**
   * Private method to clear error state
   * @param type - Error type to clear
   */
  private clearError(type: keyof UserErrorState): void {
    this._errorState.update(current => ({ ...current, [type]: null }));
  }
}

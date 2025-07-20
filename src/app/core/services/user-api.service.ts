import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, throwError, retry, catchError } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { 
  User, 
  CreateUserRequest, 
  UpdateUserRequest, 
  UserQueryParams, 
  ApiResponse 
} from '../models/user.model';
import { environment } from '../../../environments/environment';

/**
 * Professional API service for user operations
 * Handles HTTP requests with proper error handling and logging
 */
@Injectable({
  providedIn: 'root'
})
export class UserApiService {
  private readonly baseUrl = `${environment.apiUrl}/users`;

  constructor(private readonly http: HttpClient) {}

  /**
   * Retrieve all users with optional query parameters
   * @param params - Query parameters for filtering and pagination
   * @returns Observable of users array
   */
  getUsers(params?: UserQueryParams): Observable<User[]> {
    const httpParams = this.buildHttpParams(params);
    
    return this.http.get<User[]>(this.baseUrl, { params: httpParams })
      .pipe(
        retry(2), // Retry failed requests twice
        tap(users => console.log(`Retrieved ${users.length} users`)),
        catchError(this.handleError('getUsers'))
      );
  }

  /**
   * Get a specific user by ID
   * @param id - User ID
   * @returns Observable of user or null
   */
  getUserById(id: number): Observable<User | null> {
    return this.http.get<User>(`${this.baseUrl}/${id}`)
      .pipe(
        tap(user => console.log(`Retrieved user: ${user.name}`)),
        catchError(this.handleError('getUserById'))
      );
  }

  /**
   * Create a new user
   * @param userData - User creation data
   * @returns Observable of created user
   */
  createUser(userData: CreateUserRequest): Observable<User> {
    const userToCreate: Partial<User> = {
      ...userData,
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true
    };

    return this.http.post<User>(this.baseUrl, userToCreate)
      .pipe(
        tap(user => console.log(`Created user: ${user.name} with ID: ${user.id}`)),
        catchError(this.handleError('createUser'))
      );
  }

  /**
   * Update an existing user
   * @param userData - User update data
   * @returns Observable of updated user
   */
  updateUser(userData: UpdateUserRequest): Observable<User> {
    const userToUpdate: Partial<User> = {
      ...userData,
      updatedAt: new Date()
    };

    return this.http.put<User>(`${this.baseUrl}/${userData.id}`, userToUpdate)
      .pipe(
        tap(user => console.log(`Updated user: ${user.name}`)),
        catchError(this.handleError('updateUser'))
      );
  }

  /**
   * Delete a user by ID
   * @param id - User ID to delete
   * @returns Observable of void
   */
  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`)
      .pipe(
        tap(() => console.log(`Deleted user with ID: ${id}`)),
        catchError(this.handleError('deleteUser'))
      );
  }

  /**
   * Search users by query string (for json-server compatibility)
   * @param query - Search query
   * @returns Observable of matching users
   */
  searchUsers(query: string): Observable<User[]> {
    // Use json-server's q parameter for full-text search
    const params = new HttpParams().set('q', query);
    
    return this.http.get<User[]>(this.baseUrl, { params })
      .pipe(
        retry(1), // Reduce retry count for search
        tap(users => console.log(`Found ${users.length} users matching: "${query}"`)),
        catchError(this.handleError('searchUsers'))
      );
  }

  /**
   * Build HTTP parameters from query params object
   * @param params - Query parameters
   * @returns HttpParams instance
   */
  private buildHttpParams(params?: UserQueryParams): HttpParams {
    let httpParams = new HttpParams();
    
    if (params) {
      Object.keys(params).forEach(key => {
        const value = params[key as keyof UserQueryParams];
        if (value !== undefined && value !== null) {
          httpParams = httpParams.set(key, value.toString());
        }
      });
    }
    
    return httpParams;
  }

  /**
   * Generic error handler for HTTP operations
   * @param operation - Name of the operation that failed
   * @returns Error handling function
   */
  private handleError(operation: string) {
    return (error: HttpErrorResponse): Observable<any> => {
      console.error(`${operation} failed:`, error);
      
      let errorMessage = 'An unexpected error occurred';
      
      if (error.error instanceof ErrorEvent) {
        // Client-side or network error
        errorMessage = `Network Error: ${error.error.message}`;
      } else {
        // Server-side error
        const statusMessage = error.statusText || 'Unknown Error';
        errorMessage = `Server Error (${error.status}): ${statusMessage}`;
        
        // Handle specific HTTP status codes with user-friendly messages
        switch (error.status) {
          case 0:
            errorMessage = 'Unable to connect to server. Please check if the server is running.';
            break;
          case 404:
            errorMessage = operation.includes('search') ? 'No users found matching your search' : 'User not found';
            break;
          case 400:
            errorMessage = 'Invalid user data provided. Please check your input.';
            break;
          case 409:
            errorMessage = 'User with this email already exists.';
            break;
          case 500:
            errorMessage = 'Server internal error. Please try again later.';
            break;
          case 503:
            errorMessage = 'Service temporarily unavailable. Please try again later.';
            break;
        }
        
        // Log additional details for debugging
        if (error.error && typeof error.error === 'object') {
          console.error('Error details:', error.error);
        }
      }
      
      // Return error observable with user-friendly message
      return throwError(() => new Error(errorMessage));
    };
  }
}

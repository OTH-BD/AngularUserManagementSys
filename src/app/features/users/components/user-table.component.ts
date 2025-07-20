import { Component, input, output, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { User, UserStatistics } from '../../../core/models/user.model';

/**
 * User table component
 * Displays users in a filterable, sortable table with actions
 */
@Component({
  selector: 'app-user-table',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <!-- Table Controls -->
    <div class="card border-0 shadow-lg mb-4">
      <div class="card-header bg-white border-0 py-3">
        <div class="row align-items-center">
          <div class="col-md-4">
            <h5 class="mb-0 text-primary fw-bold">
              <i class="bi bi-table me-2"></i>
              User Management ({{ filteredUsers().length }})
            </h5>
          </div>
          <div class="col-md-8">
            <div class="row g-2">
              <!-- Search Filter -->
              <div class="col-md-6">
                <div class="input-group">
                  <span class="input-group-text bg-light border-end-0">
                    <i class="bi bi-search text-muted"></i>
                  </span>
                  <input
                    type="text"
                    class="form-control border-start-0"
                    placeholder="Search users..."
                    [value]="searchFilter()"
                    (input)="onSearchChange($event)"
                  />
                </div>
              </div>
              
              <!-- Gender Filter -->
              <div class="col-md-3">
                <select
                  class="form-select"
                  [value]="genderFilter()"
                  (change)="onGenderFilterChange($event)"
                >
                  <option value="">All Genders</option>
                  <option value="male">Male Only</option>
                  <option value="female">Female Only</option>
                  <option value="other">Other Only</option>
                </select>
              </div>

              <!-- Export Button -->
              <div class="col-md-3">
                <button
                  class="btn btn-outline-success w-100"
                  (click)="onExportUsers()"
                  [disabled]="filteredUsers().length === 0"
                >
                  <i class="bi bi-download me-2"></i>Export
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="card-body p-0">
        <!-- Loading State -->
        @if (isLoading()) {
          <div class="text-center py-5">
            <div class="spinner-border text-primary" role="status">
              <span class="visually-hidden">Loading...</span>
            </div>
            <p class="mt-3 text-muted">Loading users...</p>
          </div>
        } @else if (filteredUsers().length === 0) {
          <!-- Empty State -->
          <div class="text-center py-5">
            <i class="bi bi-person-x display-1 text-muted"></i>
            <h4 class="mt-3 text-muted">No Users Found</h4>
            <p class="text-muted">
              @if (hasActiveFilters()) {
                Try adjusting your search filters
              } @else {
                Start by adding your first user
              }
            </p>
          </div>
        } @else {
          <!-- Users Table -->
          <div class="table-responsive">
            <table class="table table-hover mb-0">
              <thead class="table-light">
                <tr>
                  <th scope="col" class="py-3">
                    <button 
                      class="btn btn-link p-0 text-decoration-none fw-bold"
                      (click)="toggleSort('id')"
                    >
                      ID
                      @if (sortField() === 'id') {
                        <i class="bi bi-{{ sortDirection() === 'asc' ? 'arrow-up' : 'arrow-down' }} ms-1"></i>
                      }
                    </button>
                  </th>
                  <th scope="col" class="py-3">
                    <button 
                      class="btn btn-link p-0 text-decoration-none fw-bold"
                      (click)="toggleSort('name')"
                    >
                      <i class="bi bi-person-fill me-2"></i>Name
                      @if (sortField() === 'name') {
                        <i class="bi bi-{{ sortDirection() === 'asc' ? 'arrow-up' : 'arrow-down' }} ms-1"></i>
                      }
                    </button>
                  </th>
                  <th scope="col" class="py-3">
                    <button 
                      class="btn btn-link p-0 text-decoration-none fw-bold"
                      (click)="toggleSort('email')"
                    >
                      <i class="bi bi-envelope-fill me-2"></i>Email
                      @if (sortField() === 'email') {
                        <i class="bi bi-arrow-{{ sortDirection() === 'asc' ? 'up' : 'down' }} ms-1"></i>
                      }
                    </button>
                  </th>
                  <th scope="col" class="py-3">
                    <button 
                      class="btn btn-link p-0 text-decoration-none fw-bold"
                      (click)="toggleSort('age')"
                    >
                      <i class="bi bi-calendar-fill me-2"></i>Age
                      @if (sortField() === 'age') {
                        <i class="bi bi-arrow-{{ sortDirection() === 'asc' ? 'up' : 'down' }} ms-1"></i>
                      }
                    </button>
                  </th>
                  <th scope="col" class="py-3">
                    <button 
                      class="btn btn-link p-0 text-decoration-none fw-bold"
                      (click)="toggleSort('gender')"
                    >
                      <i class="bi bi-gender-ambiguous me-2"></i>Gender
                      @if (sortField() === 'gender') {
                        <i class="bi bi-arrow-{{ sortDirection() === 'asc' ? 'up' : 'down' }} ms-1"></i>
                      }
                    </button>
                  </th>
                  <th scope="col" class="py-3">
                    <i class="bi bi-calendar-plus me-2"></i>Created
                  </th>
                  <th scope="col" class="py-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                @for (user of sortedUsers(); track user.id) {
                  <tr class="user-row" [class.table-warning]="user.id === highlightedUserId()">
                    <td class="py-3">
                      <span class="badge bg-primary">{{ user.id }}</span>
                    </td>
                    <td class="py-3">
                      <div class="d-flex align-items-center">
                        <div class="user-avatar me-3">
                          {{ getInitials(user.name) }}
                        </div>
                        <div>
                          <div class="fw-bold text-dark">{{ user.name }}</div>
                          @if (user.isActive) {
                            <small class="text-success">
                              <i class="bi bi-circle-fill me-1"></i>Active
                            </small>
                          } @else {
                            <small class="text-muted">
                              <i class="bi bi-circle me-1"></i>Inactive
                            </small>
                          }
                        </div>
                      </div>
                    </td>
                    <td class="py-3">
                      <a [href]="'mailto:' + user.email" class="text-decoration-none">
                        {{ user.email }}
                      </a>
                    </td>
                    <td class="py-3">
                      <span class="badge bg-info">{{ user.age }} years</span>
                    </td>
                    <td class="py-3">
                      <span class="badge" [class]="getGenderBadgeClass(user.gender)">
                        <i class="bi bi-{{ getGenderIcon(user.gender) }} me-1"></i>
                        {{ user.gender | titlecase }}
                      </span>
                    </td>
                    <td class="py-3">
                      <small class="text-muted">
                        {{ formatDate(user.createdAt) }}
                      </small>
                    </td>
                    <td class="py-3">
                      <div class="btn-group" role="group">
                        <button
                          type="button"
                          class="btn btn-outline-primary btn-sm"
                          (click)="onViewUser(user)"
                          title="View Details"
                        >
                          <i class="bi bi-eye"></i>
                        </button>
                        <button
                          type="button"
                          class="btn btn-outline-warning btn-sm"
                          (click)="onEditUser(user)"
                          title="Edit User"
                        >
                          <i class="bi bi-pencil"></i>
                        </button>
                        <button
                          type="button"
                          class="btn btn-outline-danger btn-sm"
                          (click)="onDeleteUser(user)"
                          title="Delete User"
                        >
                          <i class="bi bi-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        }
      </div>

      <!-- Table Footer with Pagination Info -->
      @if (filteredUsers().length > 0) {
        <div class="card-footer bg-light border-0">
          <div class="row align-items-center">
            <div class="col-md-6">
              <small class="text-muted">
                Showing {{ filteredUsers().length }} of {{ users().length }} users
                @if (hasActiveFilters()) {
                  (filtered)
                }
              </small>
            </div>
            <div class="col-md-6 text-end">
              <small class="text-muted">
                <i class="bi bi-clock me-1"></i>
                Last updated: {{ getLastUpdated() }}
              </small>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .user-row {
      transition: all 0.2s ease;
    }

    .user-row:hover {
      background-color: #f8f9ff !important;
      transform: translateX(2px);
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }

    .user-avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      font-size: 0.9rem;
    }

    .table th {
      border-bottom: 2px solid #e9ecef;
      font-weight: 600;
      color: #495057;
    }

    .btn-group .btn {
      border-radius: 6px;
      margin: 0 2px;
      transition: all 0.2s ease;
    }

    .btn-group .btn:hover {
      transform: translateY(-1px);
      box-shadow: 0 3px 8px rgba(0,0,0,0.15);
    }

    .badge {
      font-size: 0.75rem;
      padding: 0.35em 0.65em;
    }

    .input-group-text {
      border-color: #dee2e6;
    }

    .form-control:focus {
      border-color: #667eea;
      box-shadow: 0 0 0 0.2rem rgba(102, 126, 234, 0.25);
    }

    .table-responsive {
      border-radius: 0;
    }

    .btn-link {
      color: #495057 !important;
      border: none !important;
    }

    .btn-link:hover {
      color: #667eea !important;
    }

    .spinner-border {
      width: 3rem;
      height: 3rem;
    }

    @media (max-width: 768px) {
      .btn-group {
        display: flex;
        flex-direction: column;
        gap: 2px;
      }
      
      .btn-group .btn {
        font-size: 0.8rem;
        padding: 0.25rem 0.5rem;
      }
    }
  `]
})
export class UserTableComponent {
  // Input signals
  readonly users = input<User[]>([]);
  readonly isLoading = input<boolean>(false);
  readonly statistics = input<UserStatistics>();

  // Output events
  readonly userView = output<User>();
  readonly userEdit = output<User>();
  readonly userDelete = output<User>();
  readonly usersExport = output<User[]>();

  // Local state signals
  readonly searchFilter = signal<string>('');
  readonly genderFilter = signal<string>('');
  readonly sortField = signal<keyof User>('id');
  readonly sortDirection = signal<'asc' | 'desc'>('asc');
  readonly highlightedUserId = signal<number | null>(null);

  // Computed properties
  readonly filteredUsers = computed(() => {
    let filtered = this.users();

    // Apply search filter
    const searchTerm = this.searchFilter().toLowerCase();
    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.name.toLowerCase().includes(searchTerm) ||
        user.email.toLowerCase().includes(searchTerm)
      );
    }

    // Apply gender filter
    const gender = this.genderFilter();
    if (gender) {
      filtered = filtered.filter(user => user.gender === gender);
    }

    return filtered;
  });

  readonly sortedUsers = computed(() => {
    const users = [...this.filteredUsers()];
    const field = this.sortField();
    const direction = this.sortDirection();

    return users.sort((a, b) => {
      let aValue = a[field];
      let bValue = b[field];

      // Handle undefined values
      if (aValue === undefined && bValue === undefined) return 0;
      if (aValue === undefined) return direction === 'asc' ? 1 : -1;
      if (bValue === undefined) return direction === 'asc' ? -1 : 1;

      // Handle different data types
      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = (bValue as string).toLowerCase();
      }

      if (aValue < bValue) {
        return direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  });

  /**
   * Handle search input change
   */
  onSearchChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchFilter.set(input.value);
  }

  /**
   * Handle gender filter change
   */
  onGenderFilterChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.genderFilter.set(select.value);
  }

  /**
   * Toggle sort for a field
   */
  toggleSort(field: keyof User): void {
    if (this.sortField() === field) {
      // Toggle direction if same field
      this.sortDirection.set(this.sortDirection() === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new field with ascending direction
      this.sortField.set(field);
      this.sortDirection.set('asc');
    }
  }

  /**
   * Handle view user action
   */
  onViewUser(user: User): void {
    if (user.id) {
      this.highlightUser(user.id);
    }
    this.userView.emit(user);
  }

  /**
   * Handle edit user action
   */
  onEditUser(user: User): void {
    if (user.id) {
      this.highlightUser(user.id);
    }
    this.userEdit.emit(user);
  }

  /**
   * Handle delete user action
   */
  onDeleteUser(user: User): void {
    this.userDelete.emit(user);
  }

  /**
   * Handle export users action
   */
  onExportUsers(): void {
    this.usersExport.emit(this.filteredUsers());
  }

  /**
   * Highlight a user row temporarily
   */
  highlightUser(userId: number): void {
    this.highlightedUserId.set(userId);
    setTimeout(() => this.highlightedUserId.set(null), 3000);
  }

  /**
   * Get user initials for avatar
   */
  getInitials(name: string): string {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  }

  /**
   * Get gender badge CSS class
   */
  getGenderBadgeClass(gender: string): string {
    const classes = {
      male: 'bg-primary',
      female: 'bg-danger',
      other: 'bg-secondary'
    };
    return classes[gender as keyof typeof classes] || 'bg-secondary';
  }

  /**
   * Get gender icon
   */
  getGenderIcon(gender: string): string {
    const icons = {
      male: 'person-fill',
      female: 'person-fill',
      other: 'person-fill'
    };
    return icons[gender as keyof typeof icons] || 'person-fill';
  }

  /**
   * Format date for display
   */
  formatDate(date: Date | string | undefined): string {
    if (!date) return 'N/A';
    
    const d = new Date(date);
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  /**
   * Check if there are active filters
   */
  hasActiveFilters(): boolean {
    return this.searchFilter().length > 0 || this.genderFilter().length > 0;
  }

  /**
   * Get last updated timestamp
   */
  getLastUpdated(): string {
    return new Date().toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  /**
   * Clear all filters
   */
  clearFilters(): void {
    this.searchFilter.set('');
    this.genderFilter.set('');
  }

  /**
   * Get filtered users count
   */
  getFilteredCount(): number {
    return this.filteredUsers().length;
  }

  /**
   * Get total users count
   */
  getTotalCount(): number {
    return this.users().length;
  }
}

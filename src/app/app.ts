import { Component, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import * as XLSX from 'xlsx';

// Professional architecture imports
import { User, UserFormData, Gender } from './core/models/user.model';
import { UserStore } from './core/store/user.store';
import { ExportService } from './core/services/export.service';
import { NotificationService } from './core/services/notification.service';
import { ConfirmationService } from './core/services/confirmation.service';
import { ErrorHandlerService } from './core/services/error-handler.service';
import { APP_CONSTANTS } from './core/constants/app.constants';

/**
 * Main application component with professional architecture
 */
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    HttpClientModule
  ],
  templateUrl: './app.html',
  styleUrls: ['./app.scss']
})
export class AppComponent {
  // Professional service injection
  private readonly userStore = inject(UserStore);
  private readonly exportService = inject(ExportService);
  private readonly notificationService = inject(NotificationService);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly errorHandler = inject(ErrorHandlerService);

  // Expose store signals to template
  readonly users = this.userStore.users;
  readonly statistics = this.userStore.statistics;
  readonly isLoading = this.userStore.isLoading;
  readonly error = this.userStore.error;

  // Form data for template-driven forms
  formData: UserFormData = {
    name: '',
    email: '',
    age: null!,
    gender: ''
  };

  // Modal state
  showUserModal = false;
  modalMode: 'view' | 'edit' = 'view';
  selectedUser: User | null = null;

  // Filter properties
  searchFilter = '';
  genderFilter = '';
  filteredUsers: User[] = [];

  constructor() {
    // Initialize component
    this.initializeComponent();
    
    // Set up effect to watch users changes
    effect(() => {
      // When users change, reapply filters
      this.applyFilters();
    });
  }

  /**
   * Initialize component with professional practices
   */
  private async initializeComponent(): Promise<void> {
    try {
      await this.userStore.loadUsers();
      this.applyFilters();
      console.log('Component initialized successfully');
    } catch (error) {
      console.error('Component initialization failed', error);
    }
  }

  /**
   * Handle simple form submission
   */
  async onSimpleSubmit(): Promise<void> {
    if (this.formData.name && this.formData.email && this.formData.age && this.formData.gender) {
      try {
        await this.userStore.createUser(this.formData);
        this.clearForm();
        this.notificationService.showSuccess('User created successfully!');
      } catch (error) {
        this.notificationService.showError('Failed to create user');
        console.error('Failed to create user', error);
      }
    }
  }

  /**
   * Clear form data
   */
  clearForm(): void {
    this.formData = {
      name: '',
      email: '',
      age: null!,
      gender: ''
    };
  }

  /**
   * Apply filters to user list
   */
  applyFilters(): void {
    let filtered = [...this.users()];

    // Apply search filter
    if (this.searchFilter.trim()) {
      const searchTerm = this.searchFilter.toLowerCase().trim();
      filtered = filtered.filter(user => 
        user.name.toLowerCase().includes(searchTerm) ||
        user.email.toLowerCase().includes(searchTerm)
      );
    }

    // Apply gender filter
    if (this.genderFilter) {
      filtered = filtered.filter(user => user.gender === this.genderFilter);
    }

    this.filteredUsers = filtered;
  }

  /**
   * Clear all filters
   */
  clearFilters(): void {
    this.searchFilter = '';
    this.genderFilter = '';
    this.applyFilters();
  }

  /**
   * Get CSS class for gender badge
   */
  getGenderBadgeClass(gender: string): string {
    switch (gender?.toLowerCase()) {
      case 'male': return 'bg-primary';
      case 'female': return 'bg-danger';
      case 'other': return 'bg-warning';
      default: return 'bg-secondary';
    }
  }

  /**
   * Refresh users from server
   */
  async onRefreshUsers(): Promise<void> {
    try {
      await this.userStore.loadUsers();
      this.notificationService.showSuccess('Users refreshed successfully!');
    } catch (error) {
      this.notificationService.showError('Failed to refresh users');
      console.error('Failed to refresh users', error);
    }
  }

  /**
   * Export methods
   */
  async onExportUsers(): Promise<void> {
    try {
      const exportData = this.filteredUsers.length > 0 ? this.filteredUsers : this.users();
      this.exportToExcel(exportData);
      this.notificationService.showSuccess(`Exported ${exportData.length} users to Excel`);
    } catch (error) {
      this.notificationService.showError('Excel export failed');
      console.error('Excel export failed', error);
    }
  }

  private exportToExcel(users: User[]): void {
    // Préparer les données pour Excel
    const exportData = users.map(user => ({
      'ID': user.id || '',
      'Nom': user.name || '',
      'Email': user.email || '',
      'Âge': user.age || '',
      'Genre': user.gender === 'male' ? 'Homme' : 
              user.gender === 'female' ? 'Femme' : 'Autre',
      'Statut': user.isActive ? 'Actif' : 'Inactif',
      'Date de création': user.createdAt ? 
        new Date(user.createdAt).toLocaleDateString('fr-FR') : ''
    }));

    // Créer le workbook et la worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(exportData);

    // Configurer la largeur des colonnes
    const colWidths = [
      { wch: 10 }, // ID
      { wch: 25 }, // Nom  
      { wch: 30 }, // Email
      { wch: 10 }, // Âge
      { wch: 15 }, // Genre
      { wch: 15 }, // Statut
      { wch: 20 }  // Date
    ];
    ws['!cols'] = colWidths;

    // Ajouter la worksheet au workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Utilisateurs');

    // Générer et télécharger le fichier Excel
    const filename = `utilisateurs_export_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(wb, filename);
  }

  async onExportToCsv(): Promise<void> {
    try {
      const exportData = this.filteredUsers.length > 0 ? this.filteredUsers : this.users();
      const csvData = this.convertUsersToCSV(exportData);
      this.downloadCSV(csvData, `filtered_users_${new Date().toISOString().split('T')[0]}.csv`);
      this.notificationService.showSuccess(`Exported ${exportData.length} users to CSV`);
    } catch (error) {
      this.notificationService.showError('CSV export failed');
      console.error('CSV export failed', error);
    }
  }

  async onExportToJson(): Promise<void> {
    try {
      const exportData = this.users();
      const jsonData = JSON.stringify(exportData, null, 2);
      this.downloadJSON(jsonData, `users_backup_${new Date().toISOString().split('T')[0]}.json`);
      this.notificationService.showSuccess('User data exported to JSON');
    } catch (error) {
      this.notificationService.showError('JSON export failed');
      console.error('JSON export failed', error);
    }
  }

  // Helper methods for export
  private convertUsersToCSV(users: User[]): string {
    const headers = ['ID', 'Name', 'Email', 'Age', 'Gender', 'Status', 'Created At'];
    const csvRows = [headers.join(',')];
    
    users.forEach(user => {
      const row = [
        user.id || '',
        `"${user.name}"`,
        `"${user.email}"`,
        user.age || '',
        user.gender || '',
        user.isActive ? 'Active' : 'Inactive',
        user.createdAt || ''
      ];
      csvRows.push(row.join(','));
    });
    
    return csvRows.join('\n');
  }

  private downloadCSV(csvData: string, filename: string): void {
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  private downloadJSON(jsonData: string, filename: string): void {
    const blob = new Blob([jsonData], { type: 'application/json;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  /**
   * User action methods
   */
  onViewUser(user: User): void {
    this.selectedUser = user;
    this.modalMode = 'view';
    this.showUserModal = true;
    this.notificationService.showInfo(`Viewing details for: ${user.name}`);
  }

  onEditUser(user: User): void {
    this.selectedUser = user;
    this.formData = {
      name: user.name,
      email: user.email,
      age: user.age,
      gender: user.gender
    };
    this.modalMode = 'edit';
    this.showUserModal = true;
    this.notificationService.showInfo(`Editing user: ${user.name}`);
  }

  closeModal(): void {
    this.showUserModal = false;
    this.selectedUser = null;
    this.modalMode = 'view';
  }

  async onUpdateUser(): Promise<void> {
    if (this.selectedUser?.id) {
      try {
        // Validation de gender
        if (!this.formData.gender) {
          this.notificationService.showError('Please select a gender');
          return;
        }

        const updatedUser: User = {
          ...this.selectedUser,
          name: this.formData.name,
          email: this.formData.email,
          age: this.formData.age,
          gender: this.formData.gender as Gender,
          updatedAt: new Date()
        };
        
        await this.userStore.updateUser(this.selectedUser.id, updatedUser);
        this.notificationService.showSuccess('User updated successfully!');
        this.closeModal();
        this.clearForm();
      } catch (error) {
        this.notificationService.showError('Failed to update user');
        console.error('Failed to update user', error);
      }
    }
  }

  async onDeleteUser(user: User): Promise<void> {
    if (confirm(`Are you sure you want to delete "${user.name}"?`)) {
      if (user.id) {
        try {
          await this.userStore.deleteUser(user.id);
          this.notificationService.showSuccess('User deleted successfully!');
        } catch (error) {
          this.notificationService.showError('Failed to delete user');
          console.error('Failed to delete user', error);
        }
      }
    }
  }
}

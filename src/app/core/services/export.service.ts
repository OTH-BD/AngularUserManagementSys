import { Injectable, inject } from '@angular/core';
import { User, UserStatistics } from '../models/user.model';
import { NotificationService } from './notification.service';
import * as XLSX from 'xlsx';

/**
 * Export format options
 */
export type ExportFormat = 'excel' | 'csv' | 'json' | 'pdf';

/**
 * Export configuration interface
 */
export interface ExportConfig {
  filename?: string;
  includeStatistics?: boolean;
  dateFormat?: string;
  columns?: (keyof User)[];
}

/**
 * Professional export service for user data
 * Handles multiple export formats with proper error handling
 */
@Injectable({
  providedIn: 'root'
})
export class ExportService {
  private readonly notificationService = inject(NotificationService);

  /**
   * Export users to Excel format with advanced formatting
   * @param users - Users data to export
   * @param statistics - Optional statistics data
   * @param config - Export configuration
   */
  async exportToExcel(
    users: User[], 
    statistics?: UserStatistics, 
    config: ExportConfig = {}
  ): Promise<void> {
    try {
      if (users.length === 0) {
        this.notificationService.showWarning('No users available to export');
        return;
      }

      const workbook = XLSX.utils.book_new();
      
      // Main data sheet
      this.createUserDataSheet(workbook, users, config);
      
      // Statistics sheet if provided
      if (statistics && config.includeStatistics) {
        this.createStatisticsSheet(workbook, statistics, users);
      }

      // Generate filename
      const filename = this.generateFilename('excel', config.filename);
      
      // Write and download file
      XLSX.writeFile(workbook, filename);
      
      this.notificationService.showSuccess(
        `Excel report generated successfully!\nFile: ${filename}\nTotal users: ${users.length}`
      );

    } catch (error) {
      console.error('Excel export error:', error);
      this.notificationService.showError('Failed to generate Excel report');
      throw error;
    }
  }

  /**
   * Export users to CSV format
   * @param users - Users data to export
   * @param config - Export configuration
   */
  async exportToCsv(users: User[], config: ExportConfig = {}): Promise<void> {
    try {
      if (users.length === 0) {
        this.notificationService.showWarning('No users available to export');
        return;
      }

      const csvContent = this.convertToCsv(users, config);
      const filename = this.generateFilename('csv', config.filename);
      
      this.downloadFile(csvContent, filename, 'text/csv');
      
      this.notificationService.showSuccess(`CSV export completed: ${filename}`);

    } catch (error) {
      console.error('CSV export error:', error);
      this.notificationService.showError('Failed to generate CSV file');
      throw error;
    }
  }

  /**
   * Export users to JSON format
   * @param users - Users data to export
   * @param config - Export configuration
   */
  async exportToJson(users: User[], config: ExportConfig = {}): Promise<void> {
    try {
      if (users.length === 0) {
        this.notificationService.showWarning('No users available to export');
        return;
      }

      const jsonContent = JSON.stringify(
        {
          exportDate: new Date().toISOString(),
          totalUsers: users.length,
          users: users
        }, 
        null, 
        2
      );
      
      const filename = this.generateFilename('json', config.filename);
      
      this.downloadFile(jsonContent, filename, 'application/json');
      
      this.notificationService.showSuccess(`JSON export completed: ${filename}`);

    } catch (error) {
      console.error('JSON export error:', error);
      this.notificationService.showError('Failed to generate JSON file');
      throw error;
    }
  }

  /**
   * Create main user data sheet for Excel
   * @param workbook - Excel workbook
   * @param users - Users data
   * @param config - Export configuration
   */
  private createUserDataSheet(
    workbook: XLSX.WorkBook, 
    users: User[], 
    config: ExportConfig
  ): void {
    // Define columns to export
    const columns = config.columns || ['id', 'name', 'email', 'age', 'gender', 'createdAt'];
    
    // Create headers
    const headers = columns.map(col => {
      const headerMap: Record<string, string> = {
        id: 'ID',
        name: 'Full Name',
        email: 'Email Address',
        age: 'Age',
        gender: 'Gender',
        createdAt: 'Created Date',
        updatedAt: 'Last Updated',
        isActive: 'Status'
      };
      return headerMap[col] || col.toString();
    });

    // Create data rows
    const data = [
      headers,
      ...users.map(user => columns.map(col => {
        const value = user[col];
        
        // Format specific columns
        if (col === 'gender') {
          return typeof value === 'string' 
            ? value.charAt(0).toUpperCase() + value.slice(1) 
            : value;
        }
        
        if (col === 'createdAt' || col === 'updatedAt') {
          return value instanceof Date 
            ? value.toLocaleDateString(config.dateFormat || 'en-US') 
            : value;
        }
        
        if (col === 'isActive') {
          return value ? 'Active' : 'Inactive';
        }
        
        return value;
      }))
    ];

    // Create worksheet
    const worksheet = XLSX.utils.aoa_to_sheet(data);
    
    // Set column widths
    const columnWidths = columns.map(col => {
      const widthMap: Record<string, number> = {
        id: 8,
        name: 25,
        email: 30,
        age: 8,
        gender: 12,
        createdAt: 15,
        updatedAt: 15,
        isActive: 12
      };
      return { wch: widthMap[col] || 15 };
    });
    
    worksheet['!cols'] = columnWidths;
    worksheet['!autofilter'] = { ref: `A1:${XLSX.utils.encode_col(columns.length - 1)}${users.length + 1}` };

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Users');
  }

  /**
   * Create statistics sheet for Excel
   * @param workbook - Excel workbook
   * @param statistics - Statistics data
   * @param users - Original users data
   */
  private createStatisticsSheet(
    workbook: XLSX.WorkBook, 
    statistics: UserStatistics, 
    users: User[]
  ): void {
    const statsData = [
      ['📊 USER MANAGEMENT STATISTICS', '', ''],
      [''],
      ['Report Generated:', new Date().toLocaleString()],
      ['Total Users:', statistics.total],
      [''],
      ['👥 GENDER DISTRIBUTION', '', ''],
      ['Male Users:', statistics.maleCount],
      ['Female Users:', statistics.femaleCount],
      ['Other:', statistics.otherCount],
      [''],
      ['📅 AGE ANALYSIS', '', ''],
      ['Average Age:', statistics.averageAge],
      ['Youngest User:', statistics.ageRange.min],
      ['Oldest User:', statistics.ageRange.max],
      [''],
      ['📈 ADDITIONAL METRICS', '', ''],
      ['Active Users:', users.filter(u => u.isActive).length],
      ['Recently Created (Last 30 days):', this.getRecentUsersCount(users, 30)]
    ];

    const statsWorksheet = XLSX.utils.aoa_to_sheet(statsData);
    statsWorksheet['!cols'] = [{ wch: 30 }, { wch: 20 }, { wch: 15 }];
    
    XLSX.utils.book_append_sheet(workbook, statsWorksheet, 'Statistics');
  }

  /**
   * Convert users to CSV format
   * @param users - Users data
   * @param config - Export configuration
   * @returns CSV content string
   */
  private convertToCsv(users: User[], config: ExportConfig): string {
    const columns = config.columns || ['id', 'name', 'email', 'age', 'gender'];
    const headers = columns.map(col => col.toString()).join(',');
    
    const rows = users.map(user => 
      columns.map(col => {
        const value = user[col];
        // Wrap strings in quotes and escape internal quotes
        if (typeof value === 'string') {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      }).join(',')
    );
    
    return [headers, ...rows].join('\n');
  }

  /**
   * Generate filename with timestamp
   * @param format - Export format
   * @param customName - Custom filename
   * @returns Generated filename
   */
  private generateFilename(format: string, customName?: string): string {
    const timestamp = new Date().toISOString().split('T')[0];
    const baseName = customName || 'users_export';
    return `${baseName}_${timestamp}.${format === 'excel' ? 'xlsx' : format}`;
  }

  /**
   * Download file to user's device
   * @param content - File content
   * @param filename - File name
   * @param mimeType - MIME type
   */
  private downloadFile(content: string, filename: string, mimeType: string): void {
    const blob = new Blob([content], { type: mimeType });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }

  /**
   * Get count of recently created users
   * @param users - Users array
   * @param days - Number of days to consider as "recent"
   * @returns Count of recent users
   */
  private getRecentUsersCount(users: User[], days: number): number {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    return users.filter(user => 
      user.createdAt && new Date(user.createdAt) > cutoffDate
    ).length;
  }
}

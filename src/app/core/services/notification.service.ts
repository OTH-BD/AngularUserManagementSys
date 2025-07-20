import { Injectable } from '@angular/core';

/**
 * Notification types for different message styles
 */
export type NotificationType = 'success' | 'error' | 'warning' | 'info';

/**
 * Notification message interface
 */
export interface NotificationMessage {
  type: NotificationType;
  title: string;
  message: string;
  timestamp: Date;
  id: string;
}

/**
 * Professional notification service
 * In a real application, this would integrate with a toast library like ngx-toastr
 */
@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  /**
   * Show success notification
   * @param message - Success message
   * @param title - Optional title
   */
  showSuccess(message: string, title = 'Success!'): void {
    this.show('success', title, message);
  }

  /**
   * Show error notification
   * @param message - Error message
   * @param title - Optional title
   */
  showError(message: string, title = 'Error!'): void {
    this.show('error', title, message);
  }

  /**
   * Show warning notification
   * @param message - Warning message
   * @param title - Optional title
   */
  showWarning(message: string, title = 'Warning!'): void {
    this.show('warning', title, message);
  }

  /**
   * Show info notification
   * @param message - Info message
   * @param title - Optional title
   */
  showInfo(message: string, title = 'Information'): void {
    this.show('info', title, message);
  }

  /**
   * Generic notification method
   * @param type - Notification type
   * @param title - Notification title
   * @param message - Notification message
   */
  private show(type: NotificationType, title: string, message: string): void {
    const icons = {
      success: '✅',
      error: '❌',
      warning: '⚠️',
      info: 'ℹ️'
    };

    // For now, use browser alert
    // In production, replace with proper toast notification
    const notification = `${icons[type]} ${title}\n\n${message}`;
    
    // Also log to console for development
    console.log(`[${type.toUpperCase()}]`, title, '-', message);
    
    // Show alert (replace with toast in production)
    alert(notification);
    
    // In a real app, you might want to:
    // - Store notifications in a service for display in a toast component
    // - Send to logging service
    // - Show in a notification center
  }
}

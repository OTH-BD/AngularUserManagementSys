import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

export interface ConfirmationOptions {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
}

export interface ConfirmationResult {
  confirmed: boolean;
}

/**
 * Professional confirmation service
 * Provides a consistent way to handle user confirmations
 */
@Injectable({
  providedIn: 'root'
})
export class ConfirmationService {
  private readonly confirmationSubject = new Subject<{
    options: ConfirmationOptions;
    callback: (result: boolean) => void;
  }>();

  /**
   * Observable for confirmation requests
   */
  readonly confirmation$ = this.confirmationSubject.asObservable();

  /**
   * Show confirmation dialog
   * @param options - Confirmation options
   * @returns Promise that resolves when user responds
   */
  async confirm(options: ConfirmationOptions): Promise<boolean> {
    return new Promise((resolve) => {
      // For now, use native confirm but structured
      const fullMessage = options.title 
        ? `${options.title}\n\n${options.message}`
        : options.message;
      
      const result = confirm(fullMessage);
      resolve(result);
    });
  }

  /**
   * Confirm deletion with standardized message
   * @param itemName - Name of the item to delete
   * @param itemType - Type of the item (user, project, etc.)
   * @returns Promise that resolves when user responds
   */
  async confirmDeletion(itemName: string, itemType: string = 'item'): Promise<boolean> {
    return this.confirm({
      title: `Delete ${itemType}`,
      message: `Are you sure you want to delete "${itemName}"?\n\nThis action cannot be undone.`,
      type: 'danger'
    });
  }

  /**
   * Confirm unsaved changes
   * @returns Promise that resolves when user responds
   */
  async confirmUnsavedChanges(): Promise<boolean> {
    return this.confirm({
      title: 'Unsaved Changes',
      message: 'You have unsaved changes that will be lost.\n\nDo you want to continue?',
      type: 'warning'
    });
  }
}

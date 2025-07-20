import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { NotificationService } from './notification.service';
import { APP_CONSTANTS } from '../constants/app.constants';

export interface ErrorContext {
  operation: string;
  details?: any;
  userMessage?: string;
}

/**
 * Professional error handling service
 * Centralizes error processing and user feedback
 */
@Injectable({
  providedIn: 'root'
})
export class ErrorHandlerService {
  constructor(private readonly notificationService: NotificationService) {}

  /**
   * Handle HTTP errors with appropriate user feedback
   * @param error - The error to handle
   * @param context - Additional context about the error
   */
  handleError(error: any, context: ErrorContext): void {
    console.error(`Error in ${context.operation}:`, error, context.details);

    let userMessage = context.userMessage || APP_CONSTANTS.ERRORS.GENERIC;

    if (error instanceof HttpErrorResponse) {
      userMessage = this.getHttpErrorMessage(error, context);
    } else if (error instanceof Error) {
      userMessage = this.getGenericErrorMessage(error, context);
    }

    this.notificationService.showError(userMessage);
  }

  /**
   * Handle HTTP-specific errors
   * @param error - HTTP error response
   * @param context - Error context
   * @returns User-friendly error message
   */
  private getHttpErrorMessage(error: HttpErrorResponse, context: ErrorContext): string {
    switch (error.status) {
      case 0:
        return 'Network connection failed. Please check your internet connection.';
      case 400:
        return 'Invalid request. Please check your input and try again.';
      case 401:
        return 'Authentication required. Please log in and try again.';
      case 403:
        return 'You do not have permission to perform this action.';
      case 404:
        return 'The requested resource was not found.';
      case 409:
        return 'Conflict detected. The resource may have been modified by another user.';
      case 422:
        return 'Validation failed. Please check your input data.';
      case 500:
        return 'Server error occurred. Please try again later.';
      case 503:
        return 'Service temporarily unavailable. Please try again later.';
      default:
        return context.userMessage || `Request failed with status ${error.status}. Please try again.`;
    }
  }

  /**
   * Handle generic errors
   * @param error - Generic error
   * @param context - Error context
   * @returns User-friendly error message
   */
  private getGenericErrorMessage(error: Error, context: ErrorContext): string {
    if (error.message.toLowerCase().includes('network')) {
      return 'Network error occurred. Please check your connection.';
    }

    if (error.message.toLowerCase().includes('timeout')) {
      return 'Request timed out. Please try again.';
    }

    return context.userMessage || APP_CONSTANTS.ERRORS.GENERIC;
  }

  /**
   * Log error for debugging purposes
   * @param error - The error to log
   * @param context - Additional context
   */
  logError(error: any, context: ErrorContext): void {
    const errorInfo = {
      timestamp: new Date().toISOString(),
      operation: context.operation,
      error: error instanceof Error ? {
        name: error.name,
        message: error.message,
        stack: error.stack
      } : error,
      context: context.details,
      userAgent: navigator.userAgent,
      url: window.location.href
    };

    console.error('Application Error:', errorInfo);

    // In production, this could send to logging service
    // this.loggingService.logError(errorInfo);
  }
}

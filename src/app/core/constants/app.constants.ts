/**
 * Application constants
 * Centralized location for all application constants
 */
export const APP_CONSTANTS = {
  // Application metadata
  APP: {
    NAME: 'User Management System',
    VERSION: '1.0.0',
    DESCRIPTION: 'Professional Angular Architecture'
  },

  // Messages
  MESSAGES: {
    WELCOME: 'Welcome to User Management System!\nProfessional Angular architecture with signals.',
    USER_CREATED: (name: string, id: string) => `User "${name}" created successfully!\nID: ${id}`,
    USER_UPDATED: (name: string) => `User "${name}" updated successfully!\nModifications saved.`,
    USER_DELETED: (name: string) => `User "${name}" deleted successfully!\nUser removed from system.`,
    EDIT_CANCELLED: 'Edit cancelled',
    EDITING_USER: (name: string) => `✏️ Editing user: ${name}\nMake your changes and click Update.`,
    DATA_REFRESHED: 'Users data refreshed',
    UNSAVED_CHANGES: 'You have unsaved changes. Are you sure you want to leave?'
  },

  // Error messages
  ERRORS: {
    LOAD_USERS: 'Failed to load users. Please refresh the page.',
    CREATE_USER: 'Failed to create user. Please try again.',
    UPDATE_USER: 'Failed to update user. Please try again.',
    DELETE_USER: 'Failed to delete user. Please try again.',
    EXPORT_EXCEL: 'Failed to export users. Please try again.',
    EXPORT_CSV: 'Failed to export CSV. Please try again.',
    EXPORT_JSON: 'Failed to export JSON. Please try again.',
    GENERIC: 'An unexpected error occurred. Please try again.'
  },

  // UI
  UI: {
    LOADING_TEXT: 'Loading users...',
    SCROLL_DELAY: 100
  },

  // Export settings
  EXPORT: {
    DEFAULT_FILENAME: 'user_management_report',
    DATE_FORMAT: 'en-US'
  }
} as const;

/**
 * Type-safe access to constants
 */
export type AppConstants = typeof APP_CONSTANTS;

/**
 * Development environment configuration
 * Contains settings optimized for development and debugging
 */
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3002',
  appName: 'User Management System',
  version: '1.0.0',
  apiTimeout: 10000,
  retryAttempts: 3,
  
  // Feature flags for development
  features: {
    enableLogging: true,
    enableDebugMode: true,
    maxRetryAttempts: 3,
    enableNotifications: true,
    enableAnalytics: false,
    enableMockData: true,
    enableErrorReporting: false
  },
  
  // Development-specific settings
  logging: {
    level: 'debug' as const,
    enableConsoleLogging: true,
    enableNetworkLogging: true
  },
  
  // API configuration
  api: {
    baseUrl: 'http://localhost:3000',
    endpoints: {
      users: '/users',
      auth: '/auth',
      export: '/export',
      statistics: '/statistics'
    },
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  },
  
  // UI configuration
  ui: {
    theme: 'light' as const,
    language: 'en',
    pageSize: 10,
    animationDuration: 300
  },
  
  // Security settings (relaxed for development)
  security: {
    enableCsrf: false,
    enableCors: true,
    maxFileUploadSize: 10 * 1024 * 1024, // 10MB
    allowedFileTypes: ['image/jpeg', 'image/png', 'image/webp']
  }
};

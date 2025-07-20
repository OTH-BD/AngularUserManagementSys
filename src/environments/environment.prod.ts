/**
 * Production environment configuration
 * Contains optimized settings for production deployment
 */
export const environment = {
  production: true,
  apiUrl: 'https://api.yourdomain.com',
  appName: 'User Management System',
  version: '1.0.0',
  apiTimeout: 5000,
  retryAttempts: 2,
  
  // Feature flags for production
  features: {
    enableLogging: false,
    enableDebugMode: false,
    maxRetryAttempts: 2,
    enableNotifications: true,
    enableAnalytics: true,
    enableMockData: false,
    enableErrorReporting: true
  },
  
  // Production logging settings
  logging: {
    level: 'error' as const,
    enableConsoleLogging: false,
    enableNetworkLogging: false
  },
  
  // API configuration
  api: {
    baseUrl: 'https://api.yourdomain.com',
    endpoints: {
      users: '/api/v1/users',
      auth: '/api/v1/auth',
      export: '/api/v1/export',
      statistics: '/api/v1/statistics'
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
    pageSize: 20,
    animationDuration: 200
  },
  
  // Security settings (strict for production)
  security: {
    enableCsrf: true,
    enableCors: false,
    maxFileUploadSize: 5 * 1024 * 1024, // 5MB
    allowedFileTypes: ['image/jpeg', 'image/png']
  }
};

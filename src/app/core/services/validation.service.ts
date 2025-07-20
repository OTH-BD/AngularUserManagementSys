import { Injectable } from '@angular/core';
import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/**
 * Validation result interface
 */
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings?: string[];
}

/**
 * Field validation configuration
 */
export interface FieldValidationConfig {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  customValidator?: (value: any) => ValidationResult;
}

/**
 * Professional validation service for user forms and data
 * Provides comprehensive validation with detailed error messages
 */
@Injectable({
  providedIn: 'root'
})
export class ValidationService {
  
  // Common validation patterns
  private readonly patterns = {
    email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    name: /^[a-zA-Z\s'-]{2,50}$/,
    strongPassword: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
    phone: /^\+?[\d\s-()]{10,}$/
  };

  // Error messages in multiple languages
  private readonly errorMessages = {
    required: 'This field is required',
    email: 'Please enter a valid email address',
    minlength: 'Minimum length is {minLength} characters',
    maxlength: 'Maximum length is {maxLength} characters',
    min: 'Value must be at least {min}',
    max: 'Value must not exceed {max}',
    pattern: 'Invalid format',
    name: 'Name should contain only letters, spaces, hyphens, and apostrophes',
    age: 'Age must be between 1 and 150',
    strongPassword: 'Password must contain uppercase, lowercase, number, and special character',
    phone: 'Please enter a valid phone number',
    duplicate: 'This value already exists',
    custom: 'Invalid value'
  };

  /**
   * Validate user name
   * @param name - Name to validate
   * @returns Validation result
   */
  validateName(name: string): ValidationResult {
    const errors: string[] = [];
    
    if (!name || name.trim().length === 0) {
      errors.push(this.errorMessages.required);
    } else if (name.trim().length < 2) {
      errors.push(this.errorMessages.minlength.replace('{minLength}', '2'));
    } else if (name.trim().length > 50) {
      errors.push(this.errorMessages.maxlength.replace('{maxLength}', '50'));
    } else if (!this.patterns.name.test(name.trim())) {
      errors.push(this.errorMessages.name);
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate email address
   * @param email - Email to validate
   * @returns Validation result
   */
  validateEmail(email: string): ValidationResult {
    const errors: string[] = [];
    
    if (!email || email.trim().length === 0) {
      errors.push(this.errorMessages.required);
    } else if (!this.patterns.email.test(email.trim().toLowerCase())) {
      errors.push(this.errorMessages.email);
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate age
   * @param age - Age to validate
   * @returns Validation result
   */
  validateAge(age: number): ValidationResult {
    const errors: string[] = [];
    
    if (age === null || age === undefined) {
      errors.push(this.errorMessages.required);
    } else if (age < 1 || age > 150) {
      errors.push(this.errorMessages.age);
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate gender selection
   * @param gender - Gender to validate
   * @returns Validation result
   */
  validateGender(gender: string): ValidationResult {
    const errors: string[] = [];
    const validGenders = ['male', 'female', 'other'];
    
    if (!gender || gender.trim().length === 0) {
      errors.push(this.errorMessages.required);
    } else if (!validGenders.includes(gender.toLowerCase())) {
      errors.push('Please select a valid gender option');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate complete user form data
   * @param formData - Form data to validate
   * @returns Comprehensive validation result
   */
  validateUserForm(formData: any): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    // Name validation
    const nameResult = this.validateName(formData.name);
    errors.push(...nameResult.errors);
    
    // Email validation
    const emailResult = this.validateEmail(formData.email);
    errors.push(...emailResult.errors);
    
    // Age validation
    const ageResult = this.validateAge(formData.age);
    errors.push(...ageResult.errors);
    
    // Gender validation
    const genderResult = this.validateGender(formData.gender);
    errors.push(...genderResult.errors);
    
    // Additional business logic validations
    if (formData.age && formData.age < 18) {
      warnings.push('User is under 18 years old');
    }
    
    if (formData.email && formData.email.includes('+')) {
      warnings.push('Email contains plus sign - verify this is correct');
    }
    
    return {
      isValid: errors.length === 0,
      errors: [...new Set(errors)], // Remove duplicates
      warnings: [...new Set(warnings)]
    };
  }

  /**
   * Custom Angular validator for name field
   * @returns Validator function
   */
  nameValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null; // Let required validator handle empty values
      }
      
      const result = this.validateName(control.value);
      return result.isValid ? null : { invalidName: { message: result.errors[0] } };
    };
  }

  /**
   * Custom Angular validator for email field
   * @returns Validator function
   */
  emailValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null;
      }
      
      const result = this.validateEmail(control.value);
      return result.isValid ? null : { invalidEmail: { message: result.errors[0] } };
    };
  }

  /**
   * Custom Angular validator for age field
   * @returns Validator function
   */
  ageValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null;
      }
      
      const result = this.validateAge(control.value);
      return result.isValid ? null : { invalidAge: { message: result.errors[0] } };
    };
  }

  /**
   * Async validator for email uniqueness (example)
   * @param existingEmails - Array of existing emails to check against
   * @returns Async validator function
   */
  emailUniquenessValidator(existingEmails: string[]): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null;
      }
      
      const emailExists = existingEmails.some(
        email => email.toLowerCase() === control.value.toLowerCase()
      );
      
      return emailExists 
        ? { emailNotUnique: { message: 'This email address is already in use' } }
        : null;
    };
  }

  /**
   * Get user-friendly error message from validation errors
   * @param errors - Angular validation errors
   * @returns User-friendly error message
   */
  getErrorMessage(errors: ValidationErrors): string {
    if (errors['required']) {
      return this.errorMessages.required;
    }
    
    if (errors['email']) {
      return this.errorMessages.email;
    }
    
    if (errors['minlength']) {
      const requiredLength = errors['minlength'].requiredLength;
      return this.errorMessages.minlength.replace('{minLength}', requiredLength);
    }
    
    if (errors['maxlength']) {
      const requiredLength = errors['maxlength'].requiredLength;
      return this.errorMessages.maxlength.replace('{maxLength}', requiredLength);
    }
    
    if (errors['min']) {
      const min = errors['min'].min;
      return this.errorMessages.min.replace('{min}', min);
    }
    
    if (errors['max']) {
      const max = errors['max'].max;
      return this.errorMessages.max.replace('{max}', max);
    }
    
    if (errors['pattern']) {
      return this.errorMessages.pattern;
    }
    
    if (errors['invalidName']) {
      return errors['invalidName'].message;
    }
    
    if (errors['invalidEmail']) {
      return errors['invalidEmail'].message;
    }
    
    if (errors['invalidAge']) {
      return errors['invalidAge'].message;
    }
    
    if (errors['emailNotUnique']) {
      return errors['emailNotUnique'].message;
    }
    
    // Default message for unknown errors
    return 'Invalid input';
  }

  /**
   * Sanitize user input to prevent XSS and other security issues
   * @param input - Raw user input
   * @returns Sanitized input
   */
  sanitizeInput(input: string): string {
    if (!input) return '';
    
    return input
      .trim()
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<[^>]+>/g, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '');
  }

  /**
   * Validate file upload (for profile pictures, etc.)
   * @param file - File to validate
   * @param maxSizeMB - Maximum file size in MB
   * @param allowedTypes - Allowed MIME types
   * @returns Validation result
   */
  validateFile(
    file: File, 
    maxSizeMB: number = 5, 
    allowedTypes: string[] = ['image/jpeg', 'image/png', 'image/webp']
  ): ValidationResult {
    const errors: string[] = [];
    
    if (!file) {
      errors.push('No file selected');
      return { isValid: false, errors };
    }
    
    // Check file size
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      errors.push(`File size must be less than ${maxSizeMB}MB`);
    }
    
    // Check file type
    if (!allowedTypes.includes(file.type)) {
      errors.push(`File type not allowed. Allowed types: ${allowedTypes.join(', ')}`);
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

import { Component, inject, output } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { User, UserFormData } from '../../../core/models/user.model';
import { ValidationService } from '../../../core/services/validation.service';

/**
 * User form component for creating and editing users
 * Handles form validation and user input
 */
@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <!-- User Form Card -->
    <div class="card shadow-lg border-0 mb-4" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
      <div class="card-header bg-transparent border-0 text-white">
        <h4 class="mb-0 text-center">
          <i class="bi bi-person-plus-fill me-2"></i>
          {{ isEditing ? 'Edit User' : 'Add New User' }}
        </h4>
      </div>
      <div class="card-body">
        <form [formGroup]="userForm" (ngSubmit)="onSubmit()" class="needs-validation" novalidate>
          <div class="row">
            <!-- Name Field -->
            <div class="col-md-6 mb-3">
              <label for="name" class="form-label text-white fw-bold">
                <i class="bi bi-person-fill me-2"></i>Full Name *
              </label>
              <input
                type="text"
                id="name"
                class="form-control form-control-lg"
                [class.is-invalid]="userForm.get('name')?.invalid && userForm.get('name')?.touched"
                [class.is-valid]="userForm.get('name')?.valid && userForm.get('name')?.touched"
                formControlName="name"
                placeholder="Enter full name"
              />
              @if (userForm.get('name')?.invalid && userForm.get('name')?.touched) {
                <div class="invalid-feedback">
                  {{ getFieldError('name') }}
                </div>
              }
            </div>

            <!-- Email Field -->
            <div class="col-md-6 mb-3">
              <label for="email" class="form-label text-white fw-bold">
                <i class="bi bi-envelope-fill me-2"></i>Email Address *
              </label>
              <input
                type="email"
                id="email"
                class="form-control form-control-lg"
                [class.is-invalid]="userForm.get('email')?.invalid && userForm.get('email')?.touched"
                [class.is-valid]="userForm.get('email')?.valid && userForm.get('email')?.touched"
                formControlName="email"
                placeholder="Enter email address"
              />
              @if (userForm.get('email')?.invalid && userForm.get('email')?.touched) {
                <div class="invalid-feedback">
                  {{ getFieldError('email') }}
                </div>
              }
            </div>
          </div>

          <div class="row">
            <!-- Age Field -->
            <div class="col-md-6 mb-3">
              <label for="age" class="form-label text-white fw-bold">
                <i class="bi bi-calendar-fill me-2"></i>Age *
              </label>
              <input
                type="number"
                id="age"
                class="form-control form-control-lg"
                [class.is-invalid]="userForm.get('age')?.invalid && userForm.get('age')?.touched"
                [class.is-valid]="userForm.get('age')?.valid && userForm.get('age')?.touched"
                formControlName="age"
                placeholder="Enter age"
                min="1"
                max="150"
              />
              @if (userForm.get('age')?.invalid && userForm.get('age')?.touched) {
                <div class="invalid-feedback">
                  {{ getFieldError('age') }}
                </div>
              }
            </div>

            <!-- Gender Field -->
            <div class="col-md-6 mb-3">
              <label for="gender" class="form-label text-white fw-bold">
                <i class="bi bi-gender-ambiguous me-2"></i>Gender *
              </label>
              <select
                id="gender"
                class="form-select form-select-lg"
                [class.is-invalid]="userForm.get('gender')?.invalid && userForm.get('gender')?.touched"
                [class.is-valid]="userForm.get('gender')?.valid && userForm.get('gender')?.touched"
                formControlName="gender"
              >
                <option value="">Select Gender</option>
                <option value="male">
                  <i class="bi bi-person-fill"></i> Male
                </option>
                <option value="female">
                  <i class="bi bi-person-fill"></i> Female
                </option>
                <option value="other">
                  <i class="bi bi-person-fill"></i> Other
                </option>
              </select>
              @if (userForm.get('gender')?.invalid && userForm.get('gender')?.touched) {
                <div class="invalid-feedback">
                  {{ getFieldError('gender') }}
                </div>
              }
            </div>
          </div>

          <!-- Form Actions -->
          <div class="d-grid gap-2 d-md-flex justify-content-md-end mt-4">
            @if (isEditing) {
              <button
                type="button"
                class="btn btn-light btn-lg me-md-2"
                (click)="onCancel()"
              >
                <i class="bi bi-x-circle me-2"></i>Cancel
              </button>
            }
            <button
              type="button"
              class="btn btn-light btn-lg me-md-2"
              (click)="onReset()"
              [disabled]="userForm.pristine"
            >
              <i class="bi bi-arrow-clockwise me-2"></i>Reset
            </button>
            <button
              type="submit"
              class="btn btn-success btn-lg"
              [disabled]="userForm.invalid || isSubmitting"
            >
              @if (isSubmitting) {
                <span class="spinner-border spinner-border-sm me-2" aria-hidden="true"></span>
              }
              <i class="bi bi-{{ isEditing ? 'check-circle' : 'person-plus' }} me-2"></i>
              {{ isEditing ? 'Update User' : 'Add User' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .card {
      transition: all 0.3s ease;
      border-radius: 15px;
    }

    .card:hover {
      transform: translateY(-5px);
      box-shadow: 0 20px 40px rgba(0,0,0,0.2) !important;
    }

    .form-control, .form-select {
      border: none;
      border-radius: 10px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      transition: all 0.3s ease;
    }

    .form-control:focus, .form-select:focus {
      border-color: #fff;
      box-shadow: 0 0 0 0.25rem rgba(255, 255, 255, 0.25);
      transform: translateY(-2px);
    }

    .btn {
      border-radius: 10px;
      transition: all 0.3s ease;
      font-weight: 600;
    }

    .btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 5px 15px rgba(0,0,0,0.2);
    }

    .invalid-feedback {
      display: block;
      font-weight: 500;
    }

    .spinner-border-sm {
      width: 1rem;
      height: 1rem;
    }
  `]
})
export class UserFormComponent {
  private readonly fb = inject(FormBuilder);
  private readonly validationService = inject(ValidationService);

  // Outputs
  readonly userSubmit = output<UserFormData>();
  readonly userUpdate = output<{ id: number; data: UserFormData }>();
  readonly formCancel = output<void>();

  // Form state
  userForm: FormGroup;
  isEditing = false;
  isSubmitting = false;
  editingUserId?: number;

  constructor() {
    this.userForm = this.createForm();
  }

  /**
   * Create reactive form with validation
   */
  private createForm(): FormGroup {
    return this.fb.group({
      name: ['', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(50),
        this.validationService.nameValidator()
      ]],
      email: ['', [
        Validators.required,
        Validators.email,
        this.validationService.emailValidator()
      ]],
      age: ['', [
        Validators.required,
        Validators.min(1),
        Validators.max(150),
        this.validationService.ageValidator()
      ]],
      gender: ['', [Validators.required]]
    });
  }

  /**
   * Set form for editing mode
   * @param user - User to edit
   */
  setEditMode(user: User): void {
    this.isEditing = true;
    this.editingUserId = user.id;
    
    this.userForm.patchValue({
      name: user.name,
      email: user.email,
      age: user.age,
      gender: user.gender
    });
  }

  /**
   * Set form for create mode
   */
  setCreateMode(): void {
    this.isEditing = false;
    this.editingUserId = undefined;
    this.userForm.reset();
  }

  /**
   * Handle form submission
   */
  onSubmit(): void {
    if (this.userForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    this.isSubmitting = true;
    const formData = this.userForm.value as UserFormData;

    // Emit appropriate event based on mode
    if (this.isEditing && this.editingUserId) {
      this.userUpdate.emit({ id: this.editingUserId, data: formData });
    } else {
      this.userSubmit.emit(formData);
    }

    // Reset submission state after a delay
    setTimeout(() => {
      this.isSubmitting = false;
    }, 1000);
  }

  /**
   * Handle form reset
   */
  onReset(): void {
    this.userForm.reset();
  }

  /**
   * Handle form cancel (for edit mode)
   */
  onCancel(): void {
    this.setCreateMode();
    this.formCancel.emit();
  }

  /**
   * Get field error message
   * @param fieldName - Name of the form field
   * @returns Error message string
   */
  getFieldError(fieldName: string): string {
    const control = this.userForm.get(fieldName);
    if (control && control.errors && control.touched) {
      return this.validationService.getErrorMessage(control.errors);
    }
    return '';
  }

  /**
   * Mark all form fields as touched to show validation errors
   */
  private markFormGroupTouched(): void {
    Object.keys(this.userForm.controls).forEach(field => {
      const control = this.userForm.get(field);
      control?.markAsTouched({ onlySelf: true });
    });
  }

  /**
   * Check if form has unsaved changes
   * @returns True if form is dirty
   */
  hasUnsavedChanges(): boolean {
    return this.userForm.dirty;
  }

  /**
   * Reset form to pristine state
   */
  resetForm(): void {
    this.userForm.reset();
    this.setCreateMode();
  }
}

import { z } from 'zod';

// Password validation schema based on security requirements
export const passwordSchema = z.string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password must be less than 128 characters')
  .regex(/^(?=.*[a-z])/, 'Password must contain at least one lowercase letter')
  .regex(/^(?=.*[A-Z])/, 'Password must contain at least one uppercase letter')
  .regex(/^(?=.*\d)/, 'Password must contain at least one number')
  .regex(/^(?=.*[@$!%*?&])/, 'Password must contain at least one special character (@$!%*?&)');

// Parent registration schema
export const parentRegistrationSchema = z.object({
  email: z.string()
    .email('Please enter a valid email address')
    .max(255, 'Email must be less than 255 characters')
    .toLowerCase(),
  password: passwordSchema,
  confirmPassword: z.string(),
  displayName: z.string()
    .min(1, 'Display name is required')
    .max(50, 'Display name must be less than 50 characters')
    .trim(),
  termsAccepted: z.boolean()
    .refine((val: boolean) => val === true, 'You must accept the terms of service'),
  privacyPolicyAccepted: z.boolean()
    .refine((val: boolean) => val === true, 'You must accept the privacy policy'),
  marketingOptIn: z.boolean().optional(),
}).refine((data: any) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

// Parent login schema
export const parentLoginSchema = z.object({
  email: z.string()
    .email('Please enter a valid email address')
    .toLowerCase(),
  password: z.string()
    .min(1, 'Password is required'),
  rememberMe: z.boolean().optional(),
});

// Password reset schema
export const passwordResetSchema = z.object({
  email: z.string()
    .email('Please enter a valid email address')
    .toLowerCase(),
});

// New password schema (for password reset completion)
export const newPasswordSchema = z.object({
  password: passwordSchema,
  confirmPassword: z.string(),
}).refine((data: any) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

// Family creation schema
export const familyCreationSchema = z.object({
  familyName: z.string()
    .min(1, 'Family name is required')
    .max(50, 'Family name must be less than 50 characters')
    .trim(),
  familyDescription: z.string()
    .max(500, 'Family description must be less than 500 characters')
    .optional(),
  currency: z.string()
    .min(3, 'Currency code must be 3 characters')
    .max(3, 'Currency code must be 3 characters')
    .default('USD'),
  timezone: z.string()
    .min(1, 'Timezone is required')
    .default('America/New_York'),
});

// Child registration schema (invitation-based)
export const childRegistrationSchema = z.object({
  invitationCode: z.string()
    .length(8, 'Invitation code must be 8 characters')
    .regex(/^[A-Z0-9]+$/, 'Invalid invitation code format'),
  username: z.string()
    .min(3, 'Username must be at least 3 characters')
    .max(20, 'Username must be less than 20 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
  displayName: z.string()
    .min(1, 'Display name is required')
    .max(30, 'Display name must be less than 30 characters')
    .trim(),
  dateOfBirth: z.date()
    .refine((date: Date) => {
      const age = new Date().getFullYear() - date.getFullYear();
      return age >= 5 && age <= 17;
    }, 'Child must be between 5 and 17 years old'),
  avatar: z.string().optional(),
  pin: z.string()
    .length(4, 'PIN must be 4 digits')
    .regex(/^\d{4}$/, 'PIN must contain only numbers')
    .optional(),
});

// Profile update schema
export const profileUpdateSchema = z.object({
  displayName: z.string()
    .min(1, 'Display name is required')
    .max(50, 'Display name must be less than 50 characters')
    .trim(),
  avatar: z.string().optional(),
  timezone: z.string().optional(),
  phoneNumber: z.string()
    .regex(/^\+?[\d\s\-\(\)]+$/, 'Invalid phone number format')
    .optional(),
});

// Invitation creation schema
export const invitationSchema = z.object({
  invitationType: z.enum(['child', 'parent', 'guardian']),
  email: z.string().email().optional(),
  phoneNumber: z.string()
    .regex(/^\+?[\d\s\-\(\)]+$/, 'Invalid phone number format')
    .optional(),
  customMessage: z.string()
    .max(500, 'Custom message must be less than 500 characters')
    .optional(),
  expiryDays: z.number()
    .min(1, 'Expiry must be at least 1 day')
    .max(30, 'Expiry cannot exceed 30 days')
    .default(7),
  maxUses: z.number()
    .min(1, 'Max uses must be at least 1')
    .max(10, 'Max uses cannot exceed 10')
    .default(1),
});

// Type exports for TypeScript
export type ParentRegistrationData = z.infer<typeof parentRegistrationSchema>;
export type ParentLoginData = z.infer<typeof parentLoginSchema>;
export type PasswordResetData = z.infer<typeof passwordResetSchema>;
export type NewPasswordData = z.infer<typeof newPasswordSchema>;
export type FamilyCreationData = z.infer<typeof familyCreationSchema>;
export type ChildRegistrationData = z.infer<typeof childRegistrationSchema>;
export type ProfileUpdateData = z.infer<typeof profileUpdateSchema>;
export type InvitationData = z.infer<typeof invitationSchema>;

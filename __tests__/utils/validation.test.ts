import {
    childRegistrationSchema,
    familyCreationSchema,
    parentLoginSchema,
    parentRegistrationSchema,
    passwordResetSchema,
} from '../../utils/validation/schemas';

describe('Validation Schemas', () => {
  describe('parentRegistrationSchema', () => {
    const validData = {
      email: 'test@example.com',
      password: 'SecurePass123!',
      confirmPassword: 'SecurePass123!',
      displayName: 'John Doe',
      termsAccepted: true,
      privacyPolicyAccepted: true,
      marketingOptIn: false,
    };

    it('should validate correct parent registration data', () => {
      const result = parentRegistrationSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject invalid email', () => {
      const invalidData = { ...validData, email: 'invalid-email' };
      const result = parentRegistrationSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toContain('email');
      }
    });

    it('should reject weak password', () => {
      const invalidData = { 
        ...validData, 
        password: 'weak',
        confirmPassword: 'weak',
      };
      const result = parentRegistrationSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toContain('password');
      }
    });

    it('should reject mismatched passwords', () => {
      const invalidData = { 
        ...validData, 
        confirmPassword: 'DifferentPass123!',
      };
      const result = parentRegistrationSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('match');
      }
    });

    it('should reject if terms not accepted', () => {
      const invalidData = { ...validData, termsAccepted: false };
      const result = parentRegistrationSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toContain('termsAccepted');
      }
    });

    it('should reject if privacy policy not accepted', () => {
      const invalidData = { ...validData, privacyPolicyAccepted: false };
      const result = parentRegistrationSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toContain('privacyPolicyAccepted');
      }
    });

    it('should accept when marketing opt-in is true', () => {
      const validDataWithMarketing = { ...validData, marketingOptIn: true };
      const result = parentRegistrationSchema.safeParse(validDataWithMarketing);
      expect(result.success).toBe(true);
    });
  });

  describe('parentLoginSchema', () => {
    const validData = {
      email: 'test@example.com',
      password: 'password123',
    };

    it('should validate correct login data', () => {
      const result = parentLoginSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject invalid email', () => {
      const invalidData = { ...validData, email: 'invalid-email' };
      const result = parentLoginSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject empty password', () => {
      const invalidData = { ...validData, password: '' };
      const result = parentLoginSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject missing email', () => {
      const invalidData = { password: 'password123' };
      const result = parentLoginSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('passwordResetSchema', () => {
    it('should validate correct email', () => {
      const validData = { email: 'test@example.com' };
      const result = passwordResetSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject invalid email', () => {
      const invalidData = { email: 'invalid-email' };
      const result = passwordResetSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject empty email', () => {
      const invalidData = { email: '' };
      const result = passwordResetSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('familyCreationSchema', () => {
    const validData = {
      familyName: 'The Smith Family',
      familyDescription: 'A loving family',
    };

    it('should validate correct family data', () => {
      const result = familyCreationSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject empty family name', () => {
      const invalidData = { ...validData, familyName: '' };
      const result = familyCreationSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should accept family without description', () => {
      const validDataNoDesc = { familyName: 'The Smith Family' };
      const result = familyCreationSchema.safeParse(validDataNoDesc);
      expect(result.success).toBe(true);
    });

    it('should reject family name that is too long', () => {
      const invalidData = { 
        ...validData, 
        familyName: 'A'.repeat(101), // Assuming max length is 100
      };
      const result = familyCreationSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('childRegistrationSchema', () => {
    const validData = {
      invitationCode: 'ABC12345', // 8 characters, uppercase and numbers
      username: 'alice123',
      displayName: 'Alice',
      dateOfBirth: new Date('2015-01-01'), // 9 years old
      pin: '1234',
    };

    it('should validate correct child registration data', () => {
      const result = childRegistrationSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject child too young (under 5)', () => {
      const invalidData = { 
        ...validData, 
        dateOfBirth: new Date('2022-01-01'), // 2 years old
      };
      const result = childRegistrationSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject child too old (over 17)', () => {
      const invalidData = { 
        ...validData, 
        dateOfBirth: new Date('2000-01-01'), // 24 years old
      };
      const result = childRegistrationSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject invalid parent email', () => {
      const invalidData = { ...validData, invitationCode: 'invalid' }; // Wrong format
      const result = childRegistrationSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject invalid invitation code format', () => {
      const invalidData = { ...validData, invitationCode: 'abc123' }; // lowercase not allowed
      const result = childRegistrationSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject empty child name', () => {
      const invalidData = { ...validData, displayName: '' };
      const result = childRegistrationSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('Password strength validation', () => {
    const testCases = [
      { password: 'Password123!', expected: true, description: 'valid strong password' },
      { password: 'password123!', expected: false, description: 'no uppercase' },
      { password: 'PASSWORD123!', expected: false, description: 'no lowercase' },
      { password: 'Password!', expected: false, description: 'no numbers' },
      { password: 'Password123', expected: false, description: 'no special characters' },
      { password: 'Ps123!', expected: false, description: 'too short (6 chars)' },
      { password: 'P'.repeat(129) + '123!', expected: false, description: 'too long' },
    ];

    testCases.forEach(({ password, expected, description }) => {
      it(`should ${expected ? 'accept' : 'reject'} ${description}`, () => {
        const data = {
          email: 'test@example.com',
          password,
          confirmPassword: password,
          displayName: 'Test User',
          termsAccepted: true,
          privacyPolicyAccepted: true,
        };
        
        const result = parentRegistrationSchema.safeParse(data);
        expect(result.success).toBe(expected);
      });
    });
  });

  describe('Email validation', () => {
    const testCases = [
      { email: 'test@example.com', expected: true },
      { email: 'user.name@domain.co.uk', expected: true },
      { email: 'user+tag@example.org', expected: true },
      { email: 'invalid-email', expected: false },
      { email: '@domain.com', expected: false },
      { email: 'user@', expected: false },
      { email: '', expected: false },
      { email: 'user@domain', expected: false },
    ];

    testCases.forEach(({ email, expected }) => {
      it(`should ${expected ? 'accept' : 'reject'} email: ${email}`, () => {
        const data = { email, password: 'password123' };
        const result = parentLoginSchema.safeParse(data);
        expect(result.success).toBe(expected);
      });
    });
  });
});

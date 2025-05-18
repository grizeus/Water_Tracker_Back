import { describe, it, expect } from 'vitest';
import { authRegisterSchema, authLoginSchema } from './auth.js';

describe('Auth Validation', () => {
  describe('authRegisterSchema', () => {
    it('should validate a valid registration', () => {
      const validData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      };
      const { error } = authRegisterSchema.validate(validData);
      expect(error).toBeUndefined();
    });

    it('should require email and password', () => {
      const invalidData = { name: 'Test User' };
      const { error } = authRegisterSchema.validate(invalidData, {
        abortEarly: false,
      });
      expect(error).toBeDefined();
      expect(error.details.some((d) => d.context.key === 'email')).toBe(true);
      expect(error.details.some((d) => d.context.key === 'password')).toBe(
        true
      );
    });

    it('should validate email format', () => {
      const invalidData = {
        name: 'Test',
        email: 'invalid-email',
        password: 'password123',
      };

      const { error } = authRegisterSchema.validate(invalidData);
      expect(error.message).toBe('Invalid email format.');
    });

    it('should validate password length', () => {
      const invalidData = {
        name: 'Test',
        email: 'test@example.com',
        password: 'short',
      };
      const { error } = authRegisterSchema.validate(invalidData);
      expect(error).toBeDefined();
    });
  });

  describe('authLoginSchema', () => {
    it('should validate a valid login', () => {
      const validData = {
        email: 'test@example.com',
        password: 'password123',
      };
      const { error } = authLoginSchema.validate(validData);
      expect(error).toBeUndefined();
    });

    it('should require email and password', () => {
      const invalidData = {};
      const { error } = authLoginSchema.validate(invalidData, { abortEarly: false });
      expect(error).toBeDefined();
      const errKeys = error.details.map(d => d.context.key);
      expect(errKeys).toContain('email');
      expect(errKeys).toContain('password');
    });
  });
});

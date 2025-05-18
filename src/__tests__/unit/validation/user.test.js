import { describe, it, expect } from 'vitest';
import { userInfoSchema } from '../../../validation/user.js';

describe('User Validation', () => {
  describe('userInfoSchema', () => {
    it('should validate a valid user update', () => {
      const validData = {
        name: 'Updated Name',
        email: 'updated@example.com',
        gender: 'man',
        password: 'newpassword123',
        oldPassword: 'oldpassword123',
        newPassword: 'newpassword123',
      };
      const { error } = userInfoSchema.validate(validData);
      expect(error).toBeUndefined();
    });

    it('should validate partial updates', () => {
      const partialData = {
        name: 'New Name',
      };
      const { error } = userInfoSchema.validate(partialData);
      expect(error).toBeUndefined();
    });

    it('should validate email format', () => {
      const invalidData = {
        email: 'invalid-email',
      };
      const { error } = userInfoSchema.validate(invalidData);
      expect(error).toBeDefined();
      expect(error.details[0].message).toContain('must be a valid email');
    });

    it('should validate password length', () => {
      const invalidData = {
        password: 'short',
      };
      const { error } = userInfoSchema.validate(invalidData);
      expect(error).toBeDefined();
      expect(error.details[0].message).toContain('at least 8 characters');
    });

    it('should validate gender values', () => {
      const invalidData = {
        gender: 'invalid-gender',
      };
      const { error } = userInfoSchema.validate(invalidData);
      expect(error).toBeDefined();
      expect(error.details[0].message).toContain('must be one of');
    });

    it('should validate name length', () => {
      const invalidData = {
        name: 'a'.repeat(50), // More than 32 characters
      };
      const { error } = userInfoSchema.validate(invalidData);
      expect(error).toBeDefined();
      expect(error.details[0].message).toContain('at most 32 characters');
    });
  });
});

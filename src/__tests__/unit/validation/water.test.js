import { describe, it, expect } from 'vitest';
import {
  waterEntrySchema,
  dailyGoalSchema,
  monthFormatSchema,
} from '../../../validation/water.js';

describe('Water Validation', () => {
  describe('waterEntrySchema', () => {
    it('should validate a valid water entry', () => {
      const validData = {
        amount: 200,
        time: '2015-05-17T14:30',
      };
      const { error } = waterEntrySchema.validate(validData);
      expect(error).toBeUndefined();
    });

    it('should validate amount range', () => {
      const invalidData = {
        amount: 10, // Below minimum
        time: '2025-05-17T14:30',
      };
      const { error } = waterEntrySchema.validate(invalidData);
      expect(error).toBeDefined();
      expect(error.details[0].message).toContain('at least 50');
    });

    it('should validate time format', () => {
      const invalidData = {
        amount: 200,
        time: 'invalid-time',
      };
      const { error } = waterEntrySchema.validate(invalidData);
      expect(error).toBeDefined();
    });
  });

  describe('dailyGoalSchema', () => {
    it('should validate a valid daily goal', () => {
      const validData = {
        dailyGoal: 2000,
      };
      const { error } = dailyGoalSchema.validate(validData);
      expect(error).toBeUndefined();
    });

    it('should validate daily goal range', () => {
      const invalidData = {
        dailyGoal: 30000, // Above maximum
      };
      const { error } = dailyGoalSchema.validate(invalidData);
      expect(error).toBeDefined();
      expect(error.details[0].message).toContain('no more than 15000');
    });
  });

  describe('monthFormatSchema', () => {
    it('should validate a valid month format', () => {
      const validData = {
        month: '2025-05',
      };
      const { error } = monthFormatSchema.validate(validData);
      expect(error).toBeUndefined();
    });

    it('should require month parameter', () => {
      const invalidData = {};
      const { error } = monthFormatSchema.validate(invalidData);
      expect(error).toBeDefined();
      expect(error.details[0].message).toContain('required');
    });

    it('should validate month format', () => {
      const invalidData = {
        month: '2025/05', // Wrong format
      };
      const { error } = monthFormatSchema.validate(invalidData);
      expect(error).toBeDefined();
      expect(error.details[0].message).toContain('format YYYY-MM');
    });
  });
});

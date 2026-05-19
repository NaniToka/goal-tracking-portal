const {
  validateGoalSheet,
  validateGoalSheetDraft,
  validateAchievementUpdate,
  validateYear,
  validateTitle,
  validateDescription,
  validateThrustArea,
  validateUnit,
  validateTarget,
  validateWeightage,
  validateQuarterlyAchievements,
} = require('../goalValidation');

describe('Goal Validation Tests', () => {
  describe('validateGoalSheet', () => {
    it('should pass validation for valid goal sheet', () => {
      const goals = [
        {
          title: 'Complete project documentation',
          description: 'Write comprehensive documentation',
          thrustArea: 'Documentation',
          unitOfMeasurement: 'numeric',
          target: 100,
          weightage: 25,
        },
        {
          title: 'Improve code quality',
          description: 'Reduce code complexity',
          thrustArea: 'Quality',
          unitOfMeasurement: 'percentage',
          target: 90,
          weightage: 25,
        },
        {
          title: 'Complete feature implementation',
          description: 'Implement new features',
          thrustArea: 'Development',
          unitOfMeasurement: 'timeline',
          target: new Date('2025-12-31').toISOString(),
          weightage: 25,
        },
        {
          title: 'Reduce bugs',
          description: 'Fix critical bugs',
          thrustArea: 'Quality',
          unitOfMeasurement: 'zero_based',
          target: 0,
          weightage: 25,
        },
      ];

      const result = validateGoalSheet(goals);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should fail validation for empty goals', () => {
      const result = validateGoalSheet([]);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('At least one goal is required.');
    });

    it('should fail validation for too many goals', () => {
      const goals = new Array(9).fill({
        title: 'Test goal',
        thrustArea: 'Test',
        unitOfMeasurement: 'numeric',
        target: 100,
        weightage: 10,
      });

      const result = validateGoalSheet(goals);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('Maximum 8 goals'))).toBe(true);
    });

    it('should fail validation for incorrect total weightage', () => {
      const goals = [
        {
          title: 'Test goal',
          thrustArea: 'Test',
          unitOfMeasurement: 'numeric',
          target: 100,
          weightage: 50,
        },
      ];

      const result = validateGoalSheet(goals);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('Total goal weightage must equal 100%'))).toBe(true);
    });

    it('should fail validation for duplicate titles', () => {
      const goals = [
        {
          title: 'Test goal',
          thrustArea: 'Test',
          unitOfMeasurement: 'numeric',
          target: 50,
          weightage: 50,
        },
        {
          title: 'Test goal',
          thrustArea: 'Test',
          unitOfMeasurement: 'numeric',
          target: 50,
          weightage: 50,
        },
      ];

      const result = validateGoalSheet(goals);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Duplicate goal titles are not allowed.');
    });

    it('should fail validation for invalid weightage', () => {
      const goals = [
        {
          title: 'Test goal',
          thrustArea: 'Test',
          unitOfMeasurement: 'numeric',
          target: 100,
          weightage: 5, // Below minimum
        },
      ];

      const result = validateGoalSheet(goals);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('Weightage must be an integer between 10% and 100%'))).toBe(true);
    });

    it('should fail validation for invalid title length', () => {
      const goals = [
        {
          title: 'Hi', // Too short
          thrustArea: 'Test',
          unitOfMeasurement: 'numeric',
          target: 100,
          weightage: 100,
        },
      ];

      const result = validateGoalSheet(goals);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('Title must be between 5 and 200 characters'))).toBe(true);
    });

    it('should fail validation for invalid thrust area', () => {
      const goals = [
        {
          title: 'Test goal',
          thrustArea: 'Test@#$', // Invalid characters
          unitOfMeasurement: 'numeric',
          target: 100,
          weightage: 100,
        },
      ];

      const result = validateGoalSheet(goals);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('Thrust area is required'))).toBe(true);
    });

    it('should fail validation for invalid unit', () => {
      const goals = [
        {
          title: 'Test goal',
          thrustArea: 'Test',
          unitOfMeasurement: 'invalid',
          target: 100,
          weightage: 100,
        },
      ];

      const result = validateGoalSheet(goals);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('Unit of measurement must be one of'))).toBe(true);
    });

    it('should fail validation for invalid numeric target', () => {
      const goals = [
        {
          title: 'Test goal',
          thrustArea: 'Test',
          unitOfMeasurement: 'numeric',
          target: -10, // Negative
          weightage: 100,
        },
      ];

      const result = validateGoalSheet(goals);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('Target must be a positive number'))).toBe(true);
    });

    it('should fail validation for invalid percentage target', () => {
      const goals = [
        {
          title: 'Test goal',
          thrustArea: 'Test',
          unitOfMeasurement: 'percentage',
          target: 150, // Over 100
          weightage: 100,
        },
      ];

      const result = validateGoalSheet(goals);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('Target must be a number between 1 and 100'))).toBe(true);
    });

    it('should fail validation for invalid timeline target', () => {
      const goals = [
        {
          title: 'Test goal',
          thrustArea: 'Test',
          unitOfMeasurement: 'timeline',
          target: 'invalid date',
          weightage: 100,
        },
      ];

      const result = validateGoalSheet(goals);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('Target must be a valid future date'))).toBe(true);
    });

    it('should fail validation for invalid quarterly achievements', () => {
      const goals = [
        {
          title: 'Test goal',
          thrustArea: 'Test',
          unitOfMeasurement: 'numeric',
          target: 100,
          weightage: 100,
          quarterlyAchievements: [
            { quarter: 'Q1', achievement: 25 },
            { quarter: 'Q2', achievement: 25 },
            // Missing Q3 and Q4
          ],
        },
      ];

      const result = validateGoalSheet(goals);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('Quarterly achievements must include all 4 quarters'))).toBe(true);
    });
  });

  describe('validateGoalSheetDraft', () => {
    it('should allow empty draft', () => {
      const result = validateGoalSheetDraft([]);
      expect(result.valid).toBe(true);
    });

    it('should allow partial data in draft', () => {
      const goals = [
        {
          title: 'Test goal',
          thrustArea: 'Test',
          unitOfMeasurement: 'numeric',
          target: 100,
          weightage: 50,
        },
      ];

      const result = validateGoalSheetDraft(goals);
      expect(result.valid).toBe(true);
    });

    it('should still validate critical fields in draft', () => {
      const goals = [
        {
          title: 'Hi', // Too short
          thrustArea: 'Test',
          unitOfMeasurement: 'numeric',
          target: 100,
          weightage: 50,
        },
      ];

      const result = validateGoalSheetDraft(goals);
      expect(result.valid).toBe(false);
    });
  });

  describe('validateAchievementUpdate', () => {
    it('should pass validation for valid achievement update', () => {
      const data = {
        year: 2025,
        goalId: '507f1f77bcf86cd799439011',
        quarter: 'Q1',
        achievement: 25,
        status: 'on_track',
      };

      const result = validateAchievementUpdate(data);
      expect(result.valid).toBe(true);
    });

    it('should fail validation for invalid year', () => {
      const data = {
        year: 2023, // Invalid year
        goalId: '507f1f77bcf86cd799439011',
        quarter: 'Q1',
        achievement: 25,
      };

      const result = validateAchievementUpdate(data);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('Valid year is required'))).toBe(true);
    });

    it('should fail validation for missing goalId', () => {
      const data = {
        year: 2025,
        quarter: 'Q1',
        achievement: 25,
      };

      const result = validateAchievementUpdate(data);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Goal ID is required.');
    });

    it('should fail validation for invalid quarter', () => {
      const data = {
        year: 2025,
        goalId: '507f1f77bcf86cd799439011',
        quarter: 'Q5', // Invalid quarter
        achievement: 25,
      };

      const result = validateAchievementUpdate(data);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('Valid quarter is required'))).toBe(true);
    });

    it('should fail validation for invalid achievement type', () => {
      const data = {
        year: 2025,
        goalId: '507f1f77bcf86cd799439011',
        quarter: 'Q1',
        achievement: 'not a number',
      };

      const result = validateAchievementUpdate(data);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Achievement must be a number.');
    });

    it('should fail validation for invalid status', () => {
      const data = {
        year: 2025,
        goalId: '507f1f77bcf86cd799439011',
        quarter: 'Q1',
        status: 'invalid_status',
      };

      const result = validateAchievementUpdate(data);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('Invalid status'))).toBe(true);
    });

    it('should fail validation for invalid completedDate', () => {
      const data = {
        year: 2025,
        goalId: '507f1f77bcf86cd799439011',
        quarter: 'Q1',
        completedDate: 'invalid date',
      };

      const result = validateAchievementUpdate(data);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Invalid completed date format.');
    });
  });

  describe('validateYear', () => {
    it('should return true for valid years', () => {
      expect(validateYear(2024)).toBe(true);
      expect(validateYear(2025)).toBe(true);
      expect(validateYear(2026)).toBe(true);
      expect(validateYear(2027)).toBe(true);
      expect(validateYear(2028)).toBe(true);
    });

    it('should return false for invalid years', () => {
      expect(validateYear(2023)).toBe(false);
      expect(validateYear(2029)).toBe(false);
      expect(validateYear(1999)).toBe(false);
      expect(validateYear('invalid')).toBe(false);
    });
  });

  describe('validateTitle', () => {
    it('should return true for valid titles', () => {
      expect(validateTitle('Valid title')).toBe(true);
      expect(validateTitle('A'.repeat(5))).toBe(true);
      expect(validateTitle('A'.repeat(200))).toBe(true);
    });

    it('should return false for invalid titles', () => {
      expect(validateTitle('')).toBe(false);
      expect(validateTitle('Hi')).toBe(false);
      expect(validateTitle('A'.repeat(201))).toBe(false);
      expect(validateTitle(null)).toBe(false);
      expect(validateTitle(123)).toBe(false);
    });
  });

  describe('validateDescription', () => {
    it('should return true for valid descriptions', () => {
      expect(validateDescription('')).toBe(true); // Optional
      expect(validateDescription(null)).toBe(true); // Optional
      expect(validateDescription(undefined)).toBe(true); // Optional
      expect(validateDescription('Valid description')).toBe(true);
      expect(validateDescription('A'.repeat(1000))).toBe(true);
    });

    it('should return false for invalid descriptions', () => {
      expect(validateDescription('A'.repeat(1001))).toBe(false);
      expect(validateDescription(123)).toBe(false);
    });
  });

  describe('validateThrustArea', () => {
    it('should return true for valid thrust areas', () => {
      expect(validateThrustArea('Development')).toBe(true);
      expect(validateThrustArea('Quality_Assurance')).toBe(true);
      expect(validateThrustArea('Test-Area')).toBe(true);
      expect(validateThrustArea('A'.repeat(100))).toBe(true);
    });

    it('should return false for invalid thrust areas', () => {
      expect(validateThrustArea('')).toBe(false);
      expect(validateThrustArea('Test@#$')).toBe(false);
      expect(validateThrustArea('A'.repeat(101))).toBe(false);
      expect(validateThrustArea(null)).toBe(false);
      expect(validateThrustArea(123)).toBe(false);
    });
  });

  describe('validateUnit', () => {
    it('should return true for valid units', () => {
      expect(validateUnit('numeric')).toBe(true);
      expect(validateUnit('percentage')).toBe(true);
      expect(validateUnit('timeline')).toBe(true);
      expect(validateUnit('zero_based')).toBe(true);
    });

    it('should return false for invalid units', () => {
      expect(validateUnit('invalid')).toBe(false);
      expect(validateUnit('')).toBe(false);
      expect(validateUnit(null)).toBe(false);
    });
  });

  describe('validateTarget', () => {
    it('should return true for valid numeric targets', () => {
      expect(validateTarget(100, 'numeric')).toBe(true);
      expect(validateTarget(1.5, 'numeric')).toBe(true);
    });

    it('should return false for invalid numeric targets', () => {
      expect(validateTarget(-10, 'numeric')).toBe(false);
      expect(validateTarget(0, 'numeric')).toBe(false);
      expect(validateTarget(null, 'numeric')).toBe(false);
    });

    it('should return true for valid percentage targets', () => {
      expect(validateTarget(50, 'percentage')).toBe(true);
      expect(validateTarget(100, 'percentage')).toBe(true);
      expect(validateTarget(1, 'percentage')).toBe(true);
    });

    it('should return false for invalid percentage targets', () => {
      expect(validateTarget(0, 'percentage')).toBe(false);
      expect(validateTarget(101, 'percentage')).toBe(false);
      expect(validateTarget(-10, 'percentage')).toBe(false);
    });

    it('should return true for valid timeline targets', () => {
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 1);
      expect(validateTarget(futureDate.toISOString(), 'timeline')).toBe(true);
    });

    it('should return false for invalid timeline targets', () => {
      const pastDate = new Date('2020-01-01');
      expect(validateTarget(pastDate.toISOString(), 'timeline')).toBe(false);
      expect(validateTarget('invalid', 'timeline')).toBe(false);
    });

    it('should return true for valid zero_based targets', () => {
      expect(validateTarget(0, 'zero_based')).toBe(true);
      expect(validateTarget(100, 'zero_based')).toBe(true);
    });

    it('should return false for invalid zero_based targets', () => {
      expect(validateTarget(-1, 'zero_based')).toBe(false);
      expect(validateTarget(null, 'zero_based')).toBe(false);
    });
  });

  describe('validateWeightage', () => {
    it('should return true for valid weightage', () => {
      expect(validateWeightage(10)).toBe(true);
      expect(validateWeightage(50)).toBe(true);
      expect(validateWeightage(100)).toBe(true);
    });

    it('should return false for invalid weightage', () => {
      expect(validateWeightage(9)).toBe(false);
      expect(validateWeightage(101)).toBe(false);
      expect(validateWeightage(50.5)).toBe(false);
      expect(validateWeightage(null)).toBe(false);
      expect(validateWeightage('50')).toBe(false);
    });
  });

  describe('validateQuarterlyAchievements', () => {
    it('should return true for valid quarterly achievements', () => {
      const achievements = [
        { quarter: 'Q1', achievement: 25, status: 'on_track', progress: 25 },
        { quarter: 'Q2', achievement: 25, status: 'on_track', progress: 25 },
        { quarter: 'Q3', achievement: 25, status: 'on_track', progress: 25 },
        { quarter: 'Q4', achievement: 25, status: 'on_track', progress: 25 },
      ];
      expect(validateQuarterlyAchievements(achievements)).toBe(true);
    });

    it('should return false for missing quarters', () => {
      const achievements = [
        { quarter: 'Q1', achievement: 25 },
        { quarter: 'Q2', achievement: 25 },
        { quarter: 'Q3', achievement: 25 },
        // Missing Q4
      ];
      expect(validateQuarterlyAchievements(achievements)).toBe(false);
    });

    it('should return false for invalid achievement type', () => {
      const achievements = [
        { quarter: 'Q1', achievement: 'not a number' },
        { quarter: 'Q2', achievement: 25 },
        { quarter: 'Q3', achievement: 25 },
        { quarter: 'Q4', achievement: 25 },
      ];
      expect(validateQuarterlyAchievements(achievements)).toBe(false);
    });

    it('should return false for invalid status', () => {
      const achievements = [
        { quarter: 'Q1', achievement: 25, status: 'invalid' },
        { quarter: 'Q2', achievement: 25 },
        { quarter: 'Q3', achievement: 25 },
        { quarter: 'Q4', achievement: 25 },
      ];
      expect(validateQuarterlyAchievements(achievements)).toBe(false);
    });

    it('should return false for invalid progress', () => {
      const achievements = [
        { quarter: 'Q1', achievement: 25, progress: 150 },
        { quarter: 'Q2', achievement: 25 },
        { quarter: 'Q3', achievement: 25 },
        { quarter: 'Q4', achievement: 25 },
      ];
      expect(validateQuarterlyAchievements(achievements)).toBe(false);
    });

    it('should return false for not an array', () => {
      expect(validateQuarterlyAchievements(null)).toBe(false);
      expect(validateQuarterlyAchievements({})).toBe(false);
      expect(validateQuarterlyAchievements('string')).toBe(false);
    });

    it('should return false for wrong length', () => {
      const achievements = [
        { quarter: 'Q1', achievement: 25 },
        { quarter: 'Q2', achievement: 25 },
      ];
      expect(validateQuarterlyAchievements(achievements)).toBe(false);
    });
  });
});

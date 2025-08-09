import { generateBaseSlug, isValidSlug } from '../slug';

describe('Slug Generation', () => {
  describe('generateBaseSlug', () => {
    it('should generate clean slugs from titles', () => {
      const testCases = [
        { input: 'Hello World', expected: 'hello-world' },
        { input: 'My Song Title!', expected: 'my-song-title' },
        { input: 'Song with (Parentheses)', expected: 'song-with-parentheses' },
        { input: 'Song with Numbers 123', expected: 'song-with-numbers-123' },
        { input: 'Special@#$%Characters', expected: 'specialcharacters' },
        { input: 'Multiple   Spaces', expected: 'multiple-spaces' },
        { input: 'Trailing-Hyphens-', expected: 'trailing-hyphens' },
        { input: '-Leading-Hyphens', expected: 'leading-hyphens' },
        { input: 'Mixed_Case_And_Spaces', expected: 'mixed-case-and-spaces' },
        { input: 'Very Long Title That Should Be Truncated Because It Exceeds The Maximum Length', expected: 'very-long-title-that-should-be-truncated-because-it' },
      ];

      testCases.forEach(({ input, expected }) => {
        expect(generateBaseSlug(input)).toBe(expected);
      });
    });

    it('should handle edge cases', () => {
      expect(generateBaseSlug('')).toBe('song');
      expect(generateBaseSlug('   ')).toBe('song');
      expect(generateBaseSlug(null as any)).toBe('song');
      expect(generateBaseSlug(undefined as any)).toBe('song');
      expect(generateBaseSlug('123')).toBe('123');
      expect(generateBaseSlug('---')).toBe('song');
    });

    it('should limit slug length to 50 characters', () => {
      const longTitle = 'A'.repeat(100);
      const slug = generateBaseSlug(longTitle);
      expect(slug.length).toBeLessThanOrEqual(50);
      expect(slug).toBe('a'.repeat(50));
    });
  });

  describe('isValidSlug', () => {
    it('should validate correct slugs', () => {
      const validSlugs = [
        'hello-world',
        'my-song-title',
        'song-with-numbers-123',
        'a',
        'a-b-c',
        '123',
        'song-123',
      ];

      validSlugs.forEach(slug => {
        expect(isValidSlug(slug)).toBe(true);
      });
    });

    it('should reject invalid slugs', () => {
      const invalidSlugs = [
        '',
        '   ',
        'Hello-World', // uppercase
        'hello_world', // underscore
        'hello world', // space
        'hello-world-', // trailing hyphen
        '-hello-world', // leading hyphen
        'hello--world', // double hyphen
        'A'.repeat(101), // too long
        null as any,
        undefined as any,
      ];

      invalidSlugs.forEach(slug => {
        expect(isValidSlug(slug)).toBe(false);
      });
    });
  });
});
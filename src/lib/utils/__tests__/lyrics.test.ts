import { convertAlignedWordsToLyricLines } from '../index';
import { AlignedWord, LyricLine } from '@/types';

describe('Lyrics Conversion', () => {
  describe('convertAlignedWordsToLyricLines', () => {
    it('should convert aligned words to lyric lines correctly', () => {
      const alignedWords: AlignedWord[] = [
        { word: 'Hello', start_s: 0, end_s: 0.5, success: true, p_align: 0.9 },
        { word: 'world', start_s: 0.5, end_s: 1.0, success: true, p_align: 0.8 },
        { word: '!', start_s: 1.0, end_s: 1.2, success: true, p_align: 0.7 },
        { word: 'How', start_s: 2.0, end_s: 2.5, success: true, p_align: 0.9 },
        { word: 'are', start_s: 2.5, end_s: 3.0, success: true, p_align: 0.8 },
        { word: 'you?', start_s: 3.0, end_s: 3.5, success: true, p_align: 0.7 }
      ];

      const result = convertAlignedWordsToLyricLines(alignedWords);

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        index: 0,
        text: 'Hello world !',
        start: 0, // 0 * 1000
        end: 1200 // 1.2 * 1000
      });
      expect(result[1]).toEqual({
        index: 1,
        text: 'How are you?',
        start: 2000, // 2.0 * 1000
        end: 3500 // 3.5 * 1000
      });
    });

    it('should handle section markers correctly', () => {
      const alignedWords: AlignedWord[] = [
        { word: 'Verse', start_s: 0, end_s: 0.5, success: true, p_align: 0.9 },
        { word: '1', start_s: 0.5, end_s: 0.8, success: true, p_align: 0.8 },
        { word: ')', start_s: 0.8, end_s: 1.0, success: true, p_align: 0.7 },
        { word: 'Hello', start_s: 1.5, end_s: 2.0, success: true, p_align: 0.9 },
        { word: 'world', start_s: 2.0, end_s: 2.5, success: true, p_align: 0.8 }
      ];

      const result = convertAlignedWordsToLyricLines(alignedWords);

      expect(result).toHaveLength(2);
      expect(result[0].text).toBe('Verse 1)');
      expect(result[1].text).toBe('Hello world');
    });

    it('should handle timing gaps correctly', () => {
      const alignedWords: AlignedWord[] = [
        { word: 'First', start_s: 0, end_s: 0.5, success: true, p_align: 0.9 },
        { word: 'line', start_s: 0.5, end_s: 1.0, success: true, p_align: 0.8 },
        { word: 'Second', start_s: 3.0, end_s: 3.5, success: true, p_align: 0.9 }, // 2 second gap
        { word: 'line', start_s: 3.5, end_s: 4.0, success: true, p_align: 0.8 }
      ];

      const result = convertAlignedWordsToLyricLines(alignedWords);

      expect(result).toHaveLength(2);
      expect(result[0].text).toBe('First line');
      expect(result[1].text).toBe('Second line');
    });

    it('should handle long lines correctly', () => {
      const longWords = Array.from({ length: 20 }, (_, i) => ({
        word: `word${i}`,
        start_s: i * 0.1,
        end_s: (i + 1) * 0.1,
        success: true,
        p_align: 0.9
      })) as AlignedWord[];

      const result = convertAlignedWordsToLyricLines(longWords);

      // Should break into multiple lines due to length
      expect(result.length).toBeGreaterThan(1);
    });

    it('should handle empty input', () => {
      const result = convertAlignedWordsToLyricLines([]);
      expect(result).toEqual([]);
    });

    it('should handle single word', () => {
      const alignedWords: AlignedWord[] = [
        { word: 'Hello', start_s: 0, end_s: 1.0, success: true, p_align: 0.9 }
      ];

      const result = convertAlignedWordsToLyricLines(alignedWords);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        index: 0,
        text: 'Hello',
        start: 0,
        end: 1000
      });
    });
  });
});

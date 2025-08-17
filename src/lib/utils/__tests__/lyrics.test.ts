import { convertAlignedWordsToLyricLines } from '../index';
import { AlignedWord, LyricLine } from '@/types';

describe('Lyrics Conversion', () => {
  describe('convertAlignedWordsToLyricLines', () => {
    it('should convert aligned words to lyric lines', () => {
      const alignedWords = [
        { word: 'Hello', startS: 0, endS: 0.5, success: true, palign: 0.9 },
        { word: 'world', startS: 0.5, endS: 1.0, success: true, palign: 0.8 },
        { word: '!', startS: 1.0, endS: 1.2, success: true, palign: 0.7 },
      ];

      const result = convertAlignedWordsToLyricLines(alignedWords);

      expect(result).toHaveLength(1);
      expect(result[0].text).toBe('Hello world !');
      expect(result[0].start).toBe(0);
      expect(result[0].end).toBe(1200); // 1.2 seconds in milliseconds
    });

    it('should handle section markers correctly', () => {
      const alignedWords = [
        { word: 'Verse', startS: 0, endS: 0.5, success: true, palign: 0.9 },
        { word: '1', startS: 0.5, endS: 0.8, success: true, palign: 0.8 },
        { word: ')', startS: 0.8, endS: 1.0, success: true, palign: 0.7 },
        { word: 'Hello', startS: 1.5, endS: 2.0, success: true, palign: 0.9 },
        { word: 'world', startS: 2.0, endS: 2.5, success: true, palign: 0.8 },
      ];

      const result = convertAlignedWordsToLyricLines(alignedWords);

      expect(result).toHaveLength(2);
      expect(result[0].text).toBe('Verse 1 )');
      expect(result[1].text).toBe('Hello world');
    });

    it('should break lines on timing gaps', () => {
      const alignedWords = [
        { word: 'First', startS: 0, endS: 0.5, success: true, palign: 0.9 },
        { word: 'line', startS: 0.5, endS: 1.0, success: true, palign: 0.8 },
        { word: 'Second', startS: 3.0, endS: 3.5, success: true, palign: 0.9 }, // 2 second gap
        { word: 'line', startS: 3.5, endS: 4.0, success: true, palign: 0.8 },
      ];

      const result = convertAlignedWordsToLyricLines(alignedWords);

      expect(result).toHaveLength(2);
      expect(result[0].text).toBe('First line');
      expect(result[1].text).toBe('Second line');
    });

    it('should handle long lines by breaking them', () => {
      const alignedWords = [];
      for (let i = 0; i < 20; i++) {
        alignedWords.push({
          word: `word${i}`,
          startS: i * 0.1,
          endS: (i + 1) * 0.1,
          success: true,
          palign: 0.9,
        });
      }

      const result = convertAlignedWordsToLyricLines(alignedWords);

      expect(result.length).toBeGreaterThan(1); // Should break into multiple lines
    });

    it('should handle empty input', () => {
      const result = convertAlignedWordsToLyricLines([]);
      expect(result).toEqual([]);
    });

    it('should handle single word', () => {
      const alignedWords = [
        { word: 'Hello', startS: 0, endS: 1.0, success: true, palign: 0.9 },
      ];

      const result = convertAlignedWordsToLyricLines(alignedWords);

      expect(result).toHaveLength(1);
      expect(result[0].text).toBe('Hello');
      expect(result[0].start).toBe(0);
      expect(result[0].end).toBe(1000);
    });
  });
});

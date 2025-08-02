interface LineTimestamp {
  index: number;
  text: string;
  start: number;
  end: number;
}

// Import the converted lyrics directly from the JSON file
// import pakurKiChhayaLyrics from '../../public/lyrics/pakur-ki-chhaya.json';
import ruchiMyQueenLyrics from '../../public/lyrics/ruchi-my-queen.json';

// Export the converted lyrics
// export const pakurKiChhayaLyricsData: LineTimestamp[] = pakurKiChhayaLyrics;
export const ruchiMyQueenLyricsData: LineTimestamp[] = ruchiMyQueenLyrics;

// You can add more song lyrics here as needed
export const demoLyrics: LineTimestamp[] = [
  {
    index: 0,
    text: "Happy birthday to you",
    start: 0,
    end: 3000,
  },
  {
    index: 1,
    text: "Happy birthday to you",
    start: 3000,
    end: 6000,
  },
  {
    index: 2,
    text: "Happy birthday dear friend",
    start: 6000,
    end: 9000,
  },
  {
    index: 3,
    text: "Happy birthday to you",
    start: 9000,
    end: 12000,
  },
];

interface LineTimestamp {
  index: number;
  text: string;
  start: number;
  end: number;
}

// Import the converted lyrics directly from the JSON file
// import pakurKiChhayaLyrics from '../../public/lyrics/pakur-ki-chhaya.json';
import ruchiMyQueenLyrics from '../../public/lyrics/ruchi-my-queen.json';
import kaleidoscopeHeartLyrics from "../../public/lyrics/kaleidoscope-heart.json";
import yaaraLyrics from "../../public/lyrics/yaara.json";

// Export the converted lyrics
// export const pakurKiChhayaLyricsData: LineTimestamp[] = pakurKiChhayaLyrics;
export const ruchiMyQueenLyricsData: LineTimestamp[] = ruchiMyQueenLyrics;

export const kaleidoscopeHeartLyricsData: LineTimestamp[] = kaleidoscopeHeartLyrics;

export const yaaraLyricsData: LineTimestamp[] = yaaraLyrics;
# Lyrics Conversion Script

This script converts aligned words data into a line-by-line format suitable for the FullPageMediaPlayer component.

## Usage

1. **Prepare your aligned words data**: Make sure your `align-words.mjs` file contains the aligned words array with timing information.

2. **Run the conversion script**:
   ```bash
   node scripts/convert-aligned-words.mjs
   ```

3. **The script will**:
   - Convert aligned words into meaningful lyric lines
   - Clean and format the text
   - Create proper timing information in milliseconds
   - Save the result to `public/lyrics/yaara-converted.json`

## Output Format

The script generates a JSON file with the following structure:

```json
{
  "songId": "yaara",
  "title": "Yaara",
  "artist": "Unknown Artist",
  "timestamp_lyrics": [
    {
      "index": 0,
      "text": "Yaad hai woh din, college ki सीढ़ियाँ (seedhiyaan)?",
      "start": 8834,
      "end": 16197
    },
    // ... more lines
  ]
}
```

## Using in FullPageMediaPlayer

To use the converted lyrics in your FullPageMediaPlayer:

1. **Import the converted lyrics**:
   ```typescript
   import yaaraLyrics from '@/public/lyrics/yaara-converted.json';
   ```

2. **Use in your song data**:
   ```typescript
   const song = {
     id: "yaara",
     title: "Yaara",
     artist: "Unknown Artist",
     audioUrl: "/audio/song-library/yaara.mp3",
     duration: 209,
     timestamp_lyrics: yaaraLyrics.timestamp_lyrics
   };
   ```

## Customization

You can modify the script to:

- **Change song metadata**: Update `songId`, `title`, and `artist` in the script
- **Adjust line breaking logic**: Modify the `shouldBreakLine` function
- **Change output location**: Update the `outputPath` variable
- **Add more post-processing**: Extend the `postProcessLines` function

## Algorithm Details

The script uses several strategies to create meaningful lyric lines:

1. **Timing-based breaks**: Breaks lines when there are significant gaps (> 1.5 seconds)
2. **Content-based breaks**: Breaks after punctuation and section markers
3. **Length-based breaks**: Breaks when lines get too long (> 80 characters)
4. **Post-processing**: Merges very short consecutive lines

## Troubleshooting

- **If lines are too long**: Increase the character limit in `shouldBreakLine`
- **If lines are too short**: Decrease the character limit or adjust the merge logic
- **If timing seems off**: Check that your aligned words data has correct timing information
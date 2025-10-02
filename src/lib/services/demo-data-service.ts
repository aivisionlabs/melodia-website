/**
 * Demo Data Service
 *
 * This service generates mock Suno API data for demo mode testing.
 * It simulates progressive song generation states based on elapsed time.
 */

export interface DemoVariantData {
  id: string;
  audioUrl: string;
  sourceAudioUrl: string;
  streamAudioUrl: string;
  sourceStreamAudioUrl: string;
  imageUrl: string;
  sourceImageUrl: string;
  prompt: string;
  modelName: string;
  title: string;
  tags: string;
  createTime: number;
  duration: number;
}

/**
 * Generate demo suno data based on elapsed time
 * @param elapsedTime - Time elapsed since task creation in milliseconds
 * @returns Array of demo variant data
 */
export function generateDemoSunoData(elapsedTime: number): DemoVariantData[] {
  if (elapsedTime > 40000) { // 40+ seconds - COMPLETE: both variants with download ready
    return [
      {
        id: "78df5b9b-6168-4524-81c0-969adee3073a",
        audioUrl: "https://apiboxfiles.erweima.ai/NzhkZjViOWItNjE2OC00NTI0LTgxYzAtOTY5YWRlZTMwNzNh.mp3",
        sourceAudioUrl: "https://cdn1.suno.ai/78df5b9b-6168-4524-81c0-969adee3073a.mp3",
        streamAudioUrl: "https://mfile.erweima.ai/NzhkZjViOWItNjE2OC00NTI0LTgxYzAtOTY5YWRlZTMwNzNh",
        sourceStreamAudioUrl: "https://cdn1.suno.ai/78df5b9b-6168-4524-81c0-969adee3073a.mp3",
        imageUrl: "https://apiboxfiles.erweima.ai/NzhkZjViOWItNjE2OC00NTI0LTgxYzAtOTY5YWRlZTMwNzNh.jpeg",
        sourceImageUrl: "https://cdn2.suno.ai/image_78df5b9b-6168-4524-81c0-969adee3073a.jpeg",
        prompt: "Demo song prompt",
        modelName: "chirp-bluejay",
        title: "Shehar Hila De",
        tags: "Demo song tags",
        createTime: 1756555316725,
        duration: 181.88
      },
      {
        id: "980396fc-b213-4112-a903-419a3d1a9dc3",
        audioUrl: "https://apiboxfiles.erweima.ai/OTgwMzk2ZmMtYjIxMy00MTEyLWE5MDMtNDE5YTNkMWE5ZGMz.mp3",
        sourceAudioUrl: "https://cdn1.suno.ai/980396fc-b213-4112-a903-419a3d1a9dc3.mp3",
        streamAudioUrl: "https://mfile.erweima.ai/OTgwMzk2ZmMtYjIxMy00MTEyLWE5MDMtNDE5YTNkMWE5ZGMz",
        sourceStreamAudioUrl: "https://cdn1.suno.ai/980396fc-b213-4112-a903-419a3d1a9dc3.mp3",
        imageUrl: "https://apiboxfiles.erweima.ai/OTgwMzk2ZmMtYjIxMy00MTEyLWE5MDMtNDE5YTNkMWE5ZGMz.jpeg",
        sourceImageUrl: "https://cdn2.suno.ai/image_980396fc-b213-4112-a903-419a3d1a9dc3.jpeg",
        prompt: "Demo song prompt",
        modelName: "chirp-bluejay",
        title: "Shehar Hila De",
        tags: "Demo song tags",
        createTime: 1756555316725,
        duration: 196.48
      }
    ]
  } else if (elapsedTime > 20000) { // 20-40 seconds - STREAM_AVAILABLE: first variant with stream only
    return [
      {
        id: "78df5b9b-6168-4524-81c0-969adee3073a",
        audioUrl: "https://apiboxfiles.erweima.ai/NzhkZjViOWItNjE2OC00NTI0LTgxYzAtOTY5YWRlZTMwNzNh.mp3",
        sourceAudioUrl: "https://cdn1.suno.ai/78df5b9b-6168-4524-81c0-969adee3073a.mp3",
        streamAudioUrl: "https://mfile.erweima.ai/NzhkZjViOWItNjE2OC00NTI0LTgxYzAtOTY5YWRlZTMwNzNh",
        sourceStreamAudioUrl: "https://cdn1.suno.ai/78df5b9b-6168-4524-81c0-969adee3073a.mp3",
        imageUrl: "https://apiboxfiles.erweima.ai/NzhkZjViOWItNjE2OC00NTI0LTgxYzAtOTY5YWRlZTMwNzNh.jpeg",
        sourceImageUrl: "https://cdn2.suno.ai/image_78df5b9b-6168-4524-81c0-969adee3073a.jpeg",
        prompt: "Demo song prompt",
        modelName: "chirp-bluejay",
        title: "Shehar Hila De",
        tags: "Demo song tags",
        createTime: 1756555316725,
        duration: 181.88
      },
      {
        id: "980396fc-b213-4112-a903-419a3d1a9dc3",
        audioUrl: "",
        sourceAudioUrl: "",
        streamAudioUrl: "https://mfile.erweima.ai/OTgwMzk2ZmMtYjIxMy00MTEyLWE5MDMtNDE5YTNkMWE5ZGMz",
        sourceStreamAudioUrl: "https://cdn1.suno.ai/980396fc-b213-4112-a903-419a3d1a9dc3.mp3",
        imageUrl: "https://apiboxfiles.erweima.ai/OTgwMzk2ZmMtYjIxMy00MTEyLWE5MDMtNDE5YTNkMWE5ZGMz.jpeg",
        sourceImageUrl: "https://cdn2.suno.ai/image_980396fc-b213-4112-a903-419a3d1a9dc3.jpeg",
        prompt: "Demo song prompt",
        modelName: "chirp-bluejay",
        title: "Shehar Hila De",
        tags: "Demo song tags",
        createTime: 1756555316725,
        duration: 196.48
      }
    ]
  } else { // 0-20 seconds - PENDING: no variants ready
    return [
      {
        id: "78df5b9b-6168-4524-81c0-969adee3073a",
        audioUrl: "",
        sourceAudioUrl: "",
        streamAudioUrl: "",
        sourceStreamAudioUrl: "",
        imageUrl: "https://apiboxfiles.erweima.ai/NzhkZjViOWItNjE2OC00NTI0LTgxYzAtOTY5YWRlZTMwNzNh.jpeg",
        sourceImageUrl: "https://cdn2.suno.ai/image_78df5b9b-6168-4524-81c0-969adee3073a.jpeg",
        prompt: "Demo song prompt",
        modelName: "chirp-bluejay",
        title: "Shehar Hila De",
        tags: "Demo song tags",
        createTime: 1756555316725,
        duration: 181.88
      },
      {
        id: "980396fc-b213-4112-a903-419a3d1a9dc3",
        audioUrl: "",
        sourceAudioUrl: "",
        streamAudioUrl: "",
        sourceStreamAudioUrl: "",
        imageUrl: "https://apiboxfiles.erweima.ai/OTgwMzk2ZmMtYjIxMy00MTEyLWE5MDMtNDE5YTNkMWE5ZGMz.jpeg",
        sourceImageUrl: "https://cdn2.suno.ai/image_980396fc-b213-4112-a903-419a3d1a9dc3.jpeg",
        prompt: "Demo song prompt",
        modelName: "chirp-bluejay",
        title: "Shehar Hila De",
        tags: "Demo song tags",
        createTime: 1756555316725,
        duration: 196.48
      }
    ]
  }
}

/**
 * Extract task timestamp from demo task ID
 * @param taskId - Demo task ID in format "demo-timestamp"
 * @returns Timestamp or current time if parsing fails
 */
export function extractTaskTimestamp(taskId: string): number {
  return parseInt(taskId.split('-')[2]) || Date.now()
}

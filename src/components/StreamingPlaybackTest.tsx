import React, { useState, useEffect } from "react";
import { useStreamingPlayback } from "@/hooks/use-streaming-playback";

/**
 * Test component to demonstrate seamless duration updates during playback
 */
export function StreamingPlaybackTest() {
  const [mockDuration, setMockDuration] = useState<number>(0);
  const [isSimulating, setIsSimulating] = useState(false);

  const { getPlaybackState, togglePlayback, updateDuration } =
    useStreamingPlayback({
      onDurationAvailable: (variantId, duration) => {
        console.log(
          `✅ Duration available for variant ${variantId}: ${duration}s`
        );
      },
    });

  const playbackState = getPlaybackState("test-variant");

  // Simulate duration becoming available after 3 seconds
  useEffect(() => {
    if (isSimulating) {
      const timer = setTimeout(() => {
        setMockDuration(180); // 3 minutes
        updateDuration("test-variant", 180);
        console.log("🎵 Simulated duration update: 180s");
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [isSimulating, updateDuration]);

  const handleStartTest = () => {
    setIsSimulating(true);
    setMockDuration(0);
    // Start playback with a mock streaming URL
    togglePlayback("test-variant", "https://example.com/test-audio.mp3");
  };

  const handleStopTest = () => {
    setIsSimulating(false);
    setMockDuration(0);
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg max-w-md mx-auto">
      <h3 className="text-lg font-semibold mb-4">Streaming Playback Test</h3>

      <div className="space-y-4">
        {/* Progress Bar */}
        <div className="flex items-center gap-3">
          <div className="flex-1 bg-neutral-200 rounded-full h-2">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all duration-100"
              style={{
                width: `${
                  playbackState.duration > 0
                    ? (playbackState.currentTime / playbackState.duration) * 100
                    : 0
                }%`,
              }}
            />
          </div>
          <span className="text-sm text-neutral-600 w-24 text-right">
            {playbackState.duration > 0
              ? `${Math.floor(playbackState.currentTime / 60)}:${Math.floor(
                  playbackState.currentTime % 60
                )
                  .toString()
                  .padStart(2, "0")} / ${Math.floor(
                  playbackState.duration / 60
                )}:${Math.floor(playbackState.duration % 60)
                  .toString()
                  .padStart(2, "0")}`
              : `${Math.floor(playbackState.currentTime / 60)}:${Math.floor(
                  playbackState.currentTime % 60
                )
                  .toString()
                  .padStart(2, "0")}`}
          </span>
        </div>

        {/* Status */}
        <div className="text-sm text-gray-600">
          <p>Status: {playbackState.isPlaying ? "Playing" : "Paused"}</p>
          <p>
            Duration:{" "}
            {playbackState.duration > 0
              ? `${playbackState.duration}s`
              : "Unknown"}
          </p>
          <p>Current Time: {playbackState.currentTime.toFixed(1)}s</p>
        </div>

        {/* Controls */}
        <div className="flex gap-2">
          <button
            onClick={handleStartTest}
            disabled={isSimulating}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
          >
            Start Test
          </button>
          <button
            onClick={handleStopTest}
            disabled={!isSimulating}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 disabled:opacity-50"
          >
            Stop Test
          </button>
        </div>

        {/* Instructions */}
        <div className="text-xs text-gray-500">
          <p>1. Click "Start Test" to begin playback</p>
          <p>2. Duration will be updated after 3 seconds</p>
          <p>3. Notice how playback continues seamlessly</p>
        </div>
      </div>
    </div>
  );
}

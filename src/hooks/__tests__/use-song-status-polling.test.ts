import { renderHook, act, waitFor } from '@testing-library/react';
import { useSongStatusPolling } from '@/hooks/use-song-status-polling';
import { checkSongStatus } from '@/lib/song-status-client';

// Mock the API client
jest.mock('@/lib/song-status-client', () => ({
  checkSongStatus: jest.fn(),
}));

const mockCheckSongStatus = checkSongStatus as jest.MockedFunction<typeof checkSongStatus>;

describe('useSongStatusPolling', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  const mockCompleteResponse = {
    code: 200,
    msg: "success",
    data: {
      taskId: "test-task-id",
      response: {
        taskId: "test-task-id",
        sunoData: [
          {
            id: "variant-1",
            title: "Test Song",
            audioUrl: "https://example.com/audio1.mp3",
            sourceAudioUrl: "https://example.com/source1.mp3",
            streamAudioUrl: "https://example.com/stream1.mp3",
            sourceStreamAudioUrl: "https://example.com/source-stream1.mp3",
            imageUrl: "https://example.com/image1.jpg",
            sourceImageUrl: "https://example.com/source-image1.jpg",
            duration: 180,
            prompt: "Test prompt",
            modelName: "chirp-bluejay",
            tags: "Test tags",
            createTime: "2024-01-01T00:00:00Z",
          },
          {
            id: "variant-2",
            title: "Test Song",
            audioUrl: "https://example.com/audio2.mp3",
            sourceAudioUrl: "https://example.com/source2.mp3",
            streamAudioUrl: "https://example.com/stream2.mp3",
            sourceStreamAudioUrl: "https://example.com/source-stream2.mp3",
            imageUrl: "https://example.com/image2.jpg",
            sourceImageUrl: "https://example.com/source-image2.jpg",
            duration: 190,
            prompt: "Test prompt",
            modelName: "chirp-bluejay",
            tags: "Test tags",
            createTime: "2024-01-01T00:00:00Z",
          }
        ]
      },
      status: "COMPLETE",
      type: "GENERATE",
      errorCode: null,
      errorMessage: null
    }
  };

  const mockPendingResponse = {
    code: 200,
    msg: "success",
    data: {
      taskId: "test-task-id",
      response: {
        taskId: "test-task-id",
        sunoData: [
          {
            id: "variant-1",
            title: "Test Song",
            audioUrl: "",
            sourceAudioUrl: "",
            streamAudioUrl: "",
            sourceStreamAudioUrl: "",
            imageUrl: "https://example.com/image1.jpg",
            sourceImageUrl: "https://example.com/source-image1.jpg",
            duration: 180,
            prompt: "Test prompt",
            modelName: "chirp-bluejay",
            tags: "Test tags",
            createTime: "2024-01-01T00:00:00Z",
          }
        ]
      },
      status: "PENDING",
      type: "GENERATE",
      errorCode: null,
      errorMessage: null
    }
  };

  it('should stop polling when song status becomes COMPLETE', async () => {
    // Mock API to return complete response
    mockCheckSongStatus.mockResolvedValue(mockCompleteResponse);

    const { result } = renderHook(() =>
      useSongStatusPolling('test-song-id', {
        intervalMs: 1000,
        autoStart: true,
        stopOnComplete: true,
      })
    );

    // Wait for initial load
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Should have complete status
    expect(result.current.songStatus?.status).toBe('COMPLETE');
    expect(result.current.songStatus?.variants).toHaveLength(2);
    expect(result.current.songStatus?.variants?.[0].variantStatus).toBe('DOWNLOAD_READY');
    expect(result.current.songStatus?.variants?.[1].variantStatus).toBe('DOWNLOAD_READY');

    // Should not be polling
    expect(result.current.isPolling).toBe(false);

    // Fast-forward time to ensure no more API calls
    act(() => {
      jest.advanceTimersByTime(5000);
    });

    // Should only have been called once (initial load)
    expect(mockCheckSongStatus).toHaveBeenCalledTimes(1);
  });

  it('should continue polling when song status is not COMPLETE', async () => {
    // Mock API to return pending response
    mockCheckSongStatus.mockResolvedValue(mockPendingResponse);

    const { result } = renderHook(() =>
      useSongStatusPolling('test-song-id', {
        intervalMs: 1000,
        autoStart: true,
        stopOnComplete: true,
      })
    );

    // Wait for initial load
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Should have pending status
    expect(result.current.songStatus?.status).toBe('PENDING');
    expect(result.current.songStatus?.variants?.[0].variantStatus).toBe('PENDING');

    // Should be polling
    expect(result.current.isPolling).toBe(true);

    // Fast-forward time to trigger polling
    act(() => {
      jest.advanceTimersByTime(1000);
    });

    await waitFor(() => {
      expect(mockCheckSongStatus).toHaveBeenCalledTimes(2);
    });
  });

  it('should stop polling when status changes to COMPLETE during polling', async () => {
    let callCount = 0;

    // Mock API to return pending first, then complete
    mockCheckSongStatus.mockImplementation(() => {
      callCount++;
      if (callCount === 1) {
        return Promise.resolve(mockPendingResponse);
      } else {
        return Promise.resolve(mockCompleteResponse);
      }
    });

    const { result } = renderHook(() =>
      useSongStatusPolling('test-song-id', {
        intervalMs: 1000,
        autoStart: true,
        stopOnComplete: true,
      })
    );

    // Wait for initial load
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Should have pending status initially
    expect(result.current.songStatus?.status).toBe('PENDING');
    expect(result.current.isPolling).toBe(true);

    // Fast-forward time to trigger first poll
    act(() => {
      jest.advanceTimersByTime(1000);
    });

    await waitFor(() => {
      expect(result.current.songStatus?.status).toBe('COMPLETE');
    });

    // Should stop polling after status becomes COMPLETE
    expect(result.current.isPolling).toBe(false);

    // Fast-forward more time to ensure no more polling
    act(() => {
      jest.advanceTimersByTime(5000);
    });

    // Should only have been called twice (initial + one poll)
    expect(mockCheckSongStatus).toHaveBeenCalledTimes(2);
  });

  it('should not start polling if autoStart is false', async () => {
    mockCheckSongStatus.mockResolvedValue(mockPendingResponse);

    const { result } = renderHook(() =>
      useSongStatusPolling('test-song-id', {
        intervalMs: 1000,
        autoStart: false,
        stopOnComplete: true,
      })
    );

    // Wait for initial load
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Should not be polling
    expect(result.current.isPolling).toBe(false);

    // Fast-forward time
    act(() => {
      jest.advanceTimersByTime(5000);
    });

    // Should only have been called once (initial load)
    expect(mockCheckSongStatus).toHaveBeenCalledTimes(1);
  });

  it('should handle API errors gracefully', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => { });

    mockCheckSongStatus.mockRejectedValue(new Error('API Error'));

    const { result } = renderHook(() =>
      useSongStatusPolling('test-song-id', {
        intervalMs: 1000,
        autoStart: true,
        stopOnComplete: true,
        maxRetries: 2,
      })
    );

    // Wait for initial load
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Should have error status
    expect(result.current.error).toBe('API Error');
    expect(result.current.songStatus?.success).toBe(false);

    consoleErrorSpy.mockRestore();
  });

  it('should calculate variant statuses correctly', async () => {
    const streamReadyResponse = {
      code: 200,
      msg: "success",
      data: {
        taskId: "test-task-id",
        response: {
          taskId: "test-task-id",
          sunoData: [
            {
              id: "variant-1",
              title: "Test Song",
              audioUrl: "",
              sourceAudioUrl: "",
              streamAudioUrl: "https://example.com/stream1.mp3",
              sourceStreamAudioUrl: "https://example.com/source-stream1.mp3",
              imageUrl: "https://example.com/image1.jpg",
              sourceImageUrl: "https://example.com/source-image1.jpg",
              duration: 180,
              prompt: "Test prompt",
              modelName: "chirp-bluejay",
              tags: "Test tags",
              createTime: "2024-01-01T00:00:00Z",
            }
          ]
        },
        status: "STREAM_AVAILABLE",
        type: "GENERATE",
        errorCode: null,
        errorMessage: null
      }
    };

    mockCheckSongStatus.mockResolvedValue(streamReadyResponse);

    const { result } = renderHook(() =>
      useSongStatusPolling('test-song-id')
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Should have STREAM_AVAILABLE status
    expect(result.current.songStatus?.status).toBe('STREAM_AVAILABLE');
    expect(result.current.songStatus?.variants?.[0].variantStatus).toBe('STREAM_READY');
    expect(result.current.showLoadingScreen).toBe(false);
  });

  it('should show loading screen for PENDING status', async () => {
    mockCheckSongStatus.mockResolvedValue(mockPendingResponse);

    const { result } = renderHook(() =>
      useSongStatusPolling('test-song-id')
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Should show loading screen for PENDING status
    expect(result.current.songStatus?.status).toBe('PENDING');
    expect(result.current.showLoadingScreen).toBe(true);
  });

  it('should cleanup polling on unmount', async () => {
    mockCheckSongStatus.mockResolvedValue(mockPendingResponse);

    const { result, unmount } = renderHook(() =>
      useSongStatusPolling('test-song-id', {
        intervalMs: 1000,
        autoStart: true,
      })
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.isPolling).toBe(true);

    // Unmount the hook
    unmount();

    // Fast-forward time
    act(() => {
      jest.advanceTimersByTime(5000);
    });

    // Should not make any more API calls after unmount
    expect(mockCheckSongStatus).toHaveBeenCalledTimes(1);
  });

  it('should handle manual start/stop polling', async () => {
    mockCheckSongStatus.mockResolvedValue(mockPendingResponse);

    const { result } = renderHook(() =>
      useSongStatusPolling('test-song-id', {
        autoStart: false,
      })
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Should not be polling initially
    expect(result.current.isPolling).toBe(false);

    // Start polling manually
    act(() => {
      result.current.startPolling();
    });

    expect(result.current.isPolling).toBe(true);

    // Stop polling manually
    act(() => {
      result.current.stopPolling();
    });

    expect(result.current.isPolling).toBe(false);
  });
});

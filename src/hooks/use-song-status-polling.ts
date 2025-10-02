import { useState, useEffect, useCallback, useRef } from 'react';
import { checkSongStatus, SongStatusResponse, SongVariant } from '@/lib/song-status-client';
import {
  calculateSongStatus,
  VariantData,
  CalculatedVariant,
  SONG_STATUS_MAP,
  SongStatus
} from '@/lib/services/song-status-calculation-service';
import { FetchSongStatusApiResponse } from '@/lib/services/song-status-api-utils';

export interface UseSongStatusPollingOptions {
  /** Polling interval in milliseconds (default: 10000) */
  intervalMs?: number;
  /** Maximum polling time in milliseconds (default: 10 minutes) */
  maxPollingTime?: number;
  /** Whether to start polling automatically (default: true) */
  autoStart?: boolean;
  /** Whether to stop polling when song is complete (default: true) */
  stopOnComplete?: boolean;
  /** Whether to enable exponential backoff on errors (default: true) */
  enableExponentialBackoff?: boolean;
  /** Maximum number of retries before stopping (default: 3) */
  maxRetries?: number;
  /** Callback when status changes */
  onStatusChange?: (status: SongStatusResponse) => void;
  /** Callback when polling starts */
  onPollingStart?: () => void;
  /** Callback when polling stops */
  onPollingStop?: () => void;
  /** Callback when an error occurs */
  onError?: (error: Error) => void;
}

export interface UseSongStatusPollingReturn {
  /** Current song status response */
  songStatus: SongStatusResponse | null;
  /** Whether currently loading */
  isLoading: boolean;
  /** Whether currently polling */
  isPolling: boolean;
  /** Error message if any */
  error: string | null;
  /** Whether to show loading screen */
  showLoadingScreen: boolean;
  /** Start polling manually */
  startPolling: () => void;
  /** Stop polling manually */
  stopPolling: () => void;
  /** Refresh status once */
  refreshStatus: () => Promise<void>;
  /** Reset all state */
  reset: () => void;
}

/**
 * Custom hook for managing song status polling with the new two-level status system
 *
 * Features:
 * - Automatic status calculation from Suno API response
 * - Progressive UI state management (loading screen vs options display)
 * - Configurable polling intervals and timeouts
 * - Exponential backoff on errors
 * - Cleanup on unmount
 * - Manual control methods
 */
export function useSongStatusPolling(
  songId: string | null,
  options: UseSongStatusPollingOptions = {}
): UseSongStatusPollingReturn {
  const {
    intervalMs = 10000,
    maxPollingTime = 10 * 60 * 1000, // 10 minutes
    autoStart = true,
    stopOnComplete = true,
    enableExponentialBackoff = true,
    maxRetries = 3,
    onStatusChange,
    onPollingStart,
    onPollingStop,
    onError,
  } = options;

  // State
  const [songStatus, setSongStatus] = useState<SongStatusResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPolling, setIsPolling] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showLoadingScreen, setShowLoadingScreen] = useState(false);

  // Refs for polling control
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);
  const retryCountRef = useRef<number>(0);
  const currentIntervalRef = useRef<number>(intervalMs);
  const isPollingRef = useRef<boolean>(false);

  /**
   * Convert Suno API response to SongStatusResponse with status calculation
   */
  const convertToSongStatusResponse = useCallback(
    (
      apiResponse:
        | FetchSongStatusApiResponse
        | { success: boolean; status: string; message: string }
    ): SongStatusResponse | null => {
      // Handle error response
      if ("success" in apiResponse && !apiResponse.success) {
        console.log('❌ [HOOK] Error response detected:', apiResponse.message)

        // Check if it's a "song not found" error (404)
        if (apiResponse.message === 'Song not found') {
          return {
            success: false,
            status: "NOT_FOUND",
            message: apiResponse.message,
          };
        }

        // For other errors, treat as PENDING (song still generating)
        return {
          success: false,
          status: "PENDING",
          message: apiResponse.message,
        };
      }

      // Handle SunoSongStatusAPIResponse
      if ("data" in apiResponse && apiResponse.data) {
        const { data } = apiResponse;

        console.log('📊 [HOOK] Processing SunoSongStatusAPIResponse:', {
          status: data.status,
          hasResponse: !!data.response,
          hasSunoData: !!data.response?.songVariantData,
          sunoDataLength: data.response?.songVariantData?.length || 0,
        })

        // Extract variants from sunoData if available
        let variants: SongVariant[] = [];
        if (data.response?.songVariantData) {
          console.log('🎵 [HOOK] Processing sunoData variants...')

          // Convert API data to VariantData format
          const variantData: VariantData[] = data.response.songVariantData.map((item: any) => ({
            id: item.id || '',
            audioUrl: item.audioUrl || null,
            sourceAudioUrl: item.sourceAudioUrl || null,
            streamAudioUrl: item.streamAudioUrl || null,
            sourceStreamAudioUrl: item.sourceStreamAudioUrl || null,
            imageUrl: item.imageUrl || item.sourceImageUrl || null,
            sourceImageUrl: item.sourceImageUrl || null,
            title: item.title || '',
            duration: item.duration || 0,
            prompt: item.prompt || '',
            modelName: item.modelName || '',
            tags: item.tags || '',
            createTime: item.createTime || ''
          }));

          // Calculate status using the new service
          const statusResult = calculateSongStatus(variantData);

          console.log('🧮 [HOOK] Status calculation result:', {
            songStatus: statusResult.songStatus,
            variantsCount: statusResult.variants.length,
            hasAnyStreamReady: statusResult.hasAnyStreamReady,
            hasAnyDownloadReady: statusResult.hasAnyDownloadReady,
            allVariantsDownloadReady: statusResult.allVariantsDownloadReady
          });

          // Convert to SongVariant format with calculated status
          variants = statusResult.variants.map((variant: CalculatedVariant) => ({
            id: variant.id,
            title: variant.title || '',
            audioUrl: variant.audioUrl || '',
            sourceAudioUrl: variant.sourceAudioUrl || '',
            streamAudioUrl: variant.streamAudioUrl || '',
            sourceStreamAudioUrl: variant.sourceStreamAudioUrl || '',
            imageUrl: variant.imageUrl || '',
            sourceImageUrl: variant.sourceImageUrl || '',
            duration: variant.duration || 0,
            variantStatus: variant.variantStatus,
            prompt: variant.prompt || '',
            modelName: variant.modelName || '',
            tags: variant.tags || '',
            createTime: variant.createTime ? String(variant.createTime) : '',
          }));
        }

        // Use the database status from the API response instead of calculating it
        const databaseStatus = data.status as SongStatus;

        console.log('🎯 [HOOK] Using database song status:', {
          databaseStatus,
          variantsCount: variants.length,
          variantStatuses: variants.map(v => ({
            id: v.id,
            variantStatus: v.variantStatus
          }))
        });

        const result = {
          success: true,
          status: databaseStatus,
          variants: variants.length > 0 ? variants : undefined,
          message: "Song status updated",
        };

        console.log('✅ [HOOK] Returning SongStatusResponse:', {
          success: result.success,
          status: result.status,
          variantsCount: result.variants?.length || 0,
          hasVariants: !!result.variants
        })

        return result;
      }

      console.log('⚠️ [HOOK] No valid data found in API response')
      return null;
    },
    []
  );

  /**
   * Update UI state based on song status
   */
  const updateUIState = useCallback((status: SongStatusResponse) => {
    console.log('🎨 [HOOK] updateUIState called with:', {
      status: status.status,
      hasVariants: !!status.variants,
      variantsCount: status.variants?.length || 0
    })

    if (status.status === "PENDING") {
      // Both variants still generating, show loading screen
      console.log('⏳ [HOOK] Setting showLoadingScreen = true (PENDING status)')
      setShowLoadingScreen(true);
    } else if (status.status === "NOT_FOUND") {
      // Song not found, don't show loading screen
      console.log('❌ [HOOK] Setting showLoadingScreen = false (NOT_FOUND status)')
      setShowLoadingScreen(false);
    } else if (status.status === SONG_STATUS_MAP.STREAM_AVAILABLE || status.status === SONG_STATUS_MAP.COMPLETED) {
      // At least one variant has streaming ready, show options display
      console.log('🎵 [HOOK] Setting showLoadingScreen = false (STREAM_AVAILABLE/COMPLETE status)')
      setShowLoadingScreen(false);
    }

    console.log('🎨 [HOOK] UI state updated:', {
      status: status.status,
      showLoadingScreen: status.status === "PENDING" ? true : false,
      isLoading: false // This should be false after successful response
    })
  }, []);

  /**
   * Stop polling
   */
  const stopPolling = useCallback(() => {
    if (pollingIntervalRef.current) {
      clearTimeout(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
    isPollingRef.current = false;
    setIsPolling(false);
    onPollingStop?.();
  }, [onPollingStop]);

  /**
   * Start polling
   */
  const startPolling = useCallback(() => {
    if (!songId || isPollingRef.current) return;

    isPollingRef.current = true;
    setIsPolling(true);
    startTimeRef.current = Date.now();
    retryCountRef.current = 0;
    currentIntervalRef.current = intervalMs;
    onPollingStart?.();

    const poll = async () => {
      // Check if we've exceeded max polling time
      if (Date.now() - startTimeRef.current > maxPollingTime) {
        console.log('Max polling time exceeded, stopping polling');
        stopPolling();
        return;
      }

      // Check if we should stop polling (in case status changed externally)
      if (!isPollingRef.current) {
        return;
      }

      try {
        console.log(`🔄 [HOOK] [POLLING] Polling song status for songId: ${songId}`)
        const apiResponse = await checkSongStatus(songId);
        console.log('📡 [HOOK] [POLLING] API response received:', {
          hasData: 'data' in apiResponse,
          hasSuccess: 'success' in apiResponse,
          success: 'success' in apiResponse ? apiResponse.success : 'N/A'
        })

        const statusResponse = convertToSongStatusResponse(apiResponse);

        if (statusResponse) {
          console.log('✅ [HOOK] Status response converted successfully:', {
            success: statusResponse.success,
            status: statusResponse.status,
            hasVariants: !!statusResponse.variants,
            variantsCount: statusResponse.variants?.length || 0
          })

          setSongStatus(statusResponse);
          setError(null);
          setIsLoading(false); // Set loading to false when we get a successful response
          updateUIState(statusResponse);
          onStatusChange?.(statusResponse);

          // Reset retry count on successful check
          retryCountRef.current = 0;
          currentIntervalRef.current = intervalMs;


          if (statusResponse.status === SONG_STATUS_MAP.COMPLETED && stopOnComplete) {
            console.log('🎉 [HOOK] Song complete, stopping polling')
            stopPolling();
            return;
          } else {
            console.log('🔄 [HOOK] Continuing polling, status:', statusResponse.status)
          }
        } else {
          console.log('⚠️ [HOOK] No status response returned from conversion')
        }
      } catch (err) {
        console.error('Error polling song status:', err);
        const error = err instanceof Error ? err : new Error('Failed to poll song status');
        setError(error.message);
        onError?.(error);

        // Handle exponential backoff
        if (enableExponentialBackoff) {
          retryCountRef.current += 1;
          if (retryCountRef.current <= maxRetries) {
            currentIntervalRef.current = Math.min(
              currentIntervalRef.current * 2,
              60000 // Max 1 minute
            );
          } else {
            stopPolling();
            return;
          }
        }
      }

      // Schedule next poll if still polling
      if (isPollingRef.current) {
        pollingIntervalRef.current = setTimeout(poll, currentIntervalRef.current);
      }
    };

    // Initial poll
    poll();
  }, [
    songId,
    intervalMs,
    maxPollingTime,
    stopOnComplete,
    enableExponentialBackoff,
    maxRetries,
    convertToSongStatusResponse,
    updateUIState,
    onStatusChange,
    onPollingStart,
    onError,
    stopPolling,
  ]);

  /**
   * Refresh status once without starting continuous polling
   */
  const refreshStatus = useCallback(async () => {
    if (!songId) return;

    try {
      setIsLoading(true);
      setError(null);

      const apiResponse = await checkSongStatus(songId);
      const statusResponse = convertToSongStatusResponse(apiResponse);

      if (statusResponse) {
        setSongStatus(statusResponse);
        updateUIState(statusResponse);
        onStatusChange?.(statusResponse);
      }
    } catch (err) {
      console.error('Error refreshing song status:', err);
      const error = err instanceof Error ? err : new Error('Failed to refresh song status');
      setError(error.message);
      onError?.(error);
    } finally {
      setIsLoading(false);
    }
  }, [songId, convertToSongStatusResponse, updateUIState, onStatusChange, onError]);

  /**
   * Reset all state
   */
  const reset = useCallback(() => {
    stopPolling();
    setSongStatus(null);
    setIsLoading(true);
    setError(null);
    setShowLoadingScreen(false);
    retryCountRef.current = 0;
    currentIntervalRef.current = intervalMs;
  }, [stopPolling, intervalMs]);

  // Initial data fetch
  useEffect(() => {
    if (!songId) {
      setSongStatus(null);
      setIsLoading(false);
      setShowLoadingScreen(false);
      return;
    }

    console.log('🔄 [HOOK] Initial data fetch for songId:', songId);

    // Fetch initial status
    const fetchInitialStatus = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const apiResponse = await checkSongStatus(songId);
        const statusResponse = convertToSongStatusResponse(apiResponse);

        if (statusResponse) {
          console.log('📍 [HOOK] Initial status fetched:', statusResponse.status);
          setSongStatus(statusResponse);
          updateUIState(statusResponse);
          onStatusChange?.(statusResponse);
        }
      } catch (err) {
        console.error('Error fetching initial song status:', err);
        const error = err instanceof Error ? err : new Error('Failed to fetch song status');
        setError(error.message);
        onError?.(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [songId]); // Only depend on songId, not refreshStatus

  // Auto-start polling
  useEffect(() => {
    if (!autoStart || !songId || !songStatus) return;

    // Start polling if song is not complete
    if (songStatus.status !== SONG_STATUS_MAP.COMPLETED) {
      startPolling();
    }
  }, [autoStart, songId, songStatus, startPolling]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopPolling();
    };
  }, [stopPolling]);

  return {
    songStatus,
    isLoading,
    isPolling,
    error,
    showLoadingScreen,
    startPolling,
    stopPolling,
    refreshStatus,
    reset,
  };
}

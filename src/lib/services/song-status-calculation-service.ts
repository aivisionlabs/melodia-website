/**
 * Song Status Calculation Service
 *
 * This service calculates song and variant statuses based on actual data availability
 * rather than relying on external API status values. This makes the system more
 * reliable and independent of third-party API status reporting.
 */

export type VariantStatus = 'PENDING' | 'STREAM_READY' | 'DOWNLOAD_READY';

export type SongStatus = 'PENDING' | 'STREAM_AVAILABLE' | 'COMPLETED' | 'FAILED' | 'NOT_FOUND';

/**
 * Map of SongStatus values with their properties
 */
export const SONG_STATUS_MAP: Record<SongStatus, string> = {
  PENDING: "PENDING",
  STREAM_AVAILABLE: "STREAM_AVAILABLE",
  COMPLETED: "COMPLETED",
  FAILED: "FAILED",
  NOT_FOUND: "NOT_FOUND"
};

export interface VariantData {
  id: string;
  audioUrl?: string | null;
  sourceAudioUrl?: string | null;
  streamAudioUrl?: string | null;
  sourceStreamAudioUrl?: string | null;
  imageUrl?: string | null;
  sourceImageUrl?: string | null;
  title?: string;
  duration?: number;
  prompt?: string;
  modelName?: string;
  tags?: string;
  createTime?: number | string;
}

export interface CalculatedVariant extends VariantData {
  variantStatus: VariantStatus;
}

export interface CalculatedSongStatus {
  songStatus: SongStatus;
  variants: CalculatedVariant[];
  hasAnyStreamReady: boolean;
  hasAnyDownloadReady: boolean;
  allVariantsDownloadReady: boolean;
}

/**
 * Calculates the status of a single variant based on available URLs
 */
export function calculateVariantStatus(variant: VariantData): VariantStatus {
  console.log('🔍 [STATUS-CALC] Calculating variant status for:', {
    id: variant.id,
    hasSourceStreamAudioUrl: !!variant.sourceStreamAudioUrl,
    hasAudioUrl: !!variant.audioUrl,
    hasSourceAudioUrl: !!variant.sourceAudioUrl,
    hasStreamAudioUrl: !!variant.streamAudioUrl
  });

  // If no sourceStreamAudioUrl, variant is still PENDING
  if (!variant.sourceStreamAudioUrl) {
    console.log('⏳ [STATUS-CALC] Variant status: PENDING (no sourceStreamAudioUrl)');
    return 'PENDING';
  }

  // If sourceStreamAudioUrl is available but no download URLs, variant is STREAM_READY
  if (variant.sourceStreamAudioUrl && !variant.audioUrl && !variant.sourceAudioUrl) {
    console.log('🎵 [STATUS-CALC] Variant status: STREAM_READY (has sourceStreamAudioUrl only)');
    return 'STREAM_READY';
  }

  // If audioUrl or sourceAudioUrl is available, variant is DOWNLOAD_READY
  if (variant.audioUrl || variant.sourceAudioUrl) {
    console.log('✅ [STATUS-CALC] Variant status: DOWNLOAD_READY (has audioUrl/sourceAudioUrl)');
    return 'DOWNLOAD_READY';
  }

  console.log('⏳ [STATUS-CALC] Variant status: PENDING (fallback)');
  return 'PENDING';
}

/**
 * Calculates the overall song status based on variant statuses
 */
export function calculateSongStatus(variants: VariantData[]): CalculatedSongStatus {
  console.log('🎯 [STATUS-CALC] Calculating song status with:', {
    variantsCount: variants?.length || 0
  });

  if (variants.length === 0) {
    return {
      songStatus: SONG_STATUS_MAP.PENDING as SongStatus,
      variants: [],
      hasAnyStreamReady: false,
      hasAnyDownloadReady: false,
      allVariantsDownloadReady: false
    };
  }

  // Calculate status for each variant
  const calculatedVariants: CalculatedVariant[] = variants.map(variant => ({
    ...variant,
    variantStatus: calculateVariantStatus(variant)
  }));

  // Determine overall song status
  const hasAnyStreamReady = calculatedVariants.some(v =>
    v.variantStatus === 'STREAM_READY' || v.variantStatus === 'DOWNLOAD_READY'
  );

  const hasAnyDownloadReady = calculatedVariants.some(v =>
    v.variantStatus === 'DOWNLOAD_READY'
  );

  const allVariantsDownloadReady = calculatedVariants.every(v =>
    v.variantStatus === 'DOWNLOAD_READY'
  );

  console.log("calculatedVariants", calculatedVariants)
  console.log("hasAnyStreamReady", hasAnyStreamReady)
  console.log("hasAnyDownloadReady", hasAnyDownloadReady)
  console.log("allVariantsDownloadReady", allVariantsDownloadReady)

  let songStatus: SongStatus;

  if (allVariantsDownloadReady) {
    songStatus = SONG_STATUS_MAP.COMPLETED as SongStatus;
  } else if (hasAnyStreamReady) {
    songStatus = SONG_STATUS_MAP.STREAM_AVAILABLE as SongStatus;
  } else {
    songStatus = SONG_STATUS_MAP.PENDING as SongStatus;
  }

  return {
    songStatus,
    variants: calculatedVariants,
    hasAnyStreamReady,
    hasAnyDownloadReady,
    allVariantsDownloadReady
  };
}

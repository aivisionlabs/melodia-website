export interface LyricLine {
    index: number;
    text: string;
    start: number;
    end: number;
}

export interface AlignedWord {
    word: string;
    startS: number; // Changed from start_s to startS to match API response
    endS: number; // Changed from end_s to endS to match API response
    success: boolean;
    palign: number; // API response uses 'palign' not 'p_align'
}

export interface Song {
    id: number;
    created_at: string;
    song_request_id: number;
    slug: string;
    status?: string;
    is_featured?: boolean;

    // New JSONB fields for variants and timestamped lyrics
    song_variants: { [key: string]: any }; // Store all song variants as JSON
    variant_timestamp_lyrics_api_response: { [variantIndex: number]: any[] }; // Index-based timestamp lyrics API responses
    variant_timestamp_lyrics_processed: { [variantIndex: number]: any[] }; // Processed timestamp lyrics for display

    metadata?: any;
    approved_lyrics_id?: number | null;
    service_provider?: string | null;
    categories?: string[];
    tags?: string[];
    add_to_library?: boolean;
    is_deleted?: boolean;
    selected_variant?: number;
    payment_id?: number | null;
    lyrics_draft_title?: string | null; // Song title from lyrics draft

    // Fields that may be in metadata (for backward compatibility)
    title?: string;
    lyrics?: string;
    timestamp_lyrics?: any[];
    timestamped_lyrics_variants?: { [variantIndex: number]: any[] };
    music_style?: string;
    song_url?: string;
    suno_task_id?: string;
    negative_tags?: string[];
    suno_variants?: any[];
    status_checked_at?: string | Date;
    last_status_check?: string | Date;
}

// Public song interface (without sensitive fields)
export interface PublicSong {
    id: number;
    song_request_id: number;
    slug: string;
    status?: string;
    is_featured?: boolean;

    // New JSONB fields for variants and timestamped lyrics
    song_variants: { [key: string]: any };
    variant_timestamp_lyrics_processed: { [variantIndex: number]: any[] };

    service_provider?: string | null;
    categories?: string[];
    tags?: string[];
    selected_variant?: number;
    title?: string;
    lyrics?: string;
    music_style?: string;
    song_url?: string;
    timestamp_lyrics?: any[];
    timestamped_lyrics_variants?: { [variantIndex: number]: any[] };
}

// User authentication interfaces
export interface User {
    id: number;
    name: string;
    email: string;
    date_of_birth: string;
    phone_number: string | null;
    profile_picture: string | null;
    email_verified: boolean;
    created_at: string;
    updated_at: string;
}

// Signup request interface
export interface SignupRequest {
    name: string;
    email: string;
    dateOfBirth: string; // YYYY-MM-DD format
    phoneNumber?: string;
    password: string;
}

// API Response interfaces
export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: {
        message: string;
        code: string;
        details?: Record<string, any>;
    };
    meta?: {
        timestamp: string;
        requestId: string;
    };
}

// OTP related interfaces
export interface OTPData {
    userId: string;
    code: string;
    attempts: number;
    createdAt: number;
}

export interface EmailVerificationCode {
    id: number;
    user_id: number;
    code: string;
    attempts: number;
    expires_at: string;
    created_at: string;
}

export interface UserSession {
    user: User;
    expires: string;
}

// Song request interfaces
export interface SongDBRequestPayload {
    id: number;
    user_id: number | null;
    requester_name: string;
    recipient_details: string;
    occasion?: string;
    languages: string;
    mood: string[] | null;
    story: string | null;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    created_at: string;
    updated_at: string;
}

// Phase 6: Lyrics-related interfaces
export interface LyricsDraft {
    id: number;
    song_request_id: number;
    version: number;
    lyrics_edit_prompt?: string;
    generated_text: string;
    song_title?: string;
    music_style?: string;
    language: string;
    llm_model_name?: string;
    status: 'draft' | 'needs_review' | 'approved' | 'archived';
    created_by_user_id?: number;
    created_by_anonymous_user_id?: string;
    created_at: string;
    updated_at: string;
}

export interface GenerateLyricsParams {
    language: string[];
    refineText?: string;
}

// Form data interfaces
export interface SongRequestFormData {
    requester_name: string;
    recipient_details: string;
    occasion?: string;
    languages: string | string[];
    mood?: string[];
    song_story?: string;
}

// Song status API response interfaces
export interface SongStatusParam {
    prompt: string;
    style: string;
    title: string;
    customMode: boolean;
    instrumental: boolean;
    model: string;
}

export interface SongStatusResponseData {
    taskId: string;
    parentMusicId: string;
    param: string; // JSON stringified SongStatusParam
    response: {
        taskId: string;
        sunoData: any;
    };
    status: string;
    type: string;
    errorCode: string | null;
    errorMessage: string | null;
}

export interface SunoSongStatusAPIResponse {
    code: number;
    msg: string;
    data: SongStatusResponseData;
}

// Verification request interfaces
export interface VerifyEmailRequest {
    code: string;
}

export interface SendVerificationRequest {
    // User comes from JWT, no additional data needed
    [key: string]: never;
}

// Export payment types
export * from './payment';

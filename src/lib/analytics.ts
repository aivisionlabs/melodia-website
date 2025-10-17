// Google Analytics Event Tracking Utility

declare global {
  interface Window {
    gtag: (...args: any[]) => void;
  }
}

// Event categories for better organization
export const EVENT_CATEGORIES = {
  PLAYER: 'player',
  NAVIGATION: 'navigation',
  ENGAGEMENT: 'engagement',
  SHARING: 'sharing',
  SEARCH: 'search',
  CTA: 'cta',
  AUDIO: 'audio',
  LYRICS: 'lyrics',
} as const;

// Event actions
export const EVENT_ACTIONS = {
  // Player actions
  PLAY: 'play',
  PAUSE: 'pause',
  SEEK: 'seek',
  SKIP_FORWARD: 'skip_forward',
  SKIP_BACKWARD: 'skip_backward',
  VOLUME_CHANGE: 'volume_change',

  // Navigation actions
  CLICK: 'click',
  VIEW: 'view',
  NAVIGATE: 'navigate',

  // Engagement actions
  SHARE: 'share',
  COPY_LINK: 'copy_link',
  DOWNLOAD: 'download',
  LIKE: 'like',

  // Search actions
  SEARCH: 'search',
  SEARCH_RESULT: 'search_result',
  SEARCH_SUGGESTION: 'search_suggestion',
  SEARCH_NO_RESULTS: 'search_no_results',

  // CTA actions
  CTA_CLICK: 'cta_click',
  FORM_SUBMIT: 'form_submit',
  WHATSAPP_CONTACT: 'whatsapp_contact',

  // Audio actions
  AUDIO_LOAD: 'audio_load',
  AUDIO_ERROR: 'audio_error',
  AUDIO_END: 'audio_end',

  // Lyrics actions
  LYRIC_CLICK: 'lyric_click',
  LYRIC_SCROLL: 'lyric_scroll',
} as const;

// Track event function
export const trackEvent = (
  category: string,
  action: string,
  label?: string,
  value?: number,
  customParameters?: Record<string, any>
) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
      ...customParameters,
    });
  }
};

// Player-specific tracking functions
export const trackPlayerEvent = {
  play: (songTitle: string, songId: string, isDemo: boolean = false) => {
    trackEvent(EVENT_CATEGORIES.PLAYER, EVENT_ACTIONS.PLAY, songTitle, undefined, {
      song_id: songId,
      is_demo: isDemo,
      timestamp: Date.now(),
    });
  },

  pause: (songTitle: string, songId: string, currentTime: number) => {
    trackEvent(EVENT_CATEGORIES.PLAYER, EVENT_ACTIONS.PAUSE, songTitle, Math.round(currentTime), {
      song_id: songId,
      current_time: currentTime,
      timestamp: Date.now(),
    });
  },

  seek: (songTitle: string, songId: string, fromTime: number, toTime: number) => {
    trackEvent(EVENT_CATEGORIES.PLAYER, EVENT_ACTIONS.SEEK, songTitle, Math.round(toTime), {
      song_id: songId,
      from_time: fromTime,
      to_time: toTime,
      seek_difference: toTime - fromTime,
      timestamp: Date.now(),
    });
  },

  skipForward: (songTitle: string, songId: string, skipSeconds: number) => {
    trackEvent(EVENT_CATEGORIES.PLAYER, EVENT_ACTIONS.SKIP_FORWARD, songTitle, skipSeconds, {
      song_id: songId,
      skip_seconds: skipSeconds,
      timestamp: Date.now(),
    });
  },

  skipBackward: (songTitle: string, songId: string, skipSeconds: number) => {
    trackEvent(EVENT_CATEGORIES.PLAYER, EVENT_ACTIONS.SKIP_BACKWARD, songTitle, skipSeconds, {
      song_id: songId,
      skip_seconds: skipSeconds,
      timestamp: Date.now(),
    });
  },

  audioLoad: (songTitle: string, songId: string, loadTime?: number) => {
    trackEvent(EVENT_CATEGORIES.AUDIO, EVENT_ACTIONS.AUDIO_LOAD, songTitle, loadTime, {
      song_id: songId,
      load_time: loadTime,
      timestamp: Date.now(),
    });
  },

  audioError: (songTitle: string, songId: string, errorType: string) => {
    trackEvent(EVENT_CATEGORIES.AUDIO, EVENT_ACTIONS.AUDIO_ERROR, songTitle, undefined, {
      song_id: songId,
      error_type: errorType,
      timestamp: Date.now(),
    });
  },

  audioEnd: (songTitle: string, songId: string, totalDuration: number) => {
    trackEvent(EVENT_CATEGORIES.AUDIO, EVENT_ACTIONS.AUDIO_END, songTitle, Math.round(totalDuration), {
      song_id: songId,
      total_duration: totalDuration,
      timestamp: Date.now(),
    });
  },
};

// Navigation tracking functions
export const trackNavigationEvent = {
  pageView: (pageName: string, pageUrl: string) => {
    trackEvent(EVENT_CATEGORIES.NAVIGATION, EVENT_ACTIONS.VIEW, pageName, undefined, {
      page_url: pageUrl,
      timestamp: Date.now(),
    });
  },

  click: (elementName: string, pageUrl: string, elementType: string = 'button') => {
    trackEvent(EVENT_CATEGORIES.NAVIGATION, EVENT_ACTIONS.CLICK, elementName, undefined, {
      page_url: pageUrl,
      element_type: elementType,
      timestamp: Date.now(),
    });
  },

  navigate: (fromPage: string, toPage: string) => {
    trackEvent(EVENT_CATEGORIES.NAVIGATION, EVENT_ACTIONS.NAVIGATE, toPage, undefined, {
      from_page: fromPage,
      to_page: toPage,
      timestamp: Date.now(),
    });
  },
};

// Engagement tracking functions
export const trackEngagementEvent = {
  share: (songTitle: string, songId: string, shareMethod: string) => {
    trackEvent(EVENT_CATEGORIES.SHARING, EVENT_ACTIONS.SHARE, songTitle, undefined, {
      song_id: songId,
      share_method: shareMethod,
      timestamp: Date.now(),
    });
  },

  copyLink: (songTitle: string, songId: string) => {
    trackEvent(EVENT_CATEGORIES.SHARING, EVENT_ACTIONS.COPY_LINK, songTitle, undefined, {
      song_id: songId,
      timestamp: Date.now(),
    });
  },

  lyricClick: (songTitle: string, songId: string, lyricIndex: number, lyricText: string) => {
    trackEvent(EVENT_CATEGORIES.LYRICS, EVENT_ACTIONS.LYRIC_CLICK, songTitle, lyricIndex, {
      song_id: songId,
      lyric_index: lyricIndex,
      lyric_text: lyricText.substring(0, 50), // Limit text length
      timestamp: Date.now(),
    });
  },

  lyricScroll: (songTitle: string, songId: string, scrollDirection: 'up' | 'down') => {
    trackEvent(EVENT_CATEGORIES.LYRICS, EVENT_ACTIONS.LYRIC_SCROLL, songTitle, undefined, {
      song_id: songId,
      scroll_direction: scrollDirection,
      timestamp: Date.now(),
    });
  },

  like: (songTitle: string, songId: string, pageContext: string, likeCount: number) => {
    trackEvent(EVENT_CATEGORIES.ENGAGEMENT, EVENT_ACTIONS.LIKE, songTitle, likeCount, {
      song_id: songId,
      page_context: pageContext,
      like_count: likeCount,
      timestamp: Date.now(),
    });
  },
};

// Search tracking functions
export const trackSearchEvent = {
  search: (query: string, resultsCount: number, searchType: 'text' | 'voice' = 'text', searchMethod: 'fuzzy' | 'exact' = 'fuzzy') => {
    trackEvent(EVENT_CATEGORIES.SEARCH, EVENT_ACTIONS.SEARCH, query, resultsCount, {
      query_length: query.length,
      results_count: resultsCount,
      search_type: searchType,
      search_method: searchMethod,
      query_words: query.split(' ').length,
      timestamp: Date.now(),
    });
  },

  searchResult: (query: string, resultTitle: string, resultPosition: number) => {
    trackEvent(EVENT_CATEGORIES.SEARCH, EVENT_ACTIONS.SEARCH_RESULT, resultTitle, resultPosition, {
      search_query: query,
      result_position: resultPosition,
      timestamp: Date.now(),
    });
  },

  searchSuggestion: (query: string, suggestion: string, suggestionType: 'title' | 'category' | 'style' | 'description') => {
    trackEvent(EVENT_CATEGORIES.SEARCH, EVENT_ACTIONS.SEARCH_SUGGESTION, suggestion, undefined, {
      search_query: query,
      suggestion_type: suggestionType,
      timestamp: Date.now(),
    });
  },

  searchNoResults: (query: string, searchType: 'text' | 'voice' = 'text') => {
    trackEvent(EVENT_CATEGORIES.SEARCH, EVENT_ACTIONS.SEARCH_NO_RESULTS, query, 0, {
      query_length: query.length,
      search_type: searchType,
      query_words: query.split(' ').length,
      timestamp: Date.now(),
    });
  },
};

// CTA tracking functions
export const trackCTAEvent = {
  ctaClick: (ctaName: string, ctaLocation: string, ctaType: string = 'button') => {
    trackEvent(EVENT_CATEGORIES.CTA, EVENT_ACTIONS.CTA_CLICK, ctaName, undefined, {
      cta_location: ctaLocation,
      cta_type: ctaType,
      timestamp: Date.now(),
    });
  },

  formSubmit: (formName: string, formType: string) => {
    trackEvent(EVENT_CATEGORIES.CTA, EVENT_ACTIONS.FORM_SUBMIT, formName, undefined, {
      form_type: formType,
      timestamp: Date.now(),
    });
  },

  whatsappContact: (source: string) => {
    trackEvent(EVENT_CATEGORIES.CTA, EVENT_ACTIONS.WHATSAPP_CONTACT, 'whatsapp_contact', undefined, {
      source: source,
      timestamp: Date.now(),
    });
  },
};

// Page view tracking
export const trackPageView = (pageTitle: string, pageUrl: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', 'G-TJW2DN7ND5', {
      page_title: pageTitle,
      page_location: pageUrl,
    });
  }
};

// Custom event tracking for specific use cases
export const trackCustomEvent = (
  eventName: string,
  parameters: Record<string, any>
) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, {
      ...parameters,
      timestamp: Date.now(),
    });
  }
};
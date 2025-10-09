import { shouldUseMockAPI, SUNO_CONFIG } from './config';

export interface SunoGenerateRequest {
  prompt: string;
  style: string;
  title: string;
  customMode: boolean;
  instrumental: boolean;
  model: string;
  negativeTags?: string;
  callBackUrl: string;
}

export interface SunoGenerateResponse {
  code: number;
  msg: string;
  data: {
    taskId: string;
  };
}

export interface SunoVariant {
  id: string;
  audioUrl?: string | null;
  sourceAudioUrl?: string | null;
  streamAudioUrl?: string | null;
  sourceStreamAudioUrl?: string | null;
  imageUrl?: string | null;
  sourceImageUrl?: string | null;
  prompt?: string;
  modelName?: string;
  title?: string;
  tags?: string;
  createTime?: string | number;
  duration?: number;
}

export interface SunoRecordInfoResponse {
  code: number;
  msg: string;
  data: {
    taskId: string;
    parentMusicId: string;
    param: string;
    response: {
      taskId: string;
      sunoData: SunoVariant[];
    };
    status: string;
    type: string;
    errorCode: string | null;
    errorMessage: string | null;
  };
}

export interface SunoTimestampedLyricsRequest {
  taskId: string;
  musicIndex: number;
}

export interface SunoTimestampedLyricsResponse {
  code: number;
  msg: string;
  data: {
    alignedWords: Array<{
      word: string;
      success: boolean;
      startS: number; // Changed from start_s to startS to match actual API response
      endS: number;   // Changed from end_s to endS to match actual API response
      palign: number; // API response uses 'palign' not 'p_align'
    }>;
    waveformData: number[];
    hootCer: number;
    isStreamed: boolean;
  };
}

// Mock implementation for testing
class MockSunoAPI {
  private tasks: Map<string, { status: string; variants: SunoVariant[]; createdAt: number; callbackUrl?: string }> = new Map();
  private taskCounter = 0;

  constructor() {
    // Load existing tasks from localStorage if available (client-side only)
    if (typeof window !== 'undefined') {
      try {
        const storedTasks = localStorage.getItem('mockSunoTasks');
        if (storedTasks) {
          const parsedTasks = JSON.parse(storedTasks);
          this.tasks = new Map(Object.entries(parsedTasks));
        }

        const storedCounter = localStorage.getItem('mockSunoTaskCounter');
        if (storedCounter) {
          this.taskCounter = parseInt(storedCounter, 10);
        }
      } catch (error) {
        console.warn('Failed to load mock tasks from localStorage:', error);
      }
    }
  }

  private saveTasks() {
    if (typeof window !== 'undefined') {
      try {
        const tasksObject = Object.fromEntries(this.tasks);
        localStorage.setItem('mockSunoTasks', JSON.stringify(tasksObject));
        localStorage.setItem('mockSunoTaskCounter', this.taskCounter.toString());
      } catch (error) {
        console.warn('Failed to save mock tasks to localStorage:', error);
      }
    }
  }

  async generateSong(request: SunoGenerateRequest): Promise<SunoGenerateResponse> {
    const taskId = `mock_task_${++this.taskCounter}_${Date.now()}`;

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Store task for polling with callback URL
    this.tasks.set(taskId, {
      status: 'PENDING',
      variants: [],
      createdAt: Date.now(),
      callbackUrl: request.callBackUrl // Store callback URL for demo mode
    });
    this.saveTasks();

    console.log(`🎭 [DEMO] Task ${taskId} created with callback URL:`, request.callBackUrl);

    // Simulate progression through new two-level status system
    setTimeout(() => {
      const task = this.tasks.get(taskId);
      if (task) {
        task.status = 'STREAM_AVAILABLE';
        // Generate first variant with streaming only
        task.variants.push({
          id: `variant_1_${taskId}`,
          sourceStreamAudioUrl: `https://mock-suno.com/stream/${taskId}_variant1`,
          imageUrl: `https://picsum.photos/400/400?random=${taskId}_1`,
          sourceImageUrl: `https://picsum.photos/400/400?random=${taskId}_1`,
          prompt: request.prompt,
          modelName: 'chirp-v4-5plus',
          title: `${request.title} - Acoustic Version`,
          tags: request.style,
          createTime: new Date().toISOString(),
          duration: Math.floor(Math.random() * 60) + 120 // 2-3 minutes
        });
        this.saveTasks();
      }
    }, SUNO_CONFIG.MOCK_DELAYS.STREAM_AVAILABLE * 1000);

    setTimeout(() => {
      const task = this.tasks.get(taskId);
      if (task) {
        task.status = 'COMPLETE';
        // Add download URLs to first variant
        if (task.variants.length > 0) {
          task.variants[0].audioUrl = `https://mock-suno.com/audio/${taskId}_variant1.mp3`;
          task.variants[0].sourceAudioUrl = `https://mock-suno.com/audio/${taskId}_variant1.mp3`;
        }

        // Generate second variant with both streaming and download
        task.variants.push({
          id: `variant_2_${taskId}`,
          audioUrl: `https://mock-suno.com/audio/${taskId}_variant2.mp3`,
          sourceAudioUrl: `https://mock-suno.com/audio/${taskId}_variant2.mp3`,
          streamAudioUrl: `https://mock-suno.com/stream/${taskId}_variant2`,
          sourceStreamAudioUrl: `https://mock-suno.com/stream/${taskId}_variant2`,
          imageUrl: `https://picsum.photos/400/400?random=${taskId}_2`,
          sourceImageUrl: `https://picsum.photos/400/400?random=${taskId}_2`,
          prompt: request.prompt,
          modelName: 'chirp-v4-5plus',
          title: `${request.title} - Electric Version`,
          tags: request.style,
          createTime: new Date().toISOString(),
          duration: Math.floor(Math.random() * 60) + 120 // 2-3 minutes
        });
        this.saveTasks();
      }
    }, SUNO_CONFIG.MOCK_DELAYS.COMPLETE * 1000);

    return {
      code: 200,
      msg: 'success',
      data: {
        taskId
      }
    };
  }

  async getRecordInfo(taskId: string): Promise<SunoRecordInfoResponse> {
    const task = this.tasks.get(taskId);
    if (!task) {
      throw new Error('Task not found');
    }

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    return {
      code: 200,
      msg: 'success',
      data: {
        taskId,
        parentMusicId: taskId,
        param: 'mock_param',
        response: {
          taskId,
          sunoData: task.variants,
        },
        status: task.status,
        type: 'generate',
        errorCode: null,
        errorMessage: null,
      },
    };
  }

  async getTimestampedLyrics(_: SunoTimestampedLyricsRequest): Promise<SunoTimestampedLyricsResponse> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000));


    // Generate mock aligned words based on the variant
    const mockAlignedWords = this.generateMockAlignedWords();


    console.log('Mock aligned words:', _);
    return {
      code: 200,
      msg: 'success',
      data: {
        alignedWords: mockAlignedWords,
        waveformData: [0, 1, 0.5, 0.75, 0.25, 0.8, 0.3, 0.9],
        hootCer: 0.3803191489361702,
        isStreamed: false,
      },
    };
  }

  private generateMockAlignedWords(): Array<{
    word: string;
    success: boolean;
    startS: number; // Changed from start_s to startS
    endS: number;   // Changed from end_s to endS
    palign: number; // API response uses 'palign' not 'p_align'
  }> {
    const baseLyrics = [
      "Sweet dreams tonight, little one",
      "Close your eyes and rest",
      "The stars are shining bright above",
      "You are loved and blessed",
      "Sleep now, my darling",
      "Dream of happy things",
      "Tomorrow brings new adventures",
      "On happiness wings"
    ];

    const alignedWords: Array<{
      word: string;
      success: boolean;
      startS: number; // Changed from start_s to startS
      endS: number;   // Changed from end_s to endS
      palign: number; // API response uses 'palign' not 'p_align'
    }> = [];
    let currentTime = 0;

    baseLyrics.forEach((line) => {
      const words = line.split(' ');
      const lineDuration = 3 + Math.random() * 2; // 3-5 seconds per line
      const wordDuration = lineDuration / words.length;

      words.forEach((word, wordIndex) => {
        const startTime = currentTime + (wordIndex * wordDuration);
        const endTime = startTime + wordDuration;

        alignedWords.push({
          word: word + (wordIndex === words.length - 1 ? '\n' : ' '),
          success: true,
          startS: startTime, // Changed from start_s to startS
          endS: endTime,     // Changed from end_s to endS
          palign: 0,         // API response uses 'palign' not 'p_align'
        });
      });

      currentTime += lineDuration;
    });

    return alignedWords;
  }

  // Method to simulate errors for testing
  simulateError(taskId: string, errorType: 'CREATE_TASK_FAILED' | 'GENERATE_AUDIO_FAILED' | 'CALLBACK_EXCEPTION' | 'SENSITIVE_WORD_ERROR') {
    const task = this.tasks.get(taskId);
    if (task) {
      task.status = errorType;
      this.saveTasks();
    }
  }

  // Method to clear all mock data (for testing)
  clearMockData() {
    this.tasks.clear();
    this.taskCounter = 0;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('mockSunoTasks');
      localStorage.removeItem('mockSunoTaskCounter');
    }
  }

  // Method to create a task with a specific ID (for client-side task creation)
  createTaskWithId(taskId: string, request: SunoGenerateRequest) {
    // Store task for polling with callback URL
    this.tasks.set(taskId, {
      status: 'PENDING',
      variants: [],
      createdAt: Date.now(),
      callbackUrl: request.callBackUrl // Store callback URL for demo mode
    });
    this.saveTasks();

    // Simulate progression through new two-level status system
    setTimeout(() => {
      const task = this.tasks.get(taskId);
      if (task) {
        task.status = 'STREAM_AVAILABLE';
        // Generate first variant with streaming only
        task.variants.push({
          id: `variant_1_${taskId}`,
          sourceStreamAudioUrl: `https://mock-suno.com/stream/${taskId}_variant1`,
          imageUrl: `https://picsum.photos/400/400?random=${taskId}_1`,
          sourceImageUrl: `https://picsum.photos/400/400?random=${taskId}_1`,
          prompt: request.prompt,
          modelName: 'chirp-v4-5plus',
          title: `${request.title} - Acoustic Version`,
          tags: request.style,
          createTime: new Date().toISOString(),
          duration: Math.floor(Math.random() * 60) + 120 // 2-3 minutes
        });
        this.saveTasks();
      }
    }, SUNO_CONFIG.MOCK_DELAYS.STREAM_AVAILABLE * 1000);

    setTimeout(() => {
      const task = this.tasks.get(taskId);
      if (task) {
        task.status = 'COMPLETE';
        // Add download URLs to first variant
        if (task.variants.length > 0) {
          task.variants[0].audioUrl = `https://mock-suno.com/audio/${taskId}_variant1.mp3`;
          task.variants[0].sourceAudioUrl = `https://mock-suno.com/audio/${taskId}_variant1.mp3`;
        }

        // Generate second variant with both streaming and download
        task.variants.push({
          id: `variant_2_${taskId}`,
          audioUrl: `https://mock-suno.com/audio/${taskId}_variant2.mp3`,
          sourceAudioUrl: `https://mock-suno.com/audio/${taskId}_variant2.mp3`,
          streamAudioUrl: `https://mock-suno.com/stream/${taskId}_variant2`,
          sourceStreamAudioUrl: `https://mock-suno.com/stream/${taskId}_variant2`,
          imageUrl: `https://picsum.photos/400/400?random=${taskId}_2`,
          sourceImageUrl: `https://picsum.photos/400/400?random=${taskId}_2`,
          prompt: request.prompt,
          modelName: 'chirp-v4-5plus',
          title: `${request.title} - Electric Version`,
          tags: request.style,
          createTime: new Date().toISOString(),
          duration: Math.floor(Math.random() * 60) + 120 // 2-3 minutes
        });
        this.saveTasks();
      }
    }, SUNO_CONFIG.MOCK_DELAYS.COMPLETE * 1000);
  }
}

// Real API implementation
export class SunoAPI {
  private apiToken: string;
  private baseUrl = SUNO_CONFIG.BASE_URL;

  constructor(apiToken: string) {
    this.apiToken = apiToken;
  }

  async generateSong(request: SunoGenerateRequest): Promise<SunoGenerateResponse> {
    const response = await fetch(`${this.baseUrl}/generate`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`Suno API error: ${response.status}`);
    }

    return response.json();
  }

  async getRecordInfo(taskId: string): Promise<SunoRecordInfoResponse> {
    const response = await fetch(`${this.baseUrl}/generate/record-info?taskId=${taskId}`, {
      headers: {
        'Authorization': `Bearer ${this.apiToken}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Suno API error: ${response.status}`);
    }

    return response.json();
  }

  async getTimestampedLyrics(request: SunoTimestampedLyricsRequest): Promise<SunoTimestampedLyricsResponse> {
    console.log("Fetching timestamped lyrics for request:", request);
    const response = await fetch(`${this.baseUrl}/generate/get-timestamped-lyrics`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      console.error("Suno API error:", response);
      throw new Error(`Suno API error: ${response.status}`);
    }

    return response.json();
  }

  // Method to clear all mock data (for testing)
  // This is a no-op for the real API
  clearMockData() {
    // For real API, this method does nothing since there's no mock data to clear
    console.log('Real API: No mock data to clear');
  }
}

// API Factory - allows easy switching between mock and real APIs
export class SunoAPIFactory {
  private static instance: MockSunoAPI | SunoAPI | null = null;

  static getAPI(): MockSunoAPI | SunoAPI {
    // On the client, always use mock API (keeps tokens server-only)
    if (typeof window !== 'undefined') {
      console.log('🔧 Client-side: Using Mock Suno API');
      if (!this.instance || !(this.instance instanceof MockSunoAPI)) {
        this.instance = new MockSunoAPI();
      }
      return this.instance;
    }

    // Server-side: choose mock or real based on config
    if (!this.instance) {
      if (shouldUseMockAPI()) {
        this.instance = new MockSunoAPI();
      } else {
        const apiToken = process.env.SUNO_API_TOKEN;
        if (!apiToken) {
          throw new Error("Service Provider API Token not found")
        }
        this.instance = new SunoAPI(apiToken);
      }
    }
    return this.instance;
  }
}

// Note: We intentionally do NOT export a default instance here to avoid
// triggering token access during module evaluation on the client.
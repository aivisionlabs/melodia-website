# Melodia Phase 6: Lyrics-First Creation Flow
## Requirements & Implementation Guide

---

## 🎯 **Phase 6 Goal**

Transform the current song creation flow from **direct song generation** to a **two-step process**:
1. **Generate & Edit Lyrics** → User creates and refines lyrics
2. **Create Song** → User approves lyrics and generates the final song

This gives users more control and improves final song quality.

---

## 📋 **Current vs New Flow**

### **Current Flow (Phase 5):**
```
Create Request → Direct Song Generation → Dashboard
```

### **New Flow (Phase 6):**
```
Create Request → Generate Lyrics → Edit Lyrics → Approve Lyrics → Create Song → Dashboard
```

---

## 🗄️ **Database Changes**

### **1. New Table: `lyrics_drafts`**

```sql
CREATE TABLE lyrics_drafts (
  id SERIAL PRIMARY KEY,
  song_request_id INTEGER NOT NULL REFERENCES song_requests(id) ON DELETE CASCADE,
  version INTEGER NOT NULL DEFAULT 1,
  language TEXT[],
  tone TEXT[],
  length_hint TEXT CHECK (length_hint IN ('short','standard','long')),
  structure JSONB,              -- e.g., {"sections":["verse","pre","chorus","bridge"]}
  prompt_input JSONB,           -- snapshot of request + refine text
  generated_text TEXT NOT NULL, -- full lyrics body
  edited_text TEXT,             -- latest user-edited content
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','needs_review','approved','archived')),
  created_by INTEGER REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_lyrics_drafts_req ON lyrics_drafts(song_request_id);
CREATE INDEX idx_lyrics_drafts_status ON lyrics_drafts(status);
```

### **2. Update `song_requests` Table**

```sql
ALTER TABLE song_requests
  ADD COLUMN lyrics_status TEXT DEFAULT 'pending' 
    CHECK (lyrics_status IN ('pending','generating','needs_review','approved')),
  ADD COLUMN approved_lyrics_id INTEGER REFERENCES lyrics_drafts(id),
  ADD COLUMN lyrics_locked_at TIMESTAMPTZ;
```

---

## 🛠️ **New Files to Create**

### **Database Schema**
```
src/lib/db/schema.ts (add lyricsDraftsTable)
src/lib/db/queries/lyrics.ts (new file)
```

### **Server Actions**
```
src/lib/lyrics-actions.ts (new file)
```

### **Pages**
```
src/app/create-lyrics/[requestId]/page.tsx (new file)
src/app/create-song-from-lyrics/[requestId]/page.tsx (new file)
```

### **Components**
```
src/components/lyrics/
├── LyricsEditor.tsx (new file)
├── LyricsControls.tsx (new file)
├── LyricsHistory.tsx (new file)
├── ApproveLyricsModal.tsx (new file)
└── index.ts (new file)
```

### **Hooks**
```
src/hooks/use-lyrics.ts (new file)
src/hooks/use-autosave.ts (new file)
```

### **Types**
```
src/types/index.ts (add lyrics-related types)
```

---

## 📄 **Detailed Requirements**

### **1. Database Schema Updates**

#### **1.1 Add to `src/lib/db/schema.ts`**
```typescript
// Add this to your existing schema.ts
export const lyricsDraftsTable = pgTable('lyrics_drafts', {
  id: serial('id').primaryKey(),
  song_request_id: integer('song_request_id').notNull().references(() => songRequestsTable.id, { onDelete: 'cascade' }),
  version: integer('version').notNull().default(1),
  language: text('language').array(),
  tone: text('tone').array(),
  length_hint: text('length_hint').check(sql`length_hint IN ('short','standard','long')`),
  structure: jsonb('structure'),
  prompt_input: jsonb('prompt_input'),
  generated_text: text('generated_text').notNull(),
  edited_text: text('edited_text'),
  status: text('status').notNull().default('draft').check(sql`status IN ('draft','needs_review','approved','archived')`),
  created_by: integer('created_by').references(() => usersTable.id),
  created_at: timestamp('created_at').notNull().defaultNow(),
  updated_at: timestamp('updated_at').notNull().defaultNow(),
});

// Add to your existing songRequestsTable
export const songRequestsTable = pgTable('song_requests', {
  // ... existing fields ...
  lyrics_status: text('lyrics_status').default('pending').check(sql`lyrics_status IN ('pending','generating','needs_review','approved')`),
  approved_lyrics_id: integer('approved_lyrics_id').references(() => lyricsDraftsTable.id),
  lyrics_locked_at: timestamp('lyrics_locked_at'),
});
```

#### **1.2 Create `src/lib/db/queries/lyrics.ts`**
```typescript
import { eq, desc, and } from 'drizzle-orm';
import { db } from '../index';
import { lyricsDraftsTable, SelectLyricsDraft } from '../schema';

export async function getLyricsDraftsByRequest(requestId: number): Promise<SelectLyricsDraft[]> {
  return db
    .select()
    .from(lyricsDraftsTable)
    .where(eq(lyricsDraftsTable.song_request_id, requestId))
    .orderBy(desc(lyricsDraftsTable.version));
}

export async function getLatestLyricsDraft(requestId: number): Promise<SelectLyricsDraft | undefined> {
  const drafts = await getLyricsDraftsByRequest(requestId);
  return drafts[0]; // Latest version
}

export async function createLyricsDraft(data: any): Promise<SelectLyricsDraft> {
  const [draft] = await db.insert(lyricsDraftsTable).values(data).returning();
  return draft;
}

export async function updateLyricsDraft(id: number, data: any): Promise<SelectLyricsDraft | undefined> {
  const [draft] = await db
    .update(lyricsDraftsTable)
    .set({ ...data, updated_at: new Date() })
    .where(eq(lyricsDraftsTable.id, id))
    .returning();
  return draft;
}
```

### **2. Server Actions**

#### **2.1 Create `src/lib/lyrics-actions.ts`**
```typescript
'use server'

import { createLyricsDraft, updateLyricsDraft, getLatestLyricsDraft } from './db/queries/lyrics';
import { updateSongRequest } from './db/queries/update';

export async function generateLyricsAction(
  requestId: string,
  params: {
    language: string[];
    tone: string[];
    lengthHint: 'short' | 'standard' | 'long';
    structure?: any;
    refineText?: string;
  }
) {
  try {
    // 1. Get song request data
    // 2. Build prompt with params
    // 3. Call LLM to generate lyrics
    // 4. Create lyrics draft
    // 5. Update song request status
    
    return { success: true, draftId: 123, version: 1, text: "Generated lyrics..." };
  } catch (error) {
    return { success: false, error: 'Failed to generate lyrics' };
  }
}

export async function saveLyricsDraftAction(draftId: number, editedText: string) {
  try {
    await updateLyricsDraft(draftId, { edited_text: editedText, status: 'needs_review' });
    return { success: true };
  } catch (error) {
    return { success: false, error: 'Failed to save draft' };
  }
}

export async function approveLyricsAction(draftId: number, requestId: number) {
  try {
    // 1. Update draft status to approved
    // 2. Update song request with approved lyrics
    // 3. Lock lyrics for production
    
    return { success: true };
  } catch (error) {
    return { success: false, error: 'Failed to approve lyrics' };
  }
}

export async function createSongFromLyricsAction(
  requestId: string,
  params: { voice?: string; style?: string; genre?: string; bpm?: number }
) {
  try {
    // 1. Get approved lyrics
    // 2. Start Suno job with lyrics
    // 3. Update song request status
    
    return { success: true, taskId: 'suno-task-123' };
  } catch (error) {
    return { success: false, error: 'Failed to create song' };
  }
}
```

### **3. New Pages**

#### **3.1 Create `src/app/create-lyrics/[requestId]/page.tsx`**
```typescript
import { LyricsEditor } from '@/components/lyrics/LyricsEditor';
import { LyricsControls } from '@/components/lyrics/LyricsControls';

export default async function CreateLyricsPage({ params }: { params: { requestId: string } }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-8 px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Panel - Controls */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold mb-6">Lyrics Generator</h2>
            <LyricsControls requestId={params.requestId} />
          </div>
          
          {/* Right Panel - Editor */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold mb-6">Lyrics Editor</h2>
            <LyricsEditor requestId={params.requestId} />
          </div>
        </div>
      </div>
    </div>
  );
}
```

#### **3.2 Create `src/app/create-song-from-lyrics/[requestId]/page.tsx`**
```typescript
import { ApprovedLyricsDisplay } from '@/components/lyrics/ApprovedLyricsDisplay';
import { SongCreationForm } from '@/components/forms/SongCreationForm';

export default async function CreateSongFromLyricsPage({ params }: { params: { requestId: string } }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-8">Create Song from Lyrics</h1>
        
        {/* Approved Lyrics Display */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Approved Lyrics</h2>
          <ApprovedLyricsDisplay requestId={params.requestId} />
        </div>
        
        {/* Song Creation Form */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Song Settings</h2>
          <SongCreationForm requestId={params.requestId} />
        </div>
      </div>
    </div>
  );
}
```

### **4. New Components**

#### **4.1 Create `src/components/lyrics/LyricsEditor.tsx`**
```typescript
'use client'

import { useState, useEffect } from 'react';
import { useAutosave } from '@/hooks/use-autosave';

interface LyricsEditorProps {
  requestId: string;
  initialText?: string;
}

export function LyricsEditor({ requestId, initialText = '' }: LyricsEditorProps) {
  const [text, setText] = useState(initialText);
  const [isSaving, setIsSaving] = useState(false);
  
  // Auto-save hook
  useAutosave(text, () => {
    // Save draft logic
  }, 3000); // 3 seconds delay
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Lyrics Content</h3>
        <div className="text-sm text-gray-500">
          {isSaving ? 'Saving...' : 'Auto-saved'}
        </div>
      </div>
      
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="w-full h-96 p-4 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
        placeholder="Your lyrics will appear here..."
      />
      
      <div className="flex justify-between items-center text-sm text-gray-500">
        <span>{text.split('\n').length} lines</span>
        <span>{text.length} characters</span>
      </div>
    </div>
  );
}
```

#### **4.2 Create `src/components/lyrics/LyricsControls.tsx`**
```typescript
'use client'

import { useState } from 'react';
import { Button } from '@/components/ui/button';

interface LyricsControlsProps {
  requestId: string;
}

export function LyricsControls({ requestId }: LyricsControlsProps) {
  const [languages, setLanguages] = useState<string[]>(['English']);
  const [tone, setTone] = useState<string[]>(['Fun']);
  const [lengthHint, setLengthHint] = useState<'short' | 'standard' | 'long'>('standard');
  const [isGenerating, setIsGenerating] = useState(false);
  
  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      // Call generate lyrics action
    } finally {
      setIsGenerating(false);
    }
  };
  
  return (
    <div className="space-y-6">
      {/* Language Selection */}
      <div>
        <label className="block text-sm font-medium mb-2">Languages</label>
        <div className="flex flex-wrap gap-2">
          {['English', 'Hindi', 'Punjabi', 'Spanish'].map((lang) => (
            <button
              key={lang}
              onClick={() => setLanguages(prev => 
                prev.includes(lang) 
                  ? prev.filter(l => l !== lang)
                  : [...prev, lang]
              )}
              className={`px-3 py-1 rounded-full text-sm ${
                languages.includes(lang)
                  ? 'bg-yellow-500 text-white'
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              {lang}
            </button>
          ))}
        </div>
      </div>
      
      {/* Tone Selection */}
      <div>
        <label className="block text-sm font-medium mb-2">Tone</label>
        <div className="flex flex-wrap gap-2">
          {['Fun', 'Emotional', 'Romantic', 'Energetic', 'Apology', 'Pride', 'Hope', 'Blues'].map((t) => (
            <button
              key={t}
              onClick={() => setTone(prev => 
                prev.includes(t) 
                  ? prev.filter(tone => tone !== t)
                  : [...prev, t]
              )}
              className={`px-3 py-1 rounded-full text-sm ${
                tone.includes(t)
                  ? 'bg-yellow-500 text-white'
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>
      
      {/* Length Selection */}
      <div>
        <label className="block text-sm font-medium mb-2">Length</label>
        <div className="flex gap-2">
          {[
            { value: 'short', label: 'Short (~60-90s)' },
            { value: 'standard', label: 'Standard (~2-3m)' },
            { value: 'long', label: 'Long (~3-4m)' }
          ].map((option) => (
            <button
              key={option.value}
              onClick={() => setLengthHint(option.value as any)}
              className={`px-3 py-1 rounded text-sm ${
                lengthHint === option.value
                  ? 'bg-yellow-500 text-white'
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
      
      {/* Action Buttons */}
      <div className="space-y-3">
        <Button 
          onClick={handleGenerate}
          disabled={isGenerating}
          className="w-full bg-yellow-500 hover:bg-yellow-600 text-white"
        >
          {isGenerating ? 'Generating...' : 'Generate Lyrics'}
        </Button>
        
        <Button 
          variant="outline"
          className="w-full"
          disabled={isGenerating}
        >
          Regenerate
        </Button>
        
        <Button 
          variant="outline"
          className="w-full"
          disabled={isGenerating}
        >
          Refine
        </Button>
      </div>
    </div>
  );
}
```

### **5. New Hooks**

#### **5.1 Create `src/hooks/use-lyrics.ts`**
```typescript
import { useState, useEffect } from 'react';
import { generateLyricsAction, saveLyricsDraftAction, approveLyricsAction } from '@/lib/lyrics-actions';

export function useLyrics(requestId: string) {
  const [drafts, setDrafts] = useState([]);
  const [currentDraft, setCurrentDraft] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const generateLyrics = async (params: any) => {
    setLoading(true);
    try {
      const result = await generateLyricsAction(requestId, params);
      if (result.success) {
        // Update state
      }
    } finally {
      setLoading(false);
    }
  };
  
  const saveDraft = async (draftId: number, text: string) => {
    const result = await saveLyricsDraftAction(draftId, text);
    return result;
  };
  
  const approveDraft = async (draftId: number) => {
    const result = await approveLyricsAction(draftId, requestId);
    return result;
  };
  
  return {
    drafts,
    currentDraft,
    loading,
    generateLyrics,
    saveDraft,
    approveDraft,
  };
}
```

#### **5.2 Create `src/hooks/use-autosave.ts`**
```typescript
import { useEffect, useRef } from 'react';

export function useAutosave(
  value: string,
  onSave: () => void,
  delay: number = 3000
) {
  const timeoutRef = useRef<NodeJS.Timeout>();
  
  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      onSave();
    }, delay);
    
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [value, onSave, delay]);
}
```

### **6. Update Existing Files**

#### **6.1 Update `src/types/index.ts`**
```typescript
// Add these new types
export interface LyricsDraft {
  id: number;
  song_request_id: number;
  version: number;
  language: string[];
  tone: string[];
  length_hint: 'short' | 'standard' | 'long';
  structure?: any;
  prompt_input?: any;
  generated_text: string;
  edited_text?: string;
  status: 'draft' | 'needs_review' | 'approved' | 'archived';
  created_by?: number;
  created_at: string;
  updated_at: string;
}

export interface GenerateLyricsParams {
  language: string[];
  tone: string[];
  lengthHint: 'short' | 'standard' | 'long';
  structure?: any;
  refineText?: string;
}
```

#### **6.2 Update `src/app/dashboard/page.tsx`**
```typescript
// Add new status cards for lyrics workflow
const getStatusCard = (request: SongRequest) => {
  switch (request.lyrics_status) {
    case 'pending':
      return <StatusCard status="lyrics_pending" action="Create Lyrics" />;
    case 'generating':
      return <StatusCard status="lyrics_generating" action="Generating..." />;
    case 'needs_review':
      return <StatusCard status="lyrics_review" action="Edit Lyrics" />;
    case 'approved':
      return <StatusCard status="lyrics_approved" action="Create Song" />;
    default:
      return <StatusCard status={request.status} action="View" />;
  }
};
```

---

## 🚀 **Implementation Steps**

### **Week 1: Database & Backend**
1. ✅ Add `lyrics_drafts` table to schema
2. ✅ Update `song_requests` table
3. ✅ Create database queries
4. ✅ Create server actions
5. ✅ Add LLM integration for lyrics generation

### **Week 2: Frontend Components**
1. ✅ Create `LyricsEditor` component
2. ✅ Create `LyricsControls` component
3. ✅ Create `LyricsHistory` component
4. ✅ Create `ApproveLyricsModal` component
5. ✅ Create hooks (`use-lyrics`, `use-autosave`)

### **Week 3: Pages & Routing**
1. ✅ Create `/create-lyrics/[requestId]` page
2. ✅ Create `/create-song-from-lyrics/[requestId]` page
3. ✅ Update dashboard with new statuses
4. ✅ Add navigation between steps

### **Week 4: Testing & Polish**
1. ✅ Test end-to-end lyrics flow
2. ✅ Add error handling and validation
3. ✅ Polish UI/UX
4. ✅ Performance optimization

---

## 🎯 **Success Criteria**

### **Phase 6A Success:**
- ✅ Database schema updated and migrated
- ✅ Lyrics generation server actions working
- ✅ Basic lyrics editing functionality

### **Phase 6B Success:**
- ✅ All lyrics components built and styled
- ✅ Auto-save functionality working
- ✅ Version history implemented

### **Phase 6C Success:**
- ✅ Complete user flow working end-to-end
- ✅ Dashboard shows correct statuses
- ✅ Navigation between steps smooth

### **Phase 6D Success:**
- ✅ All features tested and polished
- ✅ Error handling robust
- ✅ Performance optimized
- ✅ Content safety implemented

---

## 📝 **Next Steps**

1. **Start with Week 1** - Database schema and backend
2. **Set up development environment** - Ensure all dependencies are working
3. **Create feature branches** - Use Git flow for each week
4. **Test incrementally** - Test each week before moving to the next
5. **Document as you go** - Update documentation with new features

---

This requirements file provides a clear roadmap for implementing Phase 6. Each section includes specific code examples and implementation details that align with your existing project structure.

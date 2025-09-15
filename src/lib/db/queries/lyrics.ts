import { eq, desc } from 'drizzle-orm';
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

export async function getLyricsDraftById(id: number): Promise<SelectLyricsDraft | undefined> {
  const [draft] = await db
    .select()
    .from(lyricsDraftsTable)
    .where(eq(lyricsDraftsTable.id, id));
  return draft;
}

export async function archiveLyricsDraft(id: number): Promise<SelectLyricsDraft | undefined> {
  const [draft] = await db
    .update(lyricsDraftsTable)
    .set({ status: 'archived', updated_at: new Date() })
    .where(eq(lyricsDraftsTable.id, id))
    .returning();
  return draft;
}

export async function approveLyricsDraft(id: number): Promise<SelectLyricsDraft | undefined> {
  const [draft] = await db
    .update(lyricsDraftsTable)
    .set({ status: 'approved', updated_at: new Date() })
    .where(eq(lyricsDraftsTable.id, id))
    .returning();
  return draft;
}

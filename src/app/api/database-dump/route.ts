import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import {
  songRequestsTable,
  songsTable,
  lyricsDraftsTable,
  usersTable,
  adminUsersTable,
  anonymousUsersTable,
  paymentsTable,
  paymentWebhooksTable
} from '@/lib/db/schema';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tables = searchParams.get('tables')?.split(',') || null;
    const format = searchParams.get('format') || 'sql'; // sql, json, csv

    console.log('🗄️ Starting database dump...', { tables, format });

    // Get all table data
    const dumpData = await generateDatabaseDump(tables);

    if (format === 'json') {
      return NextResponse.json({
        success: true,
        timestamp: new Date().toISOString(),
        tables: dumpData,
        metadata: {
          totalTables: Object.keys(dumpData).length,
          totalRecords: Object.values(dumpData).reduce((sum: number, table: any) => sum + table.data.length, 0)
        }
      });
    }

    if (format === 'csv') {
      const csvContent = generateCSVDump(dumpData);
      return new NextResponse(csvContent, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="melodia-dump-${new Date().toISOString().split('T')[0]}.csv"`
        }
      });
    }

    // Default: SQL format
    const sqlContent = generateSQLDump(dumpData);

    return new NextResponse(sqlContent, {
      headers: {
        'Content-Type': 'application/sql',
        'Content-Disposition': `attachment; filename="melodia-dump-${new Date().toISOString().split('T')[0]}.sql"`
      }
    });

  } catch (error) {
    console.error('❌ Database dump error:', error);
    return NextResponse.json(
      {
        error: true,
        message: 'Failed to generate database dump',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

async function generateDatabaseDump(requestedTables: string[] | null) {
  const allTables = {
    song_requests: songRequestsTable,
    songs: songsTable,
    lyrics_drafts: lyricsDraftsTable,
    users: usersTable,
    admin_users: adminUsersTable,
    anonymous_users: anonymousUsersTable,
    payments: paymentsTable,
    payment_webhooks: paymentWebhooksTable
  };

  const tablesToDump = requestedTables
    ? requestedTables.filter(table => table in allTables)
    : Object.keys(allTables);

  const dumpData: Record<string, any> = {};

  for (const tableName of tablesToDump) {
    try {
      console.log(`📊 Dumping table: ${tableName}`);
      const table = allTables[tableName as keyof typeof allTables];
      const data = await db.select().from(table);

      dumpData[tableName] = {
        schema: getTableSchema(tableName),
        data: data,
        count: data.length
      };

      console.log(`✅ ${tableName}: ${data.length} records`);
    } catch (error) {
      console.error(`❌ Error dumping ${tableName}:`, error);
      dumpData[tableName] = {
        error: error instanceof Error ? error.message : 'Unknown error',
        data: [],
        count: 0
      };
    }
  }

  return dumpData;
}

function getTableSchema(tableName: string): string {
  // Basic schema information - you can expand this
  const schemas: Record<string, string> = {
    song_requests: `
      CREATE TABLE IF NOT EXISTS song_requests (
        id SERIAL PRIMARY KEY,
        user_id INTEGER,
        requester_name TEXT NOT NULL,
        recipient_details TEXT NOT NULL,
        occasion TEXT,
        languages TEXT NOT NULL,
        mood TEXT[],
        song_story TEXT,
        status TEXT DEFAULT 'pending',
        generated_song_id INTEGER,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        anonymous_user_id UUID
      );`,
    songs: `
      CREATE TABLE IF NOT EXISTS songs (
        id SERIAL PRIMARY KEY,
        song_request_id INTEGER,
        user_id INTEGER,
        title TEXT NOT NULL,
        lyrics TEXT NOT NULL,
        music_style TEXT,
        service_provider TEXT,
        song_requester TEXT,
        prompt TEXT,
        slug TEXT UNIQUE,
        status TEXT DEFAULT 'pending',
        suno_task_id TEXT,
        approved_lyrics_id INTEGER,
        duration INTEGER,
        audio_url TEXT,
        image_url TEXT,
        metadata JSONB,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );`,
    lyrics_drafts: `
      CREATE TABLE IF NOT EXISTS lyrics_drafts (
        id SERIAL PRIMARY KEY,
        song_request_id INTEGER NOT NULL,
        version INTEGER NOT NULL,
        lyrics_edit_prompt JSONB,
        generated_text TEXT,
        status TEXT DEFAULT 'draft',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );`,
    users: `
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name TEXT,
        email TEXT UNIQUE,
        phone_number TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );`,
    admin_users: `
      CREATE TABLE IF NOT EXISTS admin_users (
        id SERIAL PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        email TEXT,
        role TEXT DEFAULT 'admin',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );`,
    anonymous_users: `
      CREATE TABLE IF NOT EXISTS anonymous_users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        ip_address INET,
        user_agent TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );`,
    payments: `
      CREATE TABLE IF NOT EXISTS payments (
        id SERIAL PRIMARY KEY,
        user_id INTEGER,
        amount DECIMAL(10,2) NOT NULL,
        currency TEXT DEFAULT 'USD',
        status TEXT DEFAULT 'pending',
        payment_method TEXT,
        transaction_id TEXT,
        metadata JSONB,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );`,
    payment_webhooks: `
      CREATE TABLE IF NOT EXISTS payment_webhooks (
        id SERIAL PRIMARY KEY,
        payment_id INTEGER,
        event_type TEXT NOT NULL,
        payload JSONB NOT NULL,
        processed BOOLEAN DEFAULT false,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );`
  };

  return schemas[tableName] || `-- Schema for ${tableName} not defined`;
}

function generateSQLDump(dumpData: Record<string, any>): string {
  let sql = `-- Melodia Database Dump
-- Generated on: ${new Date().toISOString()}
-- Total Tables: ${Object.keys(dumpData).length}

-- Disable foreign key checks
SET session_replication_role = replica;

`;

  // Generate CREATE TABLE statements
  for (const [tableName, tableData] of Object.entries(dumpData)) {
    if (tableData.error) {
      sql += `-- Error dumping ${tableName}: ${tableData.error}\n\n`;
      continue;
    }

    sql += `-- Table: ${tableName} (${tableData.count} records)\n`;
    sql += tableData.schema + '\n\n';

    // Generate INSERT statements
    if (tableData.data && tableData.data.length > 0) {
      const columns = Object.keys(tableData.data[0]);
      const columnList = columns.join(', ');

      sql += `-- Data for ${tableName}\n`;

      for (const row of tableData.data) {
        const values = columns.map(col => {
          const value = row[col];
          if (value === null) return 'NULL';
          if (typeof value === 'string') return `'${value.replace(/'/g, "''")}'`;
          if (typeof value === 'object') return `'${JSON.stringify(value).replace(/'/g, "''")}'`;
          return value;
        }).join(', ');

        sql += `INSERT INTO ${tableName} (${columnList}) VALUES (${values});\n`;
      }
      sql += '\n';
    }
  }

  sql += `-- Re-enable foreign key checks
SET session_replication_role = DEFAULT;

-- Dump completed
`;

  return sql;
}

function generateCSVDump(dumpData: Record<string, any>): string {
  let csv = 'Table,Record_Count,Data\n';

  for (const [tableName, tableData] of Object.entries(dumpData)) {
    if (tableData.error) {
      csv += `${tableName},0,"Error: ${tableData.error}"\n`;
      continue;
    }

    csv += `${tableName},${tableData.count},"${JSON.stringify(tableData.data).replace(/"/g, '""')}"\n`;
  }

  return csv;
}

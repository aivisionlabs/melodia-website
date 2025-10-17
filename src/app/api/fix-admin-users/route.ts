import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { adminUsersTable } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcrypt';

export async function POST(request: NextRequest) {
  try {
    console.log('🔧 Fixing admin users...');

    // Check existing admin users
    const existingUsers = await db
      .select()
      .from(adminUsersTable);

    console.log(`📋 Found ${existingUsers.length} admin users`);

    // Check if admin1 exists and has plain text password
    const admin1 = existingUsers.find(u => u.username === 'admin1');

    if (admin1 && admin1.password_hash === 'melodia2024!') {
      console.log('🔧 Found admin1 with plain text password, fixing...');

      // Hash the password
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash('melodia2024!', saltRounds);

      // Update the password
      await db
        .update(adminUsersTable)
        .set({ password_hash: hashedPassword })
        .where(eq(adminUsersTable.username, 'admin1'));

      console.log('✅ Updated admin1 password hash');
    } else if (!admin1) {
      console.log('🔧 Creating admin1 user...');

      // Create admin1 with hashed password
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash('melodia2024!', saltRounds);

      try {
        await db.insert(adminUsersTable).values({
          username: 'admin1',
          password_hash: hashedPassword,
        });
        console.log('✅ Created admin1 user');
      } catch (insertError: any) {
        // If insert fails due to unique constraint, try to update existing record
        if (insertError.code === '23505' && insertError.constraint_name === 'admin_users_username_key') {
          console.log('🔧 Username already exists, updating password...');
          await db
            .update(adminUsersTable)
            .set({ password_hash: hashedPassword })
            .where(eq(adminUsersTable.username, 'admin1'));
          console.log('✅ Updated existing admin1 password');
        } else {
          throw insertError;
        }
      }
    } else {
      console.log('✅ admin1 already exists with proper password hash');
    }

    // Test the authentication
    console.log('🧪 Testing authentication...');
    const testUser = await db
      .select()
      .from(adminUsersTable)
      .where(eq(adminUsersTable.username, 'admin1'))
      .limit(1);

    let isValid = false;
    if (testUser.length > 0) {
      isValid = await bcrypt.compare('melodia2024!', testUser[0].password_hash);
      console.log(`🔐 Password validation: ${isValid ? '✅ Valid' : '❌ Invalid'}`);
    }

    return NextResponse.json({
      success: true,
      message: 'Admin user setup complete!',
      credentials: {
        username: 'admin1',
        password: 'melodia2024!'
      },
      testResult: isValid
    });

  } catch (error) {
    console.error('❌ Error fixing admin users:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fix admin users'
    }, { status: 500 });
  }
}

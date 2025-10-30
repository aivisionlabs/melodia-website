/**
 * Create Song Request API
 * POST /api/create-song-request
 * Creates a new song generation request
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { songRequestsTable } from '@/lib/db/schema';
import { getCurrentUser } from '@/lib/auth/middleware';
import { getAnonymousCookie } from '@/lib/auth/cookies';
import { sendSongRequestConfirmation } from '@/lib/services/email-service';
import { withRateLimit } from '@/lib/rate-limiting/middleware';
import { z } from 'zod';
import { Resend } from 'resend';

const createRequestSchema = z.object({
  requesterName: z.string().optional(),
  recipientDetails: z.string().min(2, 'Please provide details about the recipient'),
  occasion: z.string().optional(),
  languages: z.string().min(1, 'Please select at least one language'),
  mood: z.array(z.string()).optional(),
  story: z.string().optional(),
  mobileNumber: z.string().optional(),
  email: z.preprocess(
    (val) => (val === '' || val === undefined || val === null ? undefined : val),
    z.string().email('Invalid email').optional()
  ),
});

async function handler(req: NextRequest) {
  try {
    const body = await req.json();
    const validatedData = createRequestSchema.parse(body);

    // Get user ID (authenticated or anonymous)
    const user = await getCurrentUser(req);
    const anonymousId = await getAnonymousCookie();

    if (!user && !anonymousId) {
      return NextResponse.json(
        { error: 'Session required. Please enable cookies.' },
        { status: 400 }
      );
    }

    const isDemoMode = process.env.DEMO_MODE === 'true';

    // Create song request
    const newRequests = await db
      .insert(songRequestsTable)
      .values({
        user_id: user?.id ? parseInt(user.id) : null,
        anonymous_user_id: anonymousId || null,
        requester_name: validatedData.requesterName || null,
        recipient_details: validatedData.recipientDetails,
        occasion: validatedData.occasion,
        languages: validatedData.languages,
        mood: validatedData.mood || [],
        song_story: validatedData.story,
        mobile_number: validatedData.mobileNumber,
        email: validatedData.email,
        status: 'pending',
      })
      .returning();

    const newRequest = newRequests[0];

    // Send confirmation email if email provided
    if (validatedData.email && !isDemoMode) {
      const recipientName = validatedData.recipientDetails.split(',')[0] || 'your loved one';
      await sendSongRequestConfirmation(
        validatedData.email,
        validatedData.requesterName || 'Customer',
        recipientName,
        newRequest.id
      );
    }


    if (!isDemoMode) {
      try {
        await sendSongRequestEmail({
          requesterName: validatedData.requesterName || 'Customer',
          recipientDetails: validatedData.recipientDetails,
          occasion: validatedData.occasion || '',
          languages: validatedData.languages,
          story: validatedData.story || '',
          mood: validatedData.mood || [],
          mobileNumber: validatedData.mobileNumber,
          email: validatedData.email,
          requestId: String(newRequest.id)
        });
      } catch (emailError) {
        console.error('❌ Error sending song request email:', emailError);
        // Don't fail the request if email fails - just log it
      }
    }
    // Send notification email to info@melodia-songs.com

    return NextResponse.json({
      success: true,
      requestId: newRequest.id,
      message: 'Song request created successfully!',
    });
  } catch (error) {
    console.error('Create song request error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create song request. Please try again.' },
      { status: 500 }
    );
  }
}

// Apply rate limiting
export const POST = withRateLimit('song.create_request', handler);

async function sendSongRequestEmail({
  requesterName,
  recipientDetails,
  occasion,
  languages,
  story,
  mood,
  mobileNumber,
  email,
  requestId
}: {
  requesterName?: string;
  recipientDetails: string;
  occasion: string;
  languages: string;
  story: string;
  mood: string[];
  mobileNumber?: string;
  email?: string;
  requestId: string;
}) {
  // Check if Resend API key is configured
  if (!process.env.RESEND_API_KEY) {
    console.warn('⚠️ Resend API key not configured - email not sent');
    console.warn('To enable email sending, add RESEND_API_KEY to your .env.local file');
    return;
  }

  try {
    // Initialize Resend with API key
    const resend = new Resend(process.env.RESEND_API_KEY);

    // Send email
    const emailResponse = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'Melodia <onboarding@resend.dev>',
      to: 'info@melodia-songs.com',
      subject: `🎵 New Song Request - ${recipientDetails}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #FFD166 0%, #FFC107 100%); color: #073B4C; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
              .content { background: #FDFDFD; padding: 30px; border: 1px solid #FFD166; border-top: none; border-radius: 0 0 8px 8px; }
              .field { margin-bottom: 20px; }
              .label { font-weight: 600; color: #073B4C; margin-bottom: 5px; }
              .value { color: #555; }
              .story-box { background: #f9f9f9; border-left: 4px solid #EF476F; padding: 15px; margin-top: 10px; }
              .mood-tags { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 5px; }
              .mood-tag { background: #EF476F; color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 500; }
              .footer { text-align: center; margin-top: 30px; color: #888; font-size: 12px; }
              .request-id { background: #e8f4fd; border: 1px solid #2196F3; padding: 10px; border-radius: 5px; margin-top: 15px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1 style="margin: 0;">🎵 New Song Request</h1>
                <p style="margin: 10px 0 0 0; font-size: 16px;">Request ID: ${requestId}</p>
              </div>
              <div class="content">
                <div class="field">
                  <div class="label">👤 Requester:</div>
                  <div class="value">${requesterName || 'Customer'}</div>
                </div>
                <div class="field">
                  <div class="label">🎯 For:</div>
                  <div class="value">${recipientDetails}</div>
                </div>
                <div class="field">
                  <div class="label">🎉 Occasion:</div>
                  <div class="value">${occasion}</div>
                </div>
                <div class="field">
                  <div class="label">🌍 Language(s):</div>
                  <div class="value">${languages}</div>
                </div>
                ${mood.length > 0 ? `
                <div class="field">
                  <div class="label">🎭 Mood:</div>
                  <div class="mood-tags">
                    ${mood.map(m => `<span class="mood-tag">${m}</span>`).join('')}
                  </div>
                </div>
                ` : ''}
                ${story ? `
                <div class="field">
                  <div class="label">📖 Story & Details:</div>
                  <div class="story-box">${story.replace(/\n/g, '<br>')}</div>
                </div>
                ` : ''}
                ${mobileNumber || email ? `
                <div class="field">
                  <div class="label">📞 Contact Details:</div>
                  <div class="value">
                    ${mobileNumber ? `📱 Mobile: ${mobileNumber}<br>` : ''}
                    ${email ? `📧 Email: ${email}` : ''}
                  </div>
                </div>
                ` : ''}
                <div class="field">
                  <div class="label">📅 Received:</div>
                  <div class="value">${new Date().toLocaleString('en-US', {
        dateStyle: 'full',
        timeStyle: 'long'
      })}</div>
                </div>
                <div class="request-id">
                  <strong>Request ID:</strong> ${requestId}
                </div>
              </div>
              <div class="footer">
                This song request was submitted through the Melodia website
              </div>
            </div>
          </body>
        </html>
      `,
    });

    console.log('✅ Song request email sent successfully via Resend:', emailResponse);

  } catch (emailError: any) {
    console.error('❌ Error sending song request email via Resend:', emailError);
    throw emailError;
  }
}

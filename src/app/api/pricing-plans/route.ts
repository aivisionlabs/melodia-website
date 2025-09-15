// Pricing Plans API

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { pricingPlansTable } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { PricingPlansResponse } from '@/types/payment';

export async function GET(request: NextRequest) {
  try {
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get('active') === 'true';
    const currency = searchParams.get('currency') || 'INR';

    // Build query
    let query = db.select().from(pricingPlansTable);

    if (activeOnly) {
      query = query.where(
        and(
          eq(pricingPlansTable.is_active, true),
          eq(pricingPlansTable.currency, currency)
        )
      );
    } else if (currency) {
      query = query.where(eq(pricingPlansTable.currency, currency));
    }

    const plans = await query;

    const response: PricingPlansResponse = {
      success: true,
      plans: plans.map(plan => ({
        id: plan.id,
        name: plan.name,
        description: plan.description || '',
        price: plan.price,
        currency: plan.currency,
        features: plan.features as any,
        is_active: plan.is_active,
        created_at: plan.created_at.toISOString(),
        updated_at: plan.updated_at.toISOString(),
      })),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching pricing plans:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch pricing plans' },
      { status: 500 }
    );
  }
}

export async function POST() {
  try {
    // This would be for admin users to create new pricing plans
    // For now, we'll return a 403 since we don't have admin authentication
    return NextResponse.json(
      { success: false, message: 'Admin access required' },
      { status: 403 }
    );
  } catch (error) {
    console.error('Error creating pricing plan:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create pricing plan' },
      { status: 500 }
    );
  }
}

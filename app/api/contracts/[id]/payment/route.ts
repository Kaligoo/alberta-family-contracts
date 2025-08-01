import { NextRequest, NextResponse } from 'next/server';
import { getUser, getUserWithTeam } from '@/lib/db/queries';
import { stripe } from '@/lib/payments/stripe';
import { db } from '@/lib/db/drizzle';
import { familyContracts } from '@/lib/db/schema';
import { and, eq } from 'drizzle-orm';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userWithTeam = await getUserWithTeam(user.id);
    
    if (!userWithTeam?.teamId) {
      return NextResponse.json({ error: 'Team not found' }, { status: 404 });
    }

    const resolvedParams = await params;
    const contractId = parseInt(resolvedParams.id);
    
    if (isNaN(contractId)) {
      return NextResponse.json({ error: 'Invalid contract ID' }, { status: 400 });
    }

    // Parse coupon information from request body
    const body = await request.json().catch(() => ({}));
    const { coupon, originalPrice = 700, discountAmount = 0, finalPrice = 700 } = body;

    // Get the contract to verify ownership
    const [contract] = await db
      .select()
      .from(familyContracts)
      .where(
        and(
          eq(familyContracts.id, contractId),
          eq(familyContracts.userId, user.id),
          eq(familyContracts.teamId, userWithTeam.teamId)
        )
      )
      .limit(1);

    if (!contract) {
      return NextResponse.json({ error: 'Contract not found' }, { status: 404 });
    }

    if (!stripe) {
      return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 });
    }

    // Calculate pricing with GST
    const gstAmount = finalPrice * 0.05;
    const totalAmount = finalPrice + gstAmount;
    const totalAmountCents = Math.round(totalAmount * 100); // Convert to cents for Stripe

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'cad',
            product_data: {
              name: 'Agreeable.ca Cohabitation Agreement',
              description: coupon 
                ? `Professional cohabitation agreement for ${contract.userFullName || user.name || 'Customer'} (${coupon.code} discount applied)`
                : `Professional cohabitation agreement for ${contract.userFullName || user.name || 'Customer'}`,
            },
            unit_amount: totalAmountCents
          },
          quantity: 1
        }
      ],
      mode: 'payment',
      success_url: `${process.env.BASE_URL || 'https://www.agreeable.ca'}/dashboard/send-to-lawyer?contractId=${contractId}&session_id={CHECKOUT_SESSION_ID}&payment_success=true`,
      cancel_url: `${process.env.BASE_URL || 'https://www.agreeable.ca'}/dashboard/contracts/${contractId}/preview`,
      customer_email: user.email,
      client_reference_id: contractId.toString(),
      metadata: {
        contractId: contractId.toString(),
        userId: user.id.toString(),
        product: 'cohabitation_agreement',
        originalPrice: originalPrice.toString(),
        discountAmount: discountAmount.toString(),
        finalPrice: finalPrice.toString(),
        ...(coupon && {
          couponId: coupon.id?.toString(),
          couponCode: coupon.code
        })
      },
      billing_address_collection: 'required',
      shipping_address_collection: {
        allowed_countries: ['CA']
      }
    });

    return NextResponse.json({ url: session.url });

  } catch (error) {
    console.error('Error creating payment session:', error);
    return NextResponse.json(
      { error: 'Failed to create payment session' },
      { status: 500 }
    );
  }
}
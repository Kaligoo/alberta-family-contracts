import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/payments/stripe';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const sessionId = searchParams.get('session_id');

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID required' }, { status: 400 });
    }

    if (!stripe) {
      return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 });
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status === 'paid') {
      return NextResponse.json({ 
        paid: true,
        contractId: session.client_reference_id,
        customerEmail: session.customer_email,
        amountTotal: session.amount_total,
        currency: session.currency
      });
    } else {
      return NextResponse.json({ 
        paid: false,
        error: 'Payment not completed'
      });
    }

  } catch (error) {
    console.error('Error verifying payment:', error);
    return NextResponse.json(
      { error: 'Failed to verify payment' },
      { status: 500 }
    );
  }
}
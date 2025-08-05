import Stripe from 'stripe';
import { stripe } from '@/lib/payments/stripe';
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/drizzle';
import { familyContracts } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(request: NextRequest) {
  if (!stripe || !webhookSecret) {
    console.error('Stripe not configured, cannot process webhook');
    return NextResponse.json(
      { error: 'Stripe not configured' },
      { status: 500 }
    );
  }

  const payload = await request.text();
  const signature = request.headers.get('stripe-signature') as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed.', err);
    return NextResponse.json(
      { error: 'Webhook signature verification failed.' },
      { status: 400 }
    );
  }

  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object as Stripe.Checkout.Session;
      await handlePaymentComplete(session);
      break;
      
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  return NextResponse.json({ received: true });
}

async function handlePaymentComplete(session: Stripe.Checkout.Session) {
  try {
    console.log('Processing payment completion for session:', session.id);
    
    // Get contract ID from metadata
    const contractId = session.metadata?.contractId || session.client_reference_id;
    
    if (!contractId) {
      console.error('No contract ID found in session metadata');
      return;
    }

    // Update contract as paid
    const [updatedContract] = await db
      .update(familyContracts)
      .set({
        isPaid: 'true',
        status: 'paid',
        updatedAt: new Date()
      })
      .where(eq(familyContracts.id, parseInt(contractId)))
      .returning();

    if (updatedContract) {
      console.log(`Successfully marked contract ${contractId} as paid`);
    } else {
      console.error(`Contract ${contractId} not found for payment update`);
    }

  } catch (error) {
    console.error('Error handling payment completion:', error);
  }
}

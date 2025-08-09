import Stripe from 'stripe';
import { stripe } from '@/lib/payments/stripe';
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/drizzle';
import { familyContracts } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { sendAdminSaleNotification } from '@/lib/utils/admin-notifications';

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(request: NextRequest) {
  console.log('🔄 Webhook received');
  
  if (!stripe || !webhookSecret) {
    console.error('❌ Stripe not configured, cannot process webhook');
    console.error('Stripe configured:', !!stripe);
    console.error('Webhook secret configured:', !!webhookSecret);
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
    console.log('Session metadata:', session.metadata);
    console.log('Session client_reference_id:', session.client_reference_id);
    
    // Get contract ID from metadata
    const contractId = session.metadata?.contractId || session.client_reference_id;
    
    if (!contractId) {
      console.error('No contract ID found in session metadata or client_reference_id');
      console.error('Session object keys:', Object.keys(session));
      return;
    }
    
    console.log(`Found contract ID: ${contractId}`);

    // First, check if contract exists
    const existingContract = await db
      .select()
      .from(familyContracts)
      .where(eq(familyContracts.id, parseInt(contractId)))
      .limit(1);

    if (existingContract.length === 0) {
      console.error(`❌ Contract ${contractId} not found in database`);
      return;
    }

    console.log(`✅ Contract ${contractId} found, current status: ${existingContract[0].status}, isPaid: ${existingContract[0].isPaid}`);

    // Update contract as paid
    console.log(`🔄 Updating contract ${contractId} to paid status...`);
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
      
      // Send admin notification
      const contractType = updatedContract.contractType === 'cohabitation' 
        ? 'Alberta Cohabitation Agreement'
        : updatedContract.contractType === 'prenuptial'
        ? 'Alberta Prenuptial Agreement' 
        : 'Alberta Family Agreement';

      const paymentAmount = session.amount_total 
        ? `$${(session.amount_total / 100).toFixed(2)} ${(session.currency || 'cad').toUpperCase()}`
        : undefined;
      
      console.log(`Payment amount for admin notification: ${paymentAmount}`);

      // Prepare contact information for admin notification
      const contactInfo = {
        userEmail: updatedContract.userEmail || undefined,
        userPhone: updatedContract.userPhone || undefined,
        partnerEmail: updatedContract.partnerEmail || undefined,
        partnerPhone: updatedContract.partnerPhone || undefined
      };

      // For now, lawyers are not selected at payment time - they are chosen later on the send-to-lawyer page
      // So we pass undefined for lawyerInfo
      await sendAdminSaleNotification(
        contractId,
        updatedContract.userFullName || 'Unknown User',
        updatedContract.partnerFullName || 'Unknown Partner',
        contractType,
        paymentAmount,
        contactInfo,
        undefined // lawyerInfo - not available at payment time
      );
    } else {
      console.error(`Contract ${contractId} not found for payment update`);
    }

  } catch (error) {
    console.error('Error handling payment completion:', error);
  }
}

import { NextResponse } from 'next/server';
import { stripe } from '@/lib/payments/stripe';

export async function GET() {
  try {
    // Test basic Stripe configuration
    const stripeConfigured = !!process.env.STRIPE_SECRET_KEY;
    const stripeInstance = !!stripe;
    
    let stripeTest = null;
    if (stripe) {
      try {
        // Test a simple Stripe API call
        const prices = await stripe.prices.list({ limit: 1 });
        stripeTest = { success: true, message: 'Stripe API call successful' };
      } catch (error) {
        stripeTest = { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
      }
    }

    return NextResponse.json({
      message: 'Payment test endpoint working',
      timestamp: new Date().toISOString(),
      stripe_secret_key_configured: stripeConfigured,
      stripe_instance_created: stripeInstance,
      stripe_api_test: stripeTest,
      environment: process.env.NODE_ENV
    });
  } catch (error) {
    return NextResponse.json({
      error: 'Test endpoint failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

export async function POST() {
  try {
    if (!stripe) {
      return NextResponse.json({ 
        error: 'Stripe not configured',
        stripe_secret_key_exists: !!process.env.STRIPE_SECRET_KEY
      }, { status: 500 });
    }

    // Test creating a checkout session without authentication
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'cad',
            product_data: {
              name: 'Test Payment - Alberta Cohabitation Agreement',
              description: 'Test payment for debugging purposes',
            },
            unit_amount: 70000 // $700.00 CAD in cents
          },
          quantity: 1
        }
      ],
      mode: 'payment',
      success_url: 'https://www.albertafamilycontracts.com/purchase/success?session_id={CHECKOUT_SESSION_ID}',
      cancel_url: 'https://www.albertafamilycontracts.com/dashboard',
      metadata: {
        test: 'true',
        purpose: 'debugging'
      },
      billing_address_collection: 'required',
      shipping_address_collection: {
        allowed_countries: ['CA']
      }
    });

    return NextResponse.json({ 
      success: true,
      checkout_url: session.url,
      session_id: session.id,
      message: 'Test checkout session created successfully'
    });

  } catch (error) {
    return NextResponse.json({
      error: 'Failed to create test checkout session',
      details: error instanceof Error ? error.message : 'Unknown error',
      stripe_configured: !!stripe,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
'use server';

import { redirect } from 'next/navigation';
import { withUser } from '@/lib/auth/middleware';

export const checkoutAction = withUser(async (formData, user) => {
  const priceId = formData.get('priceId') as string;
  // Note: teams were removed, so checkout sessions would need to be refactored
  // to work with individual users instead of teams
  console.log('Checkout action called for user:', user.id, 'priceId:', priceId);
  throw new Error('Checkout functionality needs to be reimplemented without teams');
});

export const customerPortalAction = withUser(async (_, user) => {
  // Note: customer portal was team-based, needs reimplementation for individual users
  console.log('Customer portal action called for user:', user.id);
  throw new Error('Customer portal functionality needs to be reimplemented without teams');
});

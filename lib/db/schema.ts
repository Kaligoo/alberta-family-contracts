import {
  pgTable,
  serial,
  varchar,
  text,
  timestamp,
  integer,
  decimal,
  json,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  role: varchar('role', { length: 20 }).notNull().default('member'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  deletedAt: timestamp('deleted_at'),
});



export const activityLogs = pgTable('activity_logs', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id),
  action: text('action').notNull(),
  timestamp: timestamp('timestamp').notNull().defaultNow(),
  ipAddress: varchar('ip_address', { length: 45 }),
});


export const familyContracts = pgTable('family_contracts', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id),
  
  // Personal Information
  userFullName: varchar('user_full_name', { length: 255 }),
  partnerFullName: varchar('partner_full_name', { length: 255 }),
  userFirstName: varchar('user_first_name', { length: 100 }),
  partnerFirstName: varchar('partner_first_name', { length: 100 }),
  userPronouns: varchar('user_pronouns', { length: 50 }), // he/him/his, she/her/hers, they/them/theirs
  partnerPronouns: varchar('partner_pronouns', { length: 50 }), // he/him/his, she/her/hers, they/them/theirs
  userAge: integer('user_age'),
  partnerAge: integer('partner_age'),
  userJobTitle: varchar('user_job_title', { length: 255 }),
  partnerJobTitle: varchar('partner_job_title', { length: 255 }),
  userIncome: decimal('user_income', { precision: 12, scale: 2 }),
  partnerIncome: decimal('partner_income', { precision: 12, scale: 2 }),
  
  // Relationship Information  
  cohabDate: timestamp('cohab_date'),
  proposedMarriageDate: timestamp('proposed_marriage_date'),
  
  // Contact Information
  userEmail: varchar('user_email', { length: 255 }),
  userPhone: varchar('user_phone', { length: 50 }),
  userAddress: text('user_address'),
  userLawyer: text('user_lawyer'),
  partnerEmail: varchar('partner_email', { length: 255 }),
  partnerPhone: varchar('partner_phone', { length: 50 }),
  partnerAddress: text('partner_address'),
  partnerLawyer: text('partner_lawyer'),
  
  // Children Information (stored as JSON array)
  children: json('children').$type<Array<{
    name: string;
    birthdate?: string;
    relationship: 'biological' | 'step' | 'adopted';
    parentage: 'user' | 'partner' | 'both';
  }>>(),
  
  // Contract Details
  contractType: varchar('contract_type', { length: 50 }).notNull().default('cohabitation'),
  propertySeparationType: varchar('property_separation_type', { length: 50 }), // 'separate_always', 'separate_until_marriage', 'separate_until_children', 'joint_except_specific', 'complicated'
  spousalSupportType: varchar('spousal_support_type', { length: 50 }), // 'no_affect_child_support', 'full_waiver', 'waiver_until_children', 'complicated'
  status: varchar('status', { length: 20 }).notNull().default('draft'), // draft, preview, paid
  
  // Address Information
  residenceAddress: text('residence_address'),
  residenceOwnership: varchar('residence_ownership', { length: 50 }), // owned_user, owned_partner, owned_jointly, rented
  
  // Financial Arrangements
  expenseSplitType: varchar('expense_split_type', { length: 50 }), // equal, proportional, custom
  customExpenseSplit: json('custom_expense_split').$type<{
    userPercentage: number;
    partnerPercentage: number;
  }>(),
  
  // Additional Information
  additionalClauses: text('additional_clauses'),
  notes: text('notes'),
  
  // Document Generation
  documentGenerated: timestamp('document_generated'),
  documentPath: varchar('document_path', { length: 500 }),
  
  // Current Contract Flag
  isCurrentContract: varchar('is_current_contract', { length: 10 }).default('false'),
  
  // Payment Status
  isPaid: varchar('is_paid', { length: 10 }).default('false'),
  
  // Terms and Conditions Acceptance
  termsAccepted: varchar('terms_accepted', { length: 10 }).default('false'),
  termsAcceptedAt: timestamp('terms_accepted_at'),
  
  // Affiliate and Coupon Tracking
  affiliateLinkId: integer('affiliate_link_id').references(() => affiliateLinks.id),
  couponCodeId: integer('coupon_code_id').references(() => couponCodes.id),
  originalPrice: decimal('original_price', { precision: 10, scale: 2 }),
  discountAmount: decimal('discount_amount', { precision: 10, scale: 2 }),
  finalPrice: decimal('final_price', { precision: 10, scale: 2 }),
  
  // Schedule A - Statement of Income, Assets and Liabilities
  // A. INCOME section
  scheduleIncomeEmployment: decimal('schedule_income_employment', { precision: 12, scale: 2 }),
  scheduleIncomeEI: decimal('schedule_income_ei', { precision: 12, scale: 2 }),
  scheduleIncomeWorkersComp: decimal('schedule_income_workers_comp', { precision: 12, scale: 2 }),
  scheduleIncomeInvestment: decimal('schedule_income_investment', { precision: 12, scale: 2 }),
  scheduleIncomePension: decimal('schedule_income_pension', { precision: 12, scale: 2 }),
  scheduleIncomeGovernmentAssistance: decimal('schedule_income_government_assistance', { precision: 12, scale: 2 }),
  scheduleIncomeSelfEmployment: decimal('schedule_income_self_employment', { precision: 12, scale: 2 }),
  scheduleIncomeOther: decimal('schedule_income_other', { precision: 12, scale: 2 }),
  scheduleIncomeTotalTaxReturn: decimal('schedule_income_total_tax_return', { precision: 12, scale: 2 }),
  
  // B. ASSETS section (stored as JSON arrays)
  scheduleAssetsRealEstate: json('schedule_assets_real_estate').$type<Array<{
    particulars: string;
    dateAcquired: string;
    estimatedValue: number;
  }>>(),
  scheduleAssetsVehicles: json('schedule_assets_vehicles').$type<Array<{
    particulars: string;
    dateAcquired: string;
    estimatedValue: number;
  }>>(),
  scheduleAssetsFinancial: json('schedule_assets_financial').$type<Array<{
    particulars: string;
    dateAcquired: string;
    estimatedValue: number;
  }>>(),
  scheduleAssetsPensions: json('schedule_assets_pensions').$type<Array<{
    particulars: string;
    dateAcquired: string;
    estimatedValue: number;
  }>>(),
  scheduleAssetsBusiness: json('schedule_assets_business').$type<Array<{
    particulars: string;
    dateAcquired: string;
    estimatedValue: number;
  }>>(),
  scheduleAssetsOther: json('schedule_assets_other').$type<Array<{
    particulars: string;
    dateAcquired: string;
    estimatedValue: number;
  }>>(),
  
  // C. DEBTS section (stored as JSON arrays)
  scheduleDebtsSecured: json('schedule_debts_secured').$type<Array<{
    particulars: string;
    dateIncurred: string;
    balanceOwing: number;
    monthlyPayment: number;
  }>>(),
  scheduleDebtsUnsecured: json('schedule_debts_unsecured').$type<Array<{
    particulars: string;
    dateIncurred: string;
    balanceOwing: number;
    monthlyPayment: number;
  }>>(),
  scheduleDebtsOther: json('schedule_debts_other').$type<Array<{
    particulars: string;
    dateIncurred: string;
    balanceOwing: number;
    monthlyPayment: number;
  }>>(),

  // Schedule B - Partner's Statement of Income, Assets and Liabilities
  // A. INCOME section
  scheduleBIncomeEmployment: decimal('schedule_b_income_employment', { precision: 12, scale: 2 }),
  scheduleBIncomeEI: decimal('schedule_b_income_ei', { precision: 12, scale: 2 }),
  scheduleBIncomeWorkersComp: decimal('schedule_b_income_workers_comp', { precision: 12, scale: 2 }),
  scheduleBIncomeInvestment: decimal('schedule_b_income_investment', { precision: 12, scale: 2 }),
  scheduleBIncomePension: decimal('schedule_b_income_pension', { precision: 12, scale: 2 }),
  scheduleBIncomeGovernmentAssistance: decimal('schedule_b_income_government_assistance', { precision: 12, scale: 2 }),
  scheduleBIncomeSelfEmployment: decimal('schedule_b_income_self_employment', { precision: 12, scale: 2 }),
  scheduleBIncomeOther: decimal('schedule_b_income_other', { precision: 12, scale: 2 }),
  scheduleBIncomeTotalTaxReturn: decimal('schedule_b_income_total_tax_return', { precision: 12, scale: 2 }),
  
  // B. ASSETS section (stored as JSON arrays)
  scheduleBAssetsRealEstate: json('schedule_b_assets_real_estate').$type<Array<{
    particulars: string;
    dateAcquired: string;
    estimatedValue: number;
  }>>(),
  scheduleBAssetsVehicles: json('schedule_b_assets_vehicles').$type<Array<{
    particulars: string;
    dateAcquired: string;
    estimatedValue: number;
  }>>(),
  scheduleBAssetsFinancial: json('schedule_b_assets_financial').$type<Array<{
    particulars: string;
    dateAcquired: string;
    estimatedValue: number;
  }>>(),
  scheduleBAssetsPensions: json('schedule_b_assets_pensions').$type<Array<{
    particulars: string;
    dateAcquired: string;
    estimatedValue: number;
  }>>(),
  scheduleBAssetsBusiness: json('schedule_b_assets_business').$type<Array<{
    particulars: string;
    dateAcquired: string;
    estimatedValue: number;
  }>>(),
  scheduleBAssetsOther: json('schedule_b_assets_other').$type<Array<{
    particulars: string;
    dateAcquired: string;
    estimatedValue: number;
  }>>(),
  
  // C. DEBTS section (stored as JSON arrays)
  scheduleBDebtsSecured: json('schedule_b_debts_secured').$type<Array<{
    particulars: string;
    dateIncurred: string;
    balanceOwing: number;
    monthlyPayment: number;
  }>>(),
  scheduleBDebtsUnsecured: json('schedule_b_debts_unsecured').$type<Array<{
    particulars: string;
    dateIncurred: string;
    balanceOwing: number;
    monthlyPayment: number;
  }>>(),
  scheduleBDebtsOther: json('schedule_b_debts_other').$type<Array<{
    particulars: string;
    dateIncurred: string;
    balanceOwing: number;
    monthlyPayment: number;
  }>>(),
  
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const templates = pgTable('templates', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  filename: varchar('filename', { length: 255 }).notNull(),
  description: text('description'),
  content: text('content').notNull(), // Base64 encoded docx content
  size: integer('size').notNull(),
  isActive: varchar('is_active', { length: 10 }).notNull().default('false'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const lawyers = pgTable('lawyers', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull(),
  firm: varchar('firm', { length: 255 }).notNull(),
  phone: varchar('phone', { length: 50 }),
  address: text('address'),
  website: varchar('website', { length: 255 }), // Law firm website
  party: varchar('party', { length: 20 }).notNull(), // 'user', 'partner', or 'both'
  isActive: varchar('is_active', { length: 10 }).notNull().default('true'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const affiliateLinks = pgTable('affiliate_links', {
  id: serial('id').primaryKey(),
  code: varchar('code', { length: 50 }).notNull().unique(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  commissionRate: decimal('commission_rate', { precision: 5, scale: 2 }).notNull().default('0.00'), // Percentage (e.g., 10.50% = 10.50)
  totalClicks: integer('total_clicks').notNull().default(0),
  totalSignups: integer('total_signups').notNull().default(0),
  totalPurchases: integer('total_purchases').notNull().default(0),
  totalCommission: decimal('total_commission', { precision: 12, scale: 2 }).notNull().default('0.00'),
  isActive: varchar('is_active', { length: 10 }).notNull().default('true'),
  createdBy: integer('created_by').notNull().references(() => users.id),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const couponCodes = pgTable('coupon_codes', {
  id: serial('id').primaryKey(),
  code: varchar('code', { length: 50 }).notNull().unique(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  discountType: varchar('discount_type', { length: 20 }).notNull(), // 'percentage' or 'fixed'
  discountValue: decimal('discount_value', { precision: 10, scale: 2 }).notNull(), // Amount or percentage
  minimumAmount: decimal('minimum_amount', { precision: 10, scale: 2 }), // Minimum purchase amount
  usageLimit: integer('usage_limit'), // null = unlimited
  usageCount: integer('usage_count').notNull().default(0),
  validFrom: timestamp('valid_from').notNull().defaultNow(),
  validTo: timestamp('valid_to'),
  isActive: varchar('is_active', { length: 10 }).notNull().default('true'),
  createdBy: integer('created_by').notNull().references(() => users.id),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const affiliateTracking = pgTable('affiliate_tracking', {
  id: serial('id').primaryKey(),
  affiliateLinkId: integer('affiliate_link_id').notNull().references(() => affiliateLinks.id),
  userId: integer('user_id').references(() => users.id), // null for anonymous clicks
  contractId: integer('contract_id').references(() => familyContracts.id), // null until purchase
  action: varchar('action', { length: 20 }).notNull(), // 'click', 'signup', 'purchase'
  ipAddress: varchar('ip_address', { length: 45 }),
  userAgent: text('user_agent'),
  referrer: text('referrer'),
  commissionAmount: decimal('commission_amount', { precision: 10, scale: 2 }), // null for clicks/signups
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const couponUsage = pgTable('coupon_usage', {
  id: serial('id').primaryKey(),
  couponCodeId: integer('coupon_code_id').notNull().references(() => couponCodes.id),
  userId: integer('user_id').notNull().references(() => users.id),
  contractId: integer('contract_id').notNull().references(() => familyContracts.id),
  discountAmount: decimal('discount_amount', { precision: 10, scale: 2 }).notNull(),
  originalAmount: decimal('original_amount', { precision: 10, scale: 2 }).notNull(),
  finalAmount: decimal('final_amount', { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const usersRelations = relations(users, ({ many }) => ({
  familyContracts: many(familyContracts),
}));

export const activityLogsRelations = relations(activityLogs, ({ one }) => ({
  user: one(users, {
    fields: [activityLogs.userId],
    references: [users.id],
  }),
}));

export const familyContractsRelations = relations(familyContracts, ({ one, many }) => ({
  user: one(users, {
    fields: [familyContracts.userId],
    references: [users.id],
  }),
  affiliateTracking: many(affiliateTracking),
  couponUsage: many(couponUsage),
}));

export const affiliateLinksRelations = relations(affiliateLinks, ({ one, many }) => ({
  createdBy: one(users, {
    fields: [affiliateLinks.createdBy],
    references: [users.id],
  }),
  tracking: many(affiliateTracking),
}));

export const couponCodesRelations = relations(couponCodes, ({ one, many }) => ({
  createdBy: one(users, {
    fields: [couponCodes.createdBy],
    references: [users.id],
  }),
  usage: many(couponUsage),
}));

export const affiliateTrackingRelations = relations(affiliateTracking, ({ one }) => ({
  affiliateLink: one(affiliateLinks, {
    fields: [affiliateTracking.affiliateLinkId],
    references: [affiliateLinks.id],
  }),
  user: one(users, {
    fields: [affiliateTracking.userId],
    references: [users.id],
  }),
  contract: one(familyContracts, {
    fields: [affiliateTracking.contractId],
    references: [familyContracts.id],
  }),
}));

export const couponUsageRelations = relations(couponUsage, ({ one }) => ({
  couponCode: one(couponCodes, {
    fields: [couponUsage.couponCodeId],
    references: [couponCodes.id],
  }),
  user: one(users, {
    fields: [couponUsage.userId],
    references: [users.id],
  }),
  contract: one(familyContracts, {
    fields: [couponUsage.contractId],
    references: [familyContracts.id],
  }),
}));

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type ActivityLog = typeof activityLogs.$inferSelect;
export type NewActivityLog = typeof activityLogs.$inferInsert;
export type FamilyContract = typeof familyContracts.$inferSelect;
export type NewFamilyContract = typeof familyContracts.$inferInsert;
export type Template = typeof templates.$inferSelect;
export type NewTemplate = typeof templates.$inferInsert;
export type Lawyer = typeof lawyers.$inferSelect;
export type NewLawyer = typeof lawyers.$inferInsert;
export type AffiliateLink = typeof affiliateLinks.$inferSelect;
export type NewAffiliateLink = typeof affiliateLinks.$inferInsert;
export type CouponCode = typeof couponCodes.$inferSelect;
export type NewCouponCode = typeof couponCodes.$inferInsert;
export type AffiliateTracking = typeof affiliateTracking.$inferSelect;
export type NewAffiliateTracking = typeof affiliateTracking.$inferInsert;
export type CouponUsage = typeof couponUsage.$inferSelect;
export type NewCouponUsage = typeof couponUsage.$inferInsert;

export enum ActivityType {
  SIGN_UP = 'SIGN_UP',
  SIGN_IN = 'SIGN_IN',
  SIGN_OUT = 'SIGN_OUT',
  UPDATE_PASSWORD = 'UPDATE_PASSWORD',
  DELETE_ACCOUNT = 'DELETE_ACCOUNT',
  UPDATE_ACCOUNT = 'UPDATE_ACCOUNT',
  CREATE_CONTRACT = 'CREATE_CONTRACT',
  UPDATE_CONTRACT = 'UPDATE_CONTRACT',
  GENERATE_DOCUMENT = 'GENERATE_DOCUMENT',
  PURCHASE_CONTRACT = 'PURCHASE_CONTRACT',
}

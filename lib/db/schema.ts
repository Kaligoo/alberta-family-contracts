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

export const teams = pgTable('teams', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  stripeCustomerId: text('stripe_customer_id').unique(),
  stripeSubscriptionId: text('stripe_subscription_id').unique(),
  stripeProductId: text('stripe_product_id'),
  planName: varchar('plan_name', { length: 50 }),
  subscriptionStatus: varchar('subscription_status', { length: 20 }),
});

export const teamMembers = pgTable('team_members', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id),
  teamId: integer('team_id')
    .notNull()
    .references(() => teams.id),
  role: varchar('role', { length: 50 }).notNull(),
  joinedAt: timestamp('joined_at').notNull().defaultNow(),
});

export const activityLogs = pgTable('activity_logs', {
  id: serial('id').primaryKey(),
  teamId: integer('team_id')
    .notNull()
    .references(() => teams.id),
  userId: integer('user_id').references(() => users.id),
  action: text('action').notNull(),
  timestamp: timestamp('timestamp').notNull().defaultNow(),
  ipAddress: varchar('ip_address', { length: 45 }),
});

export const invitations = pgTable('invitations', {
  id: serial('id').primaryKey(),
  teamId: integer('team_id')
    .notNull()
    .references(() => teams.id),
  email: varchar('email', { length: 255 }).notNull(),
  role: varchar('role', { length: 50 }).notNull(),
  invitedBy: integer('invited_by')
    .notNull()
    .references(() => users.id),
  invitedAt: timestamp('invited_at').notNull().defaultNow(),
  status: varchar('status', { length: 20 }).notNull().default('pending'),
});

export const familyContracts = pgTable('family_contracts', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id),
  teamId: integer('team_id')
    .notNull()
    .references(() => teams.id),
  
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

export const teamsRelations = relations(teams, ({ many }) => ({
  teamMembers: many(teamMembers),
  activityLogs: many(activityLogs),
  invitations: many(invitations),
  familyContracts: many(familyContracts),
}));

export const usersRelations = relations(users, ({ many }) => ({
  teamMembers: many(teamMembers),
  invitationsSent: many(invitations),
  familyContracts: many(familyContracts),
}));

export const invitationsRelations = relations(invitations, ({ one }) => ({
  team: one(teams, {
    fields: [invitations.teamId],
    references: [teams.id],
  }),
  invitedBy: one(users, {
    fields: [invitations.invitedBy],
    references: [users.id],
  }),
}));

export const teamMembersRelations = relations(teamMembers, ({ one }) => ({
  user: one(users, {
    fields: [teamMembers.userId],
    references: [users.id],
  }),
  team: one(teams, {
    fields: [teamMembers.teamId],
    references: [teams.id],
  }),
}));

export const activityLogsRelations = relations(activityLogs, ({ one }) => ({
  team: one(teams, {
    fields: [activityLogs.teamId],
    references: [teams.id],
  }),
  user: one(users, {
    fields: [activityLogs.userId],
    references: [users.id],
  }),
}));

export const familyContractsRelations = relations(familyContracts, ({ one }) => ({
  user: one(users, {
    fields: [familyContracts.userId],
    references: [users.id],
  }),
  team: one(teams, {
    fields: [familyContracts.teamId],
    references: [teams.id],
  }),
}));

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Team = typeof teams.$inferSelect;
export type NewTeam = typeof teams.$inferInsert;
export type TeamMember = typeof teamMembers.$inferSelect;
export type NewTeamMember = typeof teamMembers.$inferInsert;
export type ActivityLog = typeof activityLogs.$inferSelect;
export type NewActivityLog = typeof activityLogs.$inferInsert;
export type Invitation = typeof invitations.$inferSelect;
export type NewInvitation = typeof invitations.$inferInsert;
export type FamilyContract = typeof familyContracts.$inferSelect;
export type NewFamilyContract = typeof familyContracts.$inferInsert;
export type Template = typeof templates.$inferSelect;
export type NewTemplate = typeof templates.$inferInsert;
export type TeamDataWithMembers = Team & {
  teamMembers: (TeamMember & {
    user: Pick<User, 'id' | 'name' | 'email'>;
  })[];
};

export enum ActivityType {
  SIGN_UP = 'SIGN_UP',
  SIGN_IN = 'SIGN_IN',
  SIGN_OUT = 'SIGN_OUT',
  UPDATE_PASSWORD = 'UPDATE_PASSWORD',
  DELETE_ACCOUNT = 'DELETE_ACCOUNT',
  UPDATE_ACCOUNT = 'UPDATE_ACCOUNT',
  CREATE_TEAM = 'CREATE_TEAM',
  REMOVE_TEAM_MEMBER = 'REMOVE_TEAM_MEMBER',
  INVITE_TEAM_MEMBER = 'INVITE_TEAM_MEMBER',
  ACCEPT_INVITATION = 'ACCEPT_INVITATION',
  CREATE_CONTRACT = 'CREATE_CONTRACT',
  UPDATE_CONTRACT = 'UPDATE_CONTRACT',
  GENERATE_DOCUMENT = 'GENERATE_DOCUMENT',
  PURCHASE_CONTRACT = 'PURCHASE_CONTRACT',
}

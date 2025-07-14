import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  serial,
  integer,
  decimal,
  boolean,
  uuid,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table (required for Replit Auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table (required for Replit Auth)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  role: varchar("role", { enum: ["creator", "brand", "admin"] }).notNull().default("creator"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Creator profiles
export const creators = pgTable("creators", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  niche: varchar("niche").notNull(),
  bio: text("bio"),
  totalFollowers: integer("total_followers").default(0),
  avgEngagementRate: decimal("avg_engagement_rate", { precision: 5, scale: 2 }).default("0"),
  completedCampaigns: integer("completed_campaigns").default(0),
  rating: decimal("rating", { precision: 3, scale: 2 }).default("0"),
  rates: jsonb("rates"), // Pricing structure
  socialAccounts: jsonb("social_accounts"), // Connected social media accounts
  portfolio: jsonb("portfolio"), // Portfolio items
  isVerified: boolean("is_verified").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Brand profiles
export const brands = pgTable("brands", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  companyName: varchar("company_name").notNull(),
  industry: varchar("industry").notNull(),
  description: text("description"),
  website: varchar("website"),
  logoUrl: varchar("logo_url"),
  isVerified: boolean("is_verified").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Campaigns
export const campaigns = pgTable("campaigns", {
  id: serial("id").primaryKey(),
  brandId: integer("brand_id").notNull().references(() => brands.id),
  title: varchar("title").notNull(),
  description: text("description").notNull(),
  requirements: jsonb("requirements"), // Campaign requirements
  budget: jsonb("budget"), // Budget range
  platforms: jsonb("platforms"), // Target platforms
  targetAudience: jsonb("target_audience"), // Demographics
  deliverables: jsonb("deliverables"), // Expected deliverables
  deadline: timestamp("deadline"),
  status: varchar("status", { 
    enum: ["draft", "active", "paused", "completed", "cancelled"] 
  }).default("draft"),
  applicationsCount: integer("applications_count").default(0),
  selectedCreators: jsonb("selected_creators"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Campaign applications
export const campaignApplications = pgTable("campaign_applications", {
  id: serial("id").primaryKey(),
  campaignId: integer("campaign_id").notNull().references(() => campaigns.id),
  creatorId: integer("creator_id").notNull().references(() => creators.id),
  proposalText: text("proposal_text"),
  proposedRate: decimal("proposed_rate", { precision: 10, scale: 2 }),
  status: varchar("status", {
    enum: ["pending", "accepted", "rejected", "withdrawn"]
  }).default("pending"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Campaign collaborations (active work)
export const collaborations = pgTable("collaborations", {
  id: serial("id").primaryKey(),
  campaignId: integer("campaign_id").notNull().references(() => campaigns.id),
  creatorId: integer("creator_id").notNull().references(() => creators.id),
  agreedRate: decimal("agreed_rate", { precision: 10, scale: 2 }).notNull(),
  workflowStatus: varchar("workflow_status", {
    enum: ["brief_shared", "content_created", "under_review", "revision_requested", "approved", "published", "completed"]
  }).default("brief_shared"),
  contentSubmissions: jsonb("content_submissions"),
  feedback: jsonb("feedback"),
  revisionHistory: jsonb("revision_history"),
  finalContent: jsonb("final_content"),
  publishedAt: timestamp("published_at"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Messages
export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  collaborationId: integer("collaboration_id").notNull().references(() => collaborations.id),
  senderId: varchar("sender_id").notNull().references(() => users.id),
  content: text("content").notNull(),
  messageType: varchar("message_type", {
    enum: ["text", "file", "system"]
  }).default("text"),
  attachments: jsonb("attachments"),
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Payments
export const payments = pgTable("payments", {
  id: serial("id").primaryKey(),
  collaborationId: integer("collaboration_id").notNull().references(() => collaborations.id),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  platformCommission: decimal("platform_commission", { precision: 10, scale: 2 }).notNull(),
  creatorEarnings: decimal("creator_earnings", { precision: 10, scale: 2 }).notNull(),
  status: varchar("status", {
    enum: ["pending", "processing", "completed", "failed", "refunded"]
  }).default("pending"),
  paymentMethod: varchar("payment_method"),
  transactionId: varchar("transaction_id"),
  paidAt: timestamp("paid_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Analytics data
export const analytics = pgTable("analytics", {
  id: serial("id").primaryKey(),
  collaborationId: integer("collaboration_id").references(() => collaborations.id),
  creatorId: integer("creator_id").references(() => creators.id),
  campaignId: integer("campaign_id").references(() => campaigns.id),
  platform: varchar("platform").notNull(),
  reach: integer("reach").default(0),
  impressions: integer("impressions").default(0),
  engagements: integer("engagements").default(0),
  clicks: integer("clicks").default(0),
  conversions: integer("conversions").default(0),
  revenue: decimal("revenue", { precision: 10, scale: 2 }).default("0"),
  roi: decimal("roi", { precision: 5, scale: 2 }).default("0"),
  recordedAt: timestamp("recorded_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Notifications
export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  title: varchar("title").notNull(),
  message: text("message").notNull(),
  type: varchar("type", {
    enum: ["campaign", "payment", "message", "system", "collaboration"]
  }).notNull(),
  isRead: boolean("is_read").default(false),
  relatedId: varchar("related_id"), // ID of related entity
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ one, many }) => ({
  creator: one(creators, {
    fields: [users.id],
    references: [creators.userId],
  }),
  brand: one(brands, {
    fields: [users.id],
    references: [brands.userId],
  }),
  notifications: many(notifications),
  sentMessages: many(messages),
}));

export const creatorsRelations = relations(creators, ({ one, many }) => ({
  user: one(users, {
    fields: [creators.userId],
    references: [users.id],
  }),
  applications: many(campaignApplications),
  collaborations: many(collaborations),
  analytics: many(analytics),
}));

export const brandsRelations = relations(brands, ({ one, many }) => ({
  user: one(users, {
    fields: [brands.userId],
    references: [users.id],
  }),
  campaigns: many(campaigns),
}));

export const campaignsRelations = relations(campaigns, ({ one, many }) => ({
  brand: one(brands, {
    fields: [campaigns.brandId],
    references: [brands.id],
  }),
  applications: many(campaignApplications),
  collaborations: many(collaborations),
  analytics: many(analytics),
}));

export const campaignApplicationsRelations = relations(campaignApplications, ({ one }) => ({
  campaign: one(campaigns, {
    fields: [campaignApplications.campaignId],
    references: [campaigns.id],
  }),
  creator: one(creators, {
    fields: [campaignApplications.creatorId],
    references: [creators.id],
  }),
}));

export const collaborationsRelations = relations(collaborations, ({ one, many }) => ({
  campaign: one(campaigns, {
    fields: [collaborations.campaignId],
    references: [campaigns.id],
  }),
  creator: one(creators, {
    fields: [collaborations.creatorId],
    references: [creators.id],
  }),
  messages: many(messages),
  payment: one(payments, {
    fields: [collaborations.id],
    references: [payments.collaborationId],
  }),
  analytics: many(analytics),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  collaboration: one(collaborations, {
    fields: [messages.collaborationId],
    references: [collaborations.id],
  }),
  sender: one(users, {
    fields: [messages.senderId],
    references: [users.id],
  }),
}));

export const paymentsRelations = relations(payments, ({ one }) => ({
  collaboration: one(collaborations, {
    fields: [payments.collaborationId],
    references: [collaborations.id],
  }),
}));

export const analyticsRelations = relations(analytics, ({ one }) => ({
  collaboration: one(collaborations, {
    fields: [analytics.collaborationId],
    references: [collaborations.id],
  }),
  creator: one(creators, {
    fields: [analytics.creatorId],
    references: [creators.id],
  }),
  campaign: one(campaigns, {
    fields: [analytics.campaignId],
    references: [campaigns.id],
  }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users);
export const insertCreatorSchema = createInsertSchema(creators).omit({ id: true, createdAt: true, updatedAt: true });
export const insertBrandSchema = createInsertSchema(brands).omit({ id: true, createdAt: true, updatedAt: true });
export const insertCampaignSchema = createInsertSchema(campaigns).omit({ id: true, createdAt: true, updatedAt: true });
export const insertCampaignApplicationSchema = createInsertSchema(campaignApplications).omit({ id: true, createdAt: true, updatedAt: true });
export const insertCollaborationSchema = createInsertSchema(collaborations).omit({ id: true, createdAt: true, updatedAt: true });
export const insertMessageSchema = createInsertSchema(messages).omit({ id: true, createdAt: true });
export const insertPaymentSchema = createInsertSchema(payments).omit({ id: true, createdAt: true });
export const insertAnalyticsSchema = createInsertSchema(analytics).omit({ id: true, createdAt: true });
export const insertNotificationSchema = createInsertSchema(notifications).omit({ id: true, createdAt: true });

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type InsertCreator = z.infer<typeof insertCreatorSchema>;
export type Creator = typeof creators.$inferSelect;
export type InsertBrand = z.infer<typeof insertBrandSchema>;
export type Brand = typeof brands.$inferSelect;
export type InsertCampaign = z.infer<typeof insertCampaignSchema>;
export type Campaign = typeof campaigns.$inferSelect;
export type InsertCampaignApplication = z.infer<typeof insertCampaignApplicationSchema>;
export type CampaignApplication = typeof campaignApplications.$inferSelect;
export type InsertCollaboration = z.infer<typeof insertCollaborationSchema>;
export type Collaboration = typeof collaborations.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof messages.$inferSelect;
export type InsertPayment = z.infer<typeof insertPaymentSchema>;
export type Payment = typeof payments.$inferSelect;
export type InsertAnalytics = z.infer<typeof insertAnalyticsSchema>;
export type Analytics = typeof analytics.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type Notification = typeof notifications.$inferSelect;

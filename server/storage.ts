import {
  users,
  creators,
  brands,
  campaigns,
  campaignApplications,
  collaborations,
  messages,
  payments,
  analytics,
  notifications,
  type User,
  type UpsertUser,
  type Creator,
  type InsertCreator,
  type Brand,
  type InsertBrand,
  type Campaign,
  type InsertCampaign,
  type CampaignApplication,
  type InsertCampaignApplication,
  type Collaboration,
  type InsertCollaboration,
  type Message,
  type InsertMessage,
  type Payment,
  type InsertPayment,
  type Analytics,
  type InsertAnalytics,
  type Notification,
  type InsertNotification,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, or, like, gte, lte, count, sql } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Creator operations
  createCreator(creator: InsertCreator): Promise<Creator>;
  getCreator(userId: string): Promise<Creator | undefined>;
  getCreatorById(id: number): Promise<Creator | undefined>;
  updateCreator(id: number, data: Partial<InsertCreator>): Promise<Creator>;
  searchCreators(filters: any): Promise<Creator[]>;
  
  // Brand operations
  createBrand(brand: InsertBrand): Promise<Brand>;
  getBrand(userId: string): Promise<Brand | undefined>;
  getBrandById(id: number): Promise<Brand | undefined>;
  updateBrand(id: number, data: Partial<InsertBrand>): Promise<Brand>;
  
  // Campaign operations
  createCampaign(campaign: InsertCampaign): Promise<Campaign>;
  getCampaign(id: number): Promise<Campaign | undefined>;
  getCampaigns(filters?: any): Promise<Campaign[]>;
  getBrandCampaigns(brandId: number): Promise<Campaign[]>;
  updateCampaign(id: number, data: Partial<InsertCampaign>): Promise<Campaign>;
  deleteCampaign(id: number): Promise<void>;
  
  // Campaign application operations
  createApplication(application: InsertCampaignApplication): Promise<CampaignApplication>;
  getApplications(campaignId: number): Promise<CampaignApplication[]>;
  getCreatorApplications(creatorId: number): Promise<CampaignApplication[]>;
  updateApplication(id: number, data: Partial<InsertCampaignApplication>): Promise<CampaignApplication>;
  
  // Collaboration operations
  createCollaboration(collaboration: InsertCollaboration): Promise<Collaboration>;
  getCollaboration(id: number): Promise<Collaboration | undefined>;
  getCreatorCollaborations(creatorId: number): Promise<Collaboration[]>;
  getBrandCollaborations(brandId: number): Promise<Collaboration[]>;
  updateCollaboration(id: number, data: Partial<InsertCollaboration>): Promise<Collaboration>;
  
  // Message operations
  createMessage(message: InsertMessage): Promise<Message>;
  getMessages(collaborationId: number): Promise<Message[]>;
  markMessagesAsRead(collaborationId: number, userId: string): Promise<void>;
  
  // Payment operations
  createPayment(payment: InsertPayment): Promise<Payment>;
  getPayment(collaborationId: number): Promise<Payment | undefined>;
  updatePayment(id: number, data: Partial<InsertPayment>): Promise<Payment>;
  getCreatorPayments(creatorId: number): Promise<Payment[]>;
  
  // Analytics operations
  createAnalytics(analytics: InsertAnalytics): Promise<Analytics>;
  getCollaborationAnalytics(collaborationId: number): Promise<Analytics[]>;
  getCreatorAnalytics(creatorId: number): Promise<Analytics[]>;
  getCampaignAnalytics(campaignId: number): Promise<Analytics[]>;
  
  // Notification operations
  createNotification(notification: InsertNotification): Promise<Notification>;
  getUserNotifications(userId: string): Promise<Notification[]>;
  markNotificationAsRead(id: number): Promise<void>;
  markAllNotificationsAsRead(userId: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // User operations (required for Replit Auth)
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Creator operations
  async createCreator(creator: InsertCreator): Promise<Creator> {
    const [newCreator] = await db.insert(creators).values(creator).returning();
    return newCreator;
  }

  async getCreator(userId: string): Promise<Creator | undefined> {
    const [creator] = await db.select().from(creators).where(eq(creators.userId, userId));
    return creator;
  }

  async getCreatorById(id: number): Promise<Creator | undefined> {
    const [creator] = await db.select().from(creators).where(eq(creators.id, id));
    return creator;
  }

  async updateCreator(id: number, data: Partial<InsertCreator>): Promise<Creator> {
    const [creator] = await db
      .update(creators)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(creators.id, id))
      .returning();
    return creator;
  }

  async searchCreators(filters: any): Promise<Creator[]> {
    let query = db.select().from(creators);
    
    const conditions = [];
    
    if (filters.niche) {
      conditions.push(eq(creators.niche, filters.niche));
    }
    
    if (filters.minFollowers) {
      conditions.push(gte(creators.totalFollowers, filters.minFollowers));
    }
    
    if (filters.maxFollowers) {
      conditions.push(lte(creators.totalFollowers, filters.maxFollowers));
    }
    
    if (filters.minEngagement) {
      conditions.push(gte(creators.avgEngagementRate, filters.minEngagement));
    }
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }
    
    return await query.orderBy(desc(creators.rating));
  }

  // Brand operations
  async createBrand(brand: InsertBrand): Promise<Brand> {
    const [newBrand] = await db.insert(brands).values(brand).returning();
    return newBrand;
  }

  async getBrand(userId: string): Promise<Brand | undefined> {
    const [brand] = await db.select().from(brands).where(eq(brands.userId, userId));
    return brand;
  }

  async getBrandById(id: number): Promise<Brand | undefined> {
    const [brand] = await db.select().from(brands).where(eq(brands.id, id));
    return brand;
  }

  async updateBrand(id: number, data: Partial<InsertBrand>): Promise<Brand> {
    const [brand] = await db
      .update(brands)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(brands.id, id))
      .returning();
    return brand;
  }

  // Campaign operations
  async createCampaign(campaign: InsertCampaign): Promise<Campaign> {
    const [newCampaign] = await db.insert(campaigns).values(campaign).returning();
    return newCampaign;
  }

  async getCampaign(id: number): Promise<Campaign | undefined> {
    const [campaign] = await db.select().from(campaigns).where(eq(campaigns.id, id));
    return campaign;
  }

  async getCampaigns(filters?: any): Promise<Campaign[]> {
    let query = db.select().from(campaigns);
    
    const conditions = [eq(campaigns.status, "active")];
    
    if (filters?.industry) {
      // Join with brands to filter by industry
      query = db.select().from(campaigns)
        .innerJoin(brands, eq(campaigns.brandId, brands.id))
        .where(and(eq(campaigns.status, "active"), eq(brands.industry, filters.industry)));
      return await query.orderBy(desc(campaigns.createdAt));
    }
    
    if (filters?.search) {
      conditions.push(or(
        like(campaigns.title, `%${filters.search}%`),
        like(campaigns.description, `%${filters.search}%`)
      ));
    }
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }
    
    return await query.orderBy(desc(campaigns.createdAt));
  }

  async getBrandCampaigns(brandId: number): Promise<Campaign[]> {
    return await db.select().from(campaigns)
      .where(eq(campaigns.brandId, brandId))
      .orderBy(desc(campaigns.createdAt));
  }

  async updateCampaign(id: number, data: Partial<InsertCampaign>): Promise<Campaign> {
    const [campaign] = await db
      .update(campaigns)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(campaigns.id, id))
      .returning();
    return campaign;
  }

  async deleteCampaign(id: number): Promise<void> {
    await db.delete(campaigns).where(eq(campaigns.id, id));
  }

  // Campaign application operations
  async createApplication(application: InsertCampaignApplication): Promise<CampaignApplication> {
    const [newApplication] = await db.insert(campaignApplications).values(application).returning();
    
    // Update campaign applications count
    await db.update(campaigns)
      .set({ 
        applicationsCount: sql`${campaigns.applicationsCount} + 1` 
      })
      .where(eq(campaigns.id, application.campaignId));
    
    return newApplication;
  }

  async getApplications(campaignId: number): Promise<CampaignApplication[]> {
    return await db.select().from(campaignApplications)
      .where(eq(campaignApplications.campaignId, campaignId))
      .orderBy(desc(campaignApplications.createdAt));
  }

  async getCreatorApplications(creatorId: number): Promise<CampaignApplication[]> {
    return await db.select().from(campaignApplications)
      .where(eq(campaignApplications.creatorId, creatorId))
      .orderBy(desc(campaignApplications.createdAt));
  }

  async updateApplication(id: number, data: Partial<InsertCampaignApplication>): Promise<CampaignApplication> {
    const [application] = await db
      .update(campaignApplications)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(campaignApplications.id, id))
      .returning();
    return application;
  }

  // Collaboration operations
  async createCollaboration(collaboration: InsertCollaboration): Promise<Collaboration> {
    const [newCollaboration] = await db.insert(collaborations).values(collaboration).returning();
    return newCollaboration;
  }

  async getCollaboration(id: number): Promise<Collaboration | undefined> {
    const [collaboration] = await db.select().from(collaborations).where(eq(collaborations.id, id));
    return collaboration;
  }

  async getCreatorCollaborations(creatorId: number): Promise<Collaboration[]> {
    return await db.select().from(collaborations)
      .where(eq(collaborations.creatorId, creatorId))
      .orderBy(desc(collaborations.createdAt));
  }

  async getBrandCollaborations(brandId: number): Promise<Collaboration[]> {
    return await db.select().from(collaborations)
      .innerJoin(campaigns, eq(collaborations.campaignId, campaigns.id))
      .where(eq(campaigns.brandId, brandId))
      .orderBy(desc(collaborations.createdAt));
  }

  async updateCollaboration(id: number, data: Partial<InsertCollaboration>): Promise<Collaboration> {
    const [collaboration] = await db
      .update(collaborations)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(collaborations.id, id))
      .returning();
    return collaboration;
  }

  // Message operations
  async createMessage(message: InsertMessage): Promise<Message> {
    const [newMessage] = await db.insert(messages).values(message).returning();
    return newMessage;
  }

  async getMessages(collaborationId: number): Promise<Message[]> {
    return await db.select().from(messages)
      .where(eq(messages.collaborationId, collaborationId))
      .orderBy(messages.createdAt);
  }

  async markMessagesAsRead(collaborationId: number, userId: string): Promise<void> {
    await db.update(messages)
      .set({ isRead: true })
      .where(and(
        eq(messages.collaborationId, collaborationId),
        eq(messages.senderId, userId)
      ));
  }

  // Payment operations
  async createPayment(payment: InsertPayment): Promise<Payment> {
    const [newPayment] = await db.insert(payments).values(payment).returning();
    return newPayment;
  }

  async getPayment(collaborationId: number): Promise<Payment | undefined> {
    const [payment] = await db.select().from(payments).where(eq(payments.collaborationId, collaborationId));
    return payment;
  }

  async updatePayment(id: number, data: Partial<InsertPayment>): Promise<Payment> {
    const [payment] = await db
      .update(payments)
      .set(data)
      .where(eq(payments.id, id))
      .returning();
    return payment;
  }

  async getCreatorPayments(creatorId: number): Promise<Payment[]> {
    return await db.select().from(payments)
      .innerJoin(collaborations, eq(payments.collaborationId, collaborations.id))
      .where(eq(collaborations.creatorId, creatorId))
      .orderBy(desc(payments.createdAt));
  }

  // Analytics operations
  async createAnalytics(analytics: InsertAnalytics): Promise<Analytics> {
    const [newAnalytics] = await db.insert(analytics).values(analytics).returning();
    return newAnalytics;
  }

  async getCollaborationAnalytics(collaborationId: number): Promise<Analytics[]> {
    return await db.select().from(analytics)
      .where(eq(analytics.collaborationId, collaborationId))
      .orderBy(desc(analytics.recordedAt));
  }

  async getCreatorAnalytics(creatorId: number): Promise<Analytics[]> {
    return await db.select().from(analytics)
      .where(eq(analytics.creatorId, creatorId))
      .orderBy(desc(analytics.recordedAt));
  }

  async getCampaignAnalytics(campaignId: number): Promise<Analytics[]> {
    return await db.select().from(analytics)
      .where(eq(analytics.campaignId, campaignId))
      .orderBy(desc(analytics.recordedAt));
  }

  // Notification operations
  async createNotification(notification: InsertNotification): Promise<Notification> {
    const [newNotification] = await db.insert(notifications).values(notification).returning();
    return newNotification;
  }

  async getUserNotifications(userId: string): Promise<Notification[]> {
    return await db.select().from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt));
  }

  async markNotificationAsRead(id: number): Promise<void> {
    await db.update(notifications)
      .set({ isRead: true })
      .where(eq(notifications.id, id));
  }

  async markAllNotificationsAsRead(userId: string): Promise<void> {
    await db.update(notifications)
      .set({ isRead: true })
      .where(eq(notifications.userId, userId));
  }
}

export const storage = new DatabaseStorage();

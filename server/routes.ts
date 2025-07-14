import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { 
  insertCreatorSchema, 
  insertBrandSchema, 
  insertCampaignSchema,
  insertCampaignApplicationSchema,
  insertCollaborationSchema,
  insertMessageSchema,
  insertAnalyticsSchema,
  insertNotificationSchema
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Check if user has creator or brand profile
      const creator = await storage.getCreator(userId);
      const brand = await storage.getBrand(userId);

      res.json({
        ...user,
        creator,
        brand,
        hasProfile: !!(creator || brand)
      });
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Creator profile routes
  app.post('/api/creators', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const creatorData = insertCreatorSchema.parse({ ...req.body, userId });
      
      const creator = await storage.createCreator(creatorData);
      res.json(creator);
    } catch (error) {
      console.error("Error creating creator:", error);
      res.status(400).json({ message: "Failed to create creator profile" });
    }
  });

  app.get('/api/creators/me', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const creator = await storage.getCreator(userId);
      
      if (!creator) {
        return res.status(404).json({ message: "Creator profile not found" });
      }
      
      res.json(creator);
    } catch (error) {
      console.error("Error fetching creator:", error);
      res.status(500).json({ message: "Failed to fetch creator profile" });
    }
  });

  app.put('/api/creators/me', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const creator = await storage.getCreator(userId);
      
      if (!creator) {
        return res.status(404).json({ message: "Creator profile not found" });
      }
      
      const updateData = insertCreatorSchema.partial().parse(req.body);
      const updatedCreator = await storage.updateCreator(creator.id, updateData);
      
      res.json(updatedCreator);
    } catch (error) {
      console.error("Error updating creator:", error);
      res.status(400).json({ message: "Failed to update creator profile" });
    }
  });

  app.get('/api/creators/search', async (req, res) => {
    try {
      const filters = req.query;
      const creators = await storage.searchCreators(filters);
      res.json(creators);
    } catch (error) {
      console.error("Error searching creators:", error);
      res.status(500).json({ message: "Failed to search creators" });
    }
  });

  // Brand profile routes
  app.post('/api/brands', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const brandData = insertBrandSchema.parse({ ...req.body, userId });
      
      const brand = await storage.createBrand(brandData);
      res.json(brand);
    } catch (error) {
      console.error("Error creating brand:", error);
      res.status(400).json({ message: "Failed to create brand profile" });
    }
  });

  app.get('/api/brands/me', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const brand = await storage.getBrand(userId);
      
      if (!brand) {
        return res.status(404).json({ message: "Brand profile not found" });
      }
      
      res.json(brand);
    } catch (error) {
      console.error("Error fetching brand:", error);
      res.status(500).json({ message: "Failed to fetch brand profile" });
    }
  });

  // Campaign routes
  app.post('/api/campaigns', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const brand = await storage.getBrand(userId);
      
      if (!brand) {
        return res.status(403).json({ message: "Only brands can create campaigns" });
      }
      
      const campaignData = insertCampaignSchema.parse({ ...req.body, brandId: brand.id });
      const campaign = await storage.createCampaign(campaignData);
      
      res.json(campaign);
    } catch (error) {
      console.error("Error creating campaign:", error);
      res.status(400).json({ message: "Failed to create campaign" });
    }
  });

  app.get('/api/campaigns', async (req, res) => {
    try {
      const filters = req.query;
      const campaigns = await storage.getCampaigns(filters);
      res.json(campaigns);
    } catch (error) {
      console.error("Error fetching campaigns:", error);
      res.status(500).json({ message: "Failed to fetch campaigns" });
    }
  });

  app.get('/api/campaigns/my', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const brand = await storage.getBrand(userId);
      
      if (!brand) {
        return res.status(403).json({ message: "Only brands can access this endpoint" });
      }
      
      const campaigns = await storage.getBrandCampaigns(brand.id);
      res.json(campaigns);
    } catch (error) {
      console.error("Error fetching brand campaigns:", error);
      res.status(500).json({ message: "Failed to fetch campaigns" });
    }
  });

  app.get('/api/campaigns/:id', async (req, res) => {
    try {
      const campaignId = parseInt(req.params.id);
      const campaign = await storage.getCampaign(campaignId);
      
      if (!campaign) {
        return res.status(404).json({ message: "Campaign not found" });
      }
      
      res.json(campaign);
    } catch (error) {
      console.error("Error fetching campaign:", error);
      res.status(500).json({ message: "Failed to fetch campaign" });
    }
  });

  // Campaign application routes
  app.post('/api/campaigns/:id/apply', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const creator = await storage.getCreator(userId);
      
      if (!creator) {
        return res.status(403).json({ message: "Only creators can apply to campaigns" });
      }
      
      const campaignId = parseInt(req.params.id);
      const applicationData = insertCampaignApplicationSchema.parse({
        ...req.body,
        campaignId,
        creatorId: creator.id
      });
      
      const application = await storage.createApplication(applicationData);
      
      // Create notification for brand
      const campaign = await storage.getCampaign(campaignId);
      if (campaign) {
        const brand = await storage.getBrandById(campaign.brandId);
        if (brand) {
          await storage.createNotification({
            userId: brand.userId,
            title: "New Campaign Application",
            message: `A creator has applied to your campaign "${campaign.title}"`,
            type: "campaign",
            relatedId: application.id.toString()
          });
        }
      }
      
      res.json(application);
    } catch (error) {
      console.error("Error creating application:", error);
      res.status(400).json({ message: "Failed to apply to campaign" });
    }
  });

  app.get('/api/campaigns/:id/applications', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const campaignId = parseInt(req.params.id);
      
      // Verify user owns the campaign
      const campaign = await storage.getCampaign(campaignId);
      if (!campaign) {
        return res.status(404).json({ message: "Campaign not found" });
      }
      
      const brand = await storage.getBrand(userId);
      if (!brand || brand.id !== campaign.brandId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const applications = await storage.getApplications(campaignId);
      res.json(applications);
    } catch (error) {
      console.error("Error fetching applications:", error);
      res.status(500).json({ message: "Failed to fetch applications" });
    }
  });

  // Collaboration routes
  app.get('/api/collaborations/my', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const creator = await storage.getCreator(userId);
      const brand = await storage.getBrand(userId);
      
      let collaborations: any[] = [];
      
      if (creator) {
        collaborations = await storage.getCreatorCollaborations(creator.id);
      } else if (brand) {
        collaborations = await storage.getBrandCollaborations(brand.id);
      }
      
      res.json(collaborations);
    } catch (error) {
      console.error("Error fetching collaborations:", error);
      res.status(500).json({ message: "Failed to fetch collaborations" });
    }
  });

  app.get('/api/collaborations/:id', isAuthenticated, async (req: any, res) => {
    try {
      const collaborationId = parseInt(req.params.id);
      const collaboration = await storage.getCollaboration(collaborationId);
      
      if (!collaboration) {
        return res.status(404).json({ message: "Collaboration not found" });
      }
      
      res.json(collaboration);
    } catch (error) {
      console.error("Error fetching collaboration:", error);
      res.status(500).json({ message: "Failed to fetch collaboration" });
    }
  });

  app.put('/api/collaborations/:id', isAuthenticated, async (req: any, res) => {
    try {
      const collaborationId = parseInt(req.params.id);
      const updateData = req.body;
      
      const collaboration = await storage.updateCollaboration(collaborationId, updateData);
      res.json(collaboration);
    } catch (error) {
      console.error("Error updating collaboration:", error);
      res.status(400).json({ message: "Failed to update collaboration" });
    }
  });

  // Message routes
  app.get('/api/collaborations/:id/messages', isAuthenticated, async (req: any, res) => {
    try {
      const collaborationId = parseInt(req.params.id);
      const messages = await storage.getMessages(collaborationId);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  app.post('/api/collaborations/:id/messages', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const collaborationId = parseInt(req.params.id);
      
      const messageData = insertMessageSchema.parse({
        ...req.body,
        collaborationId,
        senderId: userId
      });
      
      const message = await storage.createMessage(messageData);
      
      // Broadcast message via WebSocket
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({
            type: 'new_message',
            data: message
          }));
        }
      });
      
      res.json(message);
    } catch (error) {
      console.error("Error creating message:", error);
      res.status(400).json({ message: "Failed to send message" });
    }
  });

  // Analytics routes
  app.get('/api/analytics/creator', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const creator = await storage.getCreator(userId);
      
      if (!creator) {
        return res.status(403).json({ message: "Only creators can access this endpoint" });
      }
      
      const analytics = await storage.getCreatorAnalytics(creator.id);
      res.json(analytics);
    } catch (error) {
      console.error("Error fetching creator analytics:", error);
      res.status(500).json({ message: "Failed to fetch analytics" });
    }
  });

  app.get('/api/analytics/campaign/:id', isAuthenticated, async (req: any, res) => {
    try {
      const campaignId = parseInt(req.params.id);
      const analytics = await storage.getCampaignAnalytics(campaignId);
      res.json(analytics);
    } catch (error) {
      console.error("Error fetching campaign analytics:", error);
      res.status(500).json({ message: "Failed to fetch analytics" });
    }
  });

  // Notification routes
  app.get('/api/notifications', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const notifications = await storage.getUserNotifications(userId);
      res.json(notifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  });

  app.put('/api/notifications/:id/read', isAuthenticated, async (req: any, res) => {
    try {
      const notificationId = parseInt(req.params.id);
      await storage.markNotificationAsRead(notificationId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error marking notification as read:", error);
      res.status(500).json({ message: "Failed to mark notification as read" });
    }
  });

  app.put('/api/notifications/read-all', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      await storage.markAllNotificationsAsRead(userId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      res.status(500).json({ message: "Failed to mark notifications as read" });
    }
  });

  const httpServer = createServer(app);

  // WebSocket setup
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  wss.on('connection', (ws) => {
    console.log('WebSocket client connected');

    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message.toString());
        
        // Handle different message types
        switch (data.type) {
          case 'join_collaboration':
            // Join a collaboration room for real-time updates
            (ws as any).collaborationId = data.collaborationId;
            break;
          case 'typing':
            // Broadcast typing indicators
            wss.clients.forEach((client) => {
              if (client !== ws && client.readyState === WebSocket.OPEN && (client as any).collaborationId === data.collaborationId) {
                client.send(JSON.stringify({
                  type: 'typing',
                  userId: data.userId,
                  collaborationId: data.collaborationId
                }));
              }
            });
            break;
        }
      } catch (error) {
        console.error('Error handling WebSocket message:', error);
      }
    });

    ws.on('close', () => {
      console.log('WebSocket client disconnected');
    });
  });

  return httpServer;
}

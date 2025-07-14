import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useWebSocket } from "./useWebSocket";
import { useToast } from "./use-toast";

interface UseRealTimeUpdatesOptions {
  userId?: string;
  collaborationIds?: number[];
  campaignIds?: number[];
}

export function useRealTimeUpdates(options: UseRealTimeUpdatesOptions = {}) {
  const { lastMessage, isConnected, sendMessage } = useWebSocket();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { userId, collaborationIds = [], campaignIds = [] } = options;

  useEffect(() => {
    if (!lastMessage) return;

    const { type, data } = lastMessage;

    switch (type) {
      case 'new_message':
        // Invalidate messages queries for the specific collaboration
        if (data.collaborationId && collaborationIds.includes(data.collaborationId)) {
          queryClient.invalidateQueries({
            queryKey: ["/api/collaborations", data.collaborationId, "messages"]
          });
        }
        
        // Show notification if message is not from current user
        if (data.senderId !== userId) {
          toast({
            title: "New Message",
            description: data.content.substring(0, 50) + (data.content.length > 50 ? "..." : ""),
          });
        }
        break;

      case 'collaboration_updated':
        // Invalidate collaboration queries
        queryClient.invalidateQueries({
          queryKey: ["/api/collaborations"]
        });
        
        if (data.collaborationId && collaborationIds.includes(data.collaborationId)) {
          queryClient.invalidateQueries({
            queryKey: ["/api/collaborations", data.collaborationId]
          });
        }

        // Show notification for status changes
        if (data.status && data.userId !== userId) {
          toast({
            title: "Collaboration Updated",
            description: `Status changed to ${data.status.replace("_", " ")}`,
          });
        }
        break;

      case 'campaign_updated':
        // Invalidate campaign queries
        queryClient.invalidateQueries({
          queryKey: ["/api/campaigns"]
        });
        
        if (data.campaignId && campaignIds.includes(data.campaignId)) {
          queryClient.invalidateQueries({
            queryKey: ["/api/campaigns", data.campaignId]
          });
        }
        break;

      case 'new_application':
        // Invalidate campaign applications
        queryClient.invalidateQueries({
          queryKey: ["/api/campaigns", data.campaignId, "applications"]
        });
        
        // Show notification for brand users
        if (data.brandUserId === userId) {
          toast({
            title: "New Campaign Application",
            description: `A creator has applied to your campaign "${data.campaignTitle}"`,
          });
        }
        break;

      case 'application_status_changed':
        // Invalidate application queries
        queryClient.invalidateQueries({
          queryKey: ["/api/applications"]
        });
        
        // Show notification for creator users
        if (data.creatorUserId === userId) {
          const statusText = data.status === 'accepted' ? 'accepted' : 'updated';
          toast({
            title: "Application Status Updated",
            description: `Your application has been ${statusText}`,
            variant: data.status === 'accepted' ? 'default' : 'destructive',
          });
        }
        break;

      case 'payment_processed':
        // Invalidate payment queries
        queryClient.invalidateQueries({
          queryKey: ["/api/payments"]
        });
        
        // Show notification for payment
        if (data.creatorUserId === userId) {
          toast({
            title: "Payment Received",
            description: `$${data.amount} has been deposited to your account`,
          });
        }
        break;

      case 'notification':
        // General notification
        if (data.userId === userId) {
          toast({
            title: data.title,
            description: data.message,
            variant: data.type === 'error' ? 'destructive' : 'default',
          });
        }
        
        // Invalidate notifications
        queryClient.invalidateQueries({
          queryKey: ["/api/notifications"]
        });
        break;

      case 'analytics_updated':
        // Invalidate analytics queries
        queryClient.invalidateQueries({
          queryKey: ["/api/analytics"]
        });
        break;

      case 'user_online':
      case 'user_offline':
        // Handle user presence updates
        // Could be used to show online status in UI
        break;

      default:
        console.log('Unhandled WebSocket message type:', type);
    }
  }, [lastMessage, queryClient, toast, userId, collaborationIds, campaignIds]);

  // Helper functions to send real-time updates
  const notifyCollaborationUpdate = (collaborationId: number, status: string) => {
    sendMessage({
      type: 'collaboration_status_changed',
      collaborationId,
      status,
      userId
    });
  };

  const notifyNewMessage = (collaborationId: number, messageId: number) => {
    sendMessage({
      type: 'message_sent',
      collaborationId,
      messageId,
      userId
    });
  };

  const joinCollaboration = (collaborationId: number) => {
    sendMessage({
      type: 'join_collaboration',
      collaborationId,
      userId
    });
  };

  const leaveCollaboration = (collaborationId: number) => {
    sendMessage({
      type: 'leave_collaboration',
      collaborationId,
      userId
    });
  };

  const updateUserPresence = (status: 'online' | 'away' | 'offline') => {
    sendMessage({
      type: 'presence_update',
      userId,
      status
    });
  };

  return {
    isConnected,
    notifyCollaborationUpdate,
    notifyNewMessage,
    joinCollaboration,
    leaveCollaboration,
    updateUserPresence,
    lastMessage
  };
}

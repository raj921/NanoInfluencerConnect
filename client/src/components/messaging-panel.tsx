import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useWebSocket } from "@/hooks/useWebSocket";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { 
  Send,
  Paperclip,
  Image as ImageIcon,
  File,
  Smile,
  MoreVertical,
  Check,
  CheckCheck,
  Clock
} from "lucide-react";

interface Message {
  id: number;
  collaborationId: number;
  senderId: string;
  content: string;
  messageType: string;
  attachments?: any[];
  isRead: boolean;
  createdAt: string;
}

interface MessagingPanelProps {
  collaborationId: number;
  messages: Message[];
  compact?: boolean;
}

export default function MessagingPanel({ 
  collaborationId, 
  messages: initialMessages = [],
  compact = false 
}: MessagingPanelProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [newMessage, setNewMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);

  // WebSocket connection for real-time messaging
  const { socket, isConnected } = useWebSocket();

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [initialMessages]);

  // WebSocket message handling
  useEffect(() => {
    if (!socket) return;

    // Join collaboration room
    socket.send(JSON.stringify({
      type: 'join_collaboration',
      collaborationId
    }));

    // Listen for new messages
    const handleMessage = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);
        
        switch (data.type) {
          case 'new_message':
            if (data.data.collaborationId === collaborationId) {
              queryClient.invalidateQueries({ 
                queryKey: ["/api/collaborations", collaborationId, "messages"] 
              });
              scrollToBottom();
            }
            break;
            
          case 'typing':
            if (data.collaborationId === collaborationId && data.userId !== user?.id) {
              setTypingUsers(prev => {
                if (!prev.includes(data.userId)) {
                  return [...prev, data.userId];
                }
                return prev;
              });
              
              // Remove typing indicator after 3 seconds
              setTimeout(() => {
                setTypingUsers(prev => prev.filter(id => id !== data.userId));
              }, 3000);
            }
            break;
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    socket.addEventListener('message', handleMessage);

    return () => {
      socket.removeEventListener('message', handleMessage);
    };
  }, [socket, collaborationId, queryClient, user?.id]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (messageData: { content: string; messageType?: string; attachments?: any[] }) => {
      return await apiRequest("POST", `/api/collaborations/${collaborationId}/messages`, messageData);
    },
    onSuccess: () => {
      setNewMessage("");
      queryClient.invalidateQueries({ 
        queryKey: ["/api/collaborations", collaborationId, "messages"] 
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Message Failed",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    
    sendMessageMutation.mutate({
      content: newMessage,
      messageType: "text"
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleTyping = () => {
    if (!isTyping && socket) {
      setIsTyping(true);
      socket.send(JSON.stringify({
        type: 'typing',
        collaborationId,
        userId: user?.id
      }));
      
      setTimeout(() => setIsTyping(false), 3000);
    }
  };

  const formatMessageTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 168) { // 7 days
      return date.toLocaleDateString([], { weekday: 'short', hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    }
  };

  const getMessageStatus = (message: Message) => {
    if (message.senderId === user?.id) {
      if (message.isRead) {
        return <CheckCheck className="h-3 w-3 text-blue-500" />;
      } else {
        return <Check className="h-3 w-3 text-gray-500" />;
      }
    }
    return null;
  };

  const groupMessagesByDate = (messages: Message[]) => {
    const groups: { [key: string]: Message[] } = {};
    
    messages.forEach(message => {
      const date = new Date(message.createdAt).toDateString();
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(message);
    });
    
    return groups;
  };

  const isToday = (date: string) => {
    return date === new Date().toDateString();
  };

  const isYesterday = (date: string) => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return date === yesterday.toDateString();
  };

  const formatDateGroup = (date: string) => {
    if (isToday(date)) return "Today";
    if (isYesterday(date)) return "Yesterday";
    return new Date(date).toLocaleDateString([], { 
      weekday: 'long', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const messageGroups = groupMessagesByDate(initialMessages);

  if (compact) {
    return (
      <Card className="card-gradient">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Messages</CardTitle>
            <div className="flex items-center space-x-2">
              {isConnected ? (
                <Badge variant="outline" className="text-green-400 border-green-400">
                  <div className="w-2 h-2 bg-green-400 rounded-full mr-1"></div>
                  Online
                </Badge>
              ) : (
                <Badge variant="outline" className="text-gray-400 border-gray-400">
                  <div className="w-2 h-2 bg-gray-400 rounded-full mr-1"></div>
                  Offline
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4">
          <div className="text-center text-muted-foreground">
            <MessageSquare className="h-8 w-8 mx-auto mb-2" />
            <p>Open full workspace to view messages</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="card-gradient animate-slide-up h-[600px] flex flex-col">
      <CardHeader className="pb-3 border-b border-border">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <MessageSquare className="mr-2 h-5 w-5 text-primary" />
            Messages
          </CardTitle>
          <div className="flex items-center space-x-2">
            {isConnected ? (
              <Badge variant="outline" className="text-green-400 border-green-400">
                <div className="w-2 h-2 bg-green-400 rounded-full mr-1 animate-pulse"></div>
                Online
              </Badge>
            ) : (
              <Badge variant="outline" className="text-gray-400 border-gray-400">
                <div className="w-2 h-2 bg-gray-400 rounded-full mr-1"></div>
                Connecting...
              </Badge>
            )}
            <Button variant="ghost" size="sm">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      {/* Messages Area */}
      <CardContent className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        {Object.keys(messageGroups).length > 0 ? (
          <div className="space-y-4">
            {Object.entries(messageGroups).map(([date, messages]) => (
              <div key={date}>
                {/* Date Separator */}
                <div className="flex items-center justify-center my-4">
                  <div className="px-3 py-1 bg-background-elevated rounded-full text-xs text-muted-foreground">
                    {formatDateGroup(date)}
                  </div>
                </div>

                {/* Messages for this date */}
                <div className="space-y-3">
                  {messages.map((message) => {
                    const isOwn = message.senderId === user?.id;
                    
                    return (
                      <div key={message.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                        <div className={`flex items-end space-x-2 max-w-[70%] ${isOwn ? 'flex-row-reverse space-x-reverse' : ''}`}>
                          {!isOwn && (
                            <Avatar className="h-8 w-8">
                              <AvatarImage src="/api/placeholder/32/32" />
                              <AvatarFallback>U</AvatarFallback>
                            </Avatar>
                          )}
                          
                          <div className={`${isOwn ? 'message-sent' : 'message-received'} p-3 max-w-full`}>
                            <div className="text-sm break-words">{message.content}</div>
                            
                            {message.attachments && message.attachments.length > 0 && (
                              <div className="mt-2 space-y-2">
                                {message.attachments.map((attachment, index) => (
                                  <div key={index} className="flex items-center space-x-2 text-xs opacity-80">
                                    <File className="h-4 w-4" />
                                    <span>{attachment.name}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                            
                            <div className={`flex items-center justify-end space-x-1 mt-1 text-xs opacity-70 ${isOwn ? 'text-white' : 'text-muted-foreground'}`}>
                              <span>{formatMessageTime(message.createdAt)}</span>
                              {getMessageStatus(message)}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-center">
            <div>
              <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <h3 className="font-semibold mb-2">No messages yet</h3>
              <p className="text-muted-foreground">Start the conversation by sending a message below.</p>
            </div>
          </div>
        )}
        
        {/* Typing Indicator */}
        {typingUsers.length > 0 && (
          <div className="flex items-center space-x-2 text-sm text-muted-foreground mt-4">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
            <span>Someone is typing...</span>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </CardContent>

      {/* Message Input */}
      <div className="border-t border-border p-4">
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm">
            <Paperclip className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm">
            <ImageIcon className="h-4 w-4" />
          </Button>
          
          <div className="flex-1 relative">
            <Input
              value={newMessage}
              onChange={(e) => {
                setNewMessage(e.target.value);
                handleTyping();
              }}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              disabled={sendMessageMutation.isPending}
              className="pr-12 input-glow"
            />
            <Button variant="ghost" size="sm" className="absolute right-1 top-1/2 -translate-y-1/2">
              <Smile className="h-4 w-4" />
            </Button>
          </div>
          
          <Button 
            onClick={handleSendMessage}
            disabled={!newMessage.trim() || sendMessageMutation.isPending}
            className="btn-gradient"
          >
            {sendMessageMutation.isPending ? (
              <Clock className="h-4 w-4" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </Card>
  );
}

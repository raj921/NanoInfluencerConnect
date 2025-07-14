import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import MessagingPanel from "./messaging-panel";
import { 
  CheckCircle,
  Clock,
  Upload,
  MessageSquare,
  FileText,
  Image as ImageIcon,
  Video,
  Download,
  Eye,
  ThumbsUp,
  ThumbsDown,
  AlertCircle,
  Calendar,
  DollarSign,
  Users,
  ArrowRight,
  RefreshCw
} from "lucide-react";

interface CollaborationWorkspaceProps {
  collaboration: {
    id: number;
    campaignId: number;
    creatorId: number;
    agreedRate: number;
    workflowStatus: string;
    contentSubmissions?: any[];
    feedback?: any[];
    revisionHistory?: any[];
    finalContent?: any[];
    publishedAt?: string;
    completedAt?: string;
    createdAt: string;
    updatedAt: string;
  };
  compact?: boolean;
}

export default function CollaborationWorkspace({ 
  collaboration, 
  compact = false 
}: CollaborationWorkspaceProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("workflow");

  // Fetch campaign details
  const { data: campaign } = useQuery({
    queryKey: ["/api/campaigns", collaboration.campaignId],
    enabled: !!collaboration.campaignId,
  });

  // Fetch messages
  const { data: messages } = useQuery({
    queryKey: ["/api/collaborations", collaboration.id, "messages"],
    enabled: !!collaboration.id,
  });

  // Update collaboration status
  const updateStatusMutation = useMutation({
    mutationFn: async ({ status, data }: { status: string; data?: any }) => {
      return await apiRequest("PUT", `/api/collaborations/${collaboration.id}`, {
        workflowStatus: status,
        ...data
      });
    },
    onSuccess: () => {
      toast({
        title: "Status Updated",
        description: "Collaboration status has been updated successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/collaborations"] });
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
        title: "Update Failed",
        description: "Failed to update collaboration status. Please try again.",
        variant: "destructive",
      });
    },
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "brief_shared":
        return <FileText className="h-4 w-4 text-blue-500" />;
      case "content_created":
        return <Upload className="h-4 w-4 text-purple-500" />;
      case "under_review":
        return <Eye className="h-4 w-4 text-yellow-500" />;
      case "revision_requested":
        return <RefreshCw className="h-4 w-4 text-orange-500" />;
      case "approved":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "published":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "brief_shared":
        return "bg-blue-500/20 text-blue-500 border-blue-500/20";
      case "content_created":
        return "bg-purple-500/20 text-purple-500 border-purple-500/20";
      case "under_review":
        return "bg-yellow-500/20 text-yellow-500 border-yellow-500/20";
      case "revision_requested":
        return "bg-orange-500/20 text-orange-500 border-orange-500/20";
      case "approved":
      case "published":
      case "completed":
        return "bg-green-500/20 text-green-500 border-green-500/20";
      default:
        return "bg-gray-500/20 text-gray-500 border-gray-500/20";
    }
  };

  const getWorkflowProgress = () => {
    const statuses = ["brief_shared", "content_created", "under_review", "approved", "published", "completed"];
    const currentIndex = statuses.indexOf(collaboration.workflowStatus);
    return ((currentIndex + 1) / statuses.length) * 100;
  };

  const workflowSteps = [
    { 
      id: "brief_shared", 
      title: "Campaign Brief", 
      description: "Brand brief and requirements shared",
      completed: true 
    },
    { 
      id: "content_created", 
      title: "Content Created", 
      description: "Creator uploads initial content",
      completed: ["content_created", "under_review", "revision_requested", "approved", "published", "completed"].includes(collaboration.workflowStatus)
    },
    { 
      id: "under_review", 
      title: "Under Review", 
      description: "Brand reviews submitted content",
      completed: ["under_review", "approved", "published", "completed"].includes(collaboration.workflowStatus)
    },
    { 
      id: "approved", 
      title: "Approved", 
      description: "Content approved by brand",
      completed: ["approved", "published", "completed"].includes(collaboration.workflowStatus)
    },
    { 
      id: "published", 
      title: "Published", 
      description: "Content goes live on platforms",
      completed: ["published", "completed"].includes(collaboration.workflowStatus)
    },
    { 
      id: "completed", 
      title: "Completed", 
      description: "Campaign completed and payment processed",
      completed: collaboration.workflowStatus === "completed"
    }
  ];

  if (compact) {
    return (
      <Card className="card-gradient hover:bg-background-elevated transition-colors">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src="/api/placeholder/40/40" />
                <AvatarFallback>BR</AvatarFallback>
              </Avatar>
              <div>
                <h4 className="font-semibold">{campaign?.title || "Campaign"}</h4>
                <p className="text-sm text-muted-foreground">
                  {campaign?.brand?.companyName || "Brand"}
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-lg font-semibold text-green-400">
                ${collaboration.agreedRate}
              </div>
              <Badge variant="outline" className={getStatusColor(collaboration.workflowStatus)}>
                {getStatusIcon(collaboration.workflowStatus)}
                <span className="ml-1 capitalize">{collaboration.workflowStatus.replace("_", " ")}</span>
              </Badge>
            </div>
          </div>
          
          <div className="mt-4">
            <div className="flex justify-between text-sm mb-2">
              <span>Progress</span>
              <span>{Math.round(getWorkflowProgress())}%</span>
            </div>
            <Progress value={getWorkflowProgress()} className="progress-glow" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="card-gradient animate-slide-up">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">{campaign?.title || "Collaboration"}</CardTitle>
              <p className="text-muted-foreground">
                with {campaign?.brand?.companyName || "Brand"}
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-green-400">
                ${collaboration.agreedRate.toLocaleString()}
              </div>
              <Badge variant="outline" className={getStatusColor(collaboration.workflowStatus)}>
                {getStatusIcon(collaboration.workflowStatus)}
                <span className="ml-1 capitalize">{collaboration.workflowStatus.replace("_", " ")}</span>
              </Badge>
            </div>
          </div>
          
          <div className="mt-6">
            <div className="flex justify-between text-sm mb-2">
              <span>Workflow Progress</span>
              <span>{Math.round(getWorkflowProgress())}%</span>
            </div>
            <Progress value={getWorkflowProgress()} className="progress-glow" />
          </div>
        </CardHeader>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="glassmorphism">
          <TabsTrigger value="workflow">Workflow</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="messages">Messages</TabsTrigger>
          <TabsTrigger value="details">Details</TabsTrigger>
        </TabsList>

        {/* Workflow Tab */}
        <TabsContent value="workflow" className="space-y-6">
          <Card className="card-gradient animate-slide-up">
            <CardHeader>
              <CardTitle>Campaign Workflow</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {workflowSteps.map((step, index) => (
                  <div key={step.id} className="flex items-start space-x-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      step.completed 
                        ? "bg-green-500" 
                        : step.id === collaboration.workflowStatus 
                          ? "bg-yellow-500" 
                          : "bg-gray-600"
                    }`}>
                      {step.completed ? (
                        <CheckCircle className="h-5 w-5 text-white" />
                      ) : (
                        <span className="text-white text-sm font-medium">{index + 1}</span>
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className={`font-semibold ${
                        step.id === collaboration.workflowStatus ? "text-yellow-400" : 
                        step.completed ? "text-green-400" : "text-gray-400"
                      }`}>
                        {step.title}
                      </h4>
                      <p className="text-sm text-muted-foreground">{step.description}</p>
                      
                      {step.id === collaboration.workflowStatus && (
                        <div className="mt-3 space-y-3">
                          {step.id === "content_created" && (
                            <div className="space-y-2">
                              <Button 
                                size="sm" 
                                className="btn-gradient"
                                onClick={() => updateStatusMutation.mutate({ status: "under_review" })}
                                disabled={updateStatusMutation.isPending}
                              >
                                <Upload className="mr-2 h-4 w-4" />
                                Submit for Review
                              </Button>
                            </div>
                          )}
                          
                          {step.id === "under_review" && (
                            <div className="space-y-2">
                              <div className="flex space-x-2">
                                <Button 
                                  size="sm" 
                                  className="btn-gradient"
                                  onClick={() => updateStatusMutation.mutate({ status: "approved" })}
                                  disabled={updateStatusMutation.isPending}
                                >
                                  <ThumbsUp className="mr-2 h-4 w-4" />
                                  Approve Content
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => updateStatusMutation.mutate({ status: "revision_requested" })}
                                  disabled={updateStatusMutation.isPending}
                                >
                                  <ThumbsDown className="mr-2 h-4 w-4" />
                                  Request Revision
                                </Button>
                              </div>
                            </div>
                          )}

                          {step.id === "approved" && (
                            <Button 
                              size="sm" 
                              className="btn-gradient"
                              onClick={() => updateStatusMutation.mutate({ status: "published", publishedAt: new Date().toISOString() })}
                              disabled={updateStatusMutation.isPending}
                            >
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Mark as Published
                            </Button>
                          )}
                        </div>
                      )}

                      {/* Show feedback for revision requests */}
                      {step.id === "revision_requested" && collaboration.feedback && (
                        <div className="mt-3 bg-orange-500/10 border border-orange-500/20 p-3 rounded-lg">
                          <h5 className="font-medium text-orange-400 mb-2">Revision Feedback</h5>
                          {collaboration.feedback.map((feedback: any, idx: number) => (
                            <div key={idx} className="text-sm text-muted-foreground">
                              {feedback.message}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Content Tab */}
        <TabsContent value="content" className="space-y-6">
          <Card className="card-gradient animate-slide-up">
            <CardHeader>
              <CardTitle>Content Submissions</CardTitle>
            </CardHeader>
            <CardContent>
              {collaboration.contentSubmissions && collaboration.contentSubmissions.length > 0 ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {collaboration.contentSubmissions.map((content: any, index: number) => (
                    <div key={index} className="border border-border rounded-lg p-4 bg-background-elevated">
                      <div className="flex items-center space-x-2 mb-3">
                        {content.type === 'image' ? (
                          <ImageIcon className="h-5 w-5 text-blue-500" />
                        ) : content.type === 'video' ? (
                          <Video className="h-5 w-5 text-purple-500" />
                        ) : (
                          <FileText className="h-5 w-5 text-gray-500" />
                        )}
                        <span className="font-medium">{content.title || `Content ${index + 1}`}</span>
                      </div>
                      
                      {content.thumbnail && (
                        <img 
                          src={content.thumbnail} 
                          alt={content.title}
                          className="w-full aspect-video object-cover rounded mb-3"
                        />
                      )}
                      
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="capitalize">
                          {content.platform || "Platform"}
                        </Badge>
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                  <h3 className="font-semibold mb-2">No Content Submitted</h3>
                  <p className="text-muted-foreground mb-4">
                    Content submissions will appear here once uploaded.
                  </p>
                  <Button className="btn-gradient">
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Content
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Messages Tab */}
        <TabsContent value="messages" className="space-y-6">
          <MessagingPanel 
            collaborationId={collaboration.id}
            messages={messages || []}
          />
        </TabsContent>

        {/* Details Tab */}
        <TabsContent value="details" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="card-gradient animate-scale-in">
              <CardHeader>
                <CardTitle>Campaign Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Campaign Title</span>
                  <span className="font-medium">{campaign?.title || "N/A"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Brand</span>
                  <span className="font-medium">{campaign?.brand?.companyName || "N/A"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Agreed Rate</span>
                  <span className="font-medium text-green-400">${collaboration.agreedRate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Started</span>
                  <span className="font-medium">
                    {new Date(collaboration.createdAt).toLocaleDateString()}
                  </span>
                </div>
                {collaboration.completedAt && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Completed</span>
                    <span className="font-medium">
                      {new Date(collaboration.completedAt).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="card-gradient animate-scale-in" style={{ animationDelay: "0.1s" }}>
              <CardHeader>
                <CardTitle>Campaign Requirements</CardTitle>
              </CardHeader>
              <CardContent>
                {campaign?.requirements ? (
                  <div className="space-y-3">
                    {Object.entries(campaign.requirements).map(([key, value]: [string, any]) => (
                      <div key={key} className="flex justify-between">
                        <span className="text-muted-foreground capitalize">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </span>
                        <span className="font-medium">
                          {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No specific requirements listed.</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

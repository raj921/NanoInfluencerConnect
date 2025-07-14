import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import CreatorProfile from "@/components/creator-profile";
import CampaignCard from "@/components/campaign-card";
import AnalyticsChart from "@/components/analytics-chart";
import CollaborationWorkspace from "@/components/collaboration-workspace";
import { 
  TrendingUp, 
  Users, 
  DollarSign, 
  Eye,
  Heart,
  ArrowRight,
  Star,
  Calendar,
  MessageSquare,
  Award,
  Target,
  Zap
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";

export default function Dashboard() {
  const { user } = useAuth();
  const { toast } = useToast();

  // Handle unauthorized errors at page level
  useEffect(() => {
    if (!user) {
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
  }, [user, toast]);

  const { data: creator, isLoading: creatorLoading } = useQuery({
    queryKey: ["/api/creators/me"],
    enabled: !!user && user.role === "creator",
  });

  const { data: brand, isLoading: brandLoading } = useQuery({
    queryKey: ["/api/brands/me"],
    enabled: !!user && user.role === "brand",
  });

  const { data: collaborations, isLoading: collaborationsLoading } = useQuery({
    queryKey: ["/api/collaborations/my"],
    enabled: !!user,
  });

  const { data: analytics } = useQuery({
    queryKey: ["/api/analytics/creator"],
    enabled: !!user && user.role === "creator",
  });

  const { data: notifications } = useQuery({
    queryKey: ["/api/notifications"],
    enabled: !!user,
  });

  const isCreator = user?.role === "creator";
  const isBrand = user?.role === "brand";

  if (creatorLoading || brandLoading) {
    return (
      <div className="min-h-screen pt-16 bg-background-primary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-muted rounded w-1/3"></div>
            <div className="grid md:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-muted rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Mock data for demonstration (replace with real data from APIs)
  const creatorStats = {
    totalEarnings: creator?.totalEarnings || 0,
    totalReach: 2300000,
    avgEngagement: creator?.avgEngagementRate || 0,
    totalFollowers: creator?.totalFollowers || 0,
    activeCampaigns: collaborations?.filter((c: any) => c.workflowStatus !== "completed").length || 0,
    completedCampaigns: creator?.completedCampaigns || 0,
    rating: creator?.rating || 0
  };

  const brandStats = {
    activeCampaigns: 5,
    totalSpent: 45600,
    totalReach: 8500000,
    avgROI: 3.2,
    collaborations: 28,
    avgEngagement: 6.1
  };

  return (
    <div className="min-h-screen pt-16 bg-background-primary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Header */}
        <div className="mb-8 animate-fade-in">
          <h1 className="text-4xl font-bold mb-2 gradient-text">
            {isCreator ? "Creator Dashboard" : "Brand Dashboard"}
          </h1>
          <p className="text-muted-foreground text-lg">
            {isCreator && "Manage your campaigns, track performance, and grow your influence"}
            {isBrand && "Manage campaigns, find creators, and track ROI"}
          </p>
        </div>

        {/* Profile Completion Banner */}
        {!user?.hasProfile && (
          <Card className="mb-8 border-primary/20 bg-gradient-to-r from-primary/5 to-secondary/5 glassmorphism animate-slide-up">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-primary to-secondary rounded-xl flex items-center justify-center">
                    <Zap className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-1">Complete Your Profile</h3>
                    <p className="text-muted-foreground">
                      Set up your {user?.role === 'brand' ? 'brand' : 'creator'} profile to start discovering opportunities
                    </p>
                  </div>
                </div>
                <Button className="btn-gradient">
                  Complete Profile
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats Overview */}
        {(isCreator || isBrand) && (
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            {isCreator && (
              <>
                <Card className="card-gradient hover-glow animate-scale-in">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Total Earnings</p>
                        <p className="text-2xl font-bold text-green-400">${creatorStats.totalEarnings.toLocaleString()}</p>
                      </div>
                      <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                        <DollarSign className="h-6 w-6 text-white" />
                      </div>
                    </div>
                    <div className="mt-2 flex items-center text-sm">
                      <TrendingUp className="h-4 w-4 text-green-400 mr-1" />
                      <span className="text-green-400">+23% this month</span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="card-gradient hover-glow animate-scale-in" style={{ animationDelay: "0.1s" }}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Total Reach</p>
                        <p className="text-2xl font-bold">{(creatorStats.totalReach / 1000000).toFixed(1)}M</p>
                      </div>
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center">
                        <Eye className="h-6 w-6 text-white" />
                      </div>
                    </div>
                    <div className="mt-2 flex items-center text-sm">
                      <TrendingUp className="h-4 w-4 text-blue-400 mr-1" />
                      <span className="text-blue-400">+15% this month</span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="card-gradient hover-glow animate-scale-in" style={{ animationDelay: "0.2s" }}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Avg. Engagement</p>
                        <p className="text-2xl font-bold">{Number(creatorStats.avgEngagement).toFixed(1)}%</p>
                      </div>
                      <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-pink-600 rounded-xl flex items-center justify-center">
                        <Heart className="h-6 w-6 text-white" />
                      </div>
                    </div>
                    <div className="mt-2 flex items-center text-sm">
                      <TrendingUp className="h-4 w-4 text-yellow-400 mr-1" />
                      <span className="text-yellow-400">+0.8% this month</span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="card-gradient hover-glow animate-scale-in" style={{ animationDelay: "0.3s" }}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Total Followers</p>
                        <p className="text-2xl font-bold">{(creatorStats.totalFollowers / 1000).toFixed(1)}K</p>
                      </div>
                      <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-violet-600 rounded-xl flex items-center justify-center">
                        <Users className="h-6 w-6 text-white" />
                      </div>
                    </div>
                    <div className="mt-2 flex items-center text-sm">
                      <TrendingUp className="h-4 w-4 text-purple-400 mr-1" />
                      <span className="text-purple-400">+2.1K this month</span>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}

            {isBrand && (
              <>
                <Card className="card-gradient hover-glow animate-scale-in">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Active Campaigns</p>
                        <p className="text-2xl font-bold">{brandStats.activeCampaigns}</p>
                      </div>
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center">
                        <Target className="h-6 w-6 text-white" />
                      </div>
                    </div>
                    <div className="mt-2 flex items-center text-sm">
                      <span className="text-blue-400">2 ending soon</span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="card-gradient hover-glow animate-scale-in" style={{ animationDelay: "0.1s" }}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Total Spent</p>
                        <p className="text-2xl font-bold">${brandStats.totalSpent.toLocaleString()}</p>
                      </div>
                      <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                        <DollarSign className="h-6 w-6 text-white" />
                      </div>
                    </div>
                    <div className="mt-2 flex items-center text-sm">
                      <span className="text-green-400">ROI: {brandStats.avgROI}x</span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="card-gradient hover-glow animate-scale-in" style={{ animationDelay: "0.2s" }}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Total Reach</p>
                        <p className="text-2xl font-bold">{(brandStats.totalReach / 1000000).toFixed(1)}M</p>
                      </div>
                      <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-violet-600 rounded-xl flex items-center justify-center">
                        <Eye className="h-6 w-6 text-white" />
                      </div>
                    </div>
                    <div className="mt-2 flex items-center text-sm">
                      <span className="text-purple-400">Across all campaigns</span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="card-gradient hover-glow animate-scale-in" style={{ animationDelay: "0.3s" }}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Collaborations</p>
                        <p className="text-2xl font-bold">{brandStats.collaborations}</p>
                      </div>
                      <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-600 rounded-xl flex items-center justify-center">
                        <Users className="h-6 w-6 text-white" />
                      </div>
                    </div>
                    <div className="mt-2 flex items-center text-sm">
                      <span className="text-orange-400">With nano-influencers</span>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Performance Chart */}
            {isCreator && analytics && (
              <Card className="card-gradient animate-slide-up">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart3 className="mr-2 h-5 w-5 text-primary" />
                    Performance Overview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <AnalyticsChart data={analytics} type="performance" />
                </CardContent>
              </Card>
            )}

            {/* Active Collaborations */}
            {collaborations && collaborations.length > 0 && (
              <Card className="card-gradient animate-slide-up">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center">
                      <MessageSquare className="mr-2 h-5 w-5 text-primary" />
                      Active Collaborations
                    </span>
                    <Badge variant="secondary">{collaborations.length}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {collaborations.slice(0, 3).map((collaboration: any) => (
                      <CollaborationWorkspace 
                        key={collaboration.id} 
                        collaboration={collaboration}
                        compact
                      />
                    ))}
                  </div>
                  <Button variant="outline" className="w-full mt-4">
                    View All Collaborations
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Quick Actions */}
            <Card className="card-gradient animate-slide-up">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  {isCreator && (
                    <>
                      <Button className="h-20 flex-col btn-gradient">
                        <Target className="h-6 w-6 mb-2" />
                        Discover Campaigns
                      </Button>
                      <Button variant="outline" className="h-20 flex-col btn-glassmorphism">
                        <TrendingUp className="h-6 w-6 mb-2" />
                        View Analytics
                      </Button>
                      <Button variant="outline" className="h-20 flex-col btn-glassmorphism">
                        <Users className="h-6 w-6 mb-2" />
                        Update Profile
                      </Button>
                      <Button variant="outline" className="h-20 flex-col btn-glassmorphism">
                        <Star className="h-6 w-6 mb-2" />
                        Portfolio
                      </Button>
                    </>
                  )}
                  
                  {isBrand && (
                    <>
                      <Button className="h-20 flex-col btn-gradient">
                        <Target className="h-6 w-6 mb-2" />
                        Create Campaign
                      </Button>
                      <Button variant="outline" className="h-20 flex-col btn-glassmorphism">
                        <Users className="h-6 w-6 mb-2" />
                        Find Creators
                      </Button>
                      <Button variant="outline" className="h-20 flex-col btn-glassmorphism">
                        <Eye className="h-6 w-6 mb-2" />
                        View Analytics
                      </Button>
                      <Button variant="outline" className="h-20 flex-col btn-glassmorphism">
                        <Award className="h-6 w-6 mb-2" />
                        Manage Campaigns
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Creator Profile Widget */}
            {isCreator && creator && (
              <CreatorProfile creator={creator} compact />
            )}

            {/* Recent Notifications */}
            <Card className="card-gradient animate-slide-up">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MessageSquare className="mr-2 h-5 w-5 text-primary" />
                  Recent Notifications
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 custom-scrollbar max-h-80 overflow-y-auto">
                  {notifications && notifications.length > 0 ? (
                    notifications.slice(0, 5).map((notification: any) => (
                      <div key={notification.id} className="flex items-start space-x-3 p-3 rounded-lg bg-background-elevated border dark-border hover:bg-background-surface transition-colors">
                        <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                          notification.type === 'payment' ? 'bg-green-500' :
                          notification.type === 'campaign' ? 'bg-blue-500' :
                          notification.type === 'message' ? 'bg-purple-500' :
                          'bg-yellow-500'
                        }`}></div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{notification.title}</p>
                          <p className="text-xs text-muted-foreground">{notification.message}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(notification.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                      <p className="text-muted-foreground">No notifications yet</p>
                    </div>
                  )}
                </div>
                
                <Button variant="outline" className="w-full mt-4">
                  View All Notifications
                </Button>
              </CardContent>
            </Card>

            {/* Progress Tracker */}
            <Card className="card-gradient animate-slide-up">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Award className="mr-2 h-5 w-5 text-primary" />
                  Monthly Goals
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {isCreator && (
                    <>
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span>Campaigns Completed</span>
                          <span>3/5</span>
                        </div>
                        <Progress value={60} className="progress-glow" />
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span>Revenue Goal</span>
                          <span>$3,450/$5,000</span>
                        </div>
                        <Progress value={69} className="progress-glow" />
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span>Follower Growth</span>
                          <span>1,234/2,000</span>
                        </div>
                        <Progress value={62} className="progress-glow" />
                      </div>
                    </>
                  )}
                  
                  {isBrand && (
                    <>
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span>Campaigns Launched</span>
                          <span>5/8</span>
                        </div>
                        <Progress value={63} className="progress-glow" />
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span>Reach Target</span>
                          <span>8.5M/12M</span>
                        </div>
                        <Progress value={71} className="progress-glow" />
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Upcoming Deadlines */}
            <Card className="card-gradient animate-slide-up">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="mr-2 h-5 w-5 text-primary" />
                  Upcoming Deadlines
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">EcoLife Content Due</p>
                      <p className="text-xs text-muted-foreground">Tomorrow</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">TechFlow Review</p>
                      <p className="text-xs text-muted-foreground">In 3 days</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Wellness Series Launch</p>
                      <p className="text-xs text-muted-foreground">Next week</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

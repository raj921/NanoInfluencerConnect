import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { 
  TrendingUp, 
  Users, 
  DollarSign, 
  Eye,
  Heart,
  ArrowRight,
  Star,
  Calendar,
  MessageSquare
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";

export default function Home() {
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

  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ["/api/dashboard/overview"],
    enabled: !!user,
  });

  const { data: recentCampaigns } = useQuery({
    queryKey: ["/api/campaigns", { recent: true, limit: 3 }],
    enabled: !!user,
  });

  const { data: notifications } = useQuery({
    queryKey: ["/api/notifications", { limit: 5 }],
    enabled: !!user,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen pt-16 bg-background">
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

  const isCreator = user?.creator;
  const isBrand = user?.brand;

  const creatorStats = {
    totalEarnings: 12450,
    totalReach: 2300000,
    avgEngagement: 5.4,
    totalFollowers: 47200,
    activeCampaigns: 3,
    completedCampaigns: 12,
    rating: 4.9
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
    <div className="min-h-screen pt-16 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            Welcome back, {user?.firstName || user?.email?.split('@')[0] || 'User'}! 👋
          </h1>
          <p className="text-muted-foreground">
            {isCreator && "Here's your creator dashboard overview"}
            {isBrand && "Here's your brand dashboard overview"}
            {!isCreator && !isBrand && "Complete your profile to get started"}
          </p>
        </div>

        {/* Profile Setup CTA */}
        {!user?.hasProfile && (
          <Card className="mb-8 border-primary/20 bg-gradient-to-r from-primary/5 to-secondary/5">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Complete Your Profile</h3>
                  <p className="text-muted-foreground">
                    Set up your {user?.role === 'brand' ? 'brand' : 'creator'} profile to start discovering opportunities
                  </p>
                </div>
                <Button>
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
                <Card className="hover:shadow-lg transition-shadow duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Total Earnings</p>
                        <p className="text-2xl font-bold text-green-600">${creatorStats.totalEarnings.toLocaleString()}</p>
                      </div>
                      <DollarSign className="h-8 w-8 text-green-600" />
                    </div>
                    <p className="text-xs text-green-600 mt-1">+23% this month</p>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Total Reach</p>
                        <p className="text-2xl font-bold">{(creatorStats.totalReach / 1000000).toFixed(1)}M</p>
                      </div>
                      <Eye className="h-8 w-8 text-primary" />
                    </div>
                    <p className="text-xs text-primary mt-1">+15% this month</p>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Avg. Engagement</p>
                        <p className="text-2xl font-bold">{creatorStats.avgEngagement}%</p>
                      </div>
                      <Heart className="h-8 w-8 text-red-500" />
                    </div>
                    <p className="text-xs text-yellow-600 mt-1">+0.8% this month</p>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Total Followers</p>
                        <p className="text-2xl font-bold">{(creatorStats.totalFollowers / 1000).toFixed(1)}K</p>
                      </div>
                      <Users className="h-8 w-8 text-purple-600" />
                    </div>
                    <p className="text-xs text-purple-600 mt-1">+2.1K this month</p>
                  </CardContent>
                </Card>
              </>
            )}

            {isBrand && (
              <>
                <Card className="hover:shadow-lg transition-shadow duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Active Campaigns</p>
                        <p className="text-2xl font-bold">{brandStats.activeCampaigns}</p>
                      </div>
                      <TrendingUp className="h-8 w-8 text-primary" />
                    </div>
                    <p className="text-xs text-primary mt-1">2 ending soon</p>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Total Spent</p>
                        <p className="text-2xl font-bold">${brandStats.totalSpent.toLocaleString()}</p>
                      </div>
                      <DollarSign className="h-8 w-8 text-green-600" />
                    </div>
                    <p className="text-xs text-green-600 mt-1">ROI: {brandStats.avgROI}x</p>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Total Reach</p>
                        <p className="text-2xl font-bold">{(brandStats.totalReach / 1000000).toFixed(1)}M</p>
                      </div>
                      <Eye className="h-8 w-8 text-blue-600" />
                    </div>
                    <p className="text-xs text-blue-600 mt-1">Across all campaigns</p>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Collaborations</p>
                        <p className="text-2xl font-bold">{brandStats.collaborations}</p>
                      </div>
                      <Users className="h-8 w-8 text-purple-600" />
                    </div>
                    <p className="text-xs text-purple-600 mt-1">With nano-influencers</p>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="mr-2 h-5 w-5" />
                  {isCreator ? "Recent Campaigns" : "Recent Activity"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {isCreator && (
                    <>
                      <div className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors">
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src="/api/placeholder/40/40" />
                            <AvatarFallback>EC</AvatarFallback>
                          </Avatar>
                          <div>
                            <h4 className="font-semibold">EcoLife Skincare</h4>
                            <p className="text-sm text-muted-foreground">Product Review Campaign</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-semibold text-green-600">$850</div>
                          <Badge variant="secondary">Under Review</Badge>
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors">
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src="/api/placeholder/40/40" />
                            <AvatarFallback>TF</AvatarFallback>
                          </Avatar>
                          <div>
                            <h4 className="font-semibold">TechFlow Apps</h4>
                            <p className="text-sm text-muted-foreground">Story Series Campaign</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-semibold text-green-600">$1,200</div>
                          <Badge variant="default">Approved</Badge>
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors">
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src="/api/placeholder/40/40" />
                            <AvatarFallback>ZW</AvatarFallback>
                          </Avatar>
                          <div>
                            <h4 className="font-semibold">ZenLife Wellness</h4>
                            <p className="text-sm text-muted-foreground">Wellness Series</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-semibold text-gray-600">$950</div>
                          <Badge variant="outline">Completed</Badge>
                        </div>
                      </div>
                    </>
                  )}

                  {isBrand && (
                    <>
                      <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                        <div>
                          <h4 className="font-semibold">Summer Collection Launch</h4>
                          <p className="text-sm text-muted-foreground">12 applications received</p>
                        </div>
                        <Badge>Active</Badge>
                      </div>
                      <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                        <div>
                          <h4 className="font-semibold">Wellness Wednesday Series</h4>
                          <p className="text-sm text-muted-foreground">Content under review</p>
                        </div>
                        <Badge variant="secondary">Review</Badge>
                      </div>
                    </>
                  )}
                </div>

                <Button variant="outline" className="w-full mt-4">
                  {isCreator ? "View All Campaigns" : "View All Activity"}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  {isCreator && (
                    <>
                      <Button className="h-16 flex-col">
                        <Users className="h-6 w-6 mb-1" />
                        Discover Campaigns
                      </Button>
                      <Button variant="outline" className="h-16 flex-col">
                        <TrendingUp className="h-6 w-6 mb-1" />
                        View Analytics
                      </Button>
                    </>
                  )}
                  
                  {isBrand && (
                    <>
                      <Button className="h-16 flex-col">
                        <Users className="h-6 w-6 mb-1" />
                        Create Campaign
                      </Button>
                      <Button variant="outline" className="h-16 flex-col">
                        <Eye className="h-6 w-6 mb-1" />
                        Find Creators
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Creator Profile Preview */}
            {isCreator && (
              <Card>
                <CardHeader>
                  <CardTitle>Your Profile</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center space-y-4">
                    <Avatar className="h-20 w-20 mx-auto">
                      <AvatarImage src={user?.profileImageUrl} />
                      <AvatarFallback>
                        {user?.firstName?.[0]}{user?.lastName?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold">{user?.firstName} {user?.lastName}</h3>
                      <p className="text-sm text-muted-foreground">
                        {user?.creator?.niche || "Lifestyle & Wellness"}
                      </p>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Total Followers</span>
                        <span className="font-semibold">{creatorStats.totalFollowers.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Avg. Engagement</span>
                        <span className="font-semibold text-green-600">{creatorStats.avgEngagement}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Rating</span>
                        <div className="flex items-center space-x-1">
                          <span className="font-semibold">{creatorStats.rating}</span>
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        </div>
                      </div>
                    </div>
                    
                    <Button variant="outline" className="w-full">
                      Edit Profile
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Notifications */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MessageSquare className="mr-2 h-5 w-5" />
                  Recent Notifications
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-start space-x-3 p-3 border border-border rounded-lg">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">New campaign match</p>
                      <p className="text-xs text-muted-foreground">EcoWear has a campaign perfect for you</p>
                      <p className="text-xs text-muted-foreground mt-1">2 hours ago</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3 p-3 border border-border rounded-lg">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Payment received</p>
                      <p className="text-xs text-muted-foreground">$850 from EcoLife Skincare</p>
                      <p className="text-xs text-muted-foreground mt-1">1 day ago</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3 p-3 border border-border rounded-lg">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Content feedback</p>
                      <p className="text-xs text-muted-foreground">TechFlow requested minor revisions</p>
                      <p className="text-xs text-muted-foreground mt-1">2 days ago</p>
                    </div>
                  </div>
                </div>
                
                <Button variant="outline" className="w-full mt-4">
                  View All Notifications
                </Button>
              </CardContent>
            </Card>

            {/* Calendar */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="mr-2 h-5 w-5" />
                  Upcoming Deadlines
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">EcoLife Content Due</p>
                      <p className="text-xs text-muted-foreground">Tomorrow</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">TechFlow Review</p>
                      <p className="text-xs text-muted-foreground">In 3 days</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
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

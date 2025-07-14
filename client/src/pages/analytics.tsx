import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import AnalyticsChart from "@/components/analytics-chart";
import { useToast } from "@/hooks/use-toast";
import { 
  BarChart3,
  TrendingUp,
  DollarSign,
  Eye,
  Heart,
  Users,
  Target,
  Calendar,
  Download,
  Share2,
  Filter
} from "lucide-react";

export default function Analytics() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [timeRange, setTimeRange] = useState("30d");
  const [activeTab, setActiveTab] = useState("overview");

  // Handle unauthorized errors
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

  // Fetch analytics data
  const { data: analyticsData, isLoading } = useQuery({
    queryKey: ["/api/analytics/creator", { timeRange }],
    enabled: !!user,
  });

  const { data: campaignAnalytics } = useQuery({
    queryKey: ["/api/analytics/campaigns", { timeRange }],
    enabled: !!user,
  });

  const { data: platformAnalytics } = useQuery({
    queryKey: ["/api/analytics/platforms", { timeRange }],
    enabled: !!user,
  });

  if (isLoading) {
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
            <div className="h-96 bg-muted rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  const isCreator = user?.role === "creator";
  const isBrand = user?.role === "brand";

  // Mock analytics data (replace with real data from API)
  const stats = {
    totalEarnings: 12450,
    totalReach: 2300000,
    avgEngagement: 5.4,
    totalFollowers: 47200,
    monthlyGrowth: 23,
    campaignsCompleted: 12,
    avgROI: 3.2,
    platformDistribution: {
      instagram: 45,
      tiktok: 35,
      youtube: 20
    }
  };

  const revenueData = [
    { month: "Jan", revenue: 1200, reach: 180000, engagement: 5.2 },
    { month: "Feb", revenue: 1850, reach: 220000, engagement: 5.8 },
    { month: "Mar", revenue: 2100, reach: 280000, engagement: 6.1 },
    { month: "Apr", revenue: 1900, reach: 250000, engagement: 5.9 },
    { month: "May", revenue: 2300, reach: 320000, engagement: 6.3 },
    { month: "Jun", revenue: 2800, reach: 380000, engagement: 6.7 },
  ];

  const campaignPerformance = [
    {
      id: 1,
      name: "EcoLife Skincare",
      date: "Feb 15, 2024",
      platform: "Instagram",
      reach: 45200,
      engagement: 2800,
      engagementRate: 6.2,
      revenue: 850,
      roi: 3.2
    },
    {
      id: 2,
      name: "TechFlow Apps",
      date: "Feb 8, 2024",
      platform: "TikTok",
      reach: 67800,
      engagement: 5400,
      engagementRate: 8.0,
      revenue: 1200,
      roi: 4.1
    },
    {
      id: 3,
      name: "ZenLife Wellness",
      date: "Jan 28, 2024",
      platform: "Instagram",
      reach: 38900,
      engagement: 2100,
      engagementRate: 5.4,
      revenue: 950,
      roi: 2.8
    }
  ];

  return (
    <div className="min-h-screen pt-16 bg-background-primary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8 animate-fade-in">
          <div>
            <h1 className="text-4xl font-bold gradient-text mb-2">
              Performance Analytics
            </h1>
            <p className="text-muted-foreground text-lg">
              Track your growth, engagement, and campaign ROI in real-time
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 3 months</SelectItem>
                <SelectItem value="1y">Last year</SelectItem>
              </SelectContent>
            </Select>
            
            <Button variant="outline" className="btn-glassmorphism">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="card-gradient hover-glow animate-scale-in">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Earnings</p>
                  <p className="text-2xl font-bold text-green-400">${stats.totalEarnings.toLocaleString()}</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="mt-2 flex items-center text-sm">
                <TrendingUp className="h-4 w-4 text-green-400 mr-1" />
                <span className="text-green-400">+{stats.monthlyGrowth}% this month</span>
              </div>
            </CardContent>
          </Card>

          <Card className="card-gradient hover-glow animate-scale-in" style={{ animationDelay: "0.1s" }}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Reach</p>
                  <p className="text-2xl font-bold">{(stats.totalReach / 1000000).toFixed(1)}M</p>
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
                  <p className="text-2xl font-bold">{stats.avgEngagement}%</p>
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
                  <p className="text-2xl font-bold">{(stats.totalFollowers / 1000).toFixed(1)}K</p>
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
        </div>

        {/* Analytics Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="glassmorphism mb-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="revenue">Revenue</TabsTrigger>
            <TabsTrigger value="engagement">Engagement</TabsTrigger>
            <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
            <TabsTrigger value="platforms">Platforms</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Revenue Chart */}
              <Card className="lg:col-span-2 card-gradient animate-slide-up">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart3 className="mr-2 h-5 w-5 text-primary" />
                    Revenue Trends
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <AnalyticsChart data={revenueData} type="revenue" />
                </CardContent>
              </Card>

              {/* Platform Performance */}
              <Card className="card-gradient animate-slide-up">
                <CardHeader>
                  <CardTitle>Platform Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-3 h-3 bg-pink-500 rounded-full"></div>
                        <span>Instagram</span>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">28.5K</div>
                        <div className="text-sm text-green-400">6.2%</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                        <span>TikTok</span>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">12.3K</div>
                        <div className="text-sm text-green-400">8.1%</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                        <span>YouTube</span>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">6.4K</div>
                        <div className="text-sm text-green-400">4.7%</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Campaign Performance Table */}
            <Card className="card-gradient animate-slide-up">
              <CardHeader>
                <CardTitle>Campaign Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-3 text-muted-foreground">Campaign</th>
                        <th className="text-left py-3 text-muted-foreground">Platform</th>
                        <th className="text-left py-3 text-muted-foreground">Reach</th>
                        <th className="text-left py-3 text-muted-foreground">Engagement</th>
                        <th className="text-left py-3 text-muted-foreground">Revenue</th>
                        <th className="text-left py-3 text-muted-foreground">ROI</th>
                      </tr>
                    </thead>
                    <tbody>
                      {campaignPerformance.map((campaign) => (
                        <tr key={campaign.id} className="border-b border-border/50 hover:bg-background-elevated transition-colors">
                          <td className="py-4">
                            <div>
                              <div className="font-medium">{campaign.name}</div>
                              <div className="text-sm text-muted-foreground">{campaign.date}</div>
                            </div>
                          </td>
                          <td className="py-4">
                            <Badge variant={campaign.platform === "Instagram" ? "default" : "secondary"}>
                              {campaign.platform}
                            </Badge>
                          </td>
                          <td className="py-4 font-medium">{campaign.reach.toLocaleString()}</td>
                          <td className="py-4">
                            <div className="font-medium">{campaign.engagement.toLocaleString()}</div>
                            <div className="text-sm text-green-400">{campaign.engagementRate}%</div>
                          </td>
                          <td className="py-4 font-medium text-green-400">${campaign.revenue}</td>
                          <td className="py-4">
                            <Badge variant="outline" className="text-green-400 border-green-400">
                              {campaign.roi}x
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Revenue Tab */}
          <TabsContent value="revenue" className="space-y-6">
            <Card className="card-gradient animate-slide-up">
              <CardHeader>
                <CardTitle>Revenue Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <AnalyticsChart data={revenueData} type="revenue" height={400} />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Engagement Tab */}
          <TabsContent value="engagement" className="space-y-6">
            <Card className="card-gradient animate-slide-up">
              <CardHeader>
                <CardTitle>Engagement Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <AnalyticsChart data={revenueData} type="engagement" height={400} />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Campaigns Tab */}
          <TabsContent value="campaigns" className="space-y-6">
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="card-gradient">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3">
                    <Target className="h-8 w-8 text-blue-500" />
                    <div>
                      <p className="text-sm text-muted-foreground">Total Campaigns</p>
                      <p className="text-2xl font-bold">{stats.campaignsCompleted}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="card-gradient">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3">
                    <TrendingUp className="h-8 w-8 text-green-500" />
                    <div>
                      <p className="text-sm text-muted-foreground">Avg ROI</p>
                      <p className="text-2xl font-bold">{stats.avgROI}x</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="card-gradient">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-8 w-8 text-purple-500" />
                    <div>
                      <p className="text-sm text-muted-foreground">Success Rate</p>
                      <p className="text-2xl font-bold">89%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Platforms Tab */}
          <TabsContent value="platforms" className="space-y-6">
            <Card className="card-gradient animate-slide-up">
              <CardHeader>
                <CardTitle>Platform Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <AnalyticsChart data={revenueData} type="platforms" height={400} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

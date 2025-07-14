import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import CampaignCard from "@/components/campaign-card";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { 
  Search,
  Filter,
  Plus,
  Target,
  TrendingUp,
  Users,
  Calendar,
  DollarSign,
  Eye,
  Heart
} from "lucide-react";

interface CampaignFilters {
  search: string;
  niche: string;
  budget: string;
  platform: string;
  status: string;
}

export default function Campaigns() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState<CampaignFilters>({
    search: "",
    niche: "",
    budget: "",
    platform: "",
    status: ""
  });
  const [activeTab, setActiveTab] = useState("discover");

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

  // Fetch campaigns based on filters
  const { data: campaigns, isLoading } = useQuery({
    queryKey: ["/api/campaigns", filters],
    enabled: !!user,
  });

  // Fetch user's campaigns (for brands) or applications (for creators)
  const { data: myCampaigns } = useQuery({
    queryKey: user?.role === "brand" ? ["/api/campaigns/my"] : ["/api/applications/my"],
    enabled: !!user,
  });

  // Campaign application mutation
  const applyMutation = useMutation({
    mutationFn: async ({ campaignId, proposalText, proposedRate }: any) => {
      return await apiRequest("POST", `/api/campaigns/${campaignId}/apply`, {
        proposalText,
        proposedRate
      });
    },
    onSuccess: () => {
      toast({
        title: "Application Submitted",
        description: "Your campaign application has been submitted successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/campaigns"] });
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
        title: "Application Failed",
        description: "Failed to submit campaign application. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleFilterChange = (key: keyof CampaignFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleApplyCampaign = (campaignId: number) => {
    // In a real app, this would open a modal with application form
    applyMutation.mutate({
      campaignId,
      proposalText: "I would love to collaborate on this campaign...",
      proposedRate: 500
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen pt-16 bg-background-primary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-muted rounded w-1/3"></div>
            <div className="grid md:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-64 bg-muted rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const isCreator = user?.role === "creator";
  const isBrand = user?.role === "brand";

  return (
    <div className="min-h-screen pt-16 bg-background-primary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8 animate-fade-in">
          <div>
            <h1 className="text-4xl font-bold gradient-text mb-2">
              {isCreator ? "Discover Campaigns" : "Manage Campaigns"}
            </h1>
            <p className="text-muted-foreground text-lg">
              {isCreator ? "Find perfect brand partnerships tailored to your niche and audience" : "Create and manage your influencer marketing campaigns"}
            </p>
          </div>
          
          {isBrand && (
            <Button className="btn-gradient">
              <Plus className="mr-2 h-4 w-4" />
              Create Campaign
            </Button>
          )}
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="glassmorphism">
            <TabsTrigger value="discover">
              {isCreator ? "Discover" : "All Campaigns"}
            </TabsTrigger>
            <TabsTrigger value="my">
              {isCreator ? "My Applications" : "My Campaigns"}
            </TabsTrigger>
            {isCreator && <TabsTrigger value="active">Active</TabsTrigger>}
          </TabsList>

          {/* Discover/All Campaigns Tab */}
          <TabsContent value="discover" className="space-y-6">
            {/* Filters */}
            <Card className="glassmorphism animate-slide-up">
              <CardContent className="p-6">
                <div className="grid md:grid-cols-5 gap-4">
                  <div className="md:col-span-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search campaigns by brand, industry, or keywords..."
                        value={filters.search}
                        onChange={(e) => handleFilterChange("search", e.target.value)}
                        className="pl-10 input-glow"
                      />
                    </div>
                  </div>
                  
                  <Select value={filters.niche} onValueChange={(value) => handleFilterChange("niche", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Niches" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Niches</SelectItem>
                      <SelectItem value="lifestyle">Lifestyle</SelectItem>
                      <SelectItem value="beauty">Beauty</SelectItem>
                      <SelectItem value="fitness">Fitness</SelectItem>
                      <SelectItem value="tech">Tech</SelectItem>
                      <SelectItem value="travel">Travel</SelectItem>
                      <SelectItem value="food">Food</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select value={filters.budget} onValueChange={(value) => handleFilterChange("budget", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Budgets" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Budgets</SelectItem>
                      <SelectItem value="100-500">$100 - $500</SelectItem>
                      <SelectItem value="500-1000">$500 - $1,000</SelectItem>
                      <SelectItem value="1000-2500">$1,000 - $2,500</SelectItem>
                      <SelectItem value="2500+">$2,500+</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select value={filters.platform} onValueChange={(value) => handleFilterChange("platform", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Platforms" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Platforms</SelectItem>
                      <SelectItem value="instagram">Instagram</SelectItem>
                      <SelectItem value="tiktok">TikTok</SelectItem>
                      <SelectItem value="youtube">YouTube</SelectItem>
                      <SelectItem value="twitter">Twitter</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Campaign Stats */}
            {isCreator && (
              <div className="grid md:grid-cols-4 gap-6 animate-slide-up">
                <Card className="card-gradient">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-3">
                      <Target className="h-8 w-8 text-blue-500" />
                      <div>
                        <p className="text-sm text-muted-foreground">Available</p>
                        <p className="text-2xl font-bold">{campaigns?.length || 0}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="card-gradient">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-3">
                      <DollarSign className="h-8 w-8 text-green-500" />
                      <div>
                        <p className="text-sm text-muted-foreground">Avg. Budget</p>
                        <p className="text-2xl font-bold">$1.2K</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="card-gradient">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-3">
                      <Users className="h-8 w-8 text-purple-500" />
                      <div>
                        <p className="text-sm text-muted-foreground">Matched</p>
                        <p className="text-2xl font-bold">12</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="card-gradient">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-3">
                      <TrendingUp className="h-8 w-8 text-orange-500" />
                      <div>
                        <p className="text-sm text-muted-foreground">Success Rate</p>
                        <p className="text-2xl font-bold">89%</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Campaign Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {campaigns && campaigns.length > 0 ? (
                campaigns.map((campaign: any) => (
                  <CampaignCard
                    key={campaign.id}
                    campaign={campaign}
                    onApply={isCreator ? () => handleApplyCampaign(campaign.id) : undefined}
                    isLoading={applyMutation.isPending}
                  />
                ))
              ) : (
                <div className="col-span-full">
                  <Card className="glassmorphism">
                    <CardContent className="p-12 text-center">
                      <Target className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-xl font-semibold mb-2">No Campaigns Found</h3>
                      <p className="text-muted-foreground mb-4">
                        {filters.search || filters.niche || filters.budget || filters.platform
                          ? "Try adjusting your filters to find more campaigns"
                          : "No campaigns are currently available"}
                      </p>
                      {(filters.search || filters.niche || filters.budget || filters.platform) && (
                        <Button
                          variant="outline"
                          onClick={() => setFilters({ search: "", niche: "", budget: "", platform: "", status: "" })}
                        >
                          Clear Filters
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>

            {/* Load More */}
            {campaigns && campaigns.length > 0 && (
              <div className="text-center">
                <Button variant="outline" className="btn-glassmorphism">
                  Load More Campaigns
                </Button>
              </div>
            )}
          </TabsContent>

          {/* My Campaigns/Applications Tab */}
          <TabsContent value="my" className="space-y-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myCampaigns && myCampaigns.length > 0 ? (
                myCampaigns.map((item: any) => (
                  <CampaignCard
                    key={item.id}
                    campaign={item.campaign || item}
                    application={isCreator ? item : undefined}
                    showManageOptions={isBrand}
                  />
                ))
              ) : (
                <div className="col-span-full">
                  <Card className="glassmorphism">
                    <CardContent className="p-12 text-center">
                      <Calendar className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-xl font-semibold mb-2">
                        {isCreator ? "No Applications Yet" : "No Campaigns Yet"}
                      </h3>
                      <p className="text-muted-foreground mb-4">
                        {isCreator 
                          ? "Start applying to campaigns to see them here"
                          : "Create your first campaign to get started"
                        }
                      </p>
                      <Button className="btn-gradient">
                        {isCreator ? "Discover Campaigns" : "Create Campaign"}
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Active Campaigns Tab (Creator only) */}
          {isCreator && (
            <TabsContent value="active" className="space-y-6">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Active campaigns would be filtered from myCampaigns */}
                <div className="col-span-full">
                  <Card className="glassmorphism">
                    <CardContent className="p-12 text-center">
                      <TrendingUp className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-xl font-semibold mb-2">No Active Campaigns</h3>
                      <p className="text-muted-foreground mb-4">
                        Your active collaborations will appear here
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
}

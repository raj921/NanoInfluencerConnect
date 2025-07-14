import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { 
  Star, 
  Users, 
  TrendingUp, 
  Instagram, 
  Youtube, 
  Twitter,
  MapPin,
  Calendar,
  DollarSign,
  Eye,
  Heart,
  Share2,
  MessageSquare,
  Award,
  Verified
} from "lucide-react";

interface SocialAccount {
  platform: string;
  handle: string;
  followers: number;
  verified: boolean;
}

interface CreatorProfileProps {
  creator: {
    id: number;
    userId: string;
    niche: string;
    bio?: string;
    totalFollowers: number;
    avgEngagementRate: number;
    completedCampaigns: number;
    rating: number;
    rates?: {
      post: number;
      story: number;
      reel: number;
    };
    socialAccounts?: SocialAccount[];
    portfolio?: Array<{
      id: string;
      url: string;
      platform: string;
      type: string;
      engagement: number;
      reach: number;
    }>;
    isVerified: boolean;
  };
  user?: {
    firstName?: string;
    lastName?: string;
    profileImageUrl?: string;
    email?: string;
  };
  compact?: boolean;
  showActions?: boolean;
}

export default function CreatorProfile({ 
  creator, 
  user, 
  compact = false, 
  showActions = true 
}: CreatorProfileProps) {
  
  const getPlatformIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'instagram':
        return <Instagram className="h-4 w-4 text-pink-500" />;
      case 'youtube':
        return <Youtube className="h-4 w-4 text-red-500" />;
      case 'twitter':
        return <Twitter className="h-4 w-4 text-blue-500" />;
      default:
        return <Eye className="h-4 w-4" />;
    }
  };

  const formatFollowers = (count: number) => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 4.5) return "text-green-400";
    if (rating >= 4.0) return "text-yellow-400";
    if (rating >= 3.0) return "text-orange-400";
    return "text-red-400";
  };

  const getEngagementColor = (rate: number) => {
    if (rate >= 5.0) return "text-green-400";
    if (rate >= 3.0) return "text-yellow-400";
    return "text-orange-400";
  };

  if (compact) {
    return (
      <Card className="card-gradient hover-glow animate-scale-in">
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            <div className="relative">
              <Avatar className="h-20 w-20 mx-auto border-4 border-primary">
                <AvatarImage src={user?.profileImageUrl} />
                <AvatarFallback className="text-lg">
                  {user?.firstName?.[0]}{user?.lastName?.[0] || user?.email?.[0]}
                </AvatarFallback>
              </Avatar>
              {creator.isVerified && (
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                  <Verified className="h-4 w-4 text-white" />
                </div>
              )}
            </div>
            
            <div>
              <h3 className="font-semibold text-lg flex items-center justify-center space-x-2">
                <span>{user?.firstName} {user?.lastName}</span>
              </h3>
              <p className="text-sm text-muted-foreground capitalize">{creator.niche}</p>
              <div className="flex justify-center space-x-3 mt-2">
                {creator.socialAccounts?.slice(0, 3).map((account, index) => (
                  <div key={index}>
                    {getPlatformIcon(account.platform)}
                  </div>
                ))}
              </div>
            </div>
            
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Followers</span>
                <span className="font-semibold">{formatFollowers(creator.totalFollowers)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Avg. Engagement</span>
                <span className={`font-semibold ${getEngagementColor(creator.avgEngagementRate)}`}>
                  {Number(creator.avgEngagementRate).toFixed(1)}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Rating</span>
                <div className="flex items-center space-x-1">
                  <span className={`font-semibold ${getRatingColor(creator.rating)}`}>
                    {Number(creator.rating).toFixed(1)}
                  </span>
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                </div>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Campaigns</span>
                <span className="font-semibold">{creator.completedCampaigns}</span>
              </div>
            </div>
            
            {showActions && (
              <div className="space-y-2">
                <Button variant="outline" className="w-full btn-glassmorphism">
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Contact
                </Button>
                <Button className="w-full btn-gradient">
                  View Full Profile
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card className="card-gradient animate-slide-up">
        <CardContent className="p-8">
          <div className="flex flex-col md:flex-row items-start md:items-center space-y-6 md:space-y-0 md:space-x-8">
            <div className="relative">
              <Avatar className="h-32 w-32 border-4 border-primary">
                <AvatarImage src={user?.profileImageUrl} />
                <AvatarFallback className="text-2xl">
                  {user?.firstName?.[0]}{user?.lastName?.[0] || user?.email?.[0]}
                </AvatarFallback>
              </Avatar>
              {creator.isVerified && (
                <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <Verified className="h-5 w-5 text-white" />
                </div>
              )}
            </div>
            
            <div className="flex-1 space-y-4">
              <div>
                <h1 className="text-3xl font-bold flex items-center space-x-3">
                  <span>{user?.firstName} {user?.lastName}</span>
                </h1>
                <p className="text-lg text-muted-foreground capitalize">{creator.niche} Creator</p>
                <div className="flex items-center space-x-4 mt-2">
                  <div className="flex items-center space-x-1">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Location</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      {creator.completedCampaigns} campaigns completed
                    </span>
                  </div>
                </div>
              </div>
              
              {creator.bio && (
                <p className="text-muted-foreground max-w-2xl">{creator.bio}</p>
              )}
              
              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-2">
                  <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  <span className={`font-semibold ${getRatingColor(creator.rating)}`}>
                    {Number(creator.rating).toFixed(1)}
                  </span>
                  <span className="text-muted-foreground">({creator.completedCampaigns} reviews)</span>
                </div>
                <Badge variant="secondary" className="capitalize">
                  {creator.niche}
                </Badge>
                {creator.isVerified && (
                  <Badge className="bg-blue-500/20 text-blue-500 border-blue-500/20">
                    <Verified className="mr-1 h-3 w-3" />
                    Verified Creator
                  </Badge>
                )}
              </div>
            </div>
            
            {showActions && (
              <div className="flex flex-col space-y-3">
                <Button className="btn-gradient">
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Contact Creator
                </Button>
                <Button variant="outline" className="btn-glassmorphism">
                  <Share2 className="mr-2 h-4 w-4" />
                  Share Profile
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Stats Overview */}
        <Card className="card-gradient animate-scale-in">
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="mr-2 h-5 w-5 text-primary" />
              Statistics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Total Followers</span>
                <span className="font-semibold text-lg">{formatFollowers(creator.totalFollowers)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Avg. Engagement</span>
                <span className={`font-semibold text-lg ${getEngagementColor(creator.avgEngagementRate)}`}>
                  {Number(creator.avgEngagementRate).toFixed(1)}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Campaigns</span>
                <span className="font-semibold text-lg">{creator.completedCampaigns}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Success Rate</span>
                <span className="font-semibold text-lg text-green-400">95%</span>
              </div>
            </div>
            
            <div className="pt-4 border-t border-border">
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Profile Strength</span>
                    <span>85%</span>
                  </div>
                  <Progress value={85} className="progress-glow" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Response Rate</span>
                    <span>92%</span>
                  </div>
                  <Progress value={92} className="progress-glow" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Social Platforms */}
        <Card className="card-gradient animate-scale-in" style={{ animationDelay: "0.1s" }}>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="mr-2 h-5 w-5 text-primary" />
              Social Platforms
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {creator.socialAccounts?.map((account, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-background-elevated">
                  <div className="flex items-center space-x-3">
                    {getPlatformIcon(account.platform)}
                    <div>
                      <div className="font-medium flex items-center space-x-2">
                        <span>@{account.handle}</span>
                        {account.verified && (
                          <Verified className="h-4 w-4 text-blue-500" />
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground capitalize">
                        {account.platform}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">{formatFollowers(account.followers)}</div>
                    <div className="text-xs text-muted-foreground">followers</div>
                  </div>
                </div>
              )) || (
                <div className="text-center py-4 text-muted-foreground">
                  No social accounts connected
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Rates */}
        {creator.rates && (
          <Card className="card-gradient animate-scale-in" style={{ animationDelay: "0.2s" }}>
            <CardHeader>
              <CardTitle className="flex items-center">
                <DollarSign className="mr-2 h-5 w-5 text-primary" />
                Content Rates
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 rounded-lg bg-background-elevated">
                  <div className="flex items-center space-x-3">
                    <Instagram className="h-5 w-5 text-pink-500" />
                    <span>Instagram Post</span>
                  </div>
                  <span className="font-semibold text-green-400">${creator.rates.post}</span>
                </div>
                <div className="flex justify-between items-center p-3 rounded-lg bg-background-elevated">
                  <div className="flex items-center space-x-3">
                    <Instagram className="h-5 w-5 text-pink-500" />
                    <span>Instagram Story</span>
                  </div>
                  <span className="font-semibold text-green-400">${creator.rates.story}</span>
                </div>
                <div className="flex justify-between items-center p-3 rounded-lg bg-background-elevated">
                  <div className="flex items-center space-x-3">
                    <Instagram className="h-5 w-5 text-pink-500" />
                    <span>Instagram Reel</span>
                  </div>
                  <span className="font-semibold text-green-400">${creator.rates.reel}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Portfolio Gallery */}
      {creator.portfolio && creator.portfolio.length > 0 && (
        <Card className="card-gradient animate-slide-up">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Award className="mr-2 h-5 w-5 text-primary" />
              Portfolio
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {creator.portfolio.map((item, index) => (
                <div key={item.id} className="group relative overflow-hidden rounded-lg bg-background-elevated hover:scale-105 transition-transform duration-300">
                  <img 
                    src={item.url} 
                    alt={`Portfolio item ${index + 1}`}
                    className="w-full aspect-square object-cover"
                  />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <div className="text-center text-white">
                      <div className="flex items-center justify-center space-x-4 mb-2">
                        <div className="flex items-center space-x-1">
                          <Eye className="h-4 w-4" />
                          <span className="text-sm">{formatFollowers(item.reach)}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Heart className="h-4 w-4" />
                          <span className="text-sm">{formatFollowers(item.engagement)}</span>
                        </div>
                      </div>
                      <Badge variant="secondary" className="capitalize">
                        {item.platform} {item.type}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

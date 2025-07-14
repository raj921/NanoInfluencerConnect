import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { 
  Calendar, 
  DollarSign, 
  Users, 
  Eye, 
  ArrowRight,
  Instagram,
  Youtube,
  Twitter,
  CheckCircle,
  Clock,
  XCircle
} from "lucide-react";

interface CampaignCardProps {
  campaign: any;
  application?: any;
  onApply?: () => void;
  isLoading?: boolean;
  showManageOptions?: boolean;
}

export default function CampaignCard({ 
  campaign, 
  application, 
  onApply, 
  isLoading, 
  showManageOptions 
}: CampaignCardProps) {
  
  const getPlatformIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'instagram':
        return <Instagram className="h-4 w-4" />;
      case 'youtube':
        return <Youtube className="h-4 w-4" />;
      case 'twitter':
        return <Twitter className="h-4 w-4" />;
      default:
        return <Eye className="h-4 w-4" />;
    }
  };

  const getPlatformColor = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'instagram':
        return 'bg-pink-500/20 text-pink-500 border-pink-500/20';
      case 'youtube':
        return 'bg-red-500/20 text-red-500 border-red-500/20';
      case 'twitter':
        return 'bg-blue-500/20 text-blue-500 border-blue-500/20';
      default:
        return 'bg-gray-500/20 text-gray-500 border-gray-500/20';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'accepted':
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted':
      case 'approved':
        return 'bg-green-500/20 text-green-500 border-green-500/20';
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-500 border-yellow-500/20';
      case 'rejected':
        return 'bg-red-500/20 text-red-500 border-red-500/20';
      default:
        return 'bg-gray-500/20 text-gray-500 border-gray-500/20';
    }
  };

  // Mock brand data (in real app, this would be included in campaign)
  const brandInfo = {
    name: campaign.brand?.companyName || "Brand Name",
    logo: "/api/placeholder/60/60",
    industry: campaign.brand?.industry || "Industry"
  };

  const formatBudget = (budget: any) => {
    if (typeof budget === 'object' && budget.min && budget.max) {
      return `$${budget.min.toLocaleString()} - $${budget.max.toLocaleString()}`;
    }
    if (typeof budget === 'number') {
      return `$${budget.toLocaleString()}`;
    }
    return "Budget TBD";
  };

  const platforms = campaign.platforms || ['Instagram'];
  const requirements = campaign.requirements || {};
  const targetAudience = campaign.targetAudience || {};

  return (
    <Card className="card-gradient hover-glow transition-all duration-300 hover:scale-[1.02] animate-scale-in">
      <CardHeader className="pb-4">
        <div className="flex items-center space-x-3">
          <Avatar className="h-12 w-12">
            <AvatarImage src={brandInfo.logo} alt={brandInfo.name} />
            <AvatarFallback>{brandInfo.name[0]}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h3 className="font-semibold text-lg">{brandInfo.name}</h3>
            <p className="text-sm text-muted-foreground">{brandInfo.industry}</p>
          </div>
          {application && (
            <div className="flex items-center space-x-1">
              {getStatusIcon(application.status)}
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div>
          <h4 className="font-semibold text-xl mb-2">{campaign.title}</h4>
          <p className="text-muted-foreground text-sm line-clamp-3">
            {campaign.description}
          </p>
        </div>

        {/* Campaign Details */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground text-sm">Budget</span>
            <span className="font-semibold text-green-400">
              {formatBudget(campaign.budget)}
            </span>
          </div>

          {requirements.minFollowers && (
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground text-sm">Min. Followers</span>
              <span className="font-semibold">
                {requirements.minFollowers.toLocaleString()}
              </span>
            </div>
          )}

          {campaign.deadline && (
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground text-sm">Deadline</span>
              <span className="font-semibold">
                {new Date(campaign.deadline).toLocaleDateString()}
              </span>
            </div>
          )}

          {application?.proposedRate && (
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground text-sm">Your Rate</span>
              <span className="font-semibold text-blue-400">
                ${application.proposedRate}
              </span>
            </div>
          )}
        </div>

        {/* Platforms */}
        <div className="flex flex-wrap gap-2">
          {platforms.map((platform: string, index: number) => (
            <Badge 
              key={index} 
              variant="outline" 
              className={getPlatformColor(platform)}
            >
              {getPlatformIcon(platform)}
              <span className="ml-1 capitalize">{platform}</span>
            </Badge>
          ))}
        </div>

        {/* Tags */}
        {requirements.niche && (
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary" className="capitalize">
              {requirements.niche}
            </Badge>
            {targetAudience.ageRange && (
              <Badge variant="outline">
                Age {targetAudience.ageRange}
              </Badge>
            )}
          </div>
        )}

        {/* Application Status */}
        {application && (
          <div className="pt-3 border-t border-border">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Status</span>
              <Badge variant="outline" className={getStatusColor(application.status)}>
                {getStatusIcon(application.status)}
                <span className="ml-1 capitalize">{application.status}</span>
              </Badge>
            </div>
            {application.proposalText && (
              <div className="mt-2">
                <p className="text-sm text-muted-foreground">Your Proposal:</p>
                <p className="text-sm bg-background-elevated p-2 rounded mt-1 line-clamp-2">
                  {application.proposalText}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="pt-4">
          {onApply && !application && (
            <Button 
              className="w-full btn-gradient" 
              onClick={onApply}
              disabled={isLoading}
            >
              {isLoading ? "Applying..." : "Apply Now"}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          )}

          {showManageOptions && (
            <div className="flex space-x-2">
              <Button variant="outline" className="flex-1 btn-glassmorphism">
                View Applications
              </Button>
              <Button variant="outline" className="flex-1 btn-glassmorphism">
                Edit Campaign
              </Button>
            </div>
          )}

          {application && (
            <div className="flex space-x-2">
              <Button variant="outline" className="flex-1 btn-glassmorphism">
                View Details
              </Button>
              {application.status === 'accepted' && (
                <Button className="flex-1 btn-gradient">
                  Start Collaboration
                </Button>
              )}
            </div>
          )}

          {!onApply && !showManageOptions && !application && (
            <Button variant="outline" className="w-full btn-glassmorphism">
              View Details
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Campaign Stats */}
        {campaign.applicationsCount && (
          <div className="pt-3 border-t border-border">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-1 text-muted-foreground">
                <Users className="h-4 w-4" />
                <span>{campaign.applicationsCount} applications</span>
              </div>
              {campaign.status && (
                <Badge 
                  variant={campaign.status === 'active' ? 'default' : 'secondary'}
                  className="capitalize"
                >
                  {campaign.status}
                </Badge>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

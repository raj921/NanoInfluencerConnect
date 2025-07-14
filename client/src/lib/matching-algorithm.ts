interface Creator {
  id: number;
  niche: string;
  totalFollowers: number;
  avgEngagementRate: number;
  completedCampaigns: number;
  rating: number;
  rates?: {
    post: number;
    story: number;
    reel: number;
  };
  socialAccounts?: Array<{
    platform: string;
    followers: number;
    verified: boolean;
  }>;
  portfolio?: Array<{
    platform: string;
    engagement: number;
    reach: number;
  }>;
  isVerified: boolean;
}

interface Campaign {
  id: number;
  title: string;
  brandId: number;
  requirements?: {
    niche?: string;
    minFollowers?: number;
    maxFollowers?: number;
    minEngagement?: number;
    platforms?: string[];
    ageRange?: string;
    gender?: string;
    location?: string;
  };
  budget?: {
    min: number;
    max: number;
  };
  targetAudience?: {
    ageRange?: string;
    interests?: string[];
    location?: string;
  };
  platforms?: string[];
  deadline?: string;
  status: string;
}

interface MatchScore {
  creatorId: number;
  campaignId: number;
  score: number;
  breakdown: {
    nicheMatch: number;
    followerMatch: number;
    engagementMatch: number;
    platformMatch: number;
    budgetMatch: number;
    experienceMatch: number;
    qualityMatch: number;
  };
  confidence: 'high' | 'medium' | 'low';
}

export class MatchingAlgorithm {
  
  /**
   * Calculate match score between a creator and campaign
   */
  static calculateMatch(creator: Creator, campaign: Campaign): MatchScore {
    const breakdown = {
      nicheMatch: this.calculateNicheMatch(creator, campaign),
      followerMatch: this.calculateFollowerMatch(creator, campaign),
      engagementMatch: this.calculateEngagementMatch(creator, campaign),
      platformMatch: this.calculatePlatformMatch(creator, campaign),
      budgetMatch: this.calculateBudgetMatch(creator, campaign),
      experienceMatch: this.calculateExperienceMatch(creator, campaign),
      qualityMatch: this.calculateQualityMatch(creator, campaign)
    };

    // Weighted average - adjust weights based on importance
    const weights = {
      nicheMatch: 0.25,      // Niche compatibility is very important
      followerMatch: 0.20,   // Follower count matching requirements
      engagementMatch: 0.15, // High engagement is valuable
      platformMatch: 0.15,   // Platform availability
      budgetMatch: 0.10,     // Budget alignment
      experienceMatch: 0.10, // Past campaign success
      qualityMatch: 0.05     // Overall quality indicators
    };

    const score = Object.entries(breakdown).reduce((total, [key, value]) => {
      return total + (value * weights[key as keyof typeof weights]);
    }, 0);

    const confidence = this.determineConfidence(score, breakdown);

    return {
      creatorId: creator.id,
      campaignId: campaign.id,
      score: Math.round(score * 100) / 100, // Round to 2 decimal places
      breakdown,
      confidence
    };
  }

  /**
   * Find best matching creators for a campaign
   */
  static findMatchingCreators(
    campaign: Campaign, 
    creators: Creator[], 
    limit: number = 10
  ): MatchScore[] {
    const matches = creators
      .filter(creator => this.meetsBasicRequirements(creator, campaign))
      .map(creator => this.calculateMatch(creator, campaign))
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    return matches;
  }

  /**
   * Find matching campaigns for a creator
   */
  static findMatchingCampaigns(
    creator: Creator, 
    campaigns: Campaign[], 
    limit: number = 10
  ): MatchScore[] {
    const matches = campaigns
      .filter(campaign => campaign.status === 'active')
      .filter(campaign => this.meetsBasicRequirements(creator, campaign))
      .map(campaign => this.calculateMatch(creator, campaign))
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    return matches;
  }

  /**
   * Check if creator meets basic campaign requirements
   */
  private static meetsBasicRequirements(creator: Creator, campaign: Campaign): boolean {
    const req = campaign.requirements;
    if (!req) return true;

    // Check follower count requirements
    if (req.minFollowers && creator.totalFollowers < req.minFollowers) {
      return false;
    }
    if (req.maxFollowers && creator.totalFollowers > req.maxFollowers) {
      return false;
    }

    // Check engagement rate requirements
    if (req.minEngagement && creator.avgEngagementRate < req.minEngagement) {
      return false;
    }

    // Check platform availability
    if (req.platforms && creator.socialAccounts) {
      const creatorPlatforms = creator.socialAccounts.map(acc => acc.platform.toLowerCase());
      const hasRequiredPlatform = req.platforms.some(platform => 
        creatorPlatforms.includes(platform.toLowerCase())
      );
      if (!hasRequiredPlatform) {
        return false;
      }
    }

    return true;
  }

  /**
   * Calculate niche compatibility score (0-1)
   */
  private static calculateNicheMatch(creator: Creator, campaign: Campaign): number {
    const req = campaign.requirements;
    if (!req?.niche) return 0.8; // Default score if no niche specified

    const creatorNiche = creator.niche.toLowerCase();
    const requiredNiche = req.niche.toLowerCase();

    // Exact match
    if (creatorNiche === requiredNiche) return 1.0;

    // Related niches mapping
    const relatedNiches: { [key: string]: string[] } = {
      'lifestyle': ['wellness', 'fashion', 'travel', 'food'],
      'beauty': ['fashion', 'wellness', 'lifestyle'],
      'fitness': ['wellness', 'lifestyle', 'health'],
      'tech': ['gaming', 'productivity', 'gadgets'],
      'travel': ['lifestyle', 'adventure', 'culture'],
      'food': ['lifestyle', 'health', 'culture'],
      'fashion': ['beauty', 'lifestyle', 'luxury'],
      'wellness': ['fitness', 'health', 'lifestyle']
    };

    // Check if niches are related
    const related = relatedNiches[creatorNiche]?.includes(requiredNiche) ||
                   relatedNiches[requiredNiche]?.includes(creatorNiche);

    return related ? 0.7 : 0.3;
  }

  /**
   * Calculate follower count match score (0-1)
   */
  private static calculateFollowerMatch(creator: Creator, campaign: Campaign): number {
    const req = campaign.requirements;
    if (!req?.minFollowers && !req?.maxFollowers) return 1.0;

    const followers = creator.totalFollowers;
    const min = req.minFollowers || 0;
    const max = req.maxFollowers || Infinity;

    // Perfect range match
    if (followers >= min && followers <= max) {
      return 1.0;
    }

    // Calculate distance from ideal range
    let distance = 0;
    if (followers < min) {
      distance = (min - followers) / min;
    } else if (followers > max) {
      distance = (followers - max) / max;
    }

    // Convert distance to score (closer = higher score)
    return Math.max(0, 1 - distance);
  }

  /**
   * Calculate engagement rate match score (0-1)
   */
  private static calculateEngagementMatch(creator: Creator, campaign: Campaign): number {
    const req = campaign.requirements;
    const engagement = creator.avgEngagementRate;

    if (!req?.minEngagement) {
      // Reward higher engagement rates
      if (engagement >= 5.0) return 1.0;
      if (engagement >= 3.0) return 0.8;
      if (engagement >= 1.0) return 0.6;
      return 0.4;
    }

    if (engagement >= req.minEngagement) {
      // Bonus for exceeding minimum
      const bonus = Math.min((engagement - req.minEngagement) * 0.1, 0.3);
      return Math.min(1.0, 0.7 + bonus);
    }

    // Penalty for not meeting minimum
    return Math.max(0, engagement / req.minEngagement);
  }

  /**
   * Calculate platform compatibility score (0-1)
   */
  private static calculatePlatformMatch(creator: Creator, campaign: Campaign): number {
    const campaignPlatforms = campaign.platforms || campaign.requirements?.platforms || [];
    if (campaignPlatforms.length === 0) return 1.0;

    if (!creator.socialAccounts || creator.socialAccounts.length === 0) {
      return 0.2;
    }

    const creatorPlatforms = creator.socialAccounts.map(acc => acc.platform.toLowerCase());
    const requiredPlatforms = campaignPlatforms.map(p => p.toLowerCase());

    // Calculate how many required platforms the creator has
    const matchingPlatforms = requiredPlatforms.filter(platform =>
      creatorPlatforms.includes(platform)
    );

    const baseScore = matchingPlatforms.length / requiredPlatforms.length;

    // Bonus for verified accounts on matching platforms
    let verificationBonus = 0;
    creator.socialAccounts.forEach(account => {
      if (requiredPlatforms.includes(account.platform.toLowerCase()) && account.verified) {
        verificationBonus += 0.1;
      }
    });

    return Math.min(1.0, baseScore + verificationBonus);
  }

  /**
   * Calculate budget alignment score (0-1)
   */
  private static calculateBudgetMatch(creator: Creator, campaign: Campaign): number {
    if (!campaign.budget || !creator.rates) return 0.8;

    const campaignMax = campaign.budget.max;
    const campaignMin = campaign.budget.min;
    
    // Use the most relevant rate (assuming Instagram post as default)
    const creatorRate = creator.rates.post || creator.rates.reel || creator.rates.story || 0;

    if (creatorRate === 0) return 0.5; // No rate information

    // Perfect match if creator rate is within budget
    if (creatorRate >= campaignMin && creatorRate <= campaignMax) {
      return 1.0;
    }

    // Calculate how far off the rate is
    if (creatorRate < campaignMin) {
      // Creator charges less than minimum (good for brand)
      return Math.min(1.0, 0.8 + (campaignMin - creatorRate) / campaignMin * 0.2);
    } else {
      // Creator charges more than maximum
      const overage = (creatorRate - campaignMax) / campaignMax;
      return Math.max(0, 1 - overage);
    }
  }

  /**
   * Calculate experience/success score (0-1)
   */
  private static calculateExperienceMatch(creator: Creator, campaign: Campaign): number {
    const campaigns = creator.completedCampaigns || 0;
    const rating = creator.rating || 0;

    // Experience score based on completed campaigns
    let experienceScore = 0;
    if (campaigns >= 20) experienceScore = 1.0;
    else if (campaigns >= 10) experienceScore = 0.8;
    else if (campaigns >= 5) experienceScore = 0.6;
    else if (campaigns >= 1) experienceScore = 0.4;
    else experienceScore = 0.2;

    // Rating score (assuming 5-star system)
    const ratingScore = rating / 5.0;

    // Weighted combination
    return (experienceScore * 0.6) + (ratingScore * 0.4);
  }

  /**
   * Calculate overall quality indicators (0-1)
   */
  private static calculateQualityMatch(creator: Creator, campaign: Campaign): number {
    let qualityScore = 0.5; // Base score

    // Verified creator bonus
    if (creator.isVerified) {
      qualityScore += 0.2;
    }

    // Portfolio quality (if available)
    if (creator.portfolio && creator.portfolio.length > 0) {
      const avgEngagement = creator.portfolio.reduce((sum, item) => 
        sum + (item.engagement / item.reach), 0) / creator.portfolio.length;
      
      if (avgEngagement > 0.05) qualityScore += 0.2;
      else if (avgEngagement > 0.03) qualityScore += 0.1;
    }

    // Social account verification bonus
    if (creator.socialAccounts) {
      const verifiedAccounts = creator.socialAccounts.filter(acc => acc.verified);
      qualityScore += Math.min(0.2, verifiedAccounts.length * 0.1);
    }

    return Math.min(1.0, qualityScore);
  }

  /**
   * Determine confidence level based on score and breakdown
   */
  private static determineConfidence(score: number, breakdown: any): 'high' | 'medium' | 'low' {
    // High confidence: high overall score and strong key metrics
    if (score >= 0.8 && breakdown.nicheMatch >= 0.8 && breakdown.followerMatch >= 0.7) {
      return 'high';
    }

    // Medium confidence: decent score
    if (score >= 0.6) {
      return 'medium';
    }

    // Low confidence: low score or missing key requirements
    return 'low';
  }

  /**
   * Generate match explanation for UI display
   */
  static generateMatchExplanation(matchScore: MatchScore): string[] {
    const explanations: string[] = [];
    const { breakdown, score } = matchScore;

    if (breakdown.nicheMatch >= 0.8) {
      explanations.push("✅ Perfect niche alignment");
    } else if (breakdown.nicheMatch >= 0.6) {
      explanations.push("✅ Good niche compatibility");
    } else if (breakdown.nicheMatch < 0.5) {
      explanations.push("⚠️ Limited niche alignment");
    }

    if (breakdown.followerMatch >= 0.9) {
      explanations.push("✅ Follower count perfectly matches requirements");
    } else if (breakdown.followerMatch >= 0.7) {
      explanations.push("✅ Good follower count match");
    }

    if (breakdown.engagementMatch >= 0.8) {
      explanations.push("✅ Excellent engagement rate");
    } else if (breakdown.engagementMatch < 0.5) {
      explanations.push("⚠️ Engagement rate below expectations");
    }

    if (breakdown.platformMatch >= 0.9) {
      explanations.push("✅ All required platforms available");
    } else if (breakdown.platformMatch < 0.7) {
      explanations.push("⚠️ Some required platforms missing");
    }

    if (breakdown.experienceMatch >= 0.8) {
      explanations.push("✅ Highly experienced creator");
    } else if (breakdown.experienceMatch < 0.4) {
      explanations.push("ℹ️ New creator with limited campaign history");
    }

    if (score >= 0.8) {
      explanations.unshift("🎯 Excellent match - highly recommended");
    } else if (score >= 0.6) {
      explanations.unshift("👍 Good match - worth considering");
    } else {
      explanations.unshift("🤔 Moderate match - review carefully");
    }

    return explanations;
  }
}

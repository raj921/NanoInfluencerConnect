import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { 
  User,
  Settings,
  Camera,
  Instagram,
  Youtube,
  Twitter,
  Globe,
  Star,
  TrendingUp,
  Users,
  DollarSign,
  Edit,
  Save,
  X,
  Plus,
  Trash2
} from "lucide-react";

const creatorProfileSchema = z.object({
  niche: z.string().min(1, "Niche is required"),
  bio: z.string().max(500, "Bio must be 500 characters or less"),
  rates: z.object({
    post: z.number().min(0),
    story: z.number().min(0),
    reel: z.number().min(0),
  }),
});

const brandProfileSchema = z.object({
  companyName: z.string().min(1, "Company name is required"),
  industry: z.string().min(1, "Industry is required"),
  description: z.string().max(1000, "Description must be 1000 characters or less"),
  website: z.string().url("Must be a valid URL").optional().or(z.literal("")),
});

export default function Profile() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("profile");
  const [isEditing, setIsEditing] = useState(false);

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

  const isCreator = user?.role === "creator";
  const isBrand = user?.role === "brand";

  // Fetch profile data
  const { data: profile, isLoading } = useQuery({
    queryKey: isCreator ? ["/api/creators/me"] : ["/api/brands/me"],
    enabled: !!user,
  });

  // Profile form
  const form = useForm({
    resolver: zodResolver(isCreator ? creatorProfileSchema : brandProfileSchema),
    defaultValues: isCreator ? {
      niche: "",
      bio: "",
      rates: { post: 0, story: 0, reel: 0 },
    } : {
      companyName: "",
      industry: "",
      description: "",
      website: "",
    },
  });

  // Update form values when profile data loads
  useEffect(() => {
    if (profile) {
      if (isCreator) {
        form.reset({
          niche: profile.niche || "",
          bio: profile.bio || "",
          rates: profile.rates || { post: 0, story: 0, reel: 0 },
        });
      } else {
        form.reset({
          companyName: profile.companyName || "",
          industry: profile.industry || "",
          description: profile.description || "",
          website: profile.website || "",
        });
      }
    }
  }, [profile, form, isCreator]);

  // Profile update mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: any) => {
      const endpoint = isCreator ? "/api/creators/me" : "/api/brands/me";
      return await apiRequest("PUT", endpoint, data);
    },
    onSuccess: () => {
      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully!",
      });
      setIsEditing(false);
      queryClient.invalidateQueries({ queryKey: isCreator ? ["/api/creators/me"] : ["/api/brands/me"] });
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
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Create profile mutation (if doesn't exist)
  const createProfileMutation = useMutation({
    mutationFn: async (data: any) => {
      const endpoint = isCreator ? "/api/creators" : "/api/brands";
      return await apiRequest("POST", endpoint, data);
    },
    onSuccess: () => {
      toast({
        title: "Profile Created",
        description: "Your profile has been created successfully!",
      });
      setIsEditing(false);
      queryClient.invalidateQueries({ queryKey: isCreator ? ["/api/creators/me"] : ["/api/brands/me"] });
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
        title: "Creation Failed",
        description: "Failed to create profile. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: any) => {
    if (profile) {
      updateProfileMutation.mutate(data);
    } else {
      createProfileMutation.mutate(data);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen pt-16 bg-background-primary">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-muted rounded w-1/3"></div>
            <div className="h-64 bg-muted rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-16 bg-background-primary">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8 animate-fade-in">
          <div>
            <h1 className="text-4xl font-bold gradient-text mb-2">Profile</h1>
            <p className="text-muted-foreground text-lg">
              Manage your {isCreator ? "creator" : "brand"} profile and settings
            </p>
          </div>
          
          {!isEditing ? (
            <Button onClick={() => setIsEditing(true)} className="btn-gradient">
              <Edit className="mr-2 h-4 w-4" />
              Edit Profile
            </Button>
          ) : (
            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                onClick={() => setIsEditing(false)}
                className="btn-glassmorphism"
              >
                <X className="mr-2 h-4 w-4" />
                Cancel
              </Button>
              <Button 
                onClick={form.handleSubmit(onSubmit)}
                disabled={updateProfileMutation.isPending || createProfileMutation.isPending}
                className="btn-gradient"
              >
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </Button>
            </div>
          )}
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="glassmorphism mb-6">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="social">Social Accounts</TabsTrigger>
            {isCreator && <TabsTrigger value="portfolio">Portfolio</TabsTrigger>}
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <Card className="card-gradient animate-slide-up">
              <CardHeader>
                <div className="flex items-center space-x-4">
                  <Avatar className="h-20 w-20 border-4 border-primary">
                    <AvatarImage src={user?.profileImageUrl} />
                    <AvatarFallback className="text-xl">
                      {user?.firstName?.[0]}{user?.lastName?.[0] || user?.email?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold">
                      {user?.firstName} {user?.lastName || user?.email?.split('@')[0]}
                    </h2>
                    <p className="text-muted-foreground">{user?.email}</p>
                    <Badge variant="secondary" className="mt-2 capitalize">
                      {user?.role}
                    </Badge>
                  </div>
                  {isEditing && (
                    <Button variant="outline" size="sm">
                      <Camera className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardHeader>
              
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    {isCreator ? (
                      <>
                        {/* Creator Fields */}
                        <FormField
                          control={form.control}
                          name="niche"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Niche</FormLabel>
                              <FormControl>
                                {isEditing ? (
                                  <Select value={field.value} onValueChange={field.onChange}>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select your niche" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="lifestyle">Lifestyle</SelectItem>
                                      <SelectItem value="beauty">Beauty</SelectItem>
                                      <SelectItem value="fitness">Fitness</SelectItem>
                                      <SelectItem value="tech">Tech</SelectItem>
                                      <SelectItem value="travel">Travel</SelectItem>
                                      <SelectItem value="food">Food</SelectItem>
                                      <SelectItem value="fashion">Fashion</SelectItem>
                                      <SelectItem value="wellness">Wellness</SelectItem>
                                    </SelectContent>
                                  </Select>
                                ) : (
                                  <div className="p-3 bg-background-elevated rounded-lg capitalize">
                                    {field.value || "Not set"}
                                  </div>
                                )}
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="bio"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Bio</FormLabel>
                              <FormControl>
                                {isEditing ? (
                                  <Textarea
                                    {...field}
                                    placeholder="Tell us about yourself and your content..."
                                    rows={4}
                                    className="input-glow"
                                  />
                                ) : (
                                  <div className="p-3 bg-background-elevated rounded-lg min-h-[100px]">
                                    {field.value || "No bio added"}
                                  </div>
                                )}
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {/* Rates */}
                        <div className="space-y-4">
                          <Label className="text-base font-semibold">Content Rates</Label>
                          <div className="grid md:grid-cols-3 gap-4">
                            <FormField
                              control={form.control}
                              name="rates.post"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Instagram Post</FormLabel>
                                  <FormControl>
                                    {isEditing ? (
                                      <div className="relative">
                                        <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                        <Input
                                          {...field}
                                          type="number"
                                          placeholder="0"
                                          className="pl-10 input-glow"
                                          onChange={(e) => field.onChange(Number(e.target.value))}
                                        />
                                      </div>
                                    ) : (
                                      <div className="p-3 bg-background-elevated rounded-lg">
                                        ${field.value || 0}
                                      </div>
                                    )}
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name="rates.story"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Instagram Story</FormLabel>
                                  <FormControl>
                                    {isEditing ? (
                                      <div className="relative">
                                        <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                        <Input
                                          {...field}
                                          type="number"
                                          placeholder="0"
                                          className="pl-10 input-glow"
                                          onChange={(e) => field.onChange(Number(e.target.value))}
                                        />
                                      </div>
                                    ) : (
                                      <div className="p-3 bg-background-elevated rounded-lg">
                                        ${field.value || 0}
                                      </div>
                                    )}
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name="rates.reel"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Instagram Reel</FormLabel>
                                  <FormControl>
                                    {isEditing ? (
                                      <div className="relative">
                                        <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                        <Input
                                          {...field}
                                          type="number"
                                          placeholder="0"
                                          className="pl-10 input-glow"
                                          onChange={(e) => field.onChange(Number(e.target.value))}
                                        />
                                      </div>
                                    ) : (
                                      <div className="p-3 bg-background-elevated rounded-lg">
                                        ${field.value || 0}
                                      </div>
                                    )}
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>

                        {/* Stats Display */}
                        {profile && (
                          <div className="grid md:grid-cols-4 gap-4 pt-6 border-t border-border">
                            <div className="text-center">
                              <div className="text-2xl font-bold">{profile.totalFollowers?.toLocaleString() || 0}</div>
                              <div className="text-sm text-muted-foreground">Total Followers</div>
                            </div>
                            <div className="text-center">
                              <div className="text-2xl font-bold">{Number(profile.avgEngagementRate || 0).toFixed(1)}%</div>
                              <div className="text-sm text-muted-foreground">Avg. Engagement</div>
                            </div>
                            <div className="text-center">
                              <div className="text-2xl font-bold">{profile.completedCampaigns || 0}</div>
                              <div className="text-sm text-muted-foreground">Campaigns</div>
                            </div>
                            <div className="text-center">
                              <div className="flex items-center justify-center space-x-1">
                                <span className="text-2xl font-bold">{Number(profile.rating || 0).toFixed(1)}</span>
                                <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                              </div>
                              <div className="text-sm text-muted-foreground">Rating</div>
                            </div>
                          </div>
                        )}
                      </>
                    ) : (
                      <>
                        {/* Brand Fields */}
                        <FormField
                          control={form.control}
                          name="companyName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Company Name</FormLabel>
                              <FormControl>
                                {isEditing ? (
                                  <Input
                                    {...field}
                                    placeholder="Your company name"
                                    className="input-glow"
                                  />
                                ) : (
                                  <div className="p-3 bg-background-elevated rounded-lg">
                                    {field.value || "Not set"}
                                  </div>
                                )}
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="industry"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Industry</FormLabel>
                              <FormControl>
                                {isEditing ? (
                                  <Select value={field.value} onValueChange={field.onChange}>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select your industry" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="beauty">Beauty & Cosmetics</SelectItem>
                                      <SelectItem value="fashion">Fashion & Apparel</SelectItem>
                                      <SelectItem value="tech">Technology</SelectItem>
                                      <SelectItem value="food">Food & Beverage</SelectItem>
                                      <SelectItem value="travel">Travel & Tourism</SelectItem>
                                      <SelectItem value="fitness">Health & Fitness</SelectItem>
                                      <SelectItem value="home">Home & Lifestyle</SelectItem>
                                      <SelectItem value="automotive">Automotive</SelectItem>
                                    </SelectContent>
                                  </Select>
                                ) : (
                                  <div className="p-3 bg-background-elevated rounded-lg capitalize">
                                    {field.value || "Not set"}
                                  </div>
                                )}
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="description"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Company Description</FormLabel>
                              <FormControl>
                                {isEditing ? (
                                  <Textarea
                                    {...field}
                                    placeholder="Describe your company and what you do..."
                                    rows={4}
                                    className="input-glow"
                                  />
                                ) : (
                                  <div className="p-3 bg-background-elevated rounded-lg min-h-[100px]">
                                    {field.value || "No description added"}
                                  </div>
                                )}
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="website"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Website</FormLabel>
                              <FormControl>
                                {isEditing ? (
                                  <div className="relative">
                                    <Globe className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input
                                      {...field}
                                      placeholder="https://yourcompany.com"
                                      className="pl-10 input-glow"
                                    />
                                  </div>
                                ) : (
                                  <div className="p-3 bg-background-elevated rounded-lg">
                                    {field.value ? (
                                      <a 
                                        href={field.value} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="text-primary hover:underline"
                                      >
                                        {field.value}
                                      </a>
                                    ) : (
                                      "No website added"
                                    )}
                                  </div>
                                )}
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </>
                    )}
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Social Accounts Tab */}
          <TabsContent value="social" className="space-y-6">
            <Card className="card-gradient animate-slide-up">
              <CardHeader>
                <CardTitle>Connected Social Accounts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Instagram className="h-6 w-6 text-pink-500" />
                      <div>
                        <div className="font-medium">Instagram</div>
                        <div className="text-sm text-muted-foreground">@username</div>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      Reconnect
                    </Button>
                  </div>

                  <div className="flex items-center justify-between p-4 border border-dashed border-border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Youtube className="h-6 w-6 text-red-500" />
                      <div>
                        <div className="font-medium">YouTube</div>
                        <div className="text-sm text-muted-foreground">Not connected</div>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      <Plus className="mr-2 h-4 w-4" />
                      Connect
                    </Button>
                  </div>

                  <div className="flex items-center justify-between p-4 border border-dashed border-border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Twitter className="h-6 w-6 text-blue-500" />
                      <div>
                        <div className="font-medium">Twitter</div>
                        <div className="text-sm text-muted-foreground">Not connected</div>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      <Plus className="mr-2 h-4 w-4" />
                      Connect
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Portfolio Tab (Creator only) */}
          {isCreator && (
            <TabsContent value="portfolio" className="space-y-6">
              <Card className="card-gradient animate-slide-up">
                <CardHeader>
                  <CardTitle>Portfolio</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* Portfolio items would be rendered here */}
                    <div className="aspect-square bg-background-elevated rounded-lg border-2 border-dashed border-border flex items-center justify-center">
                      <div className="text-center">
                        <Plus className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                        <p className="text-muted-foreground">Add Content</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card className="card-gradient animate-slide-up">
              <CardHeader>
                <CardTitle>Account Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Email Notifications</h4>
                      <p className="text-sm text-muted-foreground">Receive notifications about campaigns and messages</p>
                    </div>
                    <Button variant="outline" size="sm">Configure</Button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Privacy Settings</h4>
                      <p className="text-sm text-muted-foreground">Control who can see your profile and contact you</p>
                    </div>
                    <Button variant="outline" size="sm">Manage</Button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Payment Settings</h4>
                      <p className="text-sm text-muted-foreground">Manage payment methods and tax information</p>
                    </div>
                    <Button variant="outline" size="sm">Update</Button>
                  </div>

                  <div className="pt-6 border-t border-border">
                    <Button variant="destructive" className="w-full">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete Account
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

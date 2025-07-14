import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import SplitText from "@/components/reactbits/SplitText";
import Ballpit from "@/components/reactbits/Ballpit";
import AnimatedBackground from "@/components/reactbits/AnimatedBackground";
import { 
  Users, 
  Search, 
  BarChart3, 
  Workflow, 
  Instagram, 
  Youtube, 
  Twitter,
  Linkedin,
  Star,
  TrendingUp,
  Shield,
  Zap
} from "lucide-react";

export default function Landing() {
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("animate-fade-in");
          }
        });
      },
      { threshold: 0.1 }
    );

    const elements = document.querySelectorAll(".animate-on-scroll");
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  const handleGetStarted = () => {
    window.location.href = "/api/login";
  };

  const handleBrandSignup = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 backdrop-blur-lg bg-background/80 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-primary to-secondary rounded-xl flex items-center justify-center">
                <Users className="h-6 w-6 text-primary-foreground" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                NanoInflu
              </span>
            </div>
            
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors">
                Features
              </a>
              <a href="#how-it-works" className="text-muted-foreground hover:text-foreground transition-colors">
                How it Works
              </a>
              <a href="#pricing" className="text-muted-foreground hover:text-foreground transition-colors">
                Pricing
              </a>
              <Button variant="outline" onClick={handleGetStarted}>
                Sign In
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section ref={heroRef} className="relative min-h-screen pt-16 overflow-hidden">
        <AnimatedBackground />
        <Ballpit />
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20">
          <div className="text-center space-y-8">
            <div className="space-y-4">
              <SplitText 
                text="Connect Nano-Influencers with Premium Brands"
                className="text-5xl md:text-7xl font-bold leading-tight"
                delay={100}
              />
              
              <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto">
                The only platform designed specifically for creators with 5K-50K followers to discover 
                authentic brand partnerships and manage campaigns seamlessly.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-lg px-8 py-6"
                onClick={handleGetStarted}
              >
                <Zap className="mr-2 h-5 w-5" />
                Get Started as Creator
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="text-lg px-8 py-6 backdrop-blur-sm bg-background/20"
                onClick={handleBrandSignup}
              >
                Join as Brand
              </Button>
            </div>
          </div>
          
          {/* Feature Preview Cards */}
          <div className="grid md:grid-cols-3 gap-8 mt-20 animate-on-scroll">
            <Card className="backdrop-blur-sm bg-card/50 border-border/50 hover:bg-card/70 transition-all duration-300 hover:scale-105">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-gradient-to-r from-primary to-secondary rounded-xl flex items-center justify-center mb-4">
                  <Search className="h-6 w-6 text-primary-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Smart Matching</h3>
                <p className="text-muted-foreground">
                  AI-powered algorithm matches creators with brands based on niche, engagement, and audience demographics.
                </p>
              </CardContent>
            </Card>
            
            <Card className="backdrop-blur-sm bg-card/50 border-border/50 hover:bg-card/70 transition-all duration-300 hover:scale-105">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-primary rounded-xl flex items-center justify-center mb-4">
                  <Workflow className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Campaign Workflow</h3>
                <p className="text-muted-foreground">
                  Streamlined process from brief to payment with built-in revision cycles and approval workflows.
                </p>
              </CardContent>
            </Card>
            
            <Card className="backdrop-blur-sm bg-card/50 border-border/50 hover:bg-card/70 transition-all duration-300 hover:scale-105">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-red-500 rounded-xl flex items-center justify-center mb-4">
                  <BarChart3 className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Real-time Analytics</h3>
                <p className="text-muted-foreground">
                  Track reach, engagement, and ROI with comprehensive analytics dashboard and performance insights.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-on-scroll">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Everything You Need to Succeed
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              From discovery to payment, we've built the complete ecosystem for nano-influencer success
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: TrendingUp,
                title: "Portfolio Showcase",
                description: "Beautiful portfolio galleries to showcase your best content and attract premium brands"
              },
              {
                icon: Shield,
                title: "Secure Payments",
                description: "Automated payment processing with escrow protection and transparent commission structure"
              },
              {
                icon: Star,
                title: "Rating System",
                description: "Build your reputation with our comprehensive rating and review system"
              },
              {
                icon: Users,
                title: "Collaboration Tools",
                description: "Real-time messaging, file sharing, and project management in one workspace"
              },
              {
                icon: BarChart3,
                title: "Performance Analytics",
                description: "Deep insights into your content performance and audience engagement"
              },
              {
                icon: Zap,
                title: "Instant Notifications",
                description: "Stay updated with real-time notifications for campaigns, messages, and payments"
              }
            ].map((feature, index) => (
              <Card key={index} className="animate-on-scroll hover:scale-105 transition-transform duration-300">
                <CardContent className="p-6">
                  <feature.icon className="h-12 w-12 text-primary mb-4" />
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-on-scroll">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              How It Works
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Simple, streamlined process designed for nano-influencers
            </p>
          </div>
          
          <div className="grid md:grid-cols-4 gap-8">
            {[
              {
                step: "1",
                title: "Create Profile",
                description: "Link your social accounts and showcase your content portfolio"
              },
              {
                step: "2",
                title: "Discover Campaigns",
                description: "Browse AI-matched campaigns tailored to your niche and audience"
              },
              {
                step: "3",
                title: "Collaborate",
                description: "Work directly with brands through our built-in collaboration tools"
              },
              {
                step: "4",
                title: "Get Paid",
                description: "Receive automatic payments upon campaign completion and approval"
              }
            ].map((step, index) => (
              <div key={index} className="text-center animate-on-scroll">
                <div className="w-16 h-16 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center text-2xl font-bold text-primary-foreground mx-auto mb-4">
                  {step.step}
                </div>
                <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                <p className="text-muted-foreground">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary to-secondary">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl md:text-5xl font-bold text-primary-foreground mb-6">
            Ready to Monetize Your Influence?
          </h2>
          <p className="text-xl text-primary-foreground/90 mb-8">
            Join thousands of nano-influencers already earning with premium brands
          </p>
          <Button 
            size="lg" 
            variant="secondary"
            className="text-lg px-8 py-6"
            onClick={handleGetStarted}
          >
            Start Your Journey Today
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-background/50 backdrop-blur-sm border-t border-border py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-primary to-secondary rounded-xl flex items-center justify-center">
                  <Users className="h-6 w-6 text-primary-foreground" />
                </div>
                <span className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  NanoInflu
                </span>
              </div>
              <p className="text-muted-foreground">
                Connecting nano-influencers with premium brands for authentic partnerships and sustainable growth.
              </p>
              <div className="flex space-x-4">
                <Twitter className="h-5 w-5 text-muted-foreground hover:text-primary cursor-pointer transition-colors" />
                <Instagram className="h-5 w-5 text-muted-foreground hover:text-primary cursor-pointer transition-colors" />
                <Linkedin className="h-5 w-5 text-muted-foreground hover:text-primary cursor-pointer transition-colors" />
                <Youtube className="h-5 w-5 text-muted-foreground hover:text-primary cursor-pointer transition-colors" />
              </div>
            </div>
            
            {[
              {
                title: "Platform",
                links: ["Creator Dashboard", "Brand Portal", "Campaign Discovery", "Analytics", "Payment Center"]
              },
              {
                title: "Resources", 
                links: ["Creator Guide", "Brand Handbook", "Best Practices", "API Documentation", "Help Center"]
              },
              {
                title: "Company",
                links: ["About Us", "Careers", "Press Kit", "Privacy Policy", "Terms of Service"]
              }
            ].map((section, index) => (
              <div key={index}>
                <h4 className="font-semibold mb-4">{section.title}</h4>
                <div className="space-y-3">
                  {section.links.map((link, linkIndex) => (
                    <a key={linkIndex} href="#" className="block text-muted-foreground hover:text-foreground transition-colors">
                      {link}
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </div>
          
          <div className="border-t border-border mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-muted-foreground text-sm">
              © 2024 NanoInflu. All rights reserved.
            </p>
            <div className="flex items-center space-x-6 mt-4 md:mt-0">
              <span className="text-muted-foreground text-sm">Powered by ReactBits</span>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs text-green-500">All systems operational</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

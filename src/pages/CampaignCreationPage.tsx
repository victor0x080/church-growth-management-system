import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  Target, 
  LogOut, 
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  DollarSign,
  FileText,
  Users,
  Calendar,
  TrendingUp,
  Save
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const CampaignCreationPage = () => {
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Step 1: Project Description
    projectName: "",
    tagline: "",
    category: "",
    team: "",
    testimonial: "",
    
    // Step 2: Financials
    fundingGoal: "",
    budgetItems: "",
    impactMetrics: "",
    
    // Step 3: Pro Forma
    year1: "",
    year2: "",
    year3: "",
    
    // Additional steps would go here
  });
  
  const totalSteps = 8;
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkAuth();
  }, [user]);

  const checkAuth = async () => {
    if (!user) return;
    
    const { data: profile } = await supabase
      .from("profiles")
      .select("*, churches(name, denomination)")
      .eq("id", user.id)
      .single();

    setUserProfile(profile);
    setLoading(false);
  };

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = () => {
    toast({
      title: "Campaign Created!",
      description: "Your fundraising campaign has been created and will be reviewed.",
    });
    navigate("/clergy");
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg">Loading...</p>
      </div>
    );
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="projectName">Campaign Name</Label>
              <Input
                id="projectName"
                value={formData.projectName}
                onChange={(e) => setFormData({ ...formData, projectName: e.target.value })}
                placeholder="e.g., Hope After School Program"
              />
            </div>
            <div>
              <Label htmlFor="tagline">Tagline</Label>
              <Input
                id="tagline"
                value={formData.tagline}
                onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                placeholder="e.g., Nurturing minds and hearts"
              />
            </div>
            <div>
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                placeholder="e.g., Youth & Education"
              />
            </div>
            <div>
              <Label htmlFor="team">Team Members</Label>
              <Textarea
                id="team"
                value={formData.team}
                onChange={(e) => setFormData({ ...formData, team: e.target.value })}
                placeholder="List your team members and their roles..."
                rows={4}
              />
            </div>
            <div>
              <Label htmlFor="testimonial">Testimonial</Label>
              <Textarea
                id="testimonial"
                value={formData.testimonial}
                onChange={(e) => setFormData({ ...formData, testimonial: e.target.value })}
                placeholder="Share a meaningful testimonial..."
                rows={4}
              />
            </div>
          </div>
        );
      
      case 2:
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="fundingGoal">Funding Goal</Label>
              <Input
                id="fundingGoal"
                type="number"
                value={formData.fundingGoal}
                onChange={(e) => setFormData({ ...formData, fundingGoal: e.target.value })}
                placeholder="e.g., 35000"
              />
              <p className="text-sm text-muted-foreground mt-1">Enter amount in dollars (without $ sign)</p>
            </div>
            <div>
              <Label htmlFor="budgetItems">Budget Breakdown</Label>
              <Textarea
                id="budgetItems"
                value={formData.budgetItems}
                onChange={(e) => setFormData({ ...formData, budgetItems: e.target.value })}
                placeholder="Snacks & supplies: $8,000&#10;Educational materials: $7,000&#10;Insurance & permits: $5,000&#10;..."
                rows={6}
              />
            </div>
            <div>
              <Label htmlFor="impactMetrics">Impact Metrics</Label>
              <Textarea
                id="impactMetrics"
                value={formData.impactMetrics}
                onChange={(e) => setFormData({ ...formData, impactMetrics: e.target.value })}
                placeholder="e.g., $875 provides care for 1 child/year"
                rows={3}
              />
            </div>
          </div>
        );
      
      case 3:
        return (
          <div className="space-y-4">
            <p className="text-muted-foreground">
              AI will generate a 3-year financial projection based on your inputs.
              Click "Next" to continue.
            </p>
            <Card className="p-4 bg-muted/30">
              <h4 className="font-medium mb-2">Projected Financials (AI Generated)</h4>
              <div className="space-y-2 text-sm">
                <div>Year 1: Startup costs and initial investment</div>
                <div>Year 2: Break even with sustainable model</div>
                <div>Year 3: Self-sustaining with positive growth</div>
              </div>
            </Card>
          </div>
        );

      default:
        return (
          <div className="space-y-4">
            <p className="text-muted-foreground">
              Steps 4-8 will guide you through marketing plan, donation tiers, timeline, 
              reporting commitments, and media upload. This is a simplified version.
            </p>
            <Card className="p-4 bg-muted/30">
              <h4 className="font-medium mb-2">Next Steps</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                <li>Marketing plan development</li>
                <li>Donation tier creation ($35, $175, $875, etc.)</li>
                <li>Timeline & milestones</li>
                <li>Reporting commitments</li>
                <li>Media uploads (photos, videos)</li>
              </ul>
            </Card>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigate("/clergy")}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
            <div>
              <h1 className="text-2xl font-display font-bold">Campaign Creation</h1>
              <p className="text-sm text-muted-foreground">
                Embark5: 8-Step Fundraising Wizard
              </p>
            </div>
          </div>
          <Button variant="ghost" onClick={handleSignOut}>
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Progress Bar */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold">Step {currentStep} of {totalSteps}</h3>
                <p className="text-sm text-muted-foreground">
                  {getStepTitle(currentStep)}
                </p>
              </div>
              <Badge variant="secondary">{Math.round((currentStep / totalSteps) * 100)}% Complete</Badge>
            </div>
            <Progress value={(currentStep / totalSteps) * 100} className="h-2" />
          </CardContent>
        </Card>

        {/* Step Content */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {getStepIcon(currentStep)}
              {getStepTitle(currentStep)}
            </CardTitle>
            <CardDescription>
              {getStepDescription(currentStep)}
            </CardDescription>
          </CardHeader>
          <CardContent className="min-h-[400px]">
            {renderStepContent()}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 1}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>
          
          {currentStep < totalSteps ? (
            <Button onClick={nextStep}>
              Next
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button onClick={handleSubmit}>
              <Save className="w-4 h-4 mr-2" />
              Create Campaign
            </Button>
          )}
        </div>
      </main>
    </div>
  );
};

// Helper functions
function getStepTitle(step: number): string {
  const titles = {
    1: "Project Description",
    2: "Financials",
    3: "Pro Forma Financials",
    4: "Marketing Plan",
    5: "Donation Tiers",
    6: "Timeline & Milestones",
    7: "Reporting Commitments",
    8: "Media & Contact Info"
  };
  return titles[step as keyof typeof titles] || "Unknown Step";
}

function getStepDescription(step: number): string {
  const descriptions = {
    1: "Tell us about your ministry campaign",
    2: "Define your funding goals and budget breakdown",
    3: "Generate 3-year financial projections",
    4: "Plan how you'll promote this campaign",
    5: "Set donation tiers and rewards",
    6: "Create timeline and key milestones",
    7: "Commit to regular updates for donors",
    8: "Add photos, videos, and contact information"
  };
  return descriptions[step as keyof typeof descriptions] || "";
}

function getStepIcon(step: number): JSX.Element {
  const icons = {
    1: <FileText className="w-5 h-5 text-primary" />,
    2: <DollarSign className="w-5 h-5 text-primary" />,
    3: <TrendingUp className="w-5 h-5 text-primary" />,
    4: <Users className="w-5 h-5 text-primary" />,
    5: <DollarSign className="w-5 h-5 text-primary" />,
    6: <Calendar className="w-5 h-5 text-primary" />,
    7: <FileText className="w-5 h-5 text-primary" />,
    8: <FileText className="w-5 h-5 text-primary" />,
  };
  return icons[step as keyof typeof icons] || <Target className="w-5 h-5 text-primary" />;
}

export default CampaignCreationPage;


import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { 
  Heart, 
  LogOut, 
  ArrowLeft,
  PlusCircle,
  Users,
  Clock,
  ThumbsUp
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const PrayerRequestsPage = () => {
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [prayerRequests, setPrayerRequests] = useState<any[]>([]);
  const [prayerText, setPrayerText] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
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
      .select("*, churches(name)")
      .eq("id", user.id)
      .single();

    setUserProfile(profile);
    loadPrayerRequests();
    setLoading(false);
  };

  const loadPrayerRequests = async () => {
    // Mock data for prayer requests (Spark Fellowship concept: community prayer support)
    setPrayerRequests([
      { 
        id: 1, 
        request: "Please pray for healing for Sarah's mom who is having surgery this week", 
        author: "Sarah Johnson",
        status: "Active", 
        praying: 12, 
        comments: 5,
        createdAt: "Jan 22, 2025",
        recentPrayer: "Rachel joined in prayer 2 hours ago"
      },
      { 
        id: 2, 
        request: "Pray for job opportunities for John as he searches for new employment", 
        author: "John Smith",
        status: "Active", 
        praying: 8, 
        comments: 3,
        createdAt: "Jan 21, 2025",
        recentPrayer: "Pastor James prayed 5 hours ago"
      },
      { 
        id: 3, 
        request: "Prayer request: need strength during this difficult family time", 
        author: "Anonymous",
        status: "Active", 
        praying: 15, 
        comments: 7,
        createdAt: "Jan 20, 2025",
        recentPrayer: "3 people joined in prayer today"
      },
      { 
        id: 4, 
        request: "Please pray for safe travels for mission trip team leaving next week", 
        author: "Mission Team",
        status: "Active", 
        praying: 20, 
        comments: 10,
        createdAt: "Jan 18, 2025",
        recentPrayer: "Church family is praying"
      },
    ]);
  };

  const handleSubmitPrayerRequest = () => {
    if (!prayerText.trim()) {
      toast({
        variant: "destructive",
        title: "Empty Request",
        description: "Please enter your prayer request.",
      });
      return;
    }

    // Add new request
    const newRequest = {
      id: prayerRequests.length + 1,
      request: prayerText,
      author: userProfile?.full_name || "You",
      status: "Active",
      praying: 1,
      comments: 0,
      createdAt: "Just now",
      recentPrayer: "Your request was submitted"
    };

    setPrayerRequests([newRequest, ...prayerRequests]);
    setPrayerText("");
    setIsDialogOpen(false);

    toast({
      title: "Prayer Request Submitted",
      description: "Your prayer request has been shared with the community.",
    });
  };

  const handleSendPrayer = (requestId: number) => {
    // Find the request
    const request = prayerRequests.find(req => req.id === requestId);
    if (!request) return;

    // Update prayer count
    setPrayerRequests(prayerRequests.map(req => 
      req.id === requestId 
        ? { ...req, praying: req.praying + 1, recentPrayer: `Prayed for by ${userProfile?.full_name || 'You'} just now` }
        : req
    ));

    toast({
      title: "Prayer Sent",
      description: `Your prayers have been lifted up for ${request.author}`,
    });
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigate("/parish")}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
            <div>
              <h1 className="text-2xl font-display font-bold">Prayer Requests</h1>
              <p className="text-sm text-muted-foreground">
                Join together in prayer and support
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <PlusCircle className="w-4 h-4 mr-2" />
                  Submit Request
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Submit Prayer Request</DialogTitle>
                  <DialogDescription>
                    Share your prayer need with the community. We'll pray together.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Your Prayer Request</label>
                    <Textarea
                      placeholder="Share your prayer need here..."
                      value={prayerText}
                      onChange={(e) => setPrayerText(e.target.value)}
                      className="min-h-[120px]"
                    />
                  </div>
                  <Button onClick={handleSubmitPrayerRequest} className="w-full">
                    Submit Prayer Request
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
            <Button variant="ghost" onClick={handleSignOut}>
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-4 md:grid-cols-2">
          {prayerRequests.map((request) => (
            <Card key={request.id} className="hover:shadow-elegant-hover transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <Heart className="w-5 h-5 text-primary" />
                    <CardTitle className="text-lg">{request.author}</CardTitle>
                  </div>
                  <Badge variant="default">{request.status}</Badge>
                </div>
                <CardDescription className="mt-2">
                  {request.request}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Users className="w-4 h-4" />
                    <span>{request.praying} prayers sent</span>
                  </div>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    <span>{request.createdAt}</span>
                  </div>
                </div>
                <div className="text-xs text-muted-foreground">
                  {request.recentPrayer}
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => handleSendPrayer(request.id)}
                  >
                    <Heart className="w-4 h-4 mr-2" />
                    Send Prayer
                  </Button>
                  <Button variant="ghost" className="flex-1">
                    View Comments ({request.comments})
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
};

export default PrayerRequestsPage;


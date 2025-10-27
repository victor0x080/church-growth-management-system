import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { 
  BookOpen, 
  LogOut, 
  ArrowLeft,
  Search,
  FileText,
  Video,
  Mic,
  Download
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const ResourcesPage = () => {
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [resources, setResources] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
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
    loadResources();
    setLoading(false);
  };

  const loadResources = async () => {
    setResources([
      { id: 1, title: "Sunday Sermon: Love Your Neighbor", type: "Audio", category: "Sermons", date: "Jan 28, 2025", duration: "45 min", downloads: 125 },
      { id: 2, title: "Bible Study Guide: Book of Romans", type: "Document", category: "Study Guides", date: "Jan 25, 2025", downloads: 89 },
      { id: 3, title: "Worship Service Recording", type: "Video", category: "Services", date: "Jan 22, 2025", duration: "60 min", downloads: 201 },
      { id: 4, title: "Prayer Journal Template", type: "Document", category: "Templates", date: "Jan 20, 2025", downloads: 156 },
      { id: 5, title: "Small Group Discussion: Faith in Action", type: "Document", category: "Study Guides", date: "Jan 15, 2025", downloads: 98 },
      { id: 6, title: "Christmas Service Highlights", type: "Video", category: "Services", date: "Dec 24, 2024", duration: "90 min", downloads: 342 },
    ]);
  };

  const filteredResources = resources.filter(resource =>
    resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    resource.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
              <h1 className="text-2xl font-display font-bold">Resources Library</h1>
              <p className="text-sm text-muted-foreground">
                Sermons, study guides, and spiritual materials
              </p>
            </div>
          </div>
          <Button variant="ghost" onClick={handleSignOut}>
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Search */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search resources..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Resources Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredResources.map((resource) => (
            <Card key={resource.id} className="hover:shadow-elegant-hover transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between mb-2">
                  {resource.type === "Audio" && <Mic className="w-6 h-6 text-primary" />}
                  {resource.type === "Video" && <Video className="w-6 h-6 text-primary" />}
                  {resource.type === "Document" && <FileText className="w-6 h-6 text-primary" />}
                  <Badge variant="secondary">{resource.type}</Badge>
                </div>
                <CardTitle className="text-lg">{resource.title}</CardTitle>
                <CardDescription>{resource.category}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="text-sm text-muted-foreground">
                  {resource.duration || "Downloadable"}
                </div>
                <div className="text-xs text-muted-foreground">
                  {resource.downloads} downloads
                </div>
                <Button className="w-full" variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
};

export default ResourcesPage;


import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { 
  FileText, 
  LogOut, 
  ArrowLeft,
  Upload,
  Download,
  Search,
  Filter,
  Folder,
  File,
  FileText as FileIcon,
  Image,
  FileDown
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const DocumentsPage = () => {
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [documents, setDocuments] = useState<any[]>([]);
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
      .select("*, churches(name, denomination)")
      .eq("id", user.id)
      .single();

    setUserProfile(profile);
    loadDocuments();
    setLoading(false);
  };

  const loadDocuments = async () => {
    setDocuments([
      { id: 1, name: "Church Constitution.pdf", type: "PDF", category: "Administrative", size: "245 KB", uploadDate: "Jan 15, 2025", uploader: "Pastor James", folder: "Administrative" },
      { id: 2, name: "2024 Annual Report.pdf", type: "PDF", category: "Reports", size: "1.2 MB", uploadDate: "Jan 10, 2025", uploader: "Sarah Johnson", folder: "Reports" },
      { id: 3, name: "Mission Statement.docx", type: "DOCX", category: "Administrative", size: "89 KB", uploadDate: "Jan 5, 2025", uploader: "Pastor James", folder: "Administrative" },
      { id: 4, name: "Youth Ministry Budget.xlsx", type: "XLSX", category: "Financial", size: "156 KB", uploadDate: "Dec 28, 2024", uploader: "Mike Davis", folder: "Financial" },
      { id: 5, name: "Volunteer Handbook.pdf", type: "PDF", category: "Administrative", size: "3.4 MB", uploadDate: "Dec 20, 2024", uploader: "Emily Chen", folder: "Administrative" },
      { id: 6, name: "Church Calendar.jpg", type: "IMAGE", category: "Media", size: "2.1 MB", uploadDate: "Dec 15, 2024", uploader: "Pastor James", folder: "Media" },
    ]);
  };

  const filteredDocuments = documents.filter(doc =>
    doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleUpload = () => {
    toast({
      title: "Upload Document",
      description: "Document upload feature will be available soon.",
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

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "PDF":
        return <FileText className="w-5 h-5 text-red-600" />;
      case "DOCX":
        return <FileIcon className="w-5 h-5 text-blue-600" />;
      case "XLSX":
        return <FileDown className="w-5 h-5 text-green-600" />;
      case "IMAGE":
        return <Image className="w-5 h-5 text-purple-600" />;
      default:
        return <File className="w-5 h-5 text-gray-600" />;
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
              <h1 className="text-2xl font-display font-bold">Church Documents</h1>
              <p className="text-sm text-muted-foreground">
                {userProfile?.churches?.name || "Your Church"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={handleUpload}>
              <Upload className="w-4 h-4 mr-2" />
              Upload Document
            </Button>
            <Button variant="ghost" onClick={handleSignOut}>
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Search and Filter */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search documents..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button variant="outline">
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Documents List */}
        <Card>
          <CardHeader>
            <CardTitle>All Documents</CardTitle>
            <CardDescription>
              Manage your church documents and files
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {filteredDocuments.map((doc) => (
                <Card key={doc.id} className="hover:shadow-elegant-hover transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        {getTypeIcon(doc.type)}
                        <div>
                          <div className="font-semibold">{doc.name}</div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span>{doc.size}</span>
                            <span>•</span>
                            <Badge variant="secondary" className="text-xs">{doc.category}</Badge>
                            <span>•</span>
                            <span>{doc.uploadDate}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm">
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default DocumentsPage;


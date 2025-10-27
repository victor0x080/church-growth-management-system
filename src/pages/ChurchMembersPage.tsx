import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { 
  Users, 
  LogOut, 
  ArrowLeft,
  Search,
  Filter,
  Mail,
  Phone,
  Calendar,
  TrendingUp,
  UserPlus
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const ChurchMembersPage = () => {
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
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
    loadMembers();
    setLoading(false);
  };

  const loadMembers = async () => {
    // Mock member data with engagement tracking (Spark Fellowship concept)
    setMembers([
      { id: 1, name: "John Smith", email: "john@email.com", phone: "555-0101", status: "Active", role: "Member", lastActive: "2 days ago", attendance: 85, engagementPoints: 450, joinedDate: "Jan 2024", interests: ["Music", "Small Groups"] },
      { id: 2, name: "Sarah Johnson", email: "sarah@email.com", phone: "555-0102", status: "Active", role: "Leader", lastActive: "Today", attendance: 95, engagementPoints: 720, joinedDate: "Mar 2023", interests: ["Youth Ministry", "Teaching"] },
      { id: 3, name: "Mike Davis", email: "mike@email.com", phone: "555-0103", status: "Active", role: "Volunteer", lastActive: "1 week ago", attendance: 70, engagementPoints: 320, joinedDate: "Jun 2024", interests: ["Service", "Outreach"] },
      { id: 4, name: "Emily Chen", email: "emily@email.com", phone: "555-0104", status: "Inactive", role: "Member", lastActive: "3 weeks ago", attendance: 45, engagementPoints: 180, joinedDate: "Aug 2024", interests: ["Prayer", "Fellowship"] },
      { id: 5, name: "David Williams", email: "david@email.com", phone: "555-0105", status: "Active", role: "Newcomer", lastActive: "Yesterday", attendance: 90, engagementPoints: 250, joinedDate: "Dec 2024", interests: ["Bible Study"] },
    ]);
  };

  const filteredMembers = members.filter(member => {
    const matchesSearch = searchTerm === "" || 
      member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || member.status.toLowerCase() === filterStatus;
    return matchesSearch && matchesStatus;
  });

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
            <Button variant="ghost" size="sm" onClick={() => navigate("/clergy")}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
            <div>
              <h1 className="text-2xl font-display font-bold">Church Members</h1>
              <p className="text-sm text-muted-foreground">
                {userProfile?.churches?.name || "Your Church"}
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
        {/* Stats Overview */}
        <div className="grid gap-4 md:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Total Members</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{members.length}</div>
              <p className="text-xs text-muted-foreground mt-1">Registered members</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Active</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{members.filter(m => m.status === "Active").length}</div>
              <p className="text-xs text-muted-foreground mt-1">Recently active</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">New This Month</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{members.filter(m => m.joinedDate.includes("Dec")).length}</div>
              <p className="text-xs text-muted-foreground mt-1">New members</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Avg Attendance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {Math.round(members.reduce((acc, m) => acc + m.attendance, 0) / members.length)}%
              </div>
              <p className="text-xs text-muted-foreground mt-1">Average rate</p>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search members by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button variant="outline">
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>
              <Button>
                <UserPlus className="w-4 h-4 mr-2" />
                Add Member
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Members List */}
        <Card>
          <CardHeader>
            <CardTitle>Member Directory</CardTitle>
            <CardDescription>
              View and manage your church members
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredMembers.map((member) => (
                <Card key={member.id} className="hover:shadow-elegant-hover transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <Avatar className="w-16 h-16">
                          <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-lg">{member.name}</h3>
                            <Badge variant={member.status === "Active" ? "default" : "secondary"}>
                              {member.status}
                            </Badge>
                            <Badge variant="outline">{member.role}</Badge>
                          </div>
                          <div className="space-y-1 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Mail className="w-4 h-4" /> {member.email}
                            </div>
                            <div className="flex items-center gap-1">
                              <Phone className="w-4 h-4" /> {member.phone}
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" /> Joined {member.joinedDate}
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {member.interests.map((interest: string, i: number) => (
                              <Badge key={i} variant="secondary" className="text-xs">{interest}</Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <div className="text-right">
                          <div className="text-sm font-medium">Attendance: {member.attendance}%</div>
                          <div className="text-xs text-muted-foreground">Points: {member.engagementPoints}</div>
                          <div className="text-xs text-muted-foreground mt-1">Last active: {member.lastActive}</div>
                        </div>
                        <Button variant="outline" size="sm">View Profile</Button>
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

export default ChurchMembersPage;


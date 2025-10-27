import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { 
  Users, 
  LogOut, 
  ArrowLeft,
  UserPlus,
  Clock,
  MapPin
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const GroupsPage = () => {
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [myGroups, setMyGroups] = useState<any[]>([]);
  const [availableGroups, setAvailableGroups] = useState<any[]>([]);
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
    loadGroups();
    setLoading(false);
  };

  const loadGroups = async () => {
    setMyGroups([
      { id: 1, name: "Small Group Alpha", members: 12, meetingTime: "Wednesdays 7 PM", location: "Fellowship Hall", leader: "Pastor John", description: "Bible study and fellowship" },
      { id: 2, name: "Bible Study", members: 8, meetingTime: "Saturdays 10 AM", location: "Conference Room", leader: "Sarah Smith", description: "In-depth scripture exploration" },
    ]);

    setAvailableGroups([
      { id: 1, name: "Young Adults Group", members: 25, meetingTime: "Sundays 6 PM", description: "For ages 18-30", category: "Age-Based" },
      { id: 2, name: "Music Ministry", members: 15, meetingTime: "Thursdays 7 PM", description: "Worship team and choir", category: "Ministry" },
      { id: 3, name: "Men's Fellowship", members: 20, meetingTime: "First Saturday 8 AM", description: "Monthly men's breakfast", category: "Fellowship" },
      { id: 4, name: "Women's Circle", members: 30, meetingTime: "Tuesdays 10 AM", description: "Women's Bible study and prayer", category: "Fellowship" },
    ]);
  };

  const handleJoinGroup = (groupId: number) => {
    toast({
      title: "Group Joined",
      description: "You've successfully joined the group!",
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
              <h1 className="text-2xl font-display font-bold">Small Groups</h1>
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
        {/* My Groups */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl">My Groups</CardTitle>
            <CardDescription>Groups you're currently part of</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              {myGroups.map((group) => (
                <Card key={group.id} className="hover:shadow-elegant-hover transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle>{group.name}</CardTitle>
                        <CardDescription className="mt-1">{group.description}</CardDescription>
                      </div>
                      <Badge>{group.members} members</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="w-4 h-4" /> {group.meetingTime}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="w-4 h-4" /> {group.location}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Leader: {group.leader}
                    </div>
                    <Button className="w-full mt-2">View Group</Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Available Groups */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Join a Group</CardTitle>
            <CardDescription>Find groups that match your interests</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              {availableGroups.map((group) => (
                <Card key={group.id} className="hover:shadow-elegant-hover transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle>{group.name}</CardTitle>
                        <CardDescription className="mt-1">{group.description}</CardDescription>
                      </div>
                      <Badge variant="secondary">{group.category}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Users className="w-4 h-4" /> {group.members} members
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="w-4 h-4" /> {group.meetingTime}
                    </div>
                    <Button className="w-full mt-2" onClick={() => handleJoinGroup(group.id)}>
                      <UserPlus className="w-4 h-4 mr-2" />
                      Join Group
                    </Button>
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

export default GroupsPage;


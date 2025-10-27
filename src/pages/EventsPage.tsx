import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  Calendar, 
  LogOut, 
  Clock,
  MapPin,
  Users,
  ArrowLeft
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const EventsPage = () => {
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [upcomingEvents, setUpcomingEvents] = useState<any[]>([]);
  const [pastEvents, setPastEvents] = useState<any[]>([]);
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
    loadEvents();
    setLoading(false);
  };

  const loadEvents = async () => {
    // Mock data for events
    setUpcomingEvents([
      { id: 1, title: "Sunday Service", date: "Jan 28, 2025", time: "10:00 AM", location: "Main Sanctuary", attendees: 150, description: "Join us for worship and fellowship", type: "Service" },
      { id: 2, title: "Prayer Meeting", date: "Jan 30, 2025", time: "7:00 PM", location: "Chapel", attendees: 25, description: "Weekly prayer gathering", type: "Prayer" },
      { id: 3, title: "Youth Group", date: "Feb 1, 2025", time: "6:00 PM", location: "Youth Hall", attendees: 45, description: "Teen fellowship and activities", type: "Youth" },
      { id: 4, title: "Bible Study", date: "Feb 3, 2025", time: "7:00 PM", location: "Conference Room", attendees: 30, description: "Deep dive into God's Word", type: "Study" },
      { id: 5, title: "Spring Outreach Event", date: "Feb 15, 2025", time: "2:00 PM", location: "Community Center", attendees: 200, description: "Community service and outreach", type: "Outreach" },
    ]);

    setPastEvents([
      { id: 1, title: "Christmas Eve Service", date: "Dec 24, 2024", attendees: 300 },
      { id: 2, title: "Thanksgiving Dinner", date: "Nov 28, 2024", attendees: 150 },
    ]);
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
              <h1 className="text-2xl font-display font-bold">Church Events</h1>
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
        {/* Upcoming Events */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl">Upcoming Events</CardTitle>
                <CardDescription>Join us for worship, fellowship, and community</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              {upcomingEvents.map((event) => (
                <Card key={event.id} className="hover:shadow-elegant-hover transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-primary" />
                        <CardTitle>{event.title}</CardTitle>
                      </div>
                      <Badge variant="default">{event.type}</Badge>
                    </div>
                    <CardDescription>{event.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="w-4 h-4" /> {event.date} at {event.time}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="w-4 h-4" /> {event.location}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Users className="w-4 h-4" /> {event.attendees} attending
                    </div>
                    <Button className="w-full mt-2">Register for Event</Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Past Events */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Past Events</CardTitle>
            <CardDescription>Events we've held recently</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pastEvents.map((event) => (
                <div key={event.id} className="p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="font-medium">{event.title}</div>
                    <Badge variant="outline">{event.date}</Badge>
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    {event.attendees} attended
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default EventsPage;


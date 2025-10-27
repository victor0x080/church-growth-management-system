import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Church, Users, Calendar, Heart } from "lucide-react";

const WelcomePage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="text-center max-w-4xl mx-auto space-y-6">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-4">
            <Church className="w-10 h-10 text-primary" />
          </div>
          
          <h1 className="text-4xl md:text-6xl font-display font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            Welcome to Church Growth Management
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            A modern platform designed to strengthen your church community, streamline operations, and foster spiritual growth.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button 
              size="lg" 
              onClick={() => navigate("/auth?mode=signup")}
              className="text-lg px-8"
            >
              Get Started
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              onClick={() => navigate("/auth")}
              className="text-lg px-8"
            >
              Sign In
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
            Everything Your Church Needs
          </h2>
          <p className="text-muted-foreground text-lg">
            Powerful tools for administrators, clergy, and parish members
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
          <Card className="hover:shadow-elegant-hover transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <CardTitle>Member Management</CardTitle>
              <CardDescription>
                Efficiently manage your congregation with intuitive member profiles and role-based access.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-elegant-hover transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Calendar className="w-6 h-6 text-primary" />
              </div>
              <CardTitle>Event Planning</CardTitle>
              <CardDescription>
                Schedule and coordinate church events, services, and activities with ease.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-elegant-hover transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Heart className="w-6 h-6 text-primary" />
              </div>
              <CardTitle>Community Engagement</CardTitle>
              <CardDescription>
                Foster deeper connections through prayer requests, giving, and communication tools.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16">
        <Card className="max-w-4xl mx-auto bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-primary/20">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <h2 className="text-3xl font-display font-bold">
                Join Our Growing Community
              </h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Whether you're an administrator, clergy member, or parishioner, our platform provides the tools you need to thrive.
              </p>
              <div className="pt-4">
                <Button 
                  size="lg"
                  onClick={() => navigate("/auth?mode=signup")}
                  className="text-lg px-8"
                >
                  Create Your Account
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-muted-foreground">
            <p>© 2025 Church Growth Management System. Built with faith and purpose.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default WelcomePage;

import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { USER_ROLES, DASHBOARD_ROUTES } from "@/lib/constants";
import { useAuth } from "@/contexts/AuthContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const signUpSchema = z.object({
  fullName: z.string().trim().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().trim().email("Invalid email address").max(255),
  password: z.string().min(6, "Password must be at least 6 characters").max(100),
  userType: z.enum(["parish", "clergy"]),
  churchId: z.string().uuid("Please select a church").optional(),
  // Church creation fields (for clergy)
  churchName: z.string().trim().min(2).max(200).optional(),
  churchAddress: z.string().trim().max(300).optional(),
  churchCity: z.string().trim().max(100).optional(),
  churchState: z.string().trim().max(50).optional(),
  churchDenomination: z.string().trim().max(100).optional(),
  churchUrl: z.string().url("Invalid URL").optional().or(z.literal("")),
});

const signInSchema = z.object({
  email: z.string().trim().email("Invalid email address").max(255),
  password: z.string().min(1, "Password is required").max(100),
});

interface Church {
  id: string;
  name: string;
}

const Auth = () => {
  const [searchParams] = useSearchParams();
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [churches, setChurches] = useState<Church[]>([]);
  const [userType, setUserType] = useState<"parish" | "clergy">("parish");
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    churchId: "",
    churchName: "",
    churchAddress: "",
    churchCity: "",
    churchState: "",
    churchDenomination: "",
    churchUrl: "",
  });
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check URL parameter for mode
    const mode = searchParams.get('mode');
    if (mode === 'signup') {
      setIsSignUp(true);
    }
    
    // Fetch churches for signup
    fetchChurches();
  }, [searchParams]);

  // Redirect if user is already logged in
  useEffect(() => {
    if (user) {
      redirectBasedOnRole(user.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const fetchChurches = async () => {
    const { data, error } = await supabase
      .from("churches")
      .select("id, name")
      .order("name");
    
    if (error) {
      console.error("Error fetching churches:", error);
      return;
    }
    
    setChurches(data || []);
  };

  const redirectBasedOnRole = async (userId: string) => {
    // Check user role first
    const { data: roles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId);

    // Check onboarding status
    const { data: profile } = await supabase
      .from("profiles")
      .select("onboarding_completed")
      .eq("id", userId)
      .single();

    if (roles && roles.length > 0) {
      const userRole = (roles[0] as any).role;
      
      // Admin skip onboarding, go directly to dashboard
      if (userRole === USER_ROLES.ADMIN) {
        navigate(DASHBOARD_ROUTES.ADMIN);
        return;
      }
      
      // For clergy and parish, check onboarding status
      if (userRole === USER_ROLES.CLERGY || userRole === USER_ROLES.PARISH) {
        // If onboarding not completed, go to onboarding
        if (profile && !(profile as any).onboarding_completed) {
          navigate("/onboarding");
          return;
        }
        
        // Otherwise go to respective dashboard
        if (userRole === USER_ROLES.CLERGY) {
          navigate(DASHBOARD_ROUTES.CLERGY);
          return;
        } else {
          navigate(DASHBOARD_ROUTES.PARISH);
          return;
        }
      }
    }

    // Fallback to onboarding if no role or missing profile
    if (profile && !(profile as any).onboarding_completed) {
      navigate("/onboarding");
      return;
    }

    // Otherwise go to parish dashboard
    navigate(DASHBOARD_ROUTES.PARISH);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Build the validation object based on user type
      const validationData = {
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password,
        userType: userType,
        ...(userType === "parish" 
          ? { churchId: formData.churchId } 
          : {
              churchName: formData.churchName,
              churchAddress: formData.churchAddress,
              churchCity: formData.churchCity,
              churchState: formData.churchState,
              churchDenomination: formData.churchDenomination,
              churchUrl: formData.churchUrl || "",
            })
      };

      const validated = signUpSchema.parse(validationData);
      let churchId = validated.churchId;

      // Create the user account first (trigger will handle church + role for clergy)
      const { data, error } = await supabase.auth.signUp({
        email: validated.email,
        password: validated.password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            full_name: validated.fullName,
            church_id: churchId,
            user_type: userType,
            church_name: userType === "clergy" ? formData.churchName : undefined,
            church_address: userType === "clergy" ? formData.churchAddress : undefined,
            church_city: userType === "clergy" ? formData.churchCity : undefined,
            church_state: userType === "clergy" ? formData.churchState : undefined,
            church_denomination: userType === "clergy" ? formData.churchDenomination : undefined,
            church_url: userType === "clergy" ? formData.churchUrl : undefined,
          },
        },
      });

      if (error) throw error;

      if (data.user) {
        // Wait for the trigger to create profile
        await new Promise(resolve => setTimeout(resolve, 500));

        // Update the profile with the additional data
        const updateData: any = {
          full_name: validated.fullName,
          church_id: churchId,
          email: validated.email,
        };
        await (supabase as any)
          .from("profiles")
          .update(updateData)
          .eq("id", data.user.id);

        // Role is assigned by trigger now

        toast({
          title: "Account created!",
          description: `Welcome! You've signed up as ${userType === "clergy" ? "clergy" : "a parish member"}.`,
        });
        await redirectBasedOnRole(data.user.id);
      }
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        toast({
          variant: "destructive",
          title: "Validation error",
          description: error.errors[0].message,
        });
      } else if (error.message?.includes("already registered")) {
        toast({
          variant: "destructive",
          title: "Account exists",
          description: "This email is already registered. Please sign in instead.",
        });
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: error.message || "Failed to create account",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const validated = signInSchema.parse({
        email: formData.email,
        password: formData.password,
      });

      const { data, error } = await supabase.auth.signInWithPassword({
        email: validated.email,
        password: validated.password,
      });

      if (error) throw error;

      if (data.user) {
        toast({
          title: "Welcome back!",
          description: "You've successfully signed in.",
        });
        await redirectBasedOnRole(data.user.id);
      }
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        toast({
          variant: "destructive",
          title: "Validation error",
          description: error.errors[0].message,
        });
      } else if (error.message?.includes("Invalid login credentials")) {
        toast({
          variant: "destructive",
          title: "Invalid credentials",
          description: "Please check your email and password.",
        });
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: error.message || "Failed to sign in",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/20 to-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-display text-center">
            {isSignUp ? "Join Our Community" : "Welcome Back"}
          </CardTitle>
          <CardDescription className="text-center">
            {isSignUp
              ? "Create an account to get started"
              : "Sign in to your account"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={isSignUp ? handleSignUp : handleSignIn} className="space-y-4">
            {isSignUp && (
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  placeholder="John Doe"
                  value={formData.fullName}
                  onChange={(e) =>
                    setFormData({ ...formData, fullName: e.target.value })
                  }
                  required
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                required
              />
            </div>

            {isSignUp && (
              <>
                {/* User Type Selection */}
                <div className="space-y-2">
                  <Label>I am signing up as:</Label>
                  <Tabs value={userType} onValueChange={(v) => setUserType(v as "parish" | "clergy")}>
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="parish">Parish Member</TabsTrigger>
                      <TabsTrigger value="clergy">Clergy</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>

                {/* Church Selection for Parish Members */}
                {userType === "parish" && (
                  <div className="space-y-2">
                    <Label htmlFor="church">Select Your Church</Label>
                    <Select
                      value={formData.churchId}
                      onValueChange={(value) =>
                        setFormData({ ...formData, churchId: value })
                      }
                      required
                    >
                      <SelectTrigger id="church">
                        <SelectValue placeholder="Choose a church" />
                      </SelectTrigger>
                      <SelectContent>
                        {churches.map((church) => (
                          <SelectItem key={church.id} value={church.id}>
                            {church.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Church Creation for Clergy */}
                {userType === "clergy" && (
                  <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
                    <div className="space-y-2">
                      <Label htmlFor="churchName">Church Name *</Label>
                      <Input
                        id="churchName"
                        placeholder="Grace Community Church"
                        value={formData.churchName}
                        onChange={(e) =>
                          setFormData({ ...formData, churchName: e.target.value })
                        }
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="churchAddress">Church Address</Label>
                      <Input
                        id="churchAddress"
                        placeholder="123 Main Street"
                        value={formData.churchAddress}
                        onChange={(e) =>
                          setFormData({ ...formData, churchAddress: e.target.value })
                        }
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="churchCity">City</Label>
                        <Input
                          id="churchCity"
                          placeholder="Evanston"
                          value={formData.churchCity}
                          onChange={(e) =>
                            setFormData({ ...formData, churchCity: e.target.value })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="churchState">State</Label>
                        <Input
                          id="churchState"
                          placeholder="IL"
                          value={formData.churchState}
                          onChange={(e) =>
                            setFormData({ ...formData, churchState: e.target.value })
                          }
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="churchDenomination">Denomination</Label>
                      <Input
                        id="churchDenomination"
                        placeholder="e.g., Baptist, Lutheran"
                        value={formData.churchDenomination}
                        onChange={(e) =>
                          setFormData({ ...formData, churchDenomination: e.target.value })
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="churchUrl">Church Website (Optional)</Label>
                      <Input
                        id="churchUrl"
                        type="url"
                        placeholder="https://yourchurch.com"
                        value={formData.churchUrl}
                        onChange={(e) =>
                          setFormData({ ...formData, churchUrl: e.target.value })
                        }
                      />
                    </div>
                  </div>
                )}
              </>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Loading..." : isSignUp ? "Sign Up" : "Sign In"}
            </Button>

            <div className="text-center text-sm">
              {isSignUp ? (
                <p>
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={() => setIsSignUp(false)}
                    className="text-primary hover:underline font-medium"
                  >
                    Sign In
                  </button>
                </p>
              ) : (
                <p>
                  Don't have an account?{" "}
                  <button
                    type="button"
                    onClick={() => setIsSignUp(true)}
                    className="text-primary hover:underline font-medium"
                  >
                    Sign Up
                  </button>
                </p>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;

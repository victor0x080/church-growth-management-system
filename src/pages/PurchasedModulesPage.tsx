import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Package, Bot, Layers, ArrowLeft, Trash2, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const PurchasedModulesPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [purchasedBundles, setPurchasedBundles] = useState<any[]>([]);
  const [purchasedModules, setPurchasedModules] = useState<any[]>([]);
  const [purchasedAgents, setPurchasedAgents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [churchId, setChurchId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }

    loadPurchasedData();
  }, [user, navigate]);

  const loadPurchasedData = async () => {
    try {
      // Get church_id
      const { data: profile } = await supabase
        .from("profiles")
        .select("church_id")
        .eq("id", user?.id)
        .single();

      if (!profile?.church_id) {
        setLoading(false);
        return;
      }

      setChurchId(profile.church_id);

      // Fetch purchased bundles
      const { data: bundles } = await supabase
        .from("church_bundles")
        .select("bundle_id")
        .eq("church_id", profile.church_id);

      if (bundles && bundles.length > 0) {
        const bundleIds = bundles.map((b: any) => b.bundle_id);
        const { data: bundleData } = await supabase
          .from("bundles")
          .select("*")
          .in("bundle_id", bundleIds);

        if (bundleData) {
          const bundlesWithModules = await Promise.all(
            bundleData.map(async (bundle: any) => {
              const { data: modules } = await supabase
                .from("bundle_modules")
                .select("module_name")
                .eq("bundle_id", bundle.bundle_id);

              return {
                ...bundle,
                modules: modules?.map((m: any) => m.module_name) || [],
              };
            })
          );
          setPurchasedBundles(bundlesWithModules);
        }
      }

      // Fetch purchased modules
      const { data: modules } = await supabase
        .from("church_modules")
        .select("*")
        .eq("church_id", profile.church_id);

      if (modules) {
        setPurchasedModules(modules);
      }

      // Fetch purchased agents
      const { data: agents } = await supabase
        .from("church_agents")
        .select("*")
        .eq("church_id", profile.church_id);

      if (agents) {
        setPurchasedAgents(agents);
      }
    } catch (error) {
      console.error("Error loading purchased data:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load purchased data",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUnsubscribeBundle = async (bundleId: string) => {
    if (!churchId) return;

    try {
      // First, get the modules in this bundle
      const bundle = purchasedBundles.find(b => b.bundle_id === bundleId);
      const bundleModules = bundle?.modules || [];

      // Delete the bundle subscription
      const { error } = await supabase
        .from("church_bundles")
        .delete()
        .eq("church_id", churchId)
        .eq("bundle_id", bundleId);

      if (error) throw error;

      // Delete modules that were only in this bundle
      // (Check if module appears in other bundles)
      for (const moduleName of bundleModules) {
        let shouldDeleteModule = true;
        
        // Check if this module is in any other active bundle
        for (const otherBundle of purchasedBundles) {
          if (otherBundle.bundle_id !== bundleId && otherBundle.modules.includes(moduleName)) {
            shouldDeleteModule = false;
            break;
          }
        }

        if (shouldDeleteModule) {
          // Delete the module and its agents
          await supabase
            .from("church_modules")
            .delete()
            .eq("church_id", churchId)
            .eq("module_name", moduleName);

          // Delete agents for this module
          await supabase
            .from("church_agents")
            .delete()
            .eq("church_id", churchId)
            .eq("module_name", moduleName);
        }
      }

      toast({
        title: "Bundle Unsubscribed",
        description: "You have successfully unsubscribed from this bundle.",
      });

      // Optimistically update the UI by removing the bundle from state
      setPurchasedBundles(prev => prev.filter(b => b.bundle_id !== bundleId));

      // Reload data
      await loadPurchasedData();
    } catch (error) {
      console.error("Error unsubscribing from bundle:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to unsubscribe from bundle",
      });
    }
  };

  const handleUnsubscribeModule = async (moduleId: string, moduleName: string) => {
    if (!churchId) return;

    try {
      const { error } = await supabase
        .from("church_modules")
        .delete()
        .eq("id", moduleId);

      if (error) throw error;

      // Also remove agents associated with this module
      await supabase
        .from("church_agents")
        .delete()
        .eq("church_id", churchId)
        .eq("module_name", moduleName);

      toast({
        title: "Module Unsubscribed",
        description: "You have successfully unsubscribed from this module.",
      });

      // Reload data
      loadPurchasedData();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to unsubscribe from module",
      });
    }
  };

  const handleUnsubscribeAgent = async (agentId: string, agentName: string) => {
    if (!churchId) return;

    try {
      const { error } = await supabase
        .from("church_agents")
        .delete()
        .eq("id", agentId);

      if (error) throw error;

      toast({
        title: "Agent Unsubscribed",
        description: `You have successfully unsubscribed from ${agentName}.`,
      });

      // Reload data
      loadPurchasedData();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to unsubscribe from agent",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4">Loading purchased modules...</p>
        </div>
      </div>
    );
  }

  const totalModules = purchasedBundles.reduce((acc, bundle) => acc + bundle.modules.length, 0) + purchasedModules.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <Button variant="ghost" onClick={() => navigate(-1)}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <h1 className="text-3xl font-bold mt-4">Purchased Modules & Agents</h1>
            <p className="text-muted-foreground mt-2">
              Manage your church's modules, bundles, and AI agents
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Card className="p-4">
              <div className="text-sm text-muted-foreground">Total Bundles</div>
              <div className="text-2xl font-bold">{purchasedBundles.length}</div>
            </Card>
            <Card className="p-4">
              <div className="text-sm text-muted-foreground">Total Modules</div>
              <div className="text-2xl font-bold">{totalModules}</div>
            </Card>
            <Card className="p-4">
              <div className="text-sm text-muted-foreground">Active Agents</div>
              <div className="text-2xl font-bold">{purchasedAgents.length}</div>
            </Card>
          </div>
        </div>

        {/* Purchased Bundles */}
        {purchasedBundles.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-6 h-6 text-purple-600" />
                Purchased Bundles
              </CardTitle>
              <CardDescription>
                Your church's active bundles. Unsubscribe to remove entire bundles.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {purchasedBundles.map((bundle) => (
                  <div key={bundle.bundle_id} className="border rounded-lg p-6 bg-gradient-to-r from-purple-500/5 to-transparent">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="font-semibold text-lg flex items-center gap-2 mb-2">
                          <Package className="w-5 h-5 text-purple-600" />
                          {bundle.name}
                        </div>
                        <p className="text-sm text-muted-foreground mb-1">{bundle.description}</p>
                        {bundle.price && (
                          <Badge variant="outline" className="mt-2">
                            ${bundle.price}/mo
                          </Badge>
                        )}
                      </div>
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => handleUnsubscribeBundle(bundle.bundle_id)}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Unsubscribe
                      </Button>
                    </div>
                    <div>
                      <div className="text-sm font-semibold mb-2">Includes {bundle.modules.length} modules:</div>
                      <div className="flex flex-wrap gap-2">
                        {bundle.modules.map((moduleName: string) => (
                          <Badge key={moduleName} variant="secondary" className="text-xs">
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            {moduleName}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Purchased Modules */}
        {purchasedModules.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Layers className="w-6 h-6 text-primary" />
                Individual Modules
              </CardTitle>
              <CardDescription>
                Modules purchased separately. Unsubscribe to remove modules.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {purchasedModules.map((module) => (
                  <div key={module.id} className="border rounded-lg p-4 bg-card hover:bg-primary/5 transition-colors">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Layers className="w-5 h-5 text-primary" />
                        <span className="font-medium">{module.module_name}</span>
                      </div>
                      <Badge variant="outline">Active</Badge>
                    </div>
                    {module.module_price && (
                      <div className="text-xs text-muted-foreground mb-3">
                        ${module.module_price}/mo
                      </div>
                    )}
                    <Button 
                      variant="destructive" 
                      size="sm" 
                      className="w-full"
                      onClick={() => handleUnsubscribeModule(module.id, module.module_name)}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Unsubscribe
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Purchased Agents */}
        {purchasedAgents.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="w-6 h-6 text-green-600" />
                AI Agents
              </CardTitle>
              <CardDescription>
                Configured AI agents for your modules. Unsubscribe to disable agents.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {purchasedAgents.map((agent) => (
                  <div key={agent.id} className="border rounded-lg p-4 bg-card hover:bg-green-500/5 transition-colors">
                    <div className="flex items-center gap-2 mb-2">
                      <Bot className="w-5 h-5 text-green-600" />
                      <span className="font-medium text-sm">{agent.agent_name}</span>
                    </div>
                    <div className="text-xs text-muted-foreground mb-3">{agent.module_name}</div>
                    <Button 
                      variant="destructive" 
                      size="sm" 
                      className="w-full"
                      onClick={() => handleUnsubscribeAgent(agent.id, agent.agent_name)}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Unsubscribe
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Empty State */}
        {purchasedBundles.length === 0 && purchasedModules.length === 0 && purchasedAgents.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Package className="w-16 h-16 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Modules Purchased</h3>
              <p className="text-muted-foreground text-center mb-4">
                You haven't purchased any modules or bundles yet.
              </p>
              <Button onClick={() => navigate("/onboarding")}>
                Get Started
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default PurchasedModulesPage;


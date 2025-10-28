import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, ChevronLeft, Loader2, Package } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { DASHBOARD_ROUTES } from "@/lib/constants";

interface Bundle {
  id: string;
  bundle_id: string;
  name: string;
  description: string;
  price: number;
  modules: string[];
}

const OnboardingStep3Bundles = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedModules, setSelectedModules] = useState<string[]>([]);
  const [agentSelections, setAgentSelections] = useState<any[]>([]);
  const [bundles, setBundles] = useState<Bundle[]>([]);
  const [selectedBundles, setSelectedBundles] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [modulePrices, setModulePrices] = useState<Record<string, number>>({});

  // Calculate modules that will be added by selected bundles
  const getAdditionalModules = () => {
    const addedModules = new Set<string>();
    selectedBundles.forEach(bundleId => {
      const bundle = bundles.find(b => b.bundle_id === bundleId);
      if (bundle) {
        bundle.modules.forEach(module => {
          if (!selectedModules.includes(module)) {
            addedModules.add(module);
          }
        });
      }
    });
    return Array.from(addedModules);
  };

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }

    // Load selected modules and agent selections from session storage
    const storedModules = sessionStorage.getItem("selectedModules");
    const storedAgents = sessionStorage.getItem("agentSelections");
    
    if (storedModules) {
      setSelectedModules(JSON.parse(storedModules));
    } else {
      navigate("/onboarding/step1-modules");
      return;
    }

    if (storedAgents) {
      setAgentSelections(JSON.parse(storedAgents));
    }

    // Load bundles from database
    loadBundles();
    loadModulePrices();
  }, [user, navigate]);

  const loadModulePrices = async () => {
    try {
      const { data, error } = await supabase
        .from("available_modules")
        .select("module_name, price");

      if (error) throw error;
      
      if (data) {
        const pricesMap: Record<string, number> = {};
        data.forEach(module => {
          if (module.price) {
            pricesMap[module.module_name] = parseFloat(module.price.toString());
          }
        });
        setModulePrices(pricesMap);
      }
    } catch (error) {
      console.error("Error loading module prices:", error);
    }
  };

  const loadBundles = async () => {
    try {
      // Fetch bundles
      const { data: bundlesData } = await supabase
        .from("bundles")
        .select("*")
        .order("price");

      if (bundlesData) {
        // Fetch modules for each bundle
        const bundlesWithModules = await Promise.all(
          bundlesData.map(async (bundle) => {
            const { data: modules } = await supabase
              .from("bundle_modules")
              .select("module_name")
              .eq("bundle_id", bundle.bundle_id);

            return {
              ...bundle,
              modules: modules?.map(m => m.module_name) || [],
            };
          })
        );

        setBundles(bundlesWithModules);
      }
    } catch (error) {
      console.error("Error loading bundles:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleBundle = (bundleId: string) => {
    const newSelected = new Set(selectedBundles);
    if (newSelected.has(bundleId)) {
      newSelected.delete(bundleId);
    } else {
      newSelected.add(bundleId);
    }
    setSelectedBundles(newSelected);
  };

  const getBundleModules = (bundleId: string) => {
    const bundle = bundles.find(b => b.bundle_id === bundleId);
    return bundle?.modules || [];
  };

  const calculateBundleSavings = (bundle: Bundle) => {
    // Calculate total if modules were bought individually using actual module prices
    let individualTotal = 0;
    let includedModules = 0;

    bundle.modules.forEach(moduleName => {
      const modulePrice = modulePrices[moduleName] || 0;
      individualTotal += modulePrice;
      
      if (selectedModules.includes(moduleName)) {
        includedModules++;
      }
    });

    const savings = Math.max(0, individualTotal - bundle.price);
    return {
      individualTotal: individualTotal > 0 ? individualTotal : bundle.price,
      savings,
      includedModules,
      totalModules: bundle.modules.length
    };
  };

  const handleBack = () => {
    navigate("/onboarding/step2-agents");
  };

  const handleComplete = async () => {
    if (!user) return;

    setSubmitting(true);

    try {
      // Get church_id
      const { data: profile } = await supabase
        .from("profiles")
        .select("church_id")
        .eq("id", user.id)
        .single();

      if (!profile || !profile.church_id) {
        throw new Error("Church not found");
      }

      const churchId = profile.church_id;

      // Calculate final module list: selected modules + any modules from selected bundles
      const finalModules = new Set(selectedModules);
      selectedBundles.forEach(bundleId => {
        const bundle = bundles.find(b => b.bundle_id === bundleId);
        if (bundle) {
          bundle.modules.forEach(module => finalModules.add(module));
        }
      });

      // Save all final modules
      const modulesData = Array.from(finalModules).map(moduleName => ({
        church_id: churchId,
        module_name: moduleName,
        module_price: null, // Will be calculated based on bundle
      }));

      if (modulesData.length > 0) {
        await supabase.from("church_modules").insert(modulesData);
      }

      // Save selected bundles
      const bundlesData = Array.from(selectedBundles).map(bundleId => ({
        church_id: churchId,
        bundle_id: bundleId,
      }));

      if (bundlesData.length > 0) {
        await supabase.from("church_bundles").insert(bundlesData);
      }

      // Save agent selections
      const agentsData = agentSelections.flatMap(selection =>
        selection.agent_names.map((agentName: string) => ({
          church_id: churchId,
          module_name: selection.module_name,
          agent_name: agentName,
          agent_price: null,
        }))
      );

      if (agentsData.length > 0) {
        await supabase.from("church_agents").insert(agentsData);
      }

      // Mark onboarding as completed
      await supabase
        .from("profiles")
        .update({ onboarding_completed: true })
        .eq("id", user.id);

      toast({
        title: "Onboarding completed!",
        description: "Your church is now set up with the selected modules and bundles.",
      });

      // Navigate to dashboard
      await new Promise(resolve => setTimeout(resolve, 500));
      navigate(DASHBOARD_ROUTES.PARISH);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to complete onboarding",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
      <div className="container mx-auto px-4 py-8">
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-3xl">Step 3: Select Bundles (Optional)</CardTitle>
            <CardDescription className="text-lg">
              Bundles offer savings and convenience. Selecting a bundle will automatically add any modules from the bundle that you haven't already selected.
            </CardDescription>
          </CardHeader>
        </Card>

        {bundles.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No bundles available at this time.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {bundles.map((bundle) => {
                const isSelected = selectedBundles.has(bundle.bundle_id);
                const { individualTotal, savings, includedModules, totalModules } = calculateBundleSavings(bundle);

                return (
                  <Card
                    key={bundle.bundle_id}
                    className={`cursor-pointer transition-all ${
                      isSelected ? "border-primary shadow-lg" : "hover:border-primary/50"
                    }`}
                    onClick={() => toggleBundle(bundle.bundle_id)}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <Package className="w-6 h-6 text-primary" />
                            <CardTitle>{bundle.name}</CardTitle>
                            {isSelected && <Check className="w-6 h-6 text-primary" />}
                          </div>
                          <CardDescription className="mt-2">{bundle.description}</CardDescription>
                        </div>
                        <Badge variant={isSelected ? "default" : "outline"} className="ml-2">
                          ${bundle.price}/mo
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <div className="text-sm font-semibold mb-2">Includes {totalModules} modules:</div>
                        <div className="space-y-1 max-h-40 overflow-y-auto">
                          {bundle.modules.map((moduleName) => {
                            const isIncluded = selectedModules.includes(moduleName);
                            return (
                              <div key={moduleName} className="flex items-center gap-2 text-sm">
                                {isIncluded && <Check className="w-4 h-4 text-green-600" />}
                                <span className={isIncluded ? "font-medium" : ""}>{moduleName}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                      
                      {savings > 0 && (
                        <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
                          <div className="text-sm font-semibold text-green-600">
                            Save ${savings}/month
                          </div>
                          <div className="text-xs text-muted-foreground">
                            ${individualTotal}/mo individually → ${bundle.price}/mo
                          </div>
                        </div>
                      )}
                      
                      <div className="text-sm text-muted-foreground">
                        {includedModules} of {totalModules} modules already selected
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Summary Section */}
            {selectedBundles.size > 0 && (
              <Card className="mb-8 border-primary">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="w-6 h-6 text-primary" />
                    Bundle Selection Summary
                  </CardTitle>
                  <CardDescription>
                    Modules that will be added to your church
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm font-semibold mb-2">Your Selected Modules ({selectedModules.length})</div>
                      <div className="space-y-1 max-h-48 overflow-y-auto">
                        {selectedModules.slice(0, 10).map(module => (
                          <div key={module} className="text-sm flex items-center gap-2">
                            <Check className="w-4 h-4 text-green-600" />
                            {module}
                          </div>
                        ))}
                        {selectedModules.length > 10 && (
                          <div className="text-xs text-muted-foreground">
                            + {selectedModules.length - 10} more modules
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {getAdditionalModules().length > 0 && (
                      <div>
                        <div className="text-sm font-semibold mb-2 text-primary">
                          Additional Modules from Bundles (+{getAdditionalModules().length})
                        </div>
                        <div className="space-y-1 max-h-48 overflow-y-auto">
                          {getAdditionalModules().map(module => (
                            <div key={module} className="text-sm flex items-center gap-2 text-primary">
                              <Package className="w-4 h-4" />
                              <span className="font-medium">{module}</span>
                              <Badge variant="secondary" className="text-xs">Added by bundle</Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {getAdditionalModules().length > 0 && (
                    <div className="mt-4 p-4 bg-primary/10 rounded-lg border border-primary/20">
                      <div className="text-sm font-semibold text-primary mb-1">
                        Total Modules: {selectedModules.length + getAdditionalModules().length}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {selectedModules.length} originally selected + {getAdditionalModules().length} from bundles
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            <div className="flex justify-between mt-8">
              <Button variant="outline" onClick={handleBack} disabled={submitting}>
                <ChevronLeft className="w-4 h-4 mr-2" />
                Back to Agents
              </Button>
              <Button onClick={handleComplete} disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Completing...
                  </>
                ) : (
                  "Complete Setup"
                )}
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default OnboardingStep3Bundles;

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Circle, ChevronRight, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface Module {
  module_name: string;
  purpose: string;
  price: number;
}

const OnboardingStep1Modules = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedModules, setSelectedModules] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [modules, setModules] = useState<Module[]>([]);

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }
    
    loadModules();
  }, [user, navigate]);

  const loadModules = async () => {
    try {
      const { data, error } = await supabase
        .from("available_modules")
        .select("*")
        .order("module_name");

      if (error) throw error;
      
      if (data) {
        setModules(data);
      }
    } catch (error) {
      console.error("Error loading modules:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleModule = (moduleName: string) => {
    const newSelected = new Set(selectedModules);
    if (newSelected.has(moduleName)) {
      newSelected.delete(moduleName);
    } else {
      newSelected.add(moduleName);
    }
    setSelectedModules(newSelected);
  };

  const handleNext = () => {
    if (selectedModules.size === 0) return;
    
    // Store selected modules in session storage
    sessionStorage.setItem("selectedModules", JSON.stringify(Array.from(selectedModules)));
    navigate("/onboarding/step2-agents");
  };

  const calculateTotal = () => {
    let total = 0;
    selectedModules.forEach((moduleName) => {
      const module = modules.find((m) => m.module_name === moduleName);
      if (module && module.price) {
        total += parseFloat(module.price.toString());
      }
    });
    return total;
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
            <CardTitle className="text-3xl">Step 1: Select Modules</CardTitle>
            <CardDescription className="text-lg">
              Choose the modules you'd like to enable for your church.
            </CardDescription>
          </CardHeader>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Modules List */}
          <div className="lg:col-span-2 space-y-4">
            {modules.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No modules available</p>
              </div>
            ) : (
              modules.map((module) => {
                const isSelected = selectedModules.has(module.module_name);
                
                return (
                  <Card
                    key={module.module_name}
                    className={`cursor-pointer transition-all ${
                      isSelected ? "border-primary shadow-md" : ""
                    }`}
                    onClick={() => toggleModule(module.module_name)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <div className="mt-1">
                            {isSelected ? (
                              <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                                <Check className="w-3 h-3 text-primary-foreground" />
                              </div>
                            ) : (
                              <Circle className="w-5 h-5 text-muted-foreground" />
                            )}
                          </div>
                          <div>
                            <CardTitle className="text-lg">{module.module_name}</CardTitle>
                            {module.purpose && (
                              <p className="text-sm text-muted-foreground mt-1">{module.purpose}</p>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-semibold">
                            ${module.price ? module.price.toFixed(2) : '0.00'}/mo
                          </span>
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                );
              })
            )}
          </div>

          {/* Summary Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle>Selected Modules</CardTitle>
                <CardDescription>
                  {selectedModules.size} module{selectedModules.size !== 1 ? "s" : ""} selected
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {Array.from(selectedModules).map((moduleName) => {
                    const module = modules.find((m) => m.module_name === moduleName);
                    return (
                      <div key={moduleName} className="text-sm">
                        <div className="font-medium">{moduleName}</div>
                        {module && module.price && (
                          <div className="text-muted-foreground">
                            ${module.price.toFixed(2)}/mo
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
                <div className="border-t pt-4 mt-4">
                  <div className="flex justify-between items-center font-bold">
                    <span>Total Monthly Cost:</span>
                    <span>${calculateTotal().toFixed(2)}/mo</span>
                  </div>
                </div>
                <Button
                  onClick={handleNext}
                  className="w-full"
                  size="lg"
                  disabled={selectedModules.size === 0}
                >
                  Continue to Step 2: Configure Agents
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingStep1Modules;

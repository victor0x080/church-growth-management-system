import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Search, X, ShoppingCart, CheckCircle2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  HandCoins,
  Users,
  Sparkles,
  BookOpen,
  Calendar,
  HeartHandshake,
  Home
} from "lucide-react";

// Groups from the system
const GROUPS = [
  { id: "accounting", name: "Accounting", icon: HandCoins },
  { id: "membership", name: "Membership", icon: Users },
  { id: "innovation", name: "Innovation", icon: Sparkles },
  { id: "discipleship", name: "Discipleship", icon: BookOpen },
  { id: "planning", name: "Planning", icon: Calendar },
  { id: "stewardship", name: "Stewardship", icon: HandCoins },
  { id: "community", name: "Community", icon: HeartHandshake },
  { id: "ministry", name: "Ministry", icon: Home },
];

interface Module {
  module_name: string;
  name?: string;
  price?: number;
  purpose?: string;
  category?: string | null;
}

interface ModuleManagerDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  churchId: string | null;
  onBillingClick: () => void;
  onModuleToggle?: () => void;
}

export const ModuleManagerDrawer = ({
  open,
  onOpenChange,
  churchId,
  onBillingClick,
  onModuleToggle,
}: ModuleManagerDrawerProps) => {
  const [availableModules, setAvailableModules] = useState<Module[]>([]);
  const [purchasedModules, setPurchasedModules] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [activeGroup, setActiveGroup] = useState<string | null>(null);
  const { toast } = useToast();

  // Normalize DB categories and known module ids to dashboard groups
  const CATEGORY_TO_GROUP: Record<string, string> = {
    Engagement: "community",
    Care: "ministry",
    Volunteering: "community",
    Communication: "community",
    Reporting: "innovation",
    Monitoring: "community",
    "Task Management": "planning",
  };
  const MODULE_ID_TO_GROUP: Record<string, string> = {
    mod_community_growth: "community",
    mod_pastoral_care: "ministry",
    mod_micro_volunteering: "community",
    mod_comms_engagement: "community",
    mod_rag: "innovation",
    mod_email_mgmt: "community",
    mod_nmeo: "membership",
    mod_social_media: "innovation",
  };

  const getModuleGroup = (module: Module): string => {
    // 1) normalize DB category (e.g., Engagement -> community)
    if (module.category && CATEGORY_TO_GROUP[module.category]) {
      return CATEGORY_TO_GROUP[module.category];
    }
    // 2) map by known module ids
    if (MODULE_ID_TO_GROUP[module.module_name]) {
      return MODULE_ID_TO_GROUP[module.module_name];
    }
    // 3) fallback by human name keywords
    const n = (module.name || module.module_name).toLowerCase();
    if (/care|pastoral/.test(n)) return "ministry";
    if (/volunteer/.test(n)) return "community";
    if (/report|rag|content/.test(n)) return "innovation";
    if (/member|new\s*member/.test(n)) return "membership";
    if (/plan|task/.test(n)) return "planning";
    return "community";
  };

  useEffect(() => {
    if (open && churchId) {
      loadModules();
    }
  }, [open, churchId]);

  const loadModules = async () => {
    try {
      // Load available modules
      const { data: modules } = await supabase
        .from("available_modules")
        .select("module_name, name, price, purpose, category");

      if (modules) {
        setAvailableModules(modules);
      }

      // Load purchased modules
      const { data: purchased } = await supabase
        .from("church_modules")
        .select("module_name")
        .eq("church_id", churchId);

      if (purchased) {
        setPurchasedModules(new Set(purchased.map((m: any) => m.module_name)));
      }
    } catch (error) {
      console.error("Error loading modules:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load modules",
      });
    }
  };

  const toggleModule = async (moduleName: string) => {
    if (!churchId) return;

    const isPurchased = purchasedModules.has(moduleName);

    try {
      if (isPurchased) {
        // Unsubscribe
        await supabase
          .from("church_modules")
          .delete()
          .eq("church_id", churchId)
          .eq("module_name", moduleName);

        setPurchasedModules((prev) => {
          const next = new Set(prev);
          next.delete(moduleName);
          return next;
        });

        toast({
          title: "Module Disabled",
          description: `${moduleName} has been disabled.`,
        });
      } else {
        // Subscribe
        await supabase
          .from("church_modules")
          .insert({
            church_id: churchId,
            module_name: moduleName,
          } as any);

        setPurchasedModules((prev) => new Set(prev).add(moduleName));

        toast({
          title: "Module Enabled",
          description: `${moduleName} has been enabled.`,
        });
      }
      // Call the parent callback to reload data
      if (onModuleToggle) {
        onModuleToggle();
      }
    } catch (error) {
      console.error("Error toggling module:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update module subscription",
      });
    }
  };


  const filteredModules = availableModules
    .filter((module) => purchasedModules.has(module.module_name))
    .filter((module) => module.module_name.toLowerCase().includes(searchQuery.toLowerCase()));

  const moduleCount = purchasedModules.size;
  const totalPrice = Array.from(purchasedModules)
    .reduce((sum, name) => {
      const module = availableModules.find((m) => m.module_name === name);
      return sum + (module?.price || 0);
    }, 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl h-[80vh] flex flex-col p-0 gap-0">
        <DialogHeader className="px-6 pt-6 pb-4">
          <DialogTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5 text-primary" />
            Module Manager
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 flex flex-col px-6 pt-2 pb-6 overflow-hidden">
          {/* Search */}
          <div className="flex items-center gap-2 mb-4 shrink-0">
            <div className="relative flex-1 shrink-0">
              <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search modules..."
                className="pl-9"
              />
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setActiveGroup(null)}
              className={!activeGroup ? "bg-primary/10" : ""}
            >
              All
            </Button>
          </div>

          {/* Module List */}
          <ScrollArea className="flex-1 pr-4">
            <div className="space-y-6">
              {GROUPS.map((group) => {
                const Icon = group.icon;
                // Ensure each module appears only once in its resolved group
                const groupModules = filteredModules.filter((m) => getModuleGroup(m) === group.id);

                if (groupModules.length === 0) return null;

                return (
                  <div key={group.id}>
                    <div className="flex items-center gap-2 mb-3">
                      <Icon className="h-4 w-4 text-primary" />
                      <h4 className="text-base font-bold">{group.name}</h4>
                    </div>
                    <div className="space-y-2">
                      {groupModules.map((module) => {
                        const isPurchased = purchasedModules.has(module.module_name);
                        return (
                          <div
                            key={module.module_name}
                            className="flex items-start justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                          >
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-medium">{module.name || module.module_name}</span>
                                {isPurchased && (
                                  <Badge variant="secondary" className="text-xs">
                                    Enabled
                                  </Badge>
                                )}
                              </div>
                              {module.purpose && (
                                <p className="text-sm text-muted-foreground">
                                  {module.purpose}
                                </p>
                              )}
                              {module.price && (
                                <p className="text-sm font-medium text-primary mt-1">
                                  ${module.price}/mo
                                </p>
                              )}
                            </div>
                            <Button
                              variant={isPurchased ? "outline" : "default"}
                              size="sm"
                              onClick={() => toggleModule(module.module_name)}
                              className="ml-4"
                            >
                              {isPurchased ? (
                                <>
                                  <X className="h-4 w-4 mr-1" />
                                  Disable
                                </>
                              ) : (
                                <>
                                  <CheckCircle2 className="h-4 w-4 mr-1" />
                                  Enable
                                </>
                              )}
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>

          {/* Billing Preview */}
          <Separator className="my-4 shrink-0" />
          <div className="rounded-lg border p-4 bg-muted/30 shrink-0">
            <div className="flex items-center justify-between mb-2">
              <div>
                <div className="text-sm font-medium">{moduleCount} modules enabled</div>
                <div className="text-xs text-muted-foreground">
                  Total: ${totalPrice.toFixed(2)}/mo
                </div>
              </div>
              <Button onClick={onBillingClick} className="gap-2">
                <ShoppingCart className="h-4 w-4" />
                Manage Subscriptions
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Package, Bot, Layers, ArrowLeft, Trash2, CheckCircle2 } from "lucide-react";
// Drawers are no longer used for subscribing; keeping imports removed per request
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
  // Selection-based subscribe UI
  const [availableModules, setAvailableModules] = useState<any[]>([]);
  const [availableAgents, setAvailableAgents] = useState<any[]>([]);
  const [availableBundles, setAvailableBundles] = useState<any[]>([]);
  const [selectedModuleNames, setSelectedModuleNames] = useState<Set<string>>(new Set());
  const [selectedAgentKeys, setSelectedAgentKeys] = useState<Set<string>>(new Set()); // `${module_name}::${agent_name}`
  const [selectedBundleIds, setSelectedBundleIds] = useState<Set<string>>(new Set());

  const subscribeMissingModules = async () => {
    if (!churchId) return;
    try {
      const [{ data: allModules }, { data: current }] = await Promise.all([
        supabase.from("available_modules").select("module_name"),
        supabase.from("church_modules").select("module_name").eq("church_id", churchId),
      ]);
      const currentSet = new Set((current || []).map((m: any) => m.module_name));
      const missing = (allModules || [])
        .map((m: any) => m.module_name)
        .filter((name: string) => !currentSet.has(name));

      if (missing.length === 0) {
        toast({ title: "No Missing Modules", description: "All modules are already subscribed." });
        return;
      }

      const rows = missing.map((module_name: string) => ({ church_id: churchId, module_name }));
      const { error } = await supabase.from("church_modules").insert(rows);
      if (error) throw error;
      toast({ title: "Modules Subscribed", description: `${missing.length} module(s) added.` });
      await loadPurchasedData();
    } catch (e) {
      console.error(e);
      toast({ variant: "destructive", title: "Error", description: "Failed to subscribe missing modules" });
    }
  };

  const subscribeMissingAgents = async () => {
    if (!churchId) return;
    try {
      const [{ data: subscribedModules }, { data: allAgents }, { data: currentAgents }] = await Promise.all([
        supabase.from("church_modules").select("module_name").eq("church_id", churchId),
        supabase.from("module_agents").select("module_name, agent_name"),
        supabase.from("church_agents").select("module_name, agent_name").eq("church_id", churchId),
      ]);
      const subscribedSet = new Set((subscribedModules || []).map((m: any) => m.module_name));
      const currentSet = new Set((currentAgents || []).map((a: any) => `${a.module_name}::${a.agent_name}`));
      const candidates = (allAgents || []).filter((a: any) => subscribedSet.has(a.module_name));
      const missing = candidates.filter((a: any) => !currentSet.has(`${a.module_name}::${a.agent_name}`));

      if (missing.length === 0) {
        toast({ title: "No Missing Agents", description: "All agents are already subscribed." });
        return;
      }

      const rows = missing.map((a: any) => ({ church_id: churchId, module_name: a.module_name, agent_name: a.agent_name }));
      const { error } = await supabase.from("church_agents").insert(rows);
      if (error) throw error;
      toast({ title: "Agents Subscribed", description: `${missing.length} agent(s) added.` });
      await loadPurchasedData();
    } catch (e) {
      console.error(e);
      toast({ variant: "destructive", title: "Error", description: "Failed to subscribe missing agents" });
    }
  };

  const subscribeMissingBundles = async () => {
    if (!churchId) return;
    try {
      const [{ data: allBundles }, { data: currentBundles }] = await Promise.all([
        supabase.from("bundles").select("bundle_id"),
        supabase.from("church_bundles").select("bundle_id").eq("church_id", churchId),
      ]);
      const currentSet = new Set((currentBundles || []).map((b: any) => b.bundle_id));
      const missing = (allBundles || []).map((b: any) => b.bundle_id).filter((id: string) => !currentSet.has(id));

      if (missing.length === 0) {
        toast({ title: "No Missing Bundles", description: "All bundles are already subscribed." });
        return;
      }

      const rows = missing.map((bundle_id: string) => ({ church_id: churchId, bundle_id }));
      const { error } = await supabase.from("church_bundles").insert(rows);
      if (error) throw error;
      toast({ title: "Bundles Subscribed", description: `${missing.length} bundle(s) added.` });
      await loadPurchasedData();
    } catch (e) {
      console.error(e);
      toast({ variant: "destructive", title: "Error", description: "Failed to subscribe missing bundles" });
    }
  };

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

      // Load unsubscribed options for selection
      await loadAvailableOptions(profile.church_id);
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

  const loadAvailableOptions = async (cId: string) => {
    // Modules with their agents
    const [{ data: allModules }, { data: currentModules }] = await Promise.all([
      supabase.from("available_modules").select("module_name, price, purpose"),
      supabase.from("church_modules").select("module_name").eq("church_id", cId),
    ]);
    const currentModuleSet = new Set((currentModules || []).map((m: any) => m.module_name));
    const unsubscribedModules = (allModules || []).filter((m: any) => !currentModuleSet.has(m.module_name));
    
    // Fetch agents for each module
    const modulesWithAgents = await Promise.all(
      unsubscribedModules.map(async (module: any) => {
        const { data: agents } = await supabase
          .from("module_agents")
          .select("agent_name, price")
          .eq("module_name", module.module_name);
        return { ...module, agents: agents || [] };
      })
    );
    setAvailableModules(modulesWithAgents);

    // Bundles with their modules
    const [{ data: allBundles }, { data: currentBundles }] = await Promise.all([
      supabase.from("bundles").select("bundle_id, name, description, price"),
      supabase.from("church_bundles").select("bundle_id").eq("church_id", cId),
    ]);
    const currentBundleSet = new Set((currentBundles || []).map((b: any) => b.bundle_id));
    const unsubscribedBundles = (allBundles || []).filter((b: any) => !currentBundleSet.has(b.bundle_id));
    
    // Fetch modules for each bundle
    const bundlesWithModules = await Promise.all(
      unsubscribedBundles.map(async (bundle: any) => {
        const { data: modules } = await supabase
          .from("bundle_modules")
          .select("module_name")
          .eq("bundle_id", bundle.bundle_id);
        return { ...bundle, modules: modules?.map((m: any) => m.module_name) || [] };
      })
    );
    setAvailableBundles(bundlesWithModules);

    // Agents (only for subscribed modules) with their module info
    const [{ data: allAgents }, { data: currentAgents }] = await Promise.all([
      supabase.from("module_agents").select("module_name, agent_name, price"),
      supabase.from("church_agents").select("module_name, agent_name").eq("church_id", cId),
    ]);
    const subscribedModulesSet = currentModuleSet; // same set
    const currentAgentSet = new Set((currentAgents || []).map((a: any) => `${a.module_name}::${a.agent_name}`));
    setAvailableAgents(
      (allAgents || []).filter(
        (a: any) => subscribedModulesSet.has(a.module_name) && !currentAgentSet.has(`${a.module_name}::${a.agent_name}`)
      )
    );
  };

  const toggleModuleSelection = (name: string) => {
    setSelectedModuleNames((prev) => {
      const next = new Set(prev);
      next.has(name) ? next.delete(name) : next.add(name);
      return next;
    });
  };
  const toggleAgentSelection = (key: string) => {
    setSelectedAgentKeys((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };
  const toggleBundleSelection = (id: string) => {
    setSelectedBundleIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const subscribeSelectedModules = async () => {
    if (!churchId || selectedModuleNames.size === 0) return;
    const rows = Array.from(selectedModuleNames).map((module_name) => ({ church_id: churchId, module_name }));
    const { error } = await supabase.from("church_modules").insert(rows);
    if (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to subscribe selected modules" });
      return;
    }
    toast({ title: "Modules Subscribed", description: `${selectedModuleNames.size} module(s) added.` });
    setSelectedModuleNames(new Set());
    await loadPurchasedData();
  };
  const subscribeSelectedAgents = async () => {
    if (!churchId || selectedAgentKeys.size === 0) return;
    const rows = Array.from(selectedAgentKeys).map((k) => {
      const [module_name, agent_name] = k.split("::");
      return { church_id: churchId, module_name, agent_name };
    });
    const { error } = await supabase.from("church_agents").insert(rows);
    if (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to subscribe selected agents" });
      return;
    }
    toast({ title: "Agents Subscribed", description: `${selectedAgentKeys.size} agent(s) added.` });
    setSelectedAgentKeys(new Set());
    await loadPurchasedData();
  };
  const subscribeSelectedBundles = async () => {
    if (!churchId || selectedBundleIds.size === 0) return;
    
    try {
      // Insert bundles
      const bundleRows = Array.from(selectedBundleIds).map((bundle_id) => ({ church_id: churchId, bundle_id }));
      const { error: bundleError } = await supabase.from("church_bundles").insert(bundleRows);
      if (bundleError) throw bundleError;

      // Get all modules from selected bundles
      const selectedBundles = availableBundles.filter((b: any) => selectedBundleIds.has(b.bundle_id));
      const allModules = selectedBundles.flatMap((bundle: any) => bundle.modules || []);
      const uniqueModules = Array.from(new Set(allModules));

      // Subscribe to modules that aren't already subscribed
      if (uniqueModules.length > 0) {
        const { data: existingModules } = await supabase
          .from("church_modules")
          .select("module_name")
          .eq("church_id", churchId)
          .in("module_name", uniqueModules);
        
        const existingModuleNames = new Set((existingModules || []).map((m: any) => m.module_name));
        const newModules = uniqueModules.filter((m: string) => !existingModuleNames.has(m));

        if (newModules.length > 0) {
          const moduleRows = newModules.map((module_name: string) => ({ church_id: churchId, module_name }));
          const { error: moduleError } = await supabase.from("church_modules").insert(moduleRows);
          if (moduleError) throw moduleError;
        }

        // Subscribe to all agents for the modules
        const { data: moduleAgents } = await supabase
          .from("module_agents")
          .select("module_name, agent_name")
          .in("module_name", uniqueModules);

        if (moduleAgents && moduleAgents.length > 0) {
          // Check which agents are already subscribed
          const { data: existingAgents } = await supabase
            .from("church_agents")
            .select("module_name, agent_name")
            .eq("church_id", churchId);

          const existingAgentKeys = new Set(
            (existingAgents || []).map((a: any) => `${a.module_name}::${a.agent_name}`)
          );

          const newAgents = moduleAgents.filter(
            (a: any) => !existingAgentKeys.has(`${a.module_name}::${a.agent_name}`)
          );

          if (newAgents.length > 0) {
            const agentRows = newAgents.map((a: any) => ({
              church_id: churchId,
              module_name: a.module_name,
              agent_name: a.agent_name,
            }));
            const { error: agentError } = await supabase.from("church_agents").insert(agentRows);
            if (agentError) throw agentError;
          }
        }
      }

      toast({ 
        title: "Bundles Subscribed", 
        description: `${selectedBundleIds.size} bundle(s) added with all related modules and agents.` 
      });
      setSelectedBundleIds(new Set());
      await loadPurchasedData();
    } catch (error) {
      console.error("Error subscribing bundles:", error);
      toast({ 
        variant: "destructive", 
        title: "Error", 
        description: "Failed to subscribe selected bundles" 
      });
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
          <div className="flex items-center gap-2">
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

        {/* Subscribe New Bundles */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="w-6 h-6 text-purple-600" />
              Subscribe New Bundles
            </CardTitle>
            <CardDescription>
              Select bundles to subscribe from the database (unsubscribed only)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {availableBundles.length === 0 ? (
                <div className="text-sm text-muted-foreground">No additional bundles available.</div>
              ) : (
                availableBundles.map((b: any) => (
                  <label key={b.bundle_id} className="flex items-start gap-3 p-3 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                    <input
                      type="checkbox"
                      className="h-4 w-4 mt-1"
                      checked={selectedBundleIds.has(b.bundle_id)}
                      onChange={() => toggleBundleSelection(b.bundle_id)}
                    />
                    <div className="flex-1">
                      <div className="font-medium flex items-center gap-2 mb-1">
                        {b.name}
                        {b.price && <Badge variant="secondary" className="text-xs">${b.price.toFixed(2)}/mo</Badge>}
                      </div>
                      {b.description && <div className="text-xs text-muted-foreground mb-2">{b.description}</div>}
                      {b.modules && b.modules.length > 0 && (
                        <div className="mt-2">
                          <div className="text-xs font-semibold mb-1">Includes {b.modules.length} modules:</div>
                          <div className="flex flex-wrap gap-1">
                            {b.modules.map((moduleName: string) => (
                              <Badge key={moduleName} variant="outline" className="text-xs">
                                {moduleName}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </label>
                ))
              )}
            </div>
            <div className="mt-3">
              <Button size="sm" onClick={subscribeSelectedBundles} disabled={selectedBundleIds.size === 0}>Subscribe Selected Bundles</Button>
            </div>
          </CardContent>
        </Card>

        {/* Subscribe New Modules */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Layers className="w-6 h-6 text-primary" />
              Subscribe New Modules
            </CardTitle>
            <CardDescription>
              Select modules to subscribe from the database (unsubscribed only)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {availableModules.length === 0 ? (
                <div className="text-sm text-muted-foreground">No additional modules available.</div>
              ) : (
                availableModules.map((m: any) => (
                  <label key={m.module_name} className="flex items-start gap-3 p-3 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                    <input
                      type="checkbox"
                      className="h-4 w-4 mt-1"
                      checked={selectedModuleNames.has(m.module_name)}
                      onChange={() => toggleModuleSelection(m.module_name)}
                    />
                    <div className="flex-1">
                      <div className="font-medium flex items-center gap-2 mb-1">
                        {m.module_name}
                        {m.price && <Badge variant="secondary" className="text-xs">${m.price.toFixed(2)}/mo</Badge>}
                      </div>
                      {m.purpose && <div className="text-xs text-muted-foreground mb-2">{m.purpose}</div>}
                      {m.agents && m.agents.length > 0 && (
                        <div className="mt-2">
                          <div className="text-xs font-semibold mb-1">Includes {m.agents.length} agents:</div>
                          <div className="flex flex-wrap gap-1">
                            {m.agents.map((agent: any) => (
                              <Badge key={agent.agent_name} variant="outline" className="text-xs">
                                {agent.agent_name}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </label>
                ))
              )}
            </div>
            <div className="mt-3">
              <Button size="sm" onClick={subscribeSelectedModules} disabled={selectedModuleNames.size === 0}>Subscribe Selected Modules</Button>
            </div>
          </CardContent>
        </Card>

        {/* Subscribe New Agents */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bot className="w-6 h-6 text-green-600" />
              Subscribe New Agents
            </CardTitle>
            <CardDescription>
              Select agents to subscribe for already subscribed modules
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {availableAgents.length === 0 ? (
                <div className="text-sm text-muted-foreground">No additional agents available.</div>
              ) : (
                (() => {
                  // Group agents by module
                  const groupedAgents = availableAgents.reduce((acc: any, agent: any) => {
                    if (!acc[agent.module_name]) {
                      acc[agent.module_name] = [];
                    }
                    acc[agent.module_name].push(agent);
                    return acc;
                  }, {});

                  return Object.entries(groupedAgents).map(([moduleName, agents]: [string, any]) => (
                    <div key={moduleName} className="border rounded-lg p-3">
                      <div className="text-sm font-semibold mb-2 text-primary">{moduleName}</div>
                      <div className="space-y-2">
                        {agents.map((a: any) => {
                          const key = `${a.module_name}::${a.agent_name}`;
                          return (
                            <label key={key} className="flex items-center gap-3 p-2 border rounded cursor-pointer hover:bg-muted/50 transition-colors">
                              <input
                                type="checkbox"
                                className="h-4 w-4"
                                checked={selectedAgentKeys.has(key)}
                                onChange={() => toggleAgentSelection(key)}
                              />
                              <div className="flex-1">
                                <div className="font-medium text-sm">{a.agent_name}</div>
                                {a.price && <div className="text-xs text-muted-foreground">${Number(a.price).toFixed(2)}/mo</div>}
                              </div>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  ));
                })()
              )}
            </div>
            <div className="mt-3">
              <Button size="sm" onClick={subscribeSelectedAgents} disabled={selectedAgentKeys.size === 0}>Subscribe Selected Agents</Button>
            </div>
          </CardContent>
        </Card>
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


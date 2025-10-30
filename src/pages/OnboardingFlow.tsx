import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

type CatalogBundle = { bundle_id: string; name: string; description?: string };
type CatalogModule = { module_name: string; name?: string; purpose?: string; category?: string };
type ModuleAgent = { module_name: string; agent_name: string };

const OnboardingFlow = () => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [bundles, setBundles] = useState<CatalogBundle[]>([]);
  const [modules, setModules] = useState<CatalogModule[]>([]);
  const [moduleAgents, setModuleAgents] = useState<ModuleAgent[]>([]);
  const [selectedBundle, setSelectedBundle] = useState<string | null>(null);
  const [selectedModules, setSelectedModules] = useState<Set<string>>(new Set());
  const [agentModalModule, setAgentModalModule] = useState<string | null>(null);
  const [selectedAgentsForModule, setSelectedAgentsForModule] = useState<Map<string, Set<string>>>(new Map());
  const [churchId, setChurchId] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      const [{ data: b }, { data: m }, { data: a }] = await Promise.all([
        supabase.from("bundles").select("bundle_id, name, description"),
        supabase.from("available_modules").select("module_name, name, purpose, category"),
        supabase.from("module_agents").select("module_name, agent_name"),
      ]);
      setBundles(b || []);
      setModules(m || []);
      setModuleAgents(a || []);
    };
    load();
  }, []);

  useEffect(() => {
    const loadChurch = async () => {
      if (!user) return;
      const { data: profile } = await supabase
        .from("profiles")
        .select("church_id")
        .eq("id", user.id)
        .single();
      setChurchId(profile?.church_id || null);
    };
    loadChurch();
  }, [user]);

  const openAgentModal = (moduleName: string) => {
    setAgentModalModule(moduleName);
    if (!selectedAgentsForModule.has(moduleName)) {
      setSelectedAgentsForModule((prev) => new Map(prev).set(moduleName, new Set()));
    }
  };

  const toggleAgent = (moduleName: string, agentName: string) => {
    setSelectedAgentsForModule((prev) => {
      const next = new Map(prev);
      const setForModule = new Set(next.get(moduleName) || []);
      if (setForModule.has(agentName)) setForModule.delete(agentName); else setForModule.add(agentName);
      next.set(moduleName, setForModule);
      return next;
    });
  };

  const agentsForCurrentModule = useMemo(() => {
    if (!agentModalModule) return [] as string[];
    return moduleAgents.filter(a => a.module_name === agentModalModule).map(a => a.agent_name);
  }, [agentModalModule, moduleAgents]);

  const completeAgentSelection = () => {
    setAgentModalModule(null);
  };

  const proceedBundles = () => setStep(2);
  const proceedModules = () => setStep(3);

  const handleComplete = async () => {
    try {
      if (!churchId) {
        toast({ variant: "destructive", title: "Error", description: "Missing church context." });
        return;
      }

      // Subscribe bundle (optional)
      if (selectedBundle) {
        await supabase
          .from("church_bundles")
          .upsert([{ church_id: churchId, bundle_id: selectedBundle }], { onConflict: "church_id,bundle_id" });
      }

      // Subscribe modules
      const moduleRows = Array.from(selectedModules).map((module_name) => ({ church_id: churchId, module_name }));
      if (moduleRows.length > 0) {
        await supabase
          .from("church_modules")
          .upsert(moduleRows, { onConflict: "church_id,module_name" });
      }

      // Subscribe agents
      const agentRows: Array<{ church_id: string; module_name: string; agent_name: string }> = [];
      selectedAgentsForModule.forEach((agents, moduleName) => {
        agents.forEach((agentName) => {
          agentRows.push({ church_id: churchId, module_name: moduleName, agent_name: agentName });
        });
      });
      if (agentRows.length > 0) {
        await supabase
          .from("church_agents")
          .upsert(agentRows, { onConflict: "church_id,module_name,agent_name" });
      }

      // Mark onboarding as completed
      if (user) {
        await supabase
          .from("profiles")
          .update({ onboarding_completed: true })
          .eq("id", user.id);
      }

      toast({ title: "Onboarding Complete", description: "Your selections have been saved." });
      navigate("/clergy");
    } catch (e) {
      console.error(e);
      toast({ variant: "destructive", title: "Error", description: "Failed to complete onboarding." });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Onboarding</h1>

      {step === 1 && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Select a Bundle (optional)</CardTitle>
            <CardDescription>Pick a bundle or proceed to modules.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {bundles.map((b) => (
                <Card key={b.bundle_id} className={`cursor-pointer ${selectedBundle === b.bundle_id ? 'ring-2 ring-primary' : ''}`} onClick={() => setSelectedBundle(b.bundle_id)}>
                  <CardHeader>
                    <CardTitle className="text-base">{b.name}</CardTitle>
                    {b.description && <CardDescription>{b.description}</CardDescription>}
                  </CardHeader>
                </Card>
              ))}
            </div>
            <div className="mt-4 flex gap-2">
              <Button onClick={proceedBundles}>Next: Modules</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 2 && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Select Modules</CardTitle>
            <CardDescription>Click a module to configure its agents.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {modules.map((m) => (
                <Card key={m.module_name} className="cursor-pointer" onClick={() => { setSelectedModules(new Set(selectedModules).add(m.module_name)); openAgentModal(m.module_name); }}>
                  <CardHeader>
                    <CardTitle className="text-base">{m.name || m.module_name}</CardTitle>
                    {m.purpose && <CardDescription>{m.purpose}</CardDescription>}
                  </CardHeader>
                </Card>
              ))}
            </div>
            <div className="mt-4 flex gap-2">
              <Button onClick={proceedModules}>Review</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 3 && (
        <Card>
          <CardHeader>
            <CardTitle>Summary</CardTitle>
            <CardDescription>Selected bundle, modules, and agents.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <div className="text-sm text-muted-foreground">Bundle</div>
              <div className="text-sm font-medium">{bundles.find(b => b.bundle_id === selectedBundle)?.name || 'None'}</div>
            </div>
            <div className="space-y-3">
              {Array.from(selectedModules).map((mn) => (
                <div key={mn} className="border rounded p-3">
                  <div className="font-medium mb-1">{modules.find(m => m.module_name === mn)?.name || mn}</div>
                  <div className="flex flex-wrap gap-1">
                    {Array.from(selectedAgentsForModule.get(mn) || []).map((an) => (
                      <Badge key={an} variant="secondary" className="text-xs">{an}</Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <Button onClick={handleComplete}>Complete Onboarding</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Dialog open={!!agentModalModule} onOpenChange={(o) => !o && setAgentModalModule(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Configure Agents for {agentModalModule}</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            {agentsForCurrentModule.length === 0 ? (
              <div className="text-sm text-muted-foreground">No agents available for this module.</div>
            ) : (
              agentsForCurrentModule.map((agentName) => {
                const selected = selectedAgentsForModule.get(agentModalModule || '') || new Set<string>();
                const isOn = selected.has(agentName);
                return (
                  <label key={agentName} className={`flex items-center justify-between p-2 border rounded cursor-pointer ${isOn ? 'bg-primary/5' : ''}`}>
                    <span className="text-sm">{agentName}</span>
                    <input
                      type="checkbox"
                      checked={isOn}
                      onChange={() => agentModalModule && toggleAgent(agentModalModule, agentName)}
                    />
                  </label>
                );
              })
            )}
          </div>
          <div className="mt-4">
            <Button onClick={completeAgentSelection}>Done</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OnboardingFlow;



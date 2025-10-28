import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, UserPlus, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface AgentRow {
  module_name: string;
  agent_name: string;
  price?: number | null;
}

interface AgentManagerDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  churchId: string | null;
}

export const AgentManagerDrawer = ({ open, onOpenChange, churchId }: AgentManagerDrawerProps) => {
  const { toast } = useToast();
  const [agents, setAgents] = useState<AgentRow[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set()); // key: `${module_name}::${agent_name}`
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (open && churchId) {
      loadData();
    }
  }, [open, churchId]);

  const loadData = async () => {
    try {
      const { data: agentRows } = await supabase
        .from("module_agents")
        .select("module_name, agent_name, price");
      setAgents(agentRows || []);

      const { data: churchAgents } = await supabase
        .from("church_agents")
        .select("module_name, agent_name")
        .eq("church_id", churchId);
      const preselected = new Set(
        (churchAgents || []).map((r: any) => `${r.module_name}::${r.agent_name}`)
      );
      setSelected(preselected);
    } catch (e) {
      console.error(e);
      toast({ variant: "destructive", title: "Error", description: "Failed to load agents" });
    }
  };

  const subscribeAgent = async (row: AgentRow) => {
    if (!churchId) return;
    const key = `${row.module_name}::${row.agent_name}`;
    try {
      const { error } = await supabase
        .from("church_agents")
        .insert({
          church_id: churchId,
          module_name: row.module_name,
          agent_name: row.agent_name,
        });
      if (error) throw error;
      setSelected((prev) => new Set(prev).add(key));
      toast({ title: "Agent Subscribed", description: `${row.agent_name} enabled.` });
    } catch (e) {
      console.error(e);
      toast({ variant: "destructive", title: "Error", description: "Failed to subscribe agent" });
    }
  };

  const filtered = agents.filter((a) =>
    `${a.module_name} ${a.agent_name}`.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Enable Agents</DialogTitle>
        </DialogHeader>
        <div className="flex items-center gap-2 mb-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search agents or modules..."
              className="pl-9"
            />
          </div>
        </div>
        <Separator className="mb-2" />
        <ScrollArea className="flex-1 pr-2">
          <div className="space-y-2">
            {filtered.map((row) => {
              const key = `${row.module_name}::${row.agent_name}`;
              const isSelected = selected.has(key);
              return (
                <div key={key} className="flex items-center justify-between p-3 rounded-lg border">
                  <div>
                    <div className="font-medium flex items-center gap-2">
                      {row.agent_name}
                      {isSelected && <Badge variant="secondary" className="text-xs">Enabled</Badge>}
                    </div>
                    <div className="text-xs text-muted-foreground">{row.module_name}</div>
                    {typeof row.price === "number" && (
                      <div className="text-xs text-primary mt-1">${row.price.toFixed(2)}/mo</div>
                    )}
                  </div>
                  <Button size="sm" variant={isSelected ? "outline" : "default"} onClick={() => subscribeAgent(row)}>
                    {isSelected ? (<><Check className="h-4 w-4 mr-1"/> Enabled</>) : (<><UserPlus className="h-4 w-4 mr-1"/> Enable</>)}
                  </Button>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};



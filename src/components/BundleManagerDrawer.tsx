import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Package, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface BundleRow {
  bundle_id: string;
  name: string;
  description?: string | null;
  price?: number | null;
  modules?: string[];
}

interface BundleManagerDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  churchId: string | null;
}

export const BundleManagerDrawer = ({ open, onOpenChange, churchId }: BundleManagerDrawerProps) => {
  const { toast } = useToast();
  const [bundles, setBundles] = useState<BundleRow[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (open && churchId) loadData();
  }, [open, churchId]);

  const loadData = async () => {
    try {
      const { data: bundleRows } = await supabase
        .from("bundles")
        .select("bundle_id, name, description, price");

      const withModules: BundleRow[] = await Promise.all(
        (bundleRows || []).map(async (b) => {
          const { data: mods } = await supabase
            .from("bundle_modules")
            .select("module_name")
            .eq("bundle_id", b.bundle_id);
          return { ...b, modules: (mods || []).map((m: any) => m.module_name) };
        })
      );
      setBundles(withModules);

      const { data: churchBundles } = await supabase
        .from("church_bundles")
        .select("bundle_id")
        .eq("church_id", churchId);
      setSelected(new Set((churchBundles || []).map((r: any) => r.bundle_id)));
    } catch (e) {
      console.error(e);
      toast({ variant: "destructive", title: "Error", description: "Failed to load bundles" });
    }
  };

  const subscribeBundle = async (bundle: BundleRow) => {
    if (!churchId) return;
    try {
      const { error } = await supabase
        .from("church_bundles")
        .insert({ church_id: churchId, bundle_id: bundle.bundle_id });
      if (error) throw error;
      setSelected((prev) => new Set(prev).add(bundle.bundle_id));
      toast({ title: "Bundle Subscribed", description: `${bundle.name} enabled.` });
    } catch (e) {
      console.error(e);
      toast({ variant: "destructive", title: "Error", description: "Failed to subscribe bundle" });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5 text-primary" />
            Subscribe Bundles
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1 pr-2">
          <div className="space-y-4">
            {bundles.map((b) => {
              const isSelected = selected.has(b.bundle_id);
              return (
                <div key={b.bundle_id} className="p-4 rounded-lg border">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="font-semibold text-base flex items-center gap-2">
                        <Package className="h-4 w-4 text-primary" />
                        {b.name}
                        {isSelected && (
                          <Badge variant="secondary" className="text-xs">Enabled</Badge>
                        )}
                      </div>
                      {b.description && (
                        <div className="text-sm text-muted-foreground mt-1">{b.description}</div>
                      )}
                      {typeof b.price === "number" && (
                        <div className="text-sm text-primary mt-1">${b.price.toFixed(2)}/mo</div>
                      )}
                    </div>
                    <div>
                      <Button size="sm" variant={isSelected ? "outline" : "default"} onClick={() => subscribeBundle(b)}>
                        {isSelected ? (<><CheckCircle2 className="h-4 w-4 mr-1"/> Enabled</>) : (<>Subscribe</>)}
                      </Button>
                    </div>
                  </div>
                  {b.modules && b.modules.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {b.modules.map((m) => (
                        <Badge key={m} variant="outline" className="text-xs">{m}</Badge>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </ScrollArea>
        <Separator className="mt-4" />
      </DialogContent>
    </Dialog>
  );
};



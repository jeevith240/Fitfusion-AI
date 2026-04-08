import { useState, useEffect } from "react";
import { Droplets } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { addWater, getTotalWater } from "@/lib/store";

const quickAmounts = [250, 500, 750, 1000];
const GOAL = 3000;

export default function WaterPage() {
  const [total, setTotal] = useState(0);
  const [custom, setCustom] = useState("");

  const reload = () => setTotal(getTotalWater());
  useEffect(reload, []);

  const handleAdd = (ml: number) => {
    addWater(ml);
    reload();
    toast.success(`+${ml}ml added 💧`);
  };

  const handleCustom = () => {
    const ml = Number(custom);
    if (ml > 0) {
      handleAdd(ml);
      setCustom("");
    }
  };

  const pct = Math.min((total / GOAL) * 100, 100);

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Droplets className="h-6 w-6 text-water" /> Water Tracker
        </h1>
        <p className="text-muted-foreground mt-1">Stay hydrated throughout the day</p>
      </div>

      <div className="stat-card text-center py-10 space-y-4">
        <Droplets className="h-16 w-16 text-water mx-auto" />
        <div>
          <p className="text-4xl font-bold text-foreground">{(total / 1000).toFixed(1)}L</p>
          <p className="text-muted-foreground">of {GOAL / 1000}L goal</p>
        </div>
        <div className="max-w-xs mx-auto">
          <div className="h-4 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-water rounded-full transition-all duration-700 ease-out"
              style={{ width: `${pct}%` }}
            />
          </div>
          <p className="text-sm text-muted-foreground mt-2">{Math.round(pct)}% complete</p>
        </div>
      </div>

      <div className="stat-card space-y-4">
        <h3 className="font-semibold text-foreground">Quick Add</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {quickAmounts.map((ml) => (
            <Button
              key={ml}
              variant="outline"
              onClick={() => handleAdd(ml)}
              className="h-14 text-base font-semibold"
            >
              +{ml}ml
            </Button>
          ))}
        </div>
        <div className="flex gap-2">
          <Input
            type="number"
            placeholder="Custom (ml)"
            value={custom}
            onChange={(e) => setCustom(e.target.value)}
          />
          <Button onClick={handleCustom}>Add</Button>
        </div>
      </div>
    </div>
  );
}

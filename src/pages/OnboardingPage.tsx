import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Flame, ArrowRight, ArrowLeft, Check } from "lucide-react";

interface OnboardingData {
  name: string;
  age: string;
  gender: string;
  height: string;
  weight: string;
  activityLevel: string;
  goal: string;
}

const STEPS = ["basics", "body", "goals"] as const;

export default function OnboardingPage({ userId, onComplete }: { userId: string; onComplete: () => void }) {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<OnboardingData>({
    name: "",
    age: "",
    gender: "",
    height: "",
    weight: "",
    activityLevel: "",
    goal: "",
  });

  const update = (key: keyof OnboardingData, val: string) =>
    setData((d) => ({ ...d, [key]: val }));

  const canNext = () => {
    if (step === 0) return data.name && data.age && data.gender;
    if (step === 1) return data.height && data.weight;
    if (step === 2) return data.activityLevel && data.goal;
    return false;
  };

  const handleFinish = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.from("profiles").update({
        name: data.name,
        age: parseInt(data.age),
        gender: data.gender,
        height: parseFloat(data.height),
        weight: parseFloat(data.weight),
        activity_level: data.activityLevel,
        goal: data.goal,
        onboarding_completed: true,
      }).eq("user_id", userId);
      if (error) throw error;
      toast.success("Profile set up! Let's get started 🔥");
      onComplete();
    } catch (err: any) {
      toast.error(err.message || "Failed to save profile");
    } finally {
      setLoading(false);
    }
  };

  const genderOptions = [
    { value: "male", label: "Male", emoji: "👨" },
    { value: "female", label: "Female", emoji: "👩" },
    { value: "other", label: "Other", emoji: "🧑" },
  ];

  const activityOptions = [
    { value: "sedentary", label: "Sedentary", desc: "Little or no exercise" },
    { value: "light", label: "Light", desc: "Exercise 1-3 days/week" },
    { value: "moderate", label: "Moderate", desc: "Exercise 3-5 days/week" },
    { value: "active", label: "Active", desc: "Exercise 6-7 days/week" },
    { value: "very_active", label: "Very Active", desc: "Hard exercise daily" },
  ];

  const goalOptions = [
    { value: "lose", label: "Lose Weight", emoji: "📉" },
    { value: "maintain", label: "Maintain", emoji: "⚖️" },
    { value: "gain", label: "Gain Weight", emoji: "📈" },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-lg animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="text-center mb-6">
          <div className="h-14 w-14 rounded-2xl bg-primary flex items-center justify-center mx-auto mb-3">
            <Flame className="h-7 w-7 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Let's set up your profile</h1>
          <p className="text-muted-foreground mt-1">Step {step + 1} of {STEPS.length}</p>
        </div>

        {/* Progress bar */}
        <div className="flex gap-2 mb-6">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${
                i <= step ? "bg-primary" : "bg-muted"
              }`}
            />
          ))}
        </div>

        <div className="glass-card rounded-2xl p-6 space-y-5">
          {step === 0 && (
            <div className="space-y-4 animate-in fade-in duration-300">
              <div>
                <Label className="text-base">What's your name?</Label>
                <Input
                  value={data.name}
                  onChange={(e) => update("name", e.target.value)}
                  placeholder="Enter your name"
                  className="mt-2 h-12 text-base"
                />
              </div>
              <div>
                <Label className="text-base">How old are you?</Label>
                <Input
                  type="number"
                  value={data.age}
                  onChange={(e) => update("age", e.target.value)}
                  placeholder="Age"
                  className="mt-2 h-12 text-base"
                />
              </div>
              <div>
                <Label className="text-base">Gender</Label>
                <div className="grid grid-cols-3 gap-3 mt-2">
                  {genderOptions.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => update("gender", opt.value)}
                      className={`p-4 rounded-xl border-2 text-center transition-all active:scale-95 ${
                        data.gender === opt.value
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border hover:border-primary/50 text-foreground"
                      }`}
                    >
                      <span className="text-2xl">{opt.emoji}</span>
                      <p className="text-sm font-medium mt-1">{opt.label}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4 animate-in fade-in duration-300">
              <div>
                <Label className="text-base">Height (cm)</Label>
                <Input
                  type="number"
                  value={data.height}
                  onChange={(e) => update("height", e.target.value)}
                  placeholder="e.g., 175"
                  className="mt-2 h-12 text-base"
                />
              </div>
              <div>
                <Label className="text-base">Weight (kg)</Label>
                <Input
                  type="number"
                  value={data.weight}
                  onChange={(e) => update("weight", e.target.value)}
                  placeholder="e.g., 75"
                  className="mt-2 h-12 text-base"
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4 animate-in fade-in duration-300">
              <div>
                <Label className="text-base">Activity Level</Label>
                <div className="space-y-2 mt-2">
                  {activityOptions.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => update("activityLevel", opt.value)}
                      className={`w-full p-3 rounded-xl border-2 text-left transition-all active:scale-[0.98] ${
                        data.activityLevel === opt.value
                          ? "border-primary bg-primary/10"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <p className="font-medium text-foreground">{opt.label}</p>
                      <p className="text-sm text-muted-foreground">{opt.desc}</p>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <Label className="text-base">What's your goal?</Label>
                <div className="grid grid-cols-3 gap-3 mt-2">
                  {goalOptions.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => update("goal", opt.value)}
                      className={`p-4 rounded-xl border-2 text-center transition-all active:scale-95 ${
                        data.goal === opt.value
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border hover:border-primary/50 text-foreground"
                      }`}
                    >
                      <span className="text-2xl">{opt.emoji}</span>
                      <p className="text-sm font-medium mt-1">{opt.label}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            {step > 0 && (
              <Button
                variant="outline"
                onClick={() => setStep(step - 1)}
                className="h-12 px-6 active:scale-95 transition-transform"
              >
                <ArrowLeft className="h-4 w-4 mr-2" /> Back
              </Button>
            )}
            {step < STEPS.length - 1 ? (
              <Button
                onClick={() => setStep(step + 1)}
                disabled={!canNext()}
                className="flex-1 h-12 text-base font-semibold active:scale-95 transition-transform"
              >
                Continue <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={handleFinish}
                disabled={!canNext() || loading}
                className="flex-1 h-12 text-base font-semibold active:scale-95 transition-transform"
              >
                {loading ? "Saving..." : "Get Started"} <Check className="h-4 w-4 ml-2" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

import { useState, useEffect } from "react";
import { Brain, Loader2, RefreshCw, Salad, Dumbbell, Lightbulb, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import {
  getProfile,
  getCaloriesConsumed,
  getCaloriesBurned,
  getTotalWater,
  calculateDailyCalories,
  calculateBMI,
  getBMICategory,
} from "@/lib/store";

interface Suggestion {
  category: string;
  title: string;
  description: string;
  icon: "diet" | "workout" | "tip" | "progress";
}

export default function AIDietPage() {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchSuggestions = async () => {
    setLoading(true);
    try {
      const profile = getProfile();
      const consumed = getCaloriesConsumed();
      const burned = getCaloriesBurned();
      const water = getTotalWater();
      const target = calculateDailyCalories(profile);
      const bmi = calculateBMI(profile);
      const bmiCat = getBMICategory(bmi);

      const prompt = `You are a fitness and nutrition AI coach. Based on this user's data, give exactly 6 personalized suggestions in JSON array format. Each item must have: category (string), title (short), description (2-3 sentences).

User Profile:
- Name: ${profile.name}, Age: ${profile.age}, Gender: ${profile.gender}
- Height: ${profile.height}cm, Weight: ${profile.weight}kg, BMI: ${bmi} (${bmiCat.label})
- Activity: ${profile.activityLevel}, Goal: ${profile.goal}
- Today: consumed ${consumed}/${target} kcal, burned ${burned} kcal, water ${water}ml/3000ml

Give 2 diet suggestions, 2 workout suggestions, 1 lifestyle tip, 1 progress insight.
Categories must be one of: "diet", "workout", "tip", "progress".
Return ONLY valid JSON array, no markdown.`;

      const { data, error } = await supabase.functions.invoke("detect-food", {
        body: {
          prompt,
          type: "suggestions",
        },
      });

      if (error) throw error;

      // Parse AI response
      let parsed: Suggestion[] = [];
      try {
        const text = data?.result || data?.items || "[]";
        const jsonStr = typeof text === "string" ? text : JSON.stringify(text);
        const match = jsonStr.match(/\[[\s\S]*\]/);
        if (match) {
          parsed = JSON.parse(match[0]).map((item: any) => ({
            category: item.category || "tip",
            title: item.title || "Suggestion",
            description: item.description || "",
            icon: item.category || "tip",
          }));
        }
      } catch {
        // fallback
      }

      if (parsed.length > 0) {
        setSuggestions(parsed);
      } else {
        // Fallback suggestions
        setSuggestions(getDefaultSuggestions(profile, consumed, target, burned, water));
      }
    } catch (err) {
      console.error("AI suggestions error:", err);
      const profile = getProfile();
      setSuggestions(getDefaultSuggestions(profile, getCaloriesConsumed(), calculateDailyCalories(profile), getCaloriesBurned(), getTotalWater()));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuggestions();
  }, []);

  const getIcon = (type: string) => {
    switch (type) {
      case "diet": return <Salad className="h-5 w-5" />;
      case "workout": return <Dumbbell className="h-5 w-5" />;
      case "progress": return <TrendingUp className="h-5 w-5" />;
      default: return <Lightbulb className="h-5 w-5" />;
    }
  };

  const getCategoryColor = (type: string) => {
    switch (type) {
      case "diet": return "text-green-500 bg-green-500/10";
      case "workout": return "text-primary bg-primary/10";
      case "progress": return "text-blue-500 bg-blue-500/10";
      default: return "text-yellow-500 bg-yellow-500/10";
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Brain className="h-6 w-6 text-primary" /> AI Diet & Fitness Coach
          </h1>
          <p className="text-muted-foreground mt-1">Personalized suggestions based on your progress</p>
        </div>
        <Button
          onClick={fetchSuggestions}
          disabled={loading}
          className="gap-2 active:scale-95 transition-transform shrink-0"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="h-10 w-10 text-primary animate-spin" />
          <p className="text-muted-foreground">Analyzing your progress...</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {suggestions.map((s, i) => (
            <div
              key={i}
              className="stat-card flex gap-4 animate-in fade-in slide-in-from-bottom-2"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${getCategoryColor(s.icon)}`}>
                {getIcon(s.icon)}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{s.category}</p>
                <h3 className="font-semibold text-foreground mt-0.5">{s.title}</h3>
                <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{s.description}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function getDefaultSuggestions(profile: any, consumed: number, target: number, burned: number, water: number): Suggestion[] {
  const remaining = target - consumed + burned;
  const waterPercent = Math.round((water / 3000) * 100);
  return [
    {
      category: "Diet",
      title: remaining > 500 ? "You're under your calorie goal" : "Great calorie tracking!",
      description: remaining > 500
        ? `You still have ${remaining} kcal remaining today. Consider a balanced snack with protein and healthy fats.`
        : `You're close to your ${target} kcal target. Keep it up and focus on nutrient-dense foods.`,
      icon: "diet",
    },
    {
      category: "Diet",
      title: "Protein intake tip",
      description: `For your goal to ${profile.goal} weight, aim for ${Math.round(profile.weight * (profile.goal === "gain" ? 2 : 1.6))}g of protein daily. Include lean meats, fish, eggs, or legumes.`,
      icon: "diet",
    },
    {
      category: "Workout",
      title: burned > 200 ? "Nice workout today!" : "Time to move!",
      description: burned > 200
        ? `You've burned ${burned} kcal so far. Great effort! Consider stretching to aid recovery.`
        : "You haven't logged much activity today. Even a 20-minute walk can boost your metabolism and mood.",
      icon: "workout",
    },
    {
      category: "Workout",
      title: "Exercise recommendation",
      description: profile.goal === "lose"
        ? "Try HIIT or circuit training to maximize calorie burn in less time. 3-4 sessions per week is ideal."
        : "Focus on progressive overload with compound lifts. Increase weight or reps gradually each week.",
      icon: "workout",
    },
    {
      category: "Tip",
      title: waterPercent < 50 ? "Drink more water!" : "Hydration on track",
      description: waterPercent < 50
        ? `You're only at ${waterPercent}% of your water goal. Dehydration can slow metabolism and increase hunger.`
        : `Good job staying hydrated at ${waterPercent}%! Keep sipping throughout the day for optimal performance.`,
      icon: "tip",
    },
    {
      category: "Progress",
      title: "Daily overview",
      description: `BMI: ${(profile.weight / (profile.height / 100) ** 2).toFixed(1)} | Calories: ${consumed}/${target} | Water: ${waterPercent}%. Stay consistent for best results!`,
      icon: "progress",
    },
  ];
}

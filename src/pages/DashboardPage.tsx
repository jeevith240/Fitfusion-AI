import { useEffect, useState } from "react";
import { Flame, Target, Zap, Droplets, Brain, TrendingUp, Trophy, Calendar, Quote } from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { CircularProgress } from "@/components/CircularProgress";
import {
  getProfile,
  calculateDailyCalories,
  calculateBMI,
  getBMICategory,
  getCaloriesConsumed,
  getCaloriesBurned,
  getTotalWater,
  getWeeklyData,
  getStreak,
} from "@/lib/store";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const motivationalQuotes = [
  { text: "The only bad workout is the one that didn't happen.", author: "Unknown" },
  { text: "Take care of your body. It's the only place you have to live.", author: "Jim Rohn" },
  { text: "Fitness is not about being better than someone else. It's about being better than you used to be.", author: "Khloe Kardashian" },
  { text: "The body achieves what the mind believes.", author: "Napoleon Hill" },
  { text: "Don't stop when you're tired. Stop when you're done.", author: "David Goggins" },
  { text: "Your health is an investment, not an expense.", author: "Unknown" },
  { text: "Strive for progress, not perfection.", author: "Unknown" },
];

export default function DashboardPage() {
  const [profile, setProfile] = useState(getProfile());
  const [weeklyData, setWeeklyData] = useState(getWeeklyData());
  const [quote] = useState(motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)]);
  const [streak, setStreak] = useState(0);
  const [timeGreeting, setTimeGreeting] = useState("");

  useEffect(() => {
    setProfile(getProfile());
    setWeeklyData(getWeeklyData());
    setStreak(getStreak());

    const hour = new Date().getHours();
    if (hour < 12) setTimeGreeting("Good morning");
    else if (hour < 17) setTimeGreeting("Good afternoon");
    else setTimeGreeting("Good evening");
  }, []);

  const target = calculateDailyCalories(profile);
  const consumed = getCaloriesConsumed();
  const burned = getCaloriesBurned();
  const water = getTotalWater();
  const bmi = calculateBMI(profile);
  const bmiCat = getBMICategory(bmi);
  const remaining = Math.max(target - consumed + burned, 0);
  const waterPct = Math.min((water / 3000) * 100, 100);

  // Calculate today's score (0-100)
  const calorieScore = Math.min(consumed / target, 1) * 40;
  const waterScore = Math.min(water / 3000, 1) * 30;
  const workoutScore = Math.min(burned / 300, 1) * 30;
  const todayScore = Math.round(calorieScore + waterScore + workoutScore);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Greeting + Streak */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold animate-in fade-in slide-in-from-left-4 duration-500">
            {timeGreeting}, {profile.name} 🔥
          </h1>
          <p className="text-muted-foreground mt-1">Here's your fitness overview for today</p>
        </div>
        {streak > 0 && (
          <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-primary/10 border border-primary/20 animate-in fade-in zoom-in duration-500">
            <Trophy className="h-5 w-5 text-primary" />
            <span className="font-bold text-primary text-lg">{streak}</span>
            <span className="text-sm text-muted-foreground">day streak!</span>
          </div>
        )}
      </div>

      {/* Motivational Quote */}
      <div className="stat-card bg-gradient-to-r from-primary/5 to-accent/5 animate-in fade-in slide-in-from-bottom-2 duration-600">
        <div className="flex items-start gap-3">
          <Quote className="h-5 w-5 text-primary shrink-0 mt-0.5" />
          <div>
            <p className="text-foreground font-medium italic">"{quote.text}"</p>
            <p className="text-sm text-muted-foreground mt-1">— {quote.author}</p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          title="Today's Score"
          value={`${todayScore}/100`}
          subtitle="overall progress"
          icon={<TrendingUp className="h-5 w-5" />}
          color="text-primary"
        />
        <StatCard
          title="Target Calories"
          value={target}
          subtitle="kcal / day"
          icon={<Target className="h-5 w-5" />}
          color="text-primary"
        />
        <StatCard
          title="Consumed"
          value={consumed}
          subtitle="kcal today"
          icon={<Flame className="h-5 w-5" />}
          color="text-calories"
        />
        <StatCard
          title="Burned"
          value={burned}
          subtitle="kcal today"
          icon={<Zap className="h-5 w-5" />}
          color="text-burned"
        />
        <StatCard
          title="Water"
          value={`${(water / 1000).toFixed(1)}L`}
          subtitle="of 3L goal"
          icon={<Droplets className="h-5 w-5" />}
          color="text-water"
        />
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Circular Progress */}
        <div className="stat-card flex flex-col items-center justify-center py-8">
          <CircularProgress
            value={consumed}
            max={target}
            label={`${remaining}`}
            sublabel="kcal remaining"
          />
          <div className="mt-4 flex gap-6 text-sm">
            <div className="text-center">
              <p className="font-semibold text-calories">{consumed}</p>
              <p className="text-muted-foreground text-xs">Eaten</p>
            </div>
            <div className="text-center">
              <p className="font-semibold text-burned">{burned}</p>
              <p className="text-muted-foreground text-xs">Burned</p>
            </div>
          </div>
        </div>

        {/* Weekly Chart */}
        <div className="stat-card md:col-span-2">
          <h3 className="font-semibold text-foreground mb-4">Weekly Calories</h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    background: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "0.75rem",
                    fontSize: 13,
                  }}
                />
                <Legend />
                <Bar dataKey="consumed" fill="hsl(var(--calories))" radius={[4, 4, 0, 0]} name="Consumed" />
                <Bar dataKey="burned" fill="hsl(var(--burned))" radius={[4, 4, 0, 0]} name="Burned" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* BMI */}
        <div className="stat-card">
          <h3 className="font-semibold text-foreground mb-3">BMI Status</h3>
          <div className="flex items-center gap-4">
            <div className="text-4xl font-bold text-foreground">{bmi}</div>
            <div>
              <p className={`text-lg font-semibold ${bmiCat.color}`}>{bmiCat.label}</p>
              <p className="text-sm text-muted-foreground">{profile.height}cm · {profile.weight}kg</p>
            </div>
          </div>
          <div className="mt-4 h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-500"
              style={{ width: `${Math.min((bmi / 40) * 100, 100)}%` }}
            />
          </div>
        </div>

        {/* Water Progress */}
        <div className="stat-card">
          <h3 className="font-semibold text-foreground mb-3">Water Progress</h3>
          <div className="flex items-center gap-4 mb-4">
            <Droplets className="h-8 w-8 text-water" />
            <div>
              <p className="text-2xl font-bold text-foreground">{(water / 1000).toFixed(1)}L</p>
              <p className="text-sm text-muted-foreground">of 3L daily goal</p>
            </div>
          </div>
          <div className="h-3 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-water rounded-full transition-all duration-500"
              style={{ width: `${waterPct}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-2">{Math.round(waterPct)}% complete</p>
        </div>
      </div>

      {/* AI Recommendations */}
      <div className="stat-card">
        <div className="flex items-center gap-2 mb-4">
          <Brain className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-foreground">Quick Tips</h3>
        </div>
        <div className="grid md:grid-cols-3 gap-3">
          {[
            consumed < target * 0.5
              ? "🍽️ You're under 50% of your calorie goal — time for a balanced meal!"
              : "✅ Great calorie tracking today. Keep it up!",
            water < 1500
              ? "💧 You need more water! Try to drink a glass every hour."
              : "💧 Hydration is on track. Keep sipping!",
            burned < 200
              ? "🏃 No workout yet? Even 15 minutes of walking helps!"
              : `🔥 You've burned ${burned} kcal — great effort today!`,
          ].map((tip, i) => (
            <div key={i} className="p-3 rounded-xl bg-muted/50 text-sm text-foreground">
              {tip}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

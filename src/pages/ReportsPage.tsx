import { BarChart3, TrendingUp, Brain } from "lucide-react";
import { getWeeklyData, getProfile, calculateBMI } from "@/lib/store";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function ReportsPage() {
  const weeklyData = getWeeklyData();
  const profile = getProfile();
  const bmi = calculateBMI(profile);

  // Generate mock 30-day trend data
  const monthlyData = Array.from({ length: 30 }, (_, i) => ({
    day: i + 1,
    calories: 1500 + Math.floor(Math.random() * 800),
    burned: 200 + Math.floor(Math.random() * 400),
  }));

  const weightData = Array.from({ length: 30 }, (_, i) => ({
    day: i + 1,
    weight: profile.weight - 2 + Math.random() * 4,
  }));

  const chartStyle = {
    background: "hsl(var(--card))",
    border: "1px solid hsl(var(--border))",
    borderRadius: "0.75rem",
    fontSize: 12,
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <BarChart3 className="h-6 w-6 text-primary" /> Reports
        </h1>
        <p className="text-muted-foreground mt-1">Your fitness analytics and insights</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="stat-card">
          <h3 className="font-semibold text-foreground mb-4">Calorie Intake (30 Days)</h3>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={10} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={10} />
                <Tooltip contentStyle={chartStyle} />
                <Bar dataKey="calories" fill="hsl(var(--calories))" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="stat-card">
          <h3 className="font-semibold text-foreground mb-4">Calories Burned (30 Days)</h3>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={10} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={10} />
                <Tooltip contentStyle={chartStyle} />
                <Bar dataKey="burned" fill="hsl(var(--burned))" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="stat-card">
        <h3 className="font-semibold text-foreground mb-4">Weight Progress (30 Days)</h3>
        <div className="h-52">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={weightData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={10} />
              <YAxis domain={["auto", "auto"]} stroke="hsl(var(--muted-foreground))" fontSize={10} />
              <Tooltip contentStyle={chartStyle} />
              <Line type="monotone" dataKey="weight" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="stat-card">
        <div className="flex items-center gap-2 mb-4">
          <Brain className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-foreground">AI Insights</h3>
        </div>
        <div className="space-y-3">
          <div className="p-3 rounded-xl bg-muted/50 flex items-start gap-3">
            <TrendingUp className="h-5 w-5 text-success mt-0.5 shrink-0" />
            <div>
              <p className="font-medium text-foreground text-sm">Calorie consistency improving</p>
              <p className="text-xs text-muted-foreground">Your daily intake variance has decreased by 15% this week.</p>
            </div>
          </div>
          <div className="p-3 rounded-xl bg-muted/50 flex items-start gap-3">
            <TrendingUp className="h-5 w-5 text-primary mt-0.5 shrink-0" />
            <div>
              <p className="font-medium text-foreground text-sm">Current BMI: {bmi}</p>
              <p className="text-xs text-muted-foreground">Keep up your current routine to maintain a healthy weight range.</p>
            </div>
          </div>
          <div className="p-3 rounded-xl bg-muted/50 flex items-start gap-3">
            <TrendingUp className="h-5 w-5 text-water mt-0.5 shrink-0" />
            <div>
              <p className="font-medium text-foreground text-sm">Hydration target met 4/7 days</p>
              <p className="text-xs text-muted-foreground">Try setting reminders to drink water every 2 hours.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

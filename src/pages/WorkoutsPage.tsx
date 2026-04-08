import { useState, useEffect } from "react";
import { Plus, Trash2, Dumbbell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  getWorkouts,
  addWorkout,
  removeWorkout,
  getProfile,
  estimateCaloriesBurned,
  getCaloriesBurned,
  WorkoutEntry,
  GymExercise,
} from "@/lib/store";

const workoutTypes = [
  { value: "walking", label: "🚶 Walking" },
  { value: "running", label: "🏃 Running" },
  { value: "cycling", label: "🚴 Cycling" },
  { value: "gym", label: "🏋️ Gym" },
  { value: "swimming", label: "🏊 Swimming" },
  { value: "yoga", label: "🧘 Yoga" },
] as const;

const gymExerciseOptions = [
  "Bench Press", "Squats", "Deadlift", "Shoulder Press", "Bicep Curl",
  "Tricep Extension", "Leg Press", "Pull Ups", "Push Ups",
];

export default function WorkoutsPage() {
  const [entries, setEntries] = useState<WorkoutEntry[]>([]);
  const [type, setType] = useState<WorkoutEntry["type"]>("walking");
  const [duration, setDuration] = useState("30");
  const [exercises, setExercises] = useState<GymExercise[]>([
    { name: "Bench Press", sets: [{ reps: 10, weight: 60 }] },
  ]);

  const reload = () => setEntries(getWorkouts());
  useEffect(reload, []);

  const profile = getProfile();
  const totalBurned = getCaloriesBurned();
  const estimated = estimateCaloriesBurned(type, Number(duration) || 0, profile.weight);

  const addExercise = () => {
    setExercises([...exercises, { name: "Squats", sets: [{ reps: 10 }] }]);
  };

  const removeExercise = (i: number) => {
    setExercises(exercises.filter((_, idx) => idx !== i));
  };

  const updateExercise = (i: number, field: string, value: string) => {
    const updated = [...exercises];
    if (field === "name") updated[i].name = value;
    setExercises(updated);
  };

  const addSet = (i: number) => {
    const updated = [...exercises];
    updated[i].sets.push({ reps: 10 });
    setExercises(updated);
  };

  const updateSet = (ei: number, si: number, field: "reps" | "weight", value: string) => {
    const updated = [...exercises];
    updated[ei].sets[si][field] = Number(value) || 0;
    setExercises(updated);
  };

  const removeSet = (ei: number, si: number) => {
    const updated = [...exercises];
    updated[ei].sets = updated[ei].sets.filter((_, idx) => idx !== si);
    setExercises(updated);
  };

  const handleAdd = () => {
    if (!duration || Number(duration) <= 0) {
      toast.error("Please enter a valid duration");
      return;
    }
    addWorkout({
      type,
      duration: Number(duration),
      caloriesBurned: estimated,
      exercises: type === "gym" ? exercises : undefined,
    });
    setDuration("30");
    reload();
    toast.success("Workout logged!");
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Dumbbell className="h-6 w-6 text-burned" /> Workouts
        </h1>
        <p className="text-muted-foreground mt-1">Log your exercises and track calories burned</p>
      </div>

      <div className="stat-card space-y-4">
        <h3 className="font-semibold text-foreground">Log Workout</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <Label>Type</Label>
            <Select value={type} onValueChange={(v) => setType(v as WorkoutEntry["type"])}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {workoutTypes.map((w) => (
                  <SelectItem key={w.value} value={w.value}>{w.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Duration (min)</Label>
            <Input type="number" value={duration} onChange={(e) => setDuration(e.target.value)} />
          </div>
          <div>
            <Label>Est. Calories</Label>
            <div className="h-10 flex items-center px-3 rounded-lg bg-muted text-foreground font-semibold">
              {estimated} kcal
            </div>
          </div>
        </div>

        {/* Gym exercises */}
        {type === "gym" && (
          <div className="space-y-3 pt-2 border-t border-border/50">
            <div className="flex items-center justify-between">
              <Label className="text-base">Exercises</Label>
              <Button variant="outline" size="sm" onClick={addExercise}>
                <Plus className="h-3 w-3 mr-1" /> Add Exercise
              </Button>
            </div>
            {exercises.map((ex, ei) => (
              <div key={ei} className="p-3 rounded-xl bg-muted/50 space-y-2">
                <div className="flex items-center gap-2">
                  <Select value={ex.name} onValueChange={(v) => updateExercise(ei, "name", v)}>
                    <SelectTrigger className="flex-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {gymExerciseOptions.map((o) => (
                        <SelectItem key={o} value={o}>{o}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <button
                    onClick={() => removeExercise(ei)}
                    className="p-1.5 rounded-lg hover:bg-destructive/10 text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                {ex.sets.map((s, si) => (
                  <div key={si} className="flex items-center gap-2 pl-2">
                    <span className="text-xs text-muted-foreground w-12">Set {si + 1}</span>
                    <Input
                      type="number"
                      placeholder="Reps"
                      value={s.reps}
                      onChange={(e) => updateSet(ei, si, "reps", e.target.value)}
                      className="w-20 h-8 text-sm"
                    />
                    <Input
                      type="number"
                      placeholder="Weight"
                      value={s.weight || ""}
                      onChange={(e) => updateSet(ei, si, "weight", e.target.value)}
                      className="w-20 h-8 text-sm"
                    />
                    <span className="text-xs text-muted-foreground">kg</span>
                    {ex.sets.length > 1 && (
                      <button onClick={() => removeSet(ei, si)} className="text-destructive">
                        <Trash2 className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                ))}
                <Button variant="ghost" size="sm" onClick={() => addSet(ei)} className="text-xs">
                  + Add Set
                </Button>
              </div>
            ))}
          </div>
        )}

        <Button onClick={handleAdd} className="gap-2">
          <Plus className="h-4 w-4" /> Log Workout
        </Button>
      </div>

      <div className="stat-card flex items-center justify-between">
        <span className="font-semibold text-foreground">Total Burned Today</span>
        <span className="text-2xl font-bold text-burned">{totalBurned} kcal</span>
      </div>

      <div className="space-y-2">
        {entries.length === 0 && (
          <div className="stat-card text-center text-muted-foreground py-8">
            No workouts logged today. Get moving! 💪
          </div>
        )}
        {entries.map((e) => (
          <div key={e.id} className="stat-card flex items-center justify-between">
            <div>
              <p className="font-medium text-foreground capitalize">
                {workoutTypes.find((w) => w.value === e.type)?.label || e.type}
              </p>
              <p className="text-sm text-muted-foreground">
                {e.duration} min
                {e.exercises ? ` · ${e.exercises.length} exercises` : ""}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-semibold text-foreground">{e.caloriesBurned} kcal</span>
              <button
                onClick={() => { removeWorkout(e.id); reload(); toast("Workout removed"); }}
                className="p-1.5 rounded-lg hover:bg-destructive/10 text-destructive transition-colors"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

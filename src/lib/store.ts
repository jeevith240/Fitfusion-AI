// Simple localStorage-based store for FitFusion data

export interface UserProfile {
  name: string;
  age: number;
  gender: "male" | "female" | "other";
  height: number; // cm
  weight: number; // kg
  activityLevel: "sedentary" | "light" | "moderate" | "active" | "very_active";
  goal: "lose" | "maintain" | "gain";
}

export interface FoodEntry {
  id: string;
  name: string;
  calories: number;
  quantity: number;
  timestamp: string;
}

export interface ExerciseSet {
  reps: number;
  weight?: number;
}

export interface GymExercise {
  name: string;
  sets: ExerciseSet[];
}

export interface WorkoutEntry {
  id: string;
  type: "walking" | "running" | "cycling" | "gym" | "swimming" | "yoga";
  duration: number; // minutes
  caloriesBurned: number;
  exercises?: GymExercise[];
  timestamp: string;
}

export interface WaterEntry {
  id: string;
  amount: number; // ml
  timestamp: string;
}

const getToday = () => new Date().toISOString().split("T")[0];

function getStore<T>(key: string, fallback: T): T {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : fallback;
  } catch {
    return fallback;
  }
}

function setStore<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value));
}

// Profile
export const getProfile = (): UserProfile =>
  getStore("ff_profile", {
    name: "User",
    age: 25,
    gender: "male",
    height: 170,
    weight: 70,
    activityLevel: "moderate",
    goal: "maintain",
  });

export const saveProfile = (p: UserProfile) => setStore("ff_profile", p);

export const calculateBMI = (p: UserProfile) => +(p.weight / (p.height / 100) ** 2).toFixed(1);

export const getBMICategory = (bmi: number) => {
  if (bmi < 18.5) return { label: "Underweight", color: "text-info" };
  if (bmi < 25) return { label: "Normal", color: "text-success" };
  if (bmi < 30) return { label: "Overweight", color: "text-warning" };
  return { label: "Obese", color: "text-destructive" };
};

export const calculateDailyCalories = (p: UserProfile) => {
  const multipliers = { sedentary: 1.2, light: 1.375, moderate: 1.55, active: 1.725, very_active: 1.9 };
  const bmr = p.gender === "male"
    ? 10 * p.weight + 6.25 * p.height - 5 * p.age + 5
    : 10 * p.weight + 6.25 * p.height - 5 * p.age - 161;
  let tdee = bmr * multipliers[p.activityLevel];
  if (p.goal === "lose") tdee -= 500;
  if (p.goal === "gain") tdee += 300;
  return Math.round(tdee);
};

// Food
export const getFoodLog = (date?: string): FoodEntry[] =>
  getStore(`ff_food_${date || getToday()}`, []);

export const addFoodEntry = (entry: Omit<FoodEntry, "id" | "timestamp">, date?: string) => {
  const d = date || getToday();
  const log = getFoodLog(d);
  log.push({ ...entry, id: crypto.randomUUID(), timestamp: new Date().toISOString() });
  setStore(`ff_food_${d}`, log);
  updateStreak();
};

export const removeFoodEntry = (id: string, date?: string) => {
  const d = date || getToday();
  setStore(`ff_food_${d}`, getFoodLog(d).filter((e) => e.id !== id));
};

// Workouts
export const getWorkouts = (date?: string): WorkoutEntry[] =>
  getStore(`ff_workouts_${date || getToday()}`, []);

export const addWorkout = (entry: Omit<WorkoutEntry, "id" | "timestamp">, date?: string) => {
  const d = date || getToday();
  const log = getWorkouts(d);
  log.push({ ...entry, id: crypto.randomUUID(), timestamp: new Date().toISOString() });
  setStore(`ff_workouts_${d}`, log);
  updateStreak();
};

export const removeWorkout = (id: string, date?: string) => {
  const d = date || getToday();
  setStore(`ff_workouts_${d}`, getWorkouts(d).filter((e) => e.id !== id));
};

// Water
export const getWaterLog = (date?: string): WaterEntry[] =>
  getStore(`ff_water_${date || getToday()}`, []);

export const addWater = (amount: number, date?: string) => {
  const d = date || getToday();
  const log = getWaterLog(d);
  log.push({ id: crypto.randomUUID(), amount, timestamp: new Date().toISOString() });
  setStore(`ff_water_${d}`, log);
  updateStreak();
};

export const getTotalWater = (date?: string) =>
  getWaterLog(date).reduce((sum, e) => sum + e.amount, 0);

// Calorie helpers
export const getCaloriesConsumed = (date?: string) =>
  getFoodLog(date).reduce((sum, e) => sum + e.calories * e.quantity, 0);

export const getCaloriesBurned = (date?: string) =>
  getWorkouts(date).reduce((sum, e) => sum + e.caloriesBurned, 0);

// Workout calorie estimation
export const estimateCaloriesBurned = (type: WorkoutEntry["type"], durationMin: number, weightKg: number) => {
  const metMap = { walking: 3.5, running: 8, cycling: 6, gym: 5, swimming: 7, yoga: 2.5 };
  return Math.round((metMap[type] * weightKg * durationMin) / 60);
};

// Streak system
export const getStreak = (): number => {
  const streakData = getStore<{ lastDate: string; count: number }>("ff_streak", { lastDate: "", count: 0 });
  const today = getToday();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split("T")[0];

  if (streakData.lastDate === today) return streakData.count;
  if (streakData.lastDate === yesterdayStr) return streakData.count; // Still valid, not yet logged today
  return 0; // Streak broken
};

const updateStreak = () => {
  const today = getToday();
  const streakData = getStore<{ lastDate: string; count: number }>("ff_streak", { lastDate: "", count: 0 });

  if (streakData.lastDate === today) return; // Already counted today

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split("T")[0];

  const newCount = streakData.lastDate === yesterdayStr ? streakData.count + 1 : 1;
  setStore("ff_streak", { lastDate: today, count: newCount });
};

// Weekly data for charts
export const getWeeklyData = () => {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const result = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().split("T")[0];
    result.push({
      day: days[d.getDay()],
      consumed: getCaloriesConsumed(key),
      burned: getCaloriesBurned(key),
      water: getTotalWater(key),
    });
  }
  return result;
};

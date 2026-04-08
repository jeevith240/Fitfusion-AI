import { useState, useEffect } from "react";
import { User, Save } from "lucide-react";
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
  getProfile,
  saveProfile,
  calculateBMI,
  getBMICategory,
  calculateDailyCalories,
  UserProfile,
} from "@/lib/store";

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile>(getProfile());

  useEffect(() => setProfile(getProfile()), []);

  const bmi = calculateBMI(profile);
  const bmiCat = getBMICategory(bmi);
  const dailyCal = calculateDailyCalories(profile);

  const update = (field: keyof UserProfile, value: string | number) => {
    setProfile((p) => ({ ...p, [field]: value }));
  };

  const handleSave = () => {
    saveProfile(profile);
    toast.success("Profile saved!");
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <User className="h-6 w-6 text-primary" /> Profile
        </h1>
        <p className="text-muted-foreground mt-1">Manage your personal information</p>
      </div>

      <div className="stat-card space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label>Name</Label>
            <Input value={profile.name} onChange={(e) => update("name", e.target.value)} />
          </div>
          <div>
            <Label>Age</Label>
            <Input type="number" value={profile.age} onChange={(e) => update("age", Number(e.target.value))} />
          </div>
          <div>
            <Label>Gender</Label>
            <Select value={profile.gender} onValueChange={(v) => update("gender", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Height (cm)</Label>
            <Input type="number" value={profile.height} onChange={(e) => update("height", Number(e.target.value))} />
          </div>
          <div>
            <Label>Weight (kg)</Label>
            <Input type="number" value={profile.weight} onChange={(e) => update("weight", Number(e.target.value))} />
          </div>
          <div>
            <Label>Activity Level</Label>
            <Select value={profile.activityLevel} onValueChange={(v) => update("activityLevel", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="sedentary">Sedentary</SelectItem>
                <SelectItem value="light">Lightly Active</SelectItem>
                <SelectItem value="moderate">Moderately Active</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="very_active">Very Active</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Goal</Label>
            <Select value={profile.goal} onValueChange={(v) => update("goal", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="lose">Lose Weight</SelectItem>
                <SelectItem value="maintain">Maintain Weight</SelectItem>
                <SelectItem value="gain">Gain Weight</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <Button onClick={handleSave} className="gap-2">
          <Save className="h-4 w-4" /> Save Profile
        </Button>
      </div>

      {/* Auto-calculated stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="stat-card text-center">
          <p className="text-sm text-muted-foreground">BMI</p>
          <p className="text-3xl font-bold text-foreground mt-1">{bmi}</p>
          <p className={`text-sm font-medium mt-1 ${bmiCat.color}`}>{bmiCat.label}</p>
        </div>
        <div className="stat-card text-center">
          <p className="text-sm text-muted-foreground">Daily Target</p>
          <p className="text-3xl font-bold text-foreground mt-1">{dailyCal}</p>
          <p className="text-sm text-muted-foreground mt-1">kcal / day</p>
        </div>
      </div>
    </div>
  );
}

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppLayout } from "@/components/AppLayout";
import { useEffect, useState } from "react";
import { initTheme } from "@/lib/theme";
import { supabase } from "@/integrations/supabase/client";
import { saveProfile } from "@/lib/store";
import type { Session } from "@supabase/supabase-js";

import DashboardPage from "./pages/DashboardPage";
import FoodPage from "./pages/FoodPage";
import WorkoutsPage from "./pages/WorkoutsPage";
import WaterPage from "./pages/WaterPage";
import ReportsPage from "./pages/ReportsPage";
import ProfilePage from "./pages/ProfilePage";
import AIDietPage from "./pages/AIDietPage";
import AuthPage from "./pages/AuthPage";
import OnboardingPage from "./pages/OnboardingPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function AppContent() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [onboardingDone, setOnboardingDone] = useState<boolean | null>(null);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        syncProfile(session.user.id);
      } else {
        setOnboardingDone(null);
        setLoading(false);
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        syncProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const syncProfile = async (userId: string) => {
    try {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", userId)
        .single();
      if (data) {
        // Sync Supabase profile to localStorage for offline use
        saveProfile({
          name: data.name || "User",
          age: data.age || 25,
          gender: (data.gender as "male" | "female" | "other") || "male",
          height: Number(data.height) || 170,
          weight: Number(data.weight) || 70,
          activityLevel: (data.activity_level as any) || "moderate",
          goal: (data.goal as any) || "maintain",
        });
        setOnboardingDone(data.onboarding_completed ?? false);
      } else {
        setOnboardingDone(false);
      }
    } catch {
      setOnboardingDone(false);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="h-10 w-10 rounded-xl bg-primary animate-pulse" />
      </div>
    );
  }

  if (!session) return <AuthPage />;

  if (!onboardingDone) {
    return (
      <OnboardingPage
        userId={session.user.id}
        onComplete={() => {
          // Re-sync after onboarding
          syncProfile(session.user.id);
        }}
      />
    );
  }

  return (
    <AppLayout>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/food" element={<FoodPage />} />
        <Route path="/workouts" element={<WorkoutsPage />} />
        <Route path="/water" element={<WaterPage />} />
        <Route path="/ai-diet" element={<AIDietPage />} />
        <Route path="/reports" element={<ReportsPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AppLayout>
  );
}

const App = () => {
  useEffect(() => { initTheme(); }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Sonner />
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;

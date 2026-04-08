import { useState, useEffect, useRef } from "react";
import { Plus, Trash2, UtensilsCrossed, Camera, Upload, X, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import {
  getFoodLog,
  addFoodEntry,
  removeFoodEntry,
  getCaloriesConsumed,
  FoodEntry,
} from "@/lib/store";

interface DetectedItem {
  name: string;
  calories: number;
  quantity: number;
}

export default function FoodPage() {
  const [entries, setEntries] = useState<FoodEntry[]>([]);
  const [name, setName] = useState("");
  const [calories, setCalories] = useState("");
  const [quantity, setQuantity] = useState("1");

  // AI detection state
  const [detecting, setDetecting] = useState(false);
  const [detectedItems, setDetectedItems] = useState<DetectedItem[]>([]);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const reload = () => setEntries(getFoodLog());
  useEffect(reload, []);
  useEffect(() => () => stopCamera(), []);

  const total = getCaloriesConsumed();

  const handleAdd = () => {
    if (!name.trim() || !calories) {
      toast.error("Please fill in food name and calories");
      return;
    }
    addFoodEntry({
      name: name.trim(),
      calories: Number(calories),
      quantity: Number(quantity) || 1,
    });
    setName("");
    setCalories("");
    setQuantity("1");
    reload();
    toast.success("Food added!");
  };

  const handleRemove = (id: string) => {
    removeFoodEntry(id);
    reload();
    toast("Entry removed");
  };

  // Convert file/blob to base64 data URL
  const toBase64 = (file: Blob): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  // Send image to AI detection
  const detectFood = async (base64: string) => {
    setDetecting(true);
    setDetectedItems([]);
    setPreviewUrl(base64);
    try {
      const { data, error } = await supabase.functions.invoke("detect-food", {
        body: { image: base64 },
      });
      if (error) throw error;
      if (data?.items?.length) {
        setDetectedItems(data.items);
        toast.success(`Detected ${data.items.length} food item(s)!`);
      } else {
        toast.error("Could not detect any food in the image");
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || "Failed to analyze image");
    } finally {
      setDetecting(false);
    }
  };

  // File upload handler
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }
    const base64 = await toBase64(file);
    await detectFood(base64);
    e.target.value = "";
  };

  // Camera
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      streamRef.current = stream;
      setShowCamera(true);
      setTimeout(() => {
        if (videoRef.current) videoRef.current.srcObject = stream;
      }, 100);
    } catch {
      toast.error("Could not access camera");
    }
  };

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setShowCamera(false);
  };

  const capturePhoto = async () => {
    if (!videoRef.current) return;
    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    canvas.getContext("2d")!.drawImage(videoRef.current, 0, 0);
    const base64 = canvas.toDataURL("image/jpeg", 0.8);
    stopCamera();
    await detectFood(base64);
  };

  const addDetectedItem = (item: DetectedItem) => {
    addFoodEntry({ name: item.name, calories: item.calories, quantity: item.quantity });
    setDetectedItems((prev) => prev.filter((i) => i !== item));
    reload();
    toast.success(`${item.name} added!`);
  };

  const addAllDetected = () => {
    detectedItems.forEach((item) =>
      addFoodEntry({ name: item.name, calories: item.calories, quantity: item.quantity })
    );
    setDetectedItems([]);
    setPreviewUrl(null);
    reload();
    toast.success("All items added!");
  };

  const dismissDetection = () => {
    setDetectedItems([]);
    setPreviewUrl(null);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <UtensilsCrossed className="h-6 w-6 text-calories" /> Food Log
        </h1>
        <p className="text-muted-foreground mt-1">Track your daily calorie intake</p>
      </div>

      {/* AI Food Detection */}
      <div className="stat-card space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-foreground">AI Food Detection</h3>
        </div>
        <p className="text-sm text-muted-foreground">
          Take a photo or upload an image — AI will detect the food and estimate calories automatically.
        </p>

        {/* Camera view */}
        {showCamera && (
          <div className="relative rounded-xl overflow-hidden bg-muted">
            <video ref={videoRef} autoPlay playsInline className="w-full max-h-64 object-cover" />
            <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-3">
              <Button onClick={capturePhoto} size="lg" className="rounded-full gap-2">
                <Camera className="h-5 w-5" /> Capture
              </Button>
              <Button onClick={stopCamera} variant="secondary" size="lg" className="rounded-full">
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>
        )}

        {/* Buttons */}
        {!showCamera && !detecting && (
          <div className="flex gap-3">
            <Button variant="outline" onClick={startCamera} className="gap-2 flex-1">
              <Camera className="h-4 w-4" /> Take Photo
            </Button>
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              className="gap-2 flex-1"
            >
              <Upload className="h-4 w-4" /> Upload Image
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileUpload}
            />
          </div>
        )}

        {/* Loading */}
        {detecting && (
          <div className="flex flex-col items-center py-8 gap-3">
            <Loader2 className="h-8 w-8 text-primary animate-spin" />
            <p className="text-sm text-muted-foreground">Analyzing your food...</p>
          </div>
        )}

        {/* Preview + results */}
        {previewUrl && !detecting && detectedItems.length > 0 && (
          <div className="space-y-3">
            <img
              src={previewUrl}
              alt="Food preview"
              className="w-full max-h-48 object-cover rounded-xl"
            />
            <div className="space-y-2">
              {detectedItems.map((item, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-3 rounded-xl bg-muted/50"
                >
                  <div>
                    <p className="font-medium text-foreground">{item.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {item.calories} kcal × {item.quantity}
                    </p>
                  </div>
                  <Button size="sm" onClick={() => addDetectedItem(item)} className="gap-1">
                    <Plus className="h-3 w-3" /> Add
                  </Button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <Button onClick={addAllDetected} className="gap-2 flex-1">
                <Plus className="h-4 w-4" /> Add All to Log
              </Button>
              <Button variant="outline" onClick={dismissDetection}>
                Dismiss
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Manual Add Form */}
      <div className="stat-card space-y-4">
        <h3 className="font-semibold text-foreground">Add Manually</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <Label htmlFor="food-name">Food Name</Label>
            <Input
              id="food-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Chicken Breast"
            />
          </div>
          <div>
            <Label htmlFor="food-cal">Calories</Label>
            <Input
              id="food-cal"
              type="number"
              value={calories}
              onChange={(e) => setCalories(e.target.value)}
              placeholder="e.g. 250"
            />
          </div>
          <div>
            <Label htmlFor="food-qty">Quantity</Label>
            <Input
              id="food-qty"
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="1"
            />
          </div>
        </div>
        <Button onClick={handleAdd} className="gap-2">
          <Plus className="h-4 w-4" /> Add to Log
        </Button>
      </div>

      {/* Total */}
      <div className="stat-card flex items-center justify-between">
        <span className="font-semibold text-foreground">Total Today</span>
        <span className="text-2xl font-bold text-calories">{total} kcal</span>
      </div>

      {/* Entries */}
      <div className="space-y-2">
        {entries.length === 0 && (
          <div className="stat-card text-center text-muted-foreground py-8">
            No food logged today. Start adding meals above!
          </div>
        )}
        {entries.map((e) => (
          <div key={e.id} className="stat-card flex items-center justify-between">
            <div>
              <p className="font-medium text-foreground">{e.name}</p>
              <p className="text-sm text-muted-foreground">
                {e.calories} kcal × {e.quantity}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-semibold text-foreground">{e.calories * e.quantity} kcal</span>
              <button
                onClick={() => handleRemove(e.id)}
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

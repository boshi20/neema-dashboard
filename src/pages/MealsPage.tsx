import { useState } from "react";
import OmrSymbol from "@/components/OmrSymbol";
import { useTranslation } from "react-i18next";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Search, Clock, Loader2, Pencil, Trash2 } from "lucide-react";
import { Meal } from "@/types/meal";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/hooks/useLanguage";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import ImageUpload from "@/components/ImageUpload";
import {
  createMeal,
  deleteMeal,
  listMeals,
  setMealAvailability,
  updateMeal,
  uploadImage,
  type MealInput,
} from "@/lib/api";

function todayLocal(): string {
  const d = new Date();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

const emptyForm = () => ({
  name: "", nameAr: "", description: "", descriptionAr: "", originalPrice: "", discountedPrice: "",
  quantity: "", category: "mainCourse", pickupDate: todayLocal(), pickupFrom: "", pickupTo: "", image: "",
});

const MealsPage = () => {
  const { t } = useTranslation();
  const { isRTL, currentLanguage } = useLanguage();
  const isAr = currentLanguage === "ar";
  const { toast } = useToast();
  const { restaurant, session } = useAuth();
  const queryClient = useQueryClient();
  const restaurantId = restaurant?.id;

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingMeal, setEditingMeal] = useState<Meal | null>(null);
  const [form, setForm] = useState(emptyForm());

  const { data: meals = [], isLoading } = useQuery({
    queryKey: ["meals", restaurantId],
    queryFn: () => listMeals(restaurantId!),
    enabled: Boolean(restaurantId),
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["meals", restaurantId] });

  const onError = (error: unknown) => {
    const message = error instanceof Error ? error.message : String(error);
    toast({ title: t("common.noResults"), description: message, variant: "destructive" });
  };

  const saveMutation = useMutation({
    mutationFn: async (input: MealInput) => {
      if (editingMeal) return updateMeal(editingMeal.id, input);
      return createMeal(restaurantId!, input);
    },
    onSuccess: () => {
      toast({ title: editingMeal ? t("meals.editMeal") : t("meals.addMeal"), description: form.name });
      setDialogOpen(false);
      void invalidate();
    },
    onError,
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, available }: { id: string; available: boolean }) =>
      setMealAvailability(id, available),
    onSuccess: () => void invalidate(),
    onError,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteMeal(id),
    onSuccess: () => {
      toast({ title: t("meals.deleteMeal"), variant: "destructive" });
      void invalidate();
    },
    onError,
  });

  const categories = [
    "all", "appetizers", "mainCourse", "desserts", "beverages", "bakery", "salads",
  ];

  const timeOptions = Array.from({ length: 48 }, (_, i) => {
    const h = String(Math.floor(i / 2)).padStart(2, "0");
    const m = i % 2 === 0 ? "00" : "30";
    return `${h}:${m}`;
  });

  const filtered = meals.filter((m) => {
    const matchSearch = m.name.toLowerCase().includes(search.toLowerCase());
    const matchCategory = categoryFilter === "all" || m.category === categoryFilter;
    return matchSearch && matchCategory;
  });

  const openAdd = () => {
    setEditingMeal(null);
    setForm(emptyForm());
    setDialogOpen(true);
  };

  const openEdit = (meal: Meal) => {
    setEditingMeal(meal);
    setForm({
      name: meal.name, nameAr: meal.nameAr, description: meal.description, descriptionAr: meal.descriptionAr,
      originalPrice: String(meal.originalPrice), discountedPrice: String(meal.discountedPrice),
      quantity: String(meal.quantity), category: meal.category,
      pickupDate: meal.pickupDate || todayLocal(),
      pickupFrom: meal.pickupFrom, pickupTo: meal.pickupTo, image: meal.image,
    });
    setDialogOpen(true);
  };

  const canSave =
    Boolean(restaurantId) &&
    form.name.trim().length >= 2 &&
    Number(form.originalPrice) > 0 &&
    Number(form.discountedPrice) > 0 &&
    Number(form.discountedPrice) <= Number(form.originalPrice) &&
    Number(form.quantity) > 0 &&
    Boolean(form.pickupDate) &&
    Boolean(form.pickupFrom) &&
    Boolean(form.pickupTo) &&
    !saveMutation.isPending;

  const handleSave = () => {
    if (!canSave) return;
    saveMutation.mutate({
      name: form.name.trim(),
      nameAr: form.nameAr.trim(),
      description: form.description.trim(),
      descriptionAr: form.descriptionAr.trim(),
      originalPrice: Number(form.originalPrice),
      discountedPrice: Number(form.discountedPrice),
      quantity: Number(form.quantity),
      category: form.category,
      image: form.image,
      pickupDate: form.pickupDate,
      pickupFrom: form.pickupFrom,
      pickupTo: form.pickupTo,
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between animate-slide-up">
          <h1 className="text-3xl font-bold text-foreground">{t("meals.title")}</h1>
          <Button onClick={openAdd} className="gap-2 gradient-primary shadow-glow hover:opacity-90 transition-opacity">
            <Plus className="h-4 w-4" />
            {t("meals.addMeal")}
          </Button>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className={cn("absolute top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground", isRTL ? "right-3" : "left-3")} />
            <Input placeholder={t("common.search")} value={search} onChange={(e) => setSearch(e.target.value)} className={cn(isRTL ? "pr-10" : "pl-10")} />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full sm:w-48"><SelectValue /></SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat}>{t(`meals.categories.${cat}`)}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-12 text-center text-muted-foreground">{t("meals.noMeals")}</div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((meal, i) => (
              <Card key={meal.id} className="overflow-hidden animate-scale-in group" style={{ animationDelay: `${i * 60}ms`, animationFillMode: "both" }}>
                <div className="h-36 bg-accent/50 flex items-center justify-center overflow-hidden">
                  {meal.image ? (
                    <img src={meal.image} alt={meal.name} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
                  ) : (
                    <span className="text-4xl">🍽️</span>
                  )}
                </div>
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-foreground">{isAr && meal.nameAr ? meal.nameAr : meal.name}</h3>
                      <p className="text-xs text-muted-foreground line-clamp-2">{isAr && meal.descriptionAr ? meal.descriptionAr : meal.description}</p>
                    </div>
                    <Badge variant={meal.available ? "default" : "secondary"}>
                      {meal.available ? t("common.available") : t("common.unavailable")}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-primary inline-flex items-center gap-1"><OmrSymbol size={15} /> {meal.discountedPrice}</span>
                    <span className="text-sm text-muted-foreground line-through inline-flex items-center gap-1"><OmrSymbol size={12} muted /> {meal.originalPrice}</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {meal.pickupDate} · {meal.pickupFrom} - {meal.pickupTo}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {t("meals.availableQuantity")}: {meal.availableQuantity}
                  </div>
                  <div className="flex items-center justify-between border-t border-border pt-3">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={meal.available}
                        disabled={toggleMutation.isPending}
                        onCheckedChange={(checked) => toggleMutation.mutate({ id: meal.id, available: checked })}
                      />
                      <span className="text-xs text-muted-foreground">{t("meals.availability")}</span>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(meal)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        disabled={deleteMutation.isPending}
                        onClick={() => deleteMutation.mutate(meal.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>{editingMeal ? t("meals.editMeal") : t("meals.addMeal")}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <ImageUpload
                value={form.image}
                onChange={(url) => setForm({ ...form, image: url })}
                onUpload={session ? (file) => uploadImage(file, session.user.id) : undefined}
                label={t("meals.mealPhoto")}
              />
              <div className="grid gap-2">
                <Label>{t("meals.mealName")}</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div className="grid gap-2">
                <Label>{t("meals.mealNameAr")}</Label>
                <Input value={form.nameAr} onChange={(e) => setForm({ ...form, nameAr: e.target.value })} dir="rtl" />
              </div>
              <div className="grid gap-2">
                <Label>{t("meals.description")}</Label>
                <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </div>
              <div className="grid gap-2">
                <Label>{t("meals.descriptionAr")}</Label>
                <Textarea value={form.descriptionAr} onChange={(e) => setForm({ ...form, descriptionAr: e.target.value })} dir="rtl" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>{t("meals.originalPrice")}</Label>
                  <Input type="number" value={form.originalPrice} onChange={(e) => setForm({ ...form, originalPrice: e.target.value })} />
                </div>
                <div className="grid gap-2">
                  <Label>{t("meals.discountedPrice")}</Label>
                  <Input type="number" value={form.discountedPrice} onChange={(e) => setForm({ ...form, discountedPrice: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>{t("meals.quantity")}</Label>
                  <Input type="number" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} />
                </div>
                <div className="grid gap-2">
                  <Label>{t("meals.category")}</Label>
                  <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {categories.filter((c) => c !== "all").map((cat) => (
                        <SelectItem key={cat} value={cat}>{t(`meals.categories.${cat}`)}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid gap-2">
                <Label>{t("meals.pickupDate")}</Label>
                <Input type="date" value={form.pickupDate} onChange={(e) => setForm({ ...form, pickupDate: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>{t("meals.pickupFrom")}</Label>
                  <Select value={form.pickupFrom} onValueChange={(v) => setForm({ ...form, pickupFrom: v })}>
                    <SelectTrigger><SelectValue placeholder="--:--" /></SelectTrigger>
                    <SelectContent className="max-h-48">
                      {timeOptions.map((time) => (
                        <SelectItem key={time} value={time}>{time}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>{t("meals.pickupTo")}</Label>
                  <Select value={form.pickupTo} onValueChange={(v) => setForm({ ...form, pickupTo: v })}>
                    <SelectTrigger><SelectValue placeholder="--:--" /></SelectTrigger>
                    <SelectContent className="max-h-48">
                      {timeOptions.map((time) => (
                        <SelectItem key={time} value={time}>{time}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>{t("common.cancel")}</Button>
              <Button onClick={handleSave} disabled={!canSave}>
                {saveMutation.isPending ? t("common.loading") : t("common.save")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default MealsPage;

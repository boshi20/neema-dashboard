import { useState } from "react";
import { useTranslation } from "react-i18next";
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
import { Plus, Search, Clock, Pencil, Trash2 } from "lucide-react";
import { mockMeals } from "@/data/mockData";
import { Meal } from "@/types/meal";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/hooks/useLanguage";
import { useToast } from "@/hooks/use-toast";
import ImageUpload from "@/components/ImageUpload";

const MealsPage = () => {
  const { t } = useTranslation();
  const { isRTL } = useLanguage();
  const { toast } = useToast();
  const [meals, setMeals] = useState<Meal[]>(mockMeals);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingMeal, setEditingMeal] = useState<Meal | null>(null);
  const [form, setForm] = useState({
    name: "", description: "", originalPrice: "", discountedPrice: "",
    quantity: "", category: "mainCourse", pickupFrom: "", pickupTo: "", image: "",
  });

  const categories = [
    "all", "appetizers", "mainCourse", "desserts", "beverages", "bakery", "salads",
  ];

  const filtered = meals.filter((m) => {
    const matchSearch = m.name.toLowerCase().includes(search.toLowerCase());
    const matchCategory = categoryFilter === "all" || m.category === categoryFilter;
    return matchSearch && matchCategory;
  });

  const openAdd = () => {
    setEditingMeal(null);
    setForm({
      name: "", description: "", originalPrice: "", discountedPrice: "",
      quantity: "", category: "mainCourse", pickupFrom: "", pickupTo: "", image: "",
    });
    setDialogOpen(true);
  };

  const openEdit = (meal: Meal) => {
    setEditingMeal(meal);
    setForm({
      name: meal.name, description: meal.description,
      originalPrice: String(meal.originalPrice), discountedPrice: String(meal.discountedPrice),
      quantity: String(meal.quantity), category: meal.category,
      pickupFrom: meal.pickupFrom, pickupTo: meal.pickupTo, image: meal.image,
    });
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!form.name || !form.originalPrice || !form.discountedPrice) return;
    if (editingMeal) {
      setMeals((prev) =>
        prev.map((m) =>
          m.id === editingMeal.id
            ? { ...m, name: form.name, description: form.description,
                originalPrice: Number(form.originalPrice), discountedPrice: Number(form.discountedPrice),
                quantity: Number(form.quantity), category: form.category,
                pickupFrom: form.pickupFrom, pickupTo: form.pickupTo, image: form.image }
            : m
        )
      );
      toast({ title: t("meals.editMeal"), description: form.name });
    } else {
      const newMeal: Meal = {
        id: String(Date.now()), name: form.name, description: form.description,
        originalPrice: Number(form.originalPrice), discountedPrice: Number(form.discountedPrice),
        quantity: Number(form.quantity), availableQuantity: Number(form.quantity),
        category: form.category, image: form.image, available: true,
        pickupFrom: form.pickupFrom, pickupTo: form.pickupTo,
        createdAt: new Date().toISOString().split("T")[0],
      };
      setMeals((prev) => [newMeal, ...prev]);
      toast({ title: t("meals.addMeal"), description: form.name });
    }
    setDialogOpen(false);
  };

  const toggleAvailability = (id: string) =>
    setMeals((prev) => prev.map((m) => (m.id === id ? { ...m, available: !m.available } : m)));

  const deleteMeal = (id: string) => {
    setMeals((prev) => prev.filter((m) => m.id !== id));
    toast({ title: t("meals.deleteMeal"), variant: "destructive" });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-2xl font-bold text-foreground">{t("meals.title")}</h1>
          <Button onClick={openAdd} className="gap-2">
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

        {filtered.length === 0 ? (
          <div className="py-12 text-center text-muted-foreground">{t("meals.noMeals")}</div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((meal) => (
              <Card key={meal.id} className="overflow-hidden">
                <div className="h-32 bg-accent flex items-center justify-center overflow-hidden">
                  {meal.image ? (
                    <img src={meal.image} alt={meal.name} className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-4xl">🍽️</span>
                  )}
                </div>
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-foreground">{meal.name}</h3>
                      <p className="text-xs text-muted-foreground line-clamp-2">{meal.description}</p>
                    </div>
                    <Badge variant={meal.available ? "default" : "secondary"}>
                      {meal.available ? t("common.available") : t("common.unavailable")}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-primary">{meal.discountedPrice} <OmrSymbol size={14} /></span>
                    <span className="text-sm text-muted-foreground line-through">{meal.originalPrice} <OmrSymbol size={12} /></span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {meal.pickupFrom} - {meal.pickupTo}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {t("meals.availableQuantity")}: {meal.availableQuantity}/{meal.quantity}
                  </div>
                  <div className="flex items-center justify-between border-t border-border pt-3">
                    <div className="flex items-center gap-2">
                      <Switch checked={meal.available} onCheckedChange={() => toggleAvailability(meal.id)} />
                      <span className="text-xs text-muted-foreground">{t("meals.availability")}</span>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(meal)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => deleteMeal(meal.id)}>
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
                label={t("meals.mealPhoto")}
              />
              <div className="grid gap-2">
                <Label>{t("meals.mealName")}</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div className="grid gap-2">
                <Label>{t("meals.description")}</Label>
                <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
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
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>{t("meals.pickupFrom")}</Label>
                  <Input type="time" value={form.pickupFrom} onChange={(e) => setForm({ ...form, pickupFrom: e.target.value })} />
                </div>
                <div className="grid gap-2">
                  <Label>{t("meals.pickupTo")}</Label>
                  <Input type="time" value={form.pickupTo} onChange={(e) => setForm({ ...form, pickupTo: e.target.value })} />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>{t("common.cancel")}</Button>
              <Button onClick={handleSave}>{t("common.save")}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default MealsPage;

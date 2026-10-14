import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Minus, UtensilsCrossed } from "lucide-react";
import { AppShell } from "@/components/shell/AppShell";
import {
  PageHeader,
  SearchInput,
  ListingCard,
  EmptyState,
  CardGridSkeleton,
} from "@/components/patterns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ImageUpload from "@/components/ImageUpload";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import type { Meal } from "@/types/meal";
import {
  createMeal,
  deleteMeal,
  listMeals,
  MealStockConflictError,
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

function buildTimeOptions(): string[] {
  const options: string[] = [];
  for (let i = 0; i < 24 * 4; i++) {
    const h = String(Math.floor(i / 4)).padStart(2, "0");
    const m = String((i % 4) * 15).padStart(2, "0");
    options.push(`${h}:${m}`);
  }
  options.push("23:59");
  return options;
}

const TIME_OPTIONS = buildTimeOptions();

type MealFormState = {
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  originalPrice: string;
  discountedPrice: string;
  quantity: string;
  category: string;
  pickupDate: string;
  pickupFrom: string;
  pickupTo: string;
  image: string;
};

const emptyForm = (): MealFormState => ({
  name: "",
  nameAr: "",
  description: "",
  descriptionAr: "",
  originalPrice: "",
  discountedPrice: "",
  quantity: "1",
  category: "mainCourse",
  pickupDate: todayLocal(),
  pickupFrom: "",
  pickupTo: "",
  image: "",
});

function formFromMeal(meal: Meal, pickupDate = meal.pickupDate || todayLocal()): MealFormState {
  return {
    name: meal.name,
    nameAr: meal.nameAr,
    description: meal.description,
    descriptionAr: meal.descriptionAr,
    originalPrice: String(meal.originalPrice),
    discountedPrice: String(meal.discountedPrice),
    quantity: String(meal.quantity),
    category: meal.category,
    pickupDate,
    pickupFrom: meal.pickupFrom,
    pickupTo: meal.pickupTo,
    image: meal.image,
  };
}

function isFormComplete(form: MealFormState): boolean {
  const original = Number(form.originalPrice);
  const discounted = Number(form.discountedPrice);
  const quantity = Number(form.quantity);
  return (
    form.image.trim().length > 0 &&
    form.name.trim().length >= 2 &&
    form.nameAr.trim().length >= 1 &&
    form.description.trim().length >= 1 &&
    form.descriptionAr.trim().length >= 1 &&
    Number.isFinite(original) &&
    original > 0 &&
    Number.isFinite(discounted) &&
    discounted > 0 &&
    discounted <= original &&
    Number.isInteger(quantity) &&
    quantity >= 1 &&
    Boolean(form.category) &&
    form.category !== "all" &&
    Boolean(form.pickupDate) &&
    Boolean(form.pickupFrom) &&
    Boolean(form.pickupTo)
  );
}

type TabKey = "active" | "paused" | "past";

const MealsPage = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { restaurant, session } = useAuth();
  const queryClient = useQueryClient();
  const restaurantId = restaurant?.id;
  const [searchParams, setSearchParams] = useSearchParams();

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [tab, setTab] = useState<TabKey>("active");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingMeal, setEditingMeal] = useState<Meal | null>(null);
  const [isRepost, setIsRepost] = useState(false);
  const [form, setForm] = useState<MealFormState>(emptyForm());
  const [archiveTarget, setArchiveTarget] = useState<Meal | null>(null);

  const { data: meals = [], isLoading } = useQuery({
    queryKey: ["meals", restaurantId],
    queryFn: () => listMeals(restaurantId!),
    enabled: Boolean(restaurantId),
  });

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ["meals", restaurantId] });

  const onError = (error: unknown) => {
    const message = error instanceof Error ? error.message : String(error);
    const title =
      error instanceof MealStockConflictError
        ? t("meals.stockConflictTitle")
        : t("common.noResults");
    toast({ title, description: message, variant: "destructive" });
  };

  const saveMutation = useMutation({
    mutationFn: async (input: MealInput) => {
      if (editingMeal && !isRepost) return updateMeal(editingMeal.id, input);
      return createMeal(restaurantId!, input);
    },
    onSuccess: () => {
      toast({
        title: isRepost
          ? t("meals.repostMeal")
          : editingMeal
            ? t("meals.editMeal")
            : t("meals.addMeal"),
        description: form.name,
      });
      setDialogOpen(false);
      setIsRepost(false);
      setEditingMeal(null);
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
      toast({ title: t("meals.deleteMeal") });
      setArchiveTarget(null);
      void invalidate();
    },
    onError,
  });

  const categories = [
    "all",
    "appetizers",
    "mainCourse",
    "desserts",
    "beverages",
    "bakery",
    "salads",
  ];

  const filtered = useMemo(() => {
    const today = todayLocal();
    return meals.filter((m) => {
      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        m.name.toLowerCase().includes(q) ||
        m.nameAr.toLowerCase().includes(q);
      const matchCategory = categoryFilter === "all" || m.category === categoryFilter;
      if (!matchSearch || !matchCategory) return false;

      const isPast = Boolean(m.pickupDate && m.pickupDate < today);
      if (tab === "active") return m.available && !isPast;
      if (tab === "paused") return !m.available && !isPast;
      return isPast;
    });
  }, [meals, search, categoryFilter, tab]);

  const openAdd = () => {
    setEditingMeal(null);
    setIsRepost(false);
    setForm(emptyForm());
    setDialogOpen(true);
  };

  const openEdit = (meal: Meal) => {
    setEditingMeal(meal);
    setIsRepost(false);
    setForm(formFromMeal(meal));
    setDialogOpen(true);
  };

  const openRepost = (meal: Meal) => {
    setEditingMeal(null);
    setIsRepost(true);
    setForm(formFromMeal(meal, todayLocal()));
    setDialogOpen(true);
  };

  const deepLinkedId = searchParams.get("listing");
  const handledDeepLink = useRef<string | null>(null);
  useEffect(() => {
    if (!deepLinkedId || handledDeepLink.current === deepLinkedId) return;
    const meal = meals.find((m) => m.id === deepLinkedId);
    if (!meal) return;
    handledDeepLink.current = deepLinkedId;
    setEditingMeal(meal);
    setIsRepost(false);
    setForm(formFromMeal(meal));
    setDialogOpen(true);
    const next = new URLSearchParams(searchParams);
    next.delete("listing");
    setSearchParams(next, { replace: true });
  }, [deepLinkedId, meals, searchParams, setSearchParams]);

  const setQuantity = (raw: string | number) => {
    const n = typeof raw === "number" ? raw : Number.parseInt(String(raw), 10);
    if (!Number.isFinite(n) || n < 1) {
      setForm((prev) => ({ ...prev, quantity: "1" }));
      return;
    }
    setForm((prev) => ({ ...prev, quantity: String(Math.floor(n)) }));
  };

  const bumpQuantity = (delta: number) => {
    const current = Number.parseInt(form.quantity, 10);
    const base = Number.isFinite(current) ? current : 1;
    setQuantity(Math.max(1, base + delta));
  };

  const canSave =
    Boolean(restaurantId) && isFormComplete(form) && !saveMutation.isPending;

  const dialogTitle = isRepost
    ? t("meals.repostMeal")
    : editingMeal
      ? t("meals.editMeal")
      : t("meals.addMeal");

  const handleSave = () => {
    if (!isFormComplete(form)) {
      toast({ title: t("meals.fillAllFields"), variant: "destructive" });
      return;
    }
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
    <AppShell title={t("listings.title")}>
      <div className="space-y-6">
        <PageHeader
          title={t("listings.title")}
          actions={
            <Button
              onClick={openAdd}
              className="gap-2 gradient-primary shadow-glow hover:opacity-90"
            >
              <Plus className="h-4 w-4" />
              {t("meals.addMeal")}
            </Button>
          }
        />

        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <SearchInput
            containerClassName="flex-1"
            placeholder={t("listings.searchPlaceholder")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full lg:w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {t(`meals.categories.${cat}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Tabs value={tab} onValueChange={(v) => setTab(v as TabKey)}>
          <TabsList>
            <TabsTrigger value="active">{t("listings.tabActive")}</TabsTrigger>
            <TabsTrigger value="paused">{t("listings.tabPaused")}</TabsTrigger>
            <TabsTrigger value="past">{t("listings.tabPast")}</TabsTrigger>
          </TabsList>
        </Tabs>

        {isLoading ? (
          <CardGridSkeleton count={6} />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={UtensilsCrossed}
            title={t("meals.noMeals")}
            description={t("meals.noMealsBody")}
            actionLabel={t("meals.createFirst")}
            onAction={openAdd}
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {filtered.map((meal) => (
              <ListingCard
                key={meal.id}
                meal={meal}
                onEdit={openEdit}
                onRepost={openRepost}
                onToggle={(m) =>
                  toggleMutation.mutate({ id: m.id, available: !m.available })
                }
                onArchive={(m) => setArchiveTarget(m)}
              />
            ))}
          </div>
        )}

        <Dialog
          open={dialogOpen}
          onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) {
              setIsRepost(false);
              setEditingMeal(null);
            }
          }}
        >
          <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>{dialogTitle}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-2">
              <ImageUpload
                value={form.image}
                onChange={(url) => setForm({ ...form, image: url })}
                onUpload={
                  session ? (file) => uploadImage(file, session.user.id) : undefined
                }
                label={`${t("meals.mealPhoto")} *`}
              />
              <div className="grid gap-1.5">
                <Label>{t("meals.mealName")} *</Label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>
              <div className="grid gap-1.5">
                <Label>{t("meals.mealNameAr")} *</Label>
                <Input
                  value={form.nameAr}
                  onChange={(e) => setForm({ ...form, nameAr: e.target.value })}
                  dir="rtl"
                />
              </div>
              <div className="grid gap-1.5">
                <Label>{t("meals.description")} *</Label>
                <Textarea
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                />
              </div>
              <div className="grid gap-1.5">
                <Label>{t("meals.descriptionAr")} *</Label>
                <Textarea
                  value={form.descriptionAr}
                  onChange={(e) =>
                    setForm({ ...form, descriptionAr: e.target.value })
                  }
                  dir="rtl"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-1.5">
                  <Label>{t("meals.originalPrice")} *</Label>
                  <div className="relative">
                    <Input
                      type="number"
                      inputMode="decimal"
                      step="0.001"
                      min="0"
                      className="pe-12"
                      value={form.originalPrice}
                      onChange={(e) =>
                        setForm({ ...form, originalPrice: e.target.value })
                      }
                    />
                    <span className="pointer-events-none absolute end-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                      {t("meals.omrHint")}
                    </span>
                  </div>
                </div>
                <div className="grid gap-1.5">
                  <Label>{t("meals.discountedPrice")} *</Label>
                  <div className="relative">
                    <Input
                      type="number"
                      inputMode="decimal"
                      step="0.001"
                      min="0"
                      className="pe-12"
                      value={form.discountedPrice}
                      onChange={(e) =>
                        setForm({ ...form, discountedPrice: e.target.value })
                      }
                    />
                    <span className="pointer-events-none absolute end-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                      {t("meals.omrHint")}
                    </span>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-1.5">
                  <Label>{t("meals.quantity")} *</Label>
                  <div className="flex items-center gap-1">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="shrink-0"
                      onClick={() => bumpQuantity(-1)}
                      disabled={Number(form.quantity) <= 1}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <Input
                      type="number"
                      inputMode="numeric"
                      min={1}
                      step={1}
                      className="text-center"
                      value={form.quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="shrink-0"
                      onClick={() => bumpQuantity(1)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="grid gap-1.5">
                  <Label>{t("meals.category")} *</Label>
                  <Select
                    value={form.category}
                    onValueChange={(v) => setForm({ ...form, category: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories
                        .filter((c) => c !== "all")
                        .map((cat) => (
                          <SelectItem key={cat} value={cat}>
                            {t(`meals.categories.${cat}`)}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid gap-1.5">
                <Label>{t("meals.pickupDate")} *</Label>
                <Input
                  type="date"
                  value={form.pickupDate}
                  onChange={(e) =>
                    setForm({ ...form, pickupDate: e.target.value })
                  }
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-1.5">
                  <Label>{t("meals.pickupFrom")} *</Label>
                  <Select
                    value={form.pickupFrom}
                    onValueChange={(v) => setForm({ ...form, pickupFrom: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="--:--" />
                    </SelectTrigger>
                    <SelectContent className="max-h-48">
                      {TIME_OPTIONS.map((time) => (
                        <SelectItem key={`from-${time}`} value={time}>
                          {time}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-1.5">
                  <Label>{t("meals.pickupTo")} *</Label>
                  <Select
                    value={form.pickupTo}
                    onValueChange={(v) => setForm({ ...form, pickupTo: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="--:--" />
                    </SelectTrigger>
                    <SelectContent className="max-h-48">
                      {TIME_OPTIONS.map((time) => (
                        <SelectItem key={`to-${time}`} value={time}>
                          {time}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                {t("common.cancel")}
              </Button>
              <Button
                onClick={handleSave}
                disabled={!canSave}
                className="gradient-primary shadow-glow hover:opacity-90"
              >
                {saveMutation.isPending ? t("common.loading") : t("common.save")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <AlertDialog
          open={Boolean(archiveTarget)}
          onOpenChange={(open) => {
            if (!open) setArchiveTarget(null);
          }}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t("meals.deleteMeal")}</AlertDialogTitle>
              <AlertDialogDescription>
                {t("meals.confirmDelete")}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
              <AlertDialogAction
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                onClick={() => {
                  if (archiveTarget) deleteMutation.mutate(archiveTarget.id);
                }}
              >
                {t("listings.archive")}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AppShell>
  );
};

export default MealsPage;

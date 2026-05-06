import type { Category } from "@/types";
import { Sparkles, Wrench, Dog, Trees, Truck, GraduationCap, type LucideIcon } from "lucide-react";

export const CATEGORIES: { id: Category; label: string; icon: LucideIcon; tint: string }[] = [
  { id: "cleaning", label: "Cleaning", icon: Sparkles, tint: "from-rose-200 to-orange-200" },
  { id: "handyman", label: "Handyman", icon: Wrench, tint: "from-amber-200 to-yellow-200" },
  { id: "dog-walking", label: "Dog walking", icon: Dog, tint: "from-emerald-200 to-teal-200" },
  { id: "lawn-care", label: "Lawn & garden", icon: Trees, tint: "from-lime-200 to-green-200" },
  { id: "moving-help", label: "Moving help", icon: Truck, tint: "from-sky-200 to-indigo-200" },
  { id: "tutoring", label: "Tutoring", icon: GraduationCap, tint: "from-fuchsia-200 to-pink-200" },
];

export const CITIES = [
  "Austin, TX",
  "Brooklyn, NY",
  "Denver, CO",
  "Portland, OR",
  "Asheville, NC",
  "Oakland, CA",
];

export function categoryLabel(id: Category) {
  return CATEGORIES.find((c) => c.id === id)?.label ?? id;
}

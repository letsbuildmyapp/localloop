import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { addDoc, collection, doc, getDoc, serverTimestamp, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CATEGORIES, CITIES } from "@/lib/categories";
import type { Category, Listing } from "@/types";
import { toast } from "sonner";

const STOCK_IMAGES: Record<Category, string[]> = {
  cleaning: [
    "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=900&q=80",
    "https://images.unsplash.com/photo-1584622781867-bc4b66e2a637?w=900&q=80",
    "https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?w=900&q=80",
  ],
  handyman: [
    "https://images.unsplash.com/photo-1581244277943-fe4a9c777189?w=900&q=80",
    "https://images.unsplash.com/photo-1572297870735-9483e7d6b58d?w=900&q=80",
    "https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=900&q=80",
  ],
  "dog-walking": [
    "https://images.unsplash.com/photo-1450778869180-41d0601e046e?w=900&q=80",
    "https://images.unsplash.com/photo-1601758124510-52d02ddb7cbd?w=900&q=80",
    "https://images.unsplash.com/photo-1546238232-20216dec9f72?w=900&q=80",
  ],
  "lawn-care": [
    "https://images.unsplash.com/photo-1592417817098-8fd3d9eb14a5?w=900&q=80",
    "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=900&q=80",
    "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=900&q=80",
  ],
  "moving-help": [
    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=900&q=80",
    "https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=900&q=80",
    "https://images.unsplash.com/photo-1557521630-d6e1d4dba74e?w=900&q=80",
  ],
  tutoring: [
    "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=900&q=80",
    "https://images.unsplash.com/photo-1497486751825-1233686d5d80?w=900&q=80",
    "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=900&q=80",
  ],
};

export default function ListingForm({ mode }: { mode: "create" | "edit" }) {
  const { id } = useParams();
  const { profile } = useAuth();
  const nav = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<Category>("cleaning");
  const [city, setCity] = useState(CITIES[0]);
  const [priceDollars, setPriceDollars] = useState(45);
  const [unit, setUnit] = useState<"hour" | "visit" | "project">("hour");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (mode !== "edit" || !id) return;
    (async () => {
      const snap = await getDoc(doc(db, "listings", id));
      if (snap.exists()) {
        const l = snap.data() as Listing;
        setTitle(l.title); setDescription(l.description); setCategory(l.category);
        setCity(l.city); setPriceDollars(Math.round(l.priceCents / 100)); setUnit(l.unit);
      }
    })();
  }, [mode, id]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!profile) return;
    setBusy(true);
    try {
      const data = {
        sellerId: profile.id,
        sellerName: profile.displayName,
        sellerPhoto: profile.photoURL ?? null,
        title, description, category, city,
        priceCents: Math.round(priceDollars * 100),
        unit,
        images: STOCK_IMAGES[category],
        rating: 5.0,
        reviewCount: 0,
        active: true,
        suspended: false,
        createdAt: Date.now(),
      };
      if (mode === "create") {
        const ref = await addDoc(collection(db, "listings"), { ...data, _serverCreatedAt: serverTimestamp() });
        toast.success("Listing published");
        nav(`/listings/${ref.id}`);
      } else if (id) {
        const { sellerId, createdAt, ...patch } = data;
        await updateDoc(doc(db, "listings", id), patch);
        toast.success("Listing updated");
        nav(`/listings/${id}`);
      }
    } catch (e: any) {
      toast.error(e.message ?? "Save failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="container max-w-2xl py-10">
      <h1 className="font-display text-4xl font-semibold">{mode === "create" ? "New listing" : "Edit listing"}</h1>
      <p className="mt-2 text-muted-foreground">Tell neighbors what you offer.</p>
      <form onSubmit={submit} className="mt-8 space-y-5">
        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input id="title" required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Eco-friendly deep clean for small homes" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="desc">Description</Label>
          <Textarea id="desc" required rows={6} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What's included? What sets you apart?" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Category</Label>
            <Select value={category} onValueChange={(v) => setCategory(v as Category)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{CATEGORIES.map((c) => (<SelectItem key={c.id} value={c.id}>{c.label}</SelectItem>))}</SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>City</Label>
            <Select value={city} onValueChange={setCity}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{CITIES.map((c) => (<SelectItem key={c} value={c}>{c}</SelectItem>))}</SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="price">Price (USD)</Label>
            <Input id="price" type="number" min={5} value={priceDollars} onChange={(e) => setPriceDollars(parseInt(e.target.value || "0", 10))} />
          </div>
          <div className="space-y-2">
            <Label>Unit</Label>
            <Select value={unit} onValueChange={(v) => setUnit(v as any)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="hour">per hour</SelectItem>
                <SelectItem value="visit">per visit</SelectItem>
                <SelectItem value="project">per project</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex gap-2">
          <Button type="button" variant="ghost" onClick={() => nav(-1)}>Cancel</Button>
          <Button type="submit" disabled={busy}>{busy ? "Saving…" : mode === "create" ? "Publish listing" : "Save changes"}</Button>
        </div>
      </form>
    </section>
  );
}

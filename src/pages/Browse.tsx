import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Category, Listing } from "@/types";
import { CATEGORIES, CITIES } from "@/lib/categories";
import { ListingCard } from "@/components/ListingCard";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Browse() {
  const [params, setParams] = useSearchParams();
  const [listings, setListings] = useState<Listing[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const category = (params.get("category") ?? "all") as Category | "all";
  const city = params.get("city") ?? "all";
  const maxPrice = parseInt(params.get("max") ?? "0", 10);
  const search = params.get("q") ?? "";

  useEffect(() => {
    (async () => {
      setListings(null);
      setError(null);
      try {
        const base = collection(db, "listings");
        const q = category === "all" ? base : query(base, where("category", "==", category));
        const snap = await getDocs(q);
        const data = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })) as Listing[];
        setListings(data.filter((l) => l.active && !l.suspended));
      } catch (e: any) {
        setError(e.message ?? "Failed to load listings");
        setListings([]);
      }
    })();
  }, [category]);

  const filtered = useMemo(() => {
    if (!listings) return [];
    return listings.filter((l) => {
      if (city !== "all" && l.city !== city) return false;
      if (maxPrice > 0 && l.priceCents > maxPrice * 100) return false;
      if (search && !`${l.title} ${l.description}`.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [listings, city, maxPrice, search]);

  function setParam(k: string, v: string) {
    const p = new URLSearchParams(params);
    if (!v || v === "all" || v === "0") p.delete(k);
    else p.set(k, v);
    setParams(p, { replace: true });
  }

  return (
    <section className="container py-10">
      <header className="flex flex-col gap-2">
        <h1 className="font-display text-4xl font-semibold">Browse local services</h1>
        <p className="text-muted-foreground">Verified neighbors, priced honestly.</p>
      </header>

      {/* Filters */}
      <div className="mt-6 grid gap-3 rounded-lg border bg-card p-4 md:grid-cols-[1fr_180px_180px_140px_auto]">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search 'deep clean', 'leaky faucet'…"
            value={search}
            onChange={(e) => setParam("q", e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={category} onValueChange={(v) => setParam("category", v)}>
          <SelectTrigger><SelectValue placeholder="Category" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {CATEGORIES.map((c) => (<SelectItem key={c.id} value={c.id}>{c.label}</SelectItem>))}
          </SelectContent>
        </Select>
        <Select value={city} onValueChange={(v) => setParam("city", v)}>
          <SelectTrigger><SelectValue placeholder="City" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All cities</SelectItem>
            {CITIES.map((c) => (<SelectItem key={c} value={c}>{c}</SelectItem>))}
          </SelectContent>
        </Select>
        <Input
          inputMode="numeric"
          placeholder="Max $"
          value={maxPrice || ""}
          onChange={(e) => setParam("max", e.target.value.replace(/\D/g, ""))}
        />
        <Button variant="outline" onClick={() => setParams(new URLSearchParams(), { replace: true })}>
          <SlidersHorizontal className="h-4 w-4" /> Reset
        </Button>
      </div>

      {/* Results */}
      <div className="mt-8">
        {error && (
          <div className="rounded-md border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
            {error}
          </div>
        )}
        {listings === null ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="aspect-[4/5] rounded-lg" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-lg border border-dashed p-12 text-center">
            <p className="font-display text-2xl">No matches yet</p>
            <p className="mt-2 text-sm text-muted-foreground">Try widening your filters or browsing a different category.</p>
            <Button className="mt-4" onClick={() => setParams(new URLSearchParams(), { replace: true })}>Clear filters</Button>
          </div>
        ) : (
          <>
            <p className="mb-4 text-sm text-muted-foreground">{filtered.length} {filtered.length === 1 ? "result" : "results"}</p>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((l) => <ListingCard key={l.id} listing={l} />)}
            </div>
          </>
        )}
      </div>
    </section>
  );
}

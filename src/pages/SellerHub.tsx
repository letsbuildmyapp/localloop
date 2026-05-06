import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { collection, doc, getDocs, orderBy, query, updateDoc, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/auth";
import type { Booking, Listing } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/utils";
import { Plus, Pencil, EyeOff, Eye } from "lucide-react";
import { toast } from "sonner";
import { categoryLabel } from "@/lib/categories";

export default function SellerHub() {
  const { profile } = useAuth();
  const nav = useNavigate();
  const [listings, setListings] = useState<Listing[] | null>(null);
  const [bookings, setBookings] = useState<Booking[] | null>(null);

  async function load() {
    if (!profile) return;
    const ls = await getDocs(query(collection(db, "listings"), where("sellerId", "==", profile.id)));
    setListings(ls.docs.map((d) => ({ id: d.id, ...(d.data() as any) })));
    const bs = await getDocs(query(collection(db, "bookings"), where("sellerId", "==", profile.id), orderBy("createdAt", "desc")));
    setBookings(bs.docs.map((d) => ({ id: d.id, ...(d.data() as any) })));
  }
  useEffect(() => { load(); }, [profile]);

  const earnings = useMemo(
    () => (bookings ?? []).filter((b) => b.status === "paid" || b.status === "completed").reduce((s, b) => s + b.totalCents, 0),
    [bookings]
  );
  const pending = (bookings ?? []).filter((b) => b.status === "requested").length;

  async function toggleActive(l: Listing) {
    await updateDoc(doc(db, "listings", l.id), { active: !l.active });
    toast.success(l.active ? "Listing hidden" : "Listing visible");
    load();
  }
  async function respond(b: Booking, status: "accepted" | "declined") {
    await updateDoc(doc(db, "bookings", b.id), { status });
    toast.success(`Booking ${status}`);
    load();
  }

  if (!profile) return null;
  return (
    <section className="container py-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl font-semibold">Seller hub</h1>
          <p className="text-muted-foreground">Your listings, bookings, and earnings.</p>
        </div>
        <Button onClick={() => nav("/seller/new")}><Plus className="h-4 w-4" /> New listing</Button>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        <Card><CardHeader><CardTitle>Earnings (test mode)</CardTitle></CardHeader><CardContent className="text-3xl font-semibold">{formatPrice(earnings)}</CardContent></Card>
        <Card><CardHeader><CardTitle>Pending requests</CardTitle></CardHeader><CardContent className="text-3xl font-semibold">{pending}</CardContent></Card>
        <Card><CardHeader><CardTitle>Active listings</CardTitle></CardHeader><CardContent className="text-3xl font-semibold">{(listings ?? []).filter((l) => l.active).length}</CardContent></Card>
      </div>

      <Card className="mt-8">
        <CardHeader><CardTitle>Incoming requests</CardTitle></CardHeader>
        <CardContent>
          {bookings === null ? (
            <Skeleton className="h-24 w-full" />
          ) : bookings.length === 0 ? (
            <p className="text-sm text-muted-foreground">No bookings yet.</p>
          ) : (
            <ul className="divide-y">
              {bookings.map((b) => (
                <li key={b.id} className="flex flex-wrap items-center gap-4 py-4">
                  <div className="flex-1 min-w-0">
                    <p className="truncate font-semibold">{b.listingTitle}</p>
                    <p className="text-xs tabular-nums text-muted-foreground">{b.buyerName} · {new Date(b.scheduledFor).toLocaleString()} · {b.hours}h</p>
                    {b.notes && <p className="mt-1 text-sm italic text-muted-foreground">"{b.notes}"</p>}
                  </div>
                  <span className="text-sm font-semibold tabular-nums">{formatPrice(b.totalCents)}</span>
                  <Badge variant={b.status === "paid" ? "success" : b.status === "requested" ? "warning" : "outline"}>{b.status}</Badge>
                  {b.status === "requested" && (
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => respond(b, "declined")}>Decline</Button>
                      <Button size="sm" onClick={() => respond(b, "accepted")}>Accept</Button>
                    </div>
                  )}
                  <Button asChild size="sm" variant="ghost"><Link to={`/bookings/${b.id}`}>View</Link></Button>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card className="mt-8">
        <CardHeader><CardTitle>Your listings</CardTitle></CardHeader>
        <CardContent>
          {listings === null ? (
            <Skeleton className="h-24 w-full" />
          ) : listings.length === 0 ? (
            <div className="rounded-md border border-dashed p-10 text-center">
              <p className="font-display text-xl">No listings yet</p>
              <Button className="mt-4" onClick={() => nav("/seller/new")}>Create your first listing</Button>
            </div>
          ) : (
            <ul className="divide-y">
              {listings.map((l) => (
                <li key={l.id} className="flex flex-wrap items-center gap-4 py-4">
                  <img src={l.images[0]} alt={l.title} className="h-14 w-14 rounded-md object-cover" />
                  <div className="flex-1 min-w-0">
                    <p className="truncate font-semibold">{l.title}</p>
                    <p className="text-xs text-muted-foreground">{categoryLabel(l.category)} · {l.city}</p>
                  </div>
                  <span className="text-sm font-semibold tabular-nums">{formatPrice(l.priceCents)}/{l.unit}</span>
                  {l.suspended && <Badge variant="warning">Suspended</Badge>}
                  <Button size="sm" variant="ghost" onClick={() => toggleActive(l)}>
                    {l.active ? <><EyeOff className="h-4 w-4" /> Hide</> : <><Eye className="h-4 w-4" /> Publish</>}
                  </Button>
                  <Button asChild size="sm" variant="outline"><Link to={`/seller/edit/${l.id}`}><Pencil className="h-4 w-4" /> Edit</Link></Button>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </section>
  );
}

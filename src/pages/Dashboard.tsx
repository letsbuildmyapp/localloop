import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { collection, getDocs, orderBy, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/auth";
import type { Booking } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { formatPrice, timeAgo } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar, MessageSquare } from "lucide-react";

const statusVariant: Record<string, "default" | "secondary" | "outline" | "success" | "warning"> = {
  requested: "warning",
  accepted: "default",
  paid: "success",
  completed: "success",
  declined: "outline",
  cancelled: "outline",
};

export default function Dashboard() {
  const { profile } = useAuth();
  const [bookings, setBookings] = useState<Booking[] | null>(null);

  useEffect(() => {
    (async () => {
      if (!profile) return;
      try {
        const q = query(
          collection(db, "bookings"),
          where("buyerId", "==", profile.id),
          orderBy("createdAt", "desc")
        );
        const snap = await getDocs(q);
        setBookings(snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })));
      } catch {
        setBookings([]);
      }
    })();
  }, [profile]);

  if (!profile) return null;

  return (
    <section className="container py-10">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl font-semibold">Hi, {profile.displayName.split(" ")[0]}</h1>
          <p className="text-muted-foreground">Your bookings and conversations live here.</p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline"><Link to="/messages"><MessageSquare className="h-4 w-4" /> Messages</Link></Button>
          <Button asChild><Link to="/browse"><Calendar className="h-4 w-4" /> Book a service</Link></Button>
        </div>
      </header>

      <Card className="mt-8">
        <CardHeader><CardTitle>Your bookings</CardTitle></CardHeader>
        <CardContent>
          {bookings === null ? (
            <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}</div>
          ) : bookings.length === 0 ? (
            <div className="rounded-md border border-dashed p-10 text-center">
              <p className="font-display text-xl">No bookings yet</p>
              <p className="mt-1 text-sm text-muted-foreground">Browse pros in your neighborhood to get started.</p>
              <Button asChild className="mt-4"><Link to="/browse">Browse services</Link></Button>
            </div>
          ) : (
            <ul className="divide-y">
              {bookings.map((b) => (
                <li key={b.id}>
                  <Link to={`/bookings/${b.id}`} className="flex flex-wrap items-center gap-4 py-4 hover:opacity-90">
                    <div className="flex-1 min-w-0">
                      <p className="truncate font-semibold">{b.listingTitle}</p>
                      <p className="text-xs tabular-nums text-muted-foreground">with {b.sellerName} · {new Date(b.scheduledFor).toLocaleString()}</p>
                    </div>
                    <span className="text-sm font-semibold tabular-nums">{formatPrice(b.totalCents)}</span>
                    <Badge variant={statusVariant[b.status]}>{b.status}</Badge>
                    <span className="text-xs tabular-nums text-muted-foreground">{timeAgo(b.createdAt)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </section>
  );
}

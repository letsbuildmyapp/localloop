import { useEffect, useState } from "react";
import { collection, doc, getDocs, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Listing, UserProfile } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { categoryLabel } from "@/lib/categories";
import { toast } from "sonner";

export default function Admin() {
  const [users, setUsers] = useState<UserProfile[] | null>(null);
  const [listings, setListings] = useState<Listing[] | null>(null);

  async function load() {
    const us = await getDocs(collection(db, "users"));
    setUsers(us.docs.map((d) => d.data() as UserProfile));
    const ls = await getDocs(collection(db, "listings"));
    setListings(ls.docs.map((d) => ({ id: d.id, ...(d.data() as any) })));
  }
  useEffect(() => { load(); }, []);

  async function toggleSuspendUser(u: UserProfile) {
    await updateDoc(doc(db, "users", u.id), { suspended: !u.suspended });
    toast.success(u.suspended ? "User reinstated" : "User suspended");
    load();
  }
  async function toggleSuspendListing(l: Listing) {
    await updateDoc(doc(db, "listings", l.id), { suspended: !l.suspended });
    toast.success(l.suspended ? "Listing reinstated" : "Listing suspended");
    load();
  }

  return (
    <section className="container py-10">
      <h1 className="font-display text-4xl font-semibold">Admin moderation</h1>
      <p className="text-muted-foreground">Suspend bad actors. Be fair.</p>

      <Card className="mt-8">
        <CardHeader><CardTitle>Users ({users?.length ?? 0})</CardTitle></CardHeader>
        <CardContent>
          {users === null ? <Skeleton className="h-24 w-full" /> : (
            <ul className="divide-y">
              {users.map((u) => (
                <li key={u.id} className="flex items-center gap-4 py-3">
                  <div className="flex-1 min-w-0">
                    <p className="truncate font-semibold">{u.displayName}</p>
                    <p className="text-xs text-muted-foreground">{u.email}</p>
                  </div>
                  <Badge variant={u.role === "admin" ? "default" : "outline"}>{u.role}</Badge>
                  {u.suspended && <Badge variant="warning">Suspended</Badge>}
                  <Button size="sm" variant={u.suspended ? "default" : "outline"} onClick={() => toggleSuspendUser(u)}>
                    {u.suspended ? "Reinstate" : "Suspend"}
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card className="mt-8">
        <CardHeader><CardTitle>Listings ({listings?.length ?? 0})</CardTitle></CardHeader>
        <CardContent>
          {listings === null ? <Skeleton className="h-24 w-full" /> : (
            <ul className="divide-y">
              {listings.map((l) => (
                <li key={l.id} className="flex items-center gap-4 py-3">
                  <img src={l.images[0]} alt={l.title} className="h-12 w-12 rounded-md object-cover" />
                  <div className="flex-1 min-w-0">
                    <p className="truncate font-semibold">{l.title}</p>
                    <p className="text-xs text-muted-foreground">{categoryLabel(l.category)} · {l.sellerName} · {l.city}</p>
                  </div>
                  {l.suspended && <Badge variant="warning">Suspended</Badge>}
                  <Button size="sm" variant={l.suspended ? "default" : "outline"} onClick={() => toggleSuspendListing(l)}>
                    {l.suspended ? "Reinstate" : "Suspend"}
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </section>
  );
}

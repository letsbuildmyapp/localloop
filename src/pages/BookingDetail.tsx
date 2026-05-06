import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { addDoc, collection, doc, getDoc, getDocs, query, runTransaction, setDoc, updateDoc, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/auth";
import type { Booking, Review } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { formatPrice } from "@/lib/utils";
import { Star, MessageSquare, CheckCircle2, CreditCard, XCircle } from "lucide-react";
import { toast } from "sonner";

const statusVariant: Record<string, any> = {
  requested: "warning", accepted: "default", paid: "success",
  completed: "success", declined: "outline", cancelled: "outline",
};

export default function BookingDetail() {
  const { id } = useParams();
  const { profile } = useAuth();
  const nav = useNavigate();
  const [b, setB] = useState<Booking | null | undefined>(undefined);
  const [hasReview, setHasReview] = useState(false);

  // review form
  const [stars, setStars] = useState(5);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);

  async function load() {
    if (!id) return;
    const snap = await getDoc(doc(db, "bookings", id));
    if (!snap.exists()) { setB(null); return; }
    setB({ id: snap.id, ...(snap.data() as any) });
    const rs = await getDocs(query(collection(db, "reviews"), where("bookingId", "==", id)));
    setHasReview(!rs.empty);
  }
  useEffect(() => { load(); }, [id]);

  if (b === undefined) return <div className="container py-10"><Skeleton className="h-64 w-full" /></div>;
  if (b === null) return <div className="container py-20 text-center"><p className="font-display text-3xl">Booking not found</p></div>;
  if (!profile) return null;
  const me = profile;

  const isBuyer = me.id === b.buyerId;
  const isSeller = me.id === b.sellerId;

  async function pay() {
    setBusy(true);
    try {
      // Test mode: simulate Stripe Checkout success.
      // In production this calls a Cloud Function that creates a Checkout Session.
      await updateDoc(doc(db, "bookings", b!.id), { status: "paid", paidAt: Date.now() });
      toast.success("Payment captured (test mode)");
      nav(`/checkout/success?booking=${b!.id}`);
    } finally { setBusy(false); }
  }

  async function markComplete() {
    await updateDoc(doc(db, "bookings", b!.id), { status: "completed" });
    toast.success("Marked complete");
    load();
  }

  async function cancel() {
    await updateDoc(doc(db, "bookings", b!.id), { status: "cancelled" });
    toast.success("Booking cancelled");
    load();
  }

  async function startConvo() {
    const otherId = isBuyer ? b!.sellerId : b!.buyerId;
    const otherName = isBuyer ? b!.sellerName : b!.buyerName;
    const convId = [me.id, otherId].sort().join("_") + "_" + b!.listingId;
    await setDoc(doc(db, "conversations", convId), {
      participants: [me.id, otherId],
      participantNames: { [me.id]: me.displayName, [otherId]: otherName },
      participantPhotos: { [me.id]: me.photoURL ?? null, [otherId]: null },
      listingId: b!.listingId, listingTitle: b!.listingTitle,
      lastMessage: "", lastMessageAt: Date.now(),
    }, { merge: true });
    nav(`/messages/${convId}`);
  }

  async function submitReview(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const review: Omit<Review, "id"> = {
        listingId: b!.listingId, bookingId: b!.id,
        authorId: me.id, authorName: me.displayName,
        authorPhoto: me.photoURL, rating: stars, text, createdAt: Date.now(),
      };
      await addDoc(collection(db, "reviews"), review);
      // Update listing rating in a transaction.
      await runTransaction(db, async (tx) => {
        const ref = doc(db, "listings", b!.listingId);
        const snap = await tx.get(ref);
        if (!snap.exists()) return;
        const cur = snap.data() as any;
        const count = (cur.reviewCount ?? 0) + 1;
        const avg = ((cur.rating ?? 0) * (cur.reviewCount ?? 0) + stars) / count;
        tx.update(ref, { rating: avg, reviewCount: count });
      });
      toast.success("Thanks for your review!");
      setHasReview(true);
    } catch (e: any) {
      toast.error(e.message ?? "Could not save review");
    } finally { setBusy(false); }
  }

  return (
    <section className="container max-w-3xl py-10">
      <p className="text-sm text-muted-foreground">Booking</p>
      <h1 className="font-display text-4xl font-semibold">{b.listingTitle}</h1>

      <Card className="mt-6">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Details</CardTitle>
          <Badge variant={statusVariant[b.status]}>{b.status}</Badge>
        </CardHeader>
        <CardContent className="grid gap-3 text-sm">
          <Row label="When">{new Date(b.scheduledFor).toLocaleString()}</Row>
          <Row label="Hours">{b.hours}</Row>
          <Row label="Buyer">{b.buyerName}</Row>
          <Row label="Pro">{b.sellerName}</Row>
          {b.notes && <Row label="Notes">{b.notes}</Row>}
          <Row label="Total"><span className="font-semibold">{formatPrice(b.totalCents)}</span></Row>
        </CardContent>
      </Card>

      <div className="mt-6 flex flex-wrap gap-2">
        <Button variant="outline" onClick={startConvo}><MessageSquare className="h-4 w-4" /> Message</Button>

        {isBuyer && b.status === "accepted" && (
          <Button onClick={pay} disabled={busy}><CreditCard className="h-4 w-4" /> {busy ? "Processing…" : "Pay now"}</Button>
        )}
        {isSeller && b.status === "paid" && (
          <Button onClick={markComplete}><CheckCircle2 className="h-4 w-4" /> Mark complete</Button>
        )}
        {(isBuyer || isSeller) && (b.status === "requested" || b.status === "accepted") && (
          <Button variant="ghost" onClick={cancel}><XCircle className="h-4 w-4" /> Cancel</Button>
        )}
      </div>

      {isBuyer && b.status === "completed" && !hasReview && (
        <Card className="mt-8">
          <CardHeader><CardTitle>Leave a review</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={submitReview} className="space-y-4">
              <div>
                <Label>Rating</Label>
                <div className="mt-2 flex gap-1">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button key={n} type="button" onClick={() => setStars(n)} aria-label={`${n} stars`}>
                      <Star className={`h-7 w-7 ${n <= stars ? "fill-amber-400 text-amber-400" : "text-muted-foreground"}`} />
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="text">Your review</Label>
                <Textarea id="text" required value={text} onChange={(e) => setText(e.target.value)} placeholder="What did you love? Anything that could've been better?" />
              </div>
              <Button type="submit" disabled={busy}>{busy ? "Posting…" : "Post review"}</Button>
            </form>
          </CardContent>
        </Card>
      )}
      {hasReview && <p className="mt-6 text-sm text-muted-foreground">Thanks — your review is live.</p>}
    </section>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-border/60 py-2 last:border-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right">{children}</span>
    </div>
  );
}

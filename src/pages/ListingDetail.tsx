import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  addDoc, collection, doc, getDoc, getDocs, orderBy, query,
  serverTimestamp, where, setDoc, updateDoc, increment,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Listing, Review } from "@/types";
import { useAuth } from "@/lib/auth";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Star, MapPin, ShieldCheck, MessageSquare, Calendar } from "lucide-react";
import { formatPrice, initials, timeAgo } from "@/lib/utils";
import { categoryLabel } from "@/lib/categories";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { motion } from "framer-motion";

export default function ListingDetail() {
  const { id } = useParams();
  const nav = useNavigate();
  const { user, profile } = useAuth();

  const [listing, setListing] = useState<Listing | null | undefined>(undefined);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [hours, setHours] = useState(2);
  const [date, setDate] = useState(() => {
    const d = new Date(); d.setDate(d.getDate() + 2); d.setHours(10, 0, 0, 0);
    return d.toISOString().slice(0, 16);
  });
  const [notes, setNotes] = useState("");
  const [bookingOpen, setBookingOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    (async () => {
      if (!id) return;
      const snap = await getDoc(doc(db, "listings", id));
      if (!snap.exists()) { setListing(null); return; }
      setListing({ id: snap.id, ...(snap.data() as any) });
      const rs = await getDocs(query(collection(db, "reviews"), where("listingId", "==", id), orderBy("createdAt", "desc")));
      setReviews(rs.docs.map((d) => ({ id: d.id, ...(d.data() as any) })));
    })();
  }, [id]);

  const total = useMemo(() => (listing ? listing.priceCents * (listing.unit === "hour" ? hours : 1) : 0), [listing, hours]);

  if (listing === undefined) {
    return <div className="container py-10"><Skeleton className="h-96 w-full" /></div>;
  }
  if (listing === null) {
    return (
      <div className="container py-20 text-center">
        <p className="font-display text-3xl">Listing not found</p>
        <Button className="mt-4" onClick={() => nav("/browse")}>Back to browse</Button>
      </div>
    );
  }

  async function submitBooking() {
    if (!user || !profile) { nav(`/signin?redirect=/listings/${id}`); return; }
    if (profile.id === listing!.sellerId) { toast.error("You can't book your own listing"); return; }
    setBusy(true);
    try {
      const scheduledFor = new Date(date).getTime();
      const ref = await addDoc(collection(db, "bookings"), {
        listingId: listing!.id,
        listingTitle: listing!.title,
        buyerId: profile.id,
        buyerName: profile.displayName,
        sellerId: listing!.sellerId,
        sellerName: listing!.sellerName,
        scheduledFor,
        hours: listing!.unit === "hour" ? hours : 1,
        totalCents: total,
        status: "requested",
        notes,
        createdAt: Date.now(),
        _serverCreatedAt: serverTimestamp(),
      });
      toast.success("Request sent — taking you to checkout");
      setBookingOpen(false);
      nav(`/bookings/${ref.id}`);
    } catch (e: any) {
      toast.error(e.message ?? "Booking failed");
    } finally {
      setBusy(false);
    }
  }

  async function startConversation() {
    if (!user || !profile) { nav(`/signin?redirect=/listings/${id}`); return; }
    if (profile.id === listing!.sellerId) { toast.error("You can't message yourself"); return; }
    const convId = [profile.id, listing!.sellerId].sort().join("_") + "_" + listing!.id;
    const ref = doc(db, "conversations", convId);
    await setDoc(ref, {
      participants: [profile.id, listing!.sellerId],
      participantNames: { [profile.id]: profile.displayName, [listing!.sellerId]: listing!.sellerName },
      participantPhotos: { [profile.id]: profile.photoURL ?? null, [listing!.sellerId]: listing!.sellerPhoto ?? null },
      listingId: listing!.id,
      listingTitle: listing!.title,
      lastMessage: "",
      lastMessageAt: Date.now(),
    }, { merge: true });
    nav(`/messages/${convId}`);
  }

  return (
    <section className="container py-10">
      <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr]">
        <div>
          <Badge variant="secondary">{categoryLabel(listing.category)}</Badge>
          <h1 className="mt-3 font-display text-4xl font-semibold">{listing.title}</h1>
          <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1.5"><Star className="h-4 w-4 fill-amber-400 text-amber-400" /> {listing.rating.toFixed(1)} · {listing.reviewCount} reviews</span>
            <span className="inline-flex items-center gap-1.5"><MapPin className="h-4 w-4" /> {listing.city}</span>
            <span className="inline-flex items-center gap-1.5"><ShieldCheck className="h-4 w-4 text-emerald-600" /> Verified pro</span>
          </div>

          <div className="mt-6 grid gap-3 md:grid-cols-3">
            {listing.images.map((src, i) => (
              <motion.img
                key={i}
                src={src}
                alt={`${listing.title} ${i + 1}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.05 }}
                className={`rounded-lg object-cover ${i === 0 ? "md:col-span-3 md:aspect-[16/8]" : "aspect-[4/3]"}`}
              />
            ))}
          </div>

          <h2 className="mt-10 font-display text-2xl font-semibold">About this service</h2>
          <p className="mt-3 whitespace-pre-line text-foreground/90 leading-relaxed">{listing.description}</p>

          <div className="mt-10">
            <h2 className="font-display text-2xl font-semibold">Reviews ({reviews.length})</h2>
            {reviews.length === 0 ? (
              <p className="mt-3 text-sm text-muted-foreground">No reviews yet — be the first to book.</p>
            ) : (
              <ul className="mt-5 space-y-5">
                {reviews.map((r) => (
                  <li key={r.id} className="rounded-md border p-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                        {r.authorPhoto && <AvatarImage src={r.authorPhoto} />}
                        <AvatarFallback>{initials(r.authorName)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-semibold">{r.authorName}</p>
                        <p className="text-xs tabular-nums text-muted-foreground">{timeAgo(r.createdAt)}</p>
                      </div>
                      <div className="ml-auto inline-flex items-center gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} className={`h-4 w-4 ${i < r.rating ? "fill-amber-400 text-amber-400" : "text-muted"}`} />
                        ))}
                      </div>
                    </div>
                    <p className="mt-3 text-sm text-foreground/90">{r.text}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Booking panel */}
        <aside className="lg:sticky lg:top-24 h-fit">
          <div className="rounded-lg border bg-card p-6 shadow-sm">
            <div className="flex items-baseline gap-2">
              <span className="font-display text-3xl font-semibold tabular-nums">{formatPrice(listing.priceCents)}</span>
              <span className="text-sm text-muted-foreground">/ {listing.unit}</span>
            </div>

            <div className="mt-5 flex items-center gap-3">
              <Avatar>
                {listing.sellerPhoto && <AvatarImage src={listing.sellerPhoto} />}
                <AvatarFallback>{initials(listing.sellerName)}</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-semibold">{listing.sellerName}</p>
                <p className="text-xs text-muted-foreground">Local pro · {listing.city}</p>
              </div>
            </div>

            <Dialog open={bookingOpen} onOpenChange={setBookingOpen}>
              <DialogTrigger asChild>
                <Button size="lg" className="mt-6 w-full">
                  <Calendar className="h-4 w-4" /> Request booking
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Request a booking</DialogTitle>
                  <DialogDescription>{listing.sellerName} will confirm before payment is captured.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="when">When</Label>
                    <Input id="when" type="datetime-local" value={date} onChange={(e) => setDate(e.target.value)} />
                  </div>
                  {listing.unit === "hour" && (
                    <div className="space-y-2">
                      <Label htmlFor="hours">Hours</Label>
                      <Input id="hours" type="number" min={1} max={12} value={hours} onChange={(e) => setHours(parseInt(e.target.value || "1", 10))} />
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label htmlFor="notes">Notes (optional)</Label>
                    <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Anything the pro should know — gate code, pets, parking…" />
                  </div>
                  <div className="flex items-center justify-between rounded-md border bg-secondary/50 p-3">
                    <span className="text-sm text-muted-foreground">Total</span>
                    <span className="text-lg font-semibold">{formatPrice(total)}</span>
                  </div>
                </div>
                <div className="mt-2 flex justify-end gap-2">
                  <DialogClose asChild><Button variant="ghost">Cancel</Button></DialogClose>
                  <Button onClick={submitBooking} disabled={busy}>{busy ? "Sending…" : "Send request"}</Button>
                </div>
              </DialogContent>
            </Dialog>

            <Button variant="outline" size="lg" className="mt-3 w-full" onClick={startConversation}>
              <MessageSquare className="h-4 w-4" /> Message {listing.sellerName.split(" ")[0]}
            </Button>

            <p className="mt-4 text-center text-xs text-muted-foreground">You won't be charged until the pro accepts.</p>
          </div>
        </aside>
      </div>
    </section>
  );
}

// silence unused-import warnings on certain rebuilds
export const __unused = { updateDoc, increment };

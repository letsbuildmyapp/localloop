/**
 * Seeds the local Firebase emulator with realistic LocalLoop data.
 *
 * Usage (with emulators running):
 *   npm run seed
 *
 * Talks to:
 *   - Auth emulator   on 127.0.0.1:9099
 *   - Firestore emul. on 127.0.0.1:8080
 */
process.env.FIRESTORE_EMULATOR_HOST = "127.0.0.1:8080";
process.env.FIREBASE_AUTH_EMULATOR_HOST = "127.0.0.1:9099";
process.env.GCLOUD_PROJECT = "localloop-demo";

import { initializeApp, cert, applicationDefault } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

try { initializeApp({ projectId: "localloop-demo" }); }
catch { /* already initialized */ }

const auth = getAuth();
const db = getFirestore();
db.settings({ ignoreUndefinedProperties: true });

interface SeedUser {
  uid?: string;
  email: string;
  password: string;
  displayName: string;
  role: "buyer" | "seller" | "admin";
  city?: string;
  bio?: string;
}

const users: SeedUser[] = [
  { email: "buyer@localloop.dev",  password: "password123", displayName: "Sam Rivera",   role: "buyer",  city: "Austin, TX" },
  { email: "buyer2@localloop.dev", password: "password123", displayName: "Priya Shah",   role: "buyer",  city: "Brooklyn, NY" },
  { email: "maria@localloop.dev",  password: "password123", displayName: "Maria Alvarez", role: "seller", city: "Austin, TX",   bio: "Eco-friendly cleaner with 6 years of experience. Bonded & insured." },
  { email: "jordan@localloop.dev", password: "password123", displayName: "Jordan Lee",    role: "seller", city: "Brooklyn, NY", bio: "Licensed handyman — same-day fixes for leaks, drywall, and electrical." },
  { email: "kenji@localloop.dev",  password: "password123", displayName: "Kenji Patel",   role: "seller", city: "Denver, CO",    bio: "Dog walker & pet sitter. Trained in pet first aid." },
  { email: "rosa@localloop.dev",   password: "password123", displayName: "Rosa Bell",     role: "seller", city: "Portland, OR",  bio: "Gardener focused on native, low-water plants." },
  { email: "deshawn@localloop.dev",password: "password123", displayName: "Deshawn Carter",role: "seller", city: "Asheville, NC", bio: "Two trucks, one team. Local moves done right." },
  { email: "amy@localloop.dev",    password: "password123", displayName: "Amy Nguyen",    role: "seller", city: "Oakland, CA",   bio: "Math + SAT tutor, former HS teacher." },
  { email: "admin@localloop.dev",  password: "password123", displayName: "LocalLoop Admin", role: "admin", city: "Remote" },
];

async function ensureUser(u: SeedUser): Promise<string> {
  try {
    const existing = await auth.getUserByEmail(u.email);
    u.uid = existing.uid;
  } catch {
    const created = await auth.createUser({ email: u.email, password: u.password, displayName: u.displayName });
    u.uid = created.uid;
  }
  await db.doc(`users/${u.uid}`).set({
    id: u.uid, email: u.email, displayName: u.displayName, role: u.role,
    city: u.city, bio: u.bio, createdAt: Date.now(),
  });
  return u.uid!;
}

const STOCK: Record<string, string[]> = {
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

interface SeedListing {
  sellerEmail: string;
  title: string;
  description: string;
  category: keyof typeof STOCK;
  city: string;
  priceCents: number;
  unit: "hour" | "visit" | "project";
  rating: number;
  reviewCount: number;
}

const listings: SeedListing[] = [
  { sellerEmail: "maria@localloop.dev", title: "Eco-friendly deep clean for 1–2 bedrooms",
    description: "Plant-based products only. I bring everything — vacuum, microfiber, the whole kit. Includes inside the oven, fridge, and a 30-day touch-up if you're not 100% happy.",
    category: "cleaning", city: "Austin, TX", priceCents: 4500, unit: "hour", rating: 4.9, reviewCount: 128 },
  { sellerEmail: "maria@localloop.dev", title: "Move-out clean (rental ready)",
    description: "Get your full deposit back. Detailed clean focused on what landlords actually inspect: baseboards, blinds, behind appliances, inside cabinets.",
    category: "cleaning", city: "Austin, TX", priceCents: 28000, unit: "visit", rating: 4.95, reviewCount: 64 },
  { sellerEmail: "jordan@localloop.dev", title: "Same-day handyman — leaks, drywall, mounting",
    description: "Most jobs done in under 2 hours. Licensed, insured, and 9-year track record across Brooklyn and Queens. Text photos for a quick quote.",
    category: "handyman", city: "Brooklyn, NY", priceCents: 8500, unit: "hour", rating: 4.8, reviewCount: 211 },
  { sellerEmail: "jordan@localloop.dev", title: "TV mounting (any size, hidden cables)",
    description: "Flat fee per TV up to 75\". Includes stud-finding, level-true mounting, and routing cables behind the wall when possible.",
    category: "handyman", city: "Brooklyn, NY", priceCents: 14500, unit: "project", rating: 4.92, reviewCount: 87 },
  { sellerEmail: "kenji@localloop.dev", title: "30-min neighborhood dog walk",
    description: "Friendly, leash-trained walks around your block. GPS-tracked. Treat + photo update sent at the end of every walk.",
    category: "dog-walking", city: "Denver, CO", priceCents: 2400, unit: "visit", rating: 5.0, reviewCount: 192 },
  { sellerEmail: "kenji@localloop.dev", title: "Weekend pet sitting (overnight)",
    description: "I stay at your place. Two walks per day, feeding, fresh water, mail brought in. Great for anxious pups.",
    category: "dog-walking", city: "Denver, CO", priceCents: 9500, unit: "visit", rating: 4.96, reviewCount: 41 },
  { sellerEmail: "rosa@localloop.dev", title: "Native garden refresh",
    description: "I'll redesign one bed with drought-tolerant Pacific NW natives. Includes soil prep, planting, and a 1-page care guide.",
    category: "lawn-care", city: "Portland, OR", priceCents: 32000, unit: "project", rating: 4.88, reviewCount: 36 },
  { sellerEmail: "rosa@localloop.dev", title: "Mow + edge + haul (small yards)",
    description: "Quiet electric mower. Sharp edges, blower cleanup, and clippings hauled away. Recurring discounts available.",
    category: "lawn-care", city: "Portland, OR", priceCents: 5500, unit: "visit", rating: 4.85, reviewCount: 73 },
  { sellerEmail: "deshawn@localloop.dev", title: "2 movers + truck (3-hour minimum)",
    description: "Local moves under 30 miles. We bring blankets, dollies, and shrink wrap. Tip-friendly, never pressured.",
    category: "moving-help", city: "Asheville, NC", priceCents: 12500, unit: "hour", rating: 4.91, reviewCount: 156 },
  { sellerEmail: "amy@localloop.dev", title: "SAT math tutoring (1:1)",
    description: "Former HS math teacher. Average student score gain: 80 points in 6 weeks. First session is half price.",
    category: "tutoring", city: "Oakland, CA", priceCents: 6500, unit: "hour", rating: 4.97, reviewCount: 102 },
  { sellerEmail: "amy@localloop.dev", title: "Algebra II homework help (weekly)",
    description: "Patient, encouraging help with Algebra II — recommended weekly. I work on real homework, not generic worksheets.",
    category: "tutoring", city: "Oakland, CA", priceCents: 5000, unit: "hour", rating: 4.94, reviewCount: 58 },
  { sellerEmail: "maria@localloop.dev", title: "Recurring weekly cleaning (4hr)",
    description: "Same cleaner each visit. Discounted rate for recurring clients. Cancel anytime.",
    category: "cleaning", city: "Austin, TX", priceCents: 4000, unit: "hour", rating: 4.92, reviewCount: 211 },
];

const sampleReviews = [
  "Showed up early, did an incredible job. Already booked again.",
  "Honestly the best money I've spent on the house this year.",
  "Super friendly, great communication, fair price. 10/10.",
  "Saved me from a real plumbing nightmare. Will use forever.",
  "Kind, patient, and thorough. My pets loved them.",
];
const reviewers = [
  { name: "Sam R.",  uid: null as string | null },
  { name: "Priya S.", uid: null as string | null },
  { name: "Chloe M.", uid: "seed_chloe" },
  { name: "Marcus T.", uid: "seed_marcus" },
  { name: "Lila J.", uid: "seed_lila" },
];

async function clearCollection(name: string) {
  const snap = await db.collection(name).get();
  const batch = db.batch();
  snap.docs.forEach((d) => batch.delete(d.ref));
  if (!snap.empty) await batch.commit();
}

async function main() {
  console.log("Seeding LocalLoop emulator…");

  // Wipe
  for (const c of ["listings", "bookings", "reviews", "conversations"]) await clearCollection(c);

  // Users
  const uidByEmail: Record<string, string> = {};
  for (const u of users) {
    const uid = await ensureUser(u);
    uidByEmail[u.email] = uid;
  }
  reviewers[0].uid = uidByEmail["buyer@localloop.dev"];
  reviewers[1].uid = uidByEmail["buyer2@localloop.dev"];

  // Listings
  for (const l of listings) {
    const sellerUid = uidByEmail[l.sellerEmail];
    const sellerProfile = users.find((u) => u.email === l.sellerEmail)!;
    const ref = db.collection("listings").doc();
    await ref.set({
      sellerId: sellerUid,
      sellerName: sellerProfile.displayName,
      title: l.title,
      description: l.description,
      category: l.category,
      city: l.city,
      priceCents: l.priceCents,
      unit: l.unit,
      images: STOCK[l.category],
      rating: l.rating,
      reviewCount: l.reviewCount,
      active: true,
      suspended: false,
      createdAt: Date.now() - Math.floor(Math.random() * 1000 * 60 * 60 * 24 * 30),
    });

    // 3 sample reviews per listing
    for (let i = 0; i < 3; i++) {
      const r = reviewers[(i * 2) % reviewers.length];
      await db.collection("reviews").add({
        listingId: ref.id,
        bookingId: `seed_${ref.id}_${i}`,
        authorId: r.uid ?? `seed_${i}`,
        authorName: r.name,
        rating: 4 + Math.round(Math.random()),
        text: sampleReviews[(i + l.title.length) % sampleReviews.length],
        createdAt: Date.now() - i * 1000 * 60 * 60 * 24 * 5,
      });
    }
  }

  // A couple of demo bookings for the demo buyer
  const buyerUid = uidByEmail["buyer@localloop.dev"];
  const sellerUid = uidByEmail["maria@localloop.dev"];
  const lSnap = await db.collection("listings").where("sellerId", "==", sellerUid).limit(1).get();
  if (!lSnap.empty) {
    const l = lSnap.docs[0];
    await db.collection("bookings").add({
      listingId: l.id, listingTitle: (l.data() as any).title,
      buyerId: buyerUid, buyerName: "Sam Rivera",
      sellerId: sellerUid, sellerName: "Maria Alvarez",
      scheduledFor: Date.now() + 1000 * 60 * 60 * 48,
      hours: 3, totalCents: 13500,
      status: "accepted", notes: "Front door code 1234. Cat is friendly.",
      createdAt: Date.now() - 1000 * 60 * 60 * 6,
    });
    await db.collection("bookings").add({
      listingId: l.id, listingTitle: (l.data() as any).title,
      buyerId: buyerUid, buyerName: "Sam Rivera",
      sellerId: sellerUid, sellerName: "Maria Alvarez",
      scheduledFor: Date.now() - 1000 * 60 * 60 * 24 * 7,
      hours: 4, totalCents: 18000,
      status: "completed", paidAt: Date.now() - 1000 * 60 * 60 * 24 * 7,
      createdAt: Date.now() - 1000 * 60 * 60 * 24 * 8,
    });
  }

  console.log("Done.");
  console.log("Sign in with: buyer@localloop.dev / password123 (and others, all same password)");
}

main().catch((e) => { console.error(e); process.exit(1); });

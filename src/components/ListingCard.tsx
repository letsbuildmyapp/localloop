import { Link } from "react-router-dom";
import type { Listing } from "@/types";
import { categoryLabel } from "@/lib/categories";
import { formatPrice } from "@/lib/utils";
import { Star, MapPin } from "lucide-react";
import { motion } from "framer-motion";

export function ListingCard({ listing }: { listing: Listing }) {
  return (
    <motion.div whileHover={{ y: -3 }} transition={{ type: "spring", stiffness: 240, damping: 20 }}>
      <Link
        to={`/listings/${listing.id}`}
        className="group block overflow-hidden rounded-lg border bg-card shadow-sm transition hover:shadow-md focus-ring"
      >
        <div className="relative aspect-[4/3] overflow-hidden bg-muted">
          <img
            src={listing.images[0]}
            alt={listing.title}
            loading="lazy"
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
          <div className="absolute left-3 top-3 rounded-full bg-background/90 px-3 py-1 text-xs font-medium shadow-sm backdrop-blur">
            {categoryLabel(listing.category)}
          </div>
        </div>
        <div className="p-4">
          <div className="flex items-start justify-between gap-3">
            <h3 className="line-clamp-1 font-semibold leading-tight">{listing.title}</h3>
            <span className="shrink-0 text-sm font-semibold tabular-nums">
              {formatPrice(listing.priceCents)}
              <span className="text-xs font-normal text-muted-foreground">/{listing.unit}</span>
            </span>
          </div>
          <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{listing.description}</p>
          <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" /> {listing.city}
            </span>
            <span className="inline-flex items-center gap-1 tabular-nums">
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              {listing.rating.toFixed(1)} <span>({listing.reviewCount})</span>
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

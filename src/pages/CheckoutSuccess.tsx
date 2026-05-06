import { Link, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

export default function CheckoutSuccess() {
  const [params] = useSearchParams();
  const bookingId = params.get("booking");
  return (
    <section className="container max-w-md py-20 text-center">
      <motion.div initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 200 }}>
        <CheckCircle2 className="mx-auto h-16 w-16 text-emerald-500" />
      </motion.div>
      <h1 className="mt-6 font-display text-4xl font-semibold">Payment confirmed</h1>
      <p className="mt-3 text-muted-foreground">Your pro has been notified. You'll get a reminder the day of your booking.</p>
      <div className="mt-8 flex justify-center gap-3">
        {bookingId && <Button asChild variant="outline"><Link to={`/bookings/${bookingId}`}>View booking</Link></Button>}
        <Button asChild><Link to="/dashboard">Go to dashboard</Link></Button>
      </div>
    </section>
  );
}

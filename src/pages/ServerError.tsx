import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function ServerError() {
  return (
    <section className="container max-w-md py-24 text-center">
      <p className="font-display text-7xl font-semibold text-destructive">500</p>
      <h1 className="mt-2 font-display text-3xl">Something broke on our end</h1>
      <p className="mt-3 text-muted-foreground">We've been notified. Try again in a moment.</p>
      <Button asChild className="mt-6"><Link to="/">Back to home</Link></Button>
    </section>
  );
}

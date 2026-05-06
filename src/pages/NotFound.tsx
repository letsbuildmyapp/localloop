import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <section className="container max-w-md py-24 text-center">
      <p className="font-display text-7xl font-semibold text-primary">404</p>
      <h1 className="mt-2 font-display text-3xl">This page wandered off the loop</h1>
      <p className="mt-3 text-muted-foreground">The page you're looking for doesn't exist or has moved.</p>
      <Button asChild className="mt-6"><Link to="/">Back to home</Link></Button>
    </section>
  );
}

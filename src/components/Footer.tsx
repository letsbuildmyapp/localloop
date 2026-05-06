import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-border/60 bg-secondary/40">
      <div className="container grid gap-10 py-12 md:grid-cols-4">
        <div className="md:col-span-2">
          <p className="font-display text-2xl font-semibold">LocalLoop</p>
          <p className="mt-2 max-w-sm text-sm text-muted-foreground">
            Hyperlocal home services. Real neighbors, real reviews, real prices.
            Book in minutes, pay securely, message your pro.
          </p>
        </div>
        <div>
          <p className="text-sm font-semibold">Discover</p>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li><Link to="/browse" className="hover:text-foreground">Browse services</Link></li>
            <li><Link to="/how-it-works" className="hover:text-foreground">How it works</Link></li>
            <li><Link to="/signup?role=seller" className="hover:text-foreground">Become a pro</Link></li>
          </ul>
        </div>
        <div>
          <p className="text-sm font-semibold">Company</p>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li><a href="#" className="hover:text-foreground">About</a></li>
            <li><a href="#" className="hover:text-foreground">Trust & safety</a></li>
            <li><a href="#" className="hover:text-foreground">Contact</a></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border/60 py-4 text-center text-xs text-muted-foreground">
        Built by <a href="https://letsbuildmyapp.com" className="underline hover:text-foreground">letsbuildmyapp.com</a> — portfolio demo, payments in test mode.
      </div>
    </footer>
  );
}

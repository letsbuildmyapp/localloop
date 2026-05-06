import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { useTheme } from "@/lib/theme";
import { Moon, Sun, Plus, MessageSquare, LayoutDashboard, ShieldCheck, LogOut } from "lucide-react";
import { initials } from "@/lib/utils";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";

export function Navbar() {
  const { user, profile, signOut } = useAuth();
  const { theme, toggle } = useTheme();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur">
      <div className="container flex h-16 items-center justify-between gap-4">
        <Link to="/" data-tour="nav-brand" className="flex items-center gap-2">
          <div className="grid h-9 w-9 place-items-center rounded-md bg-primary text-primary-foreground">
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor"><path d="M12 2c5.5 0 10 4.5 10 10s-4.5 10-10 10S2 17.5 2 12 6.5 2 12 2zm-3 13l3-7 3 7-3-2-3 2z"/></svg>
          </div>
          <span className="font-display text-xl font-semibold">LocalLoop</span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          <NavLink to="/browse" data-tour="nav-browse" className={({ isActive }) => `rounded-full px-2 py-1 text-sm transition ${isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`}>Browse</NavLink>
          <NavLink to="/how-it-works" className={({ isActive }) => `text-sm transition ${isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`}>How it works</NavLink>
          {profile?.role === "seller" && (
            <NavLink to="/seller" data-tour="nav-seller-hub" className="rounded-full px-2 py-1 text-sm text-muted-foreground hover:text-foreground">Seller hub</NavLink>
          )}
          {profile?.role === "admin" && (
            <NavLink to="/admin" data-tour="nav-admin" className="rounded-full px-2 py-1 text-sm text-muted-foreground hover:text-foreground">Admin</NavLink>
          )}
        </nav>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={toggle} aria-label="Toggle theme">
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>

          {user && profile ? (
            <>
              {profile.role === "seller" && (
                <Button data-tour="nav-new-listing" variant="secondary" size="sm" onClick={() => navigate("/seller/new")} className="hidden sm:inline-flex">
                  <Plus className="h-4 w-4" /> New listing
                </Button>
              )}
              <Button data-tour="nav-messages" variant="ghost" size="icon" onClick={() => navigate("/messages")} aria-label="Messages">
                <MessageSquare className="h-4 w-4" />
              </Button>
              <DropdownMenu.Root>
                <DropdownMenu.Trigger asChild>
                  <button data-tour="nav-account" className="rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                    <Avatar className="h-9 w-9">
                      {profile.photoURL && <AvatarImage src={profile.photoURL} />}
                      <AvatarFallback>{initials(profile.displayName)}</AvatarFallback>
                    </Avatar>
                  </button>
                </DropdownMenu.Trigger>
                <DropdownMenu.Portal>
                  <DropdownMenu.Content sideOffset={8} align="end" className="z-50 min-w-[220px] rounded-md border bg-popover p-1 shadow-lg animate-fade-in">
                    <div className="px-3 py-2">
                      <p className="text-sm font-semibold">{profile.displayName}</p>
                      <p className="text-xs text-muted-foreground">{profile.email}</p>
                    </div>
                    <DropdownMenu.Separator className="my-1 h-px bg-border" />
                    <DropdownMenu.Item asChild>
                      <Link to="/dashboard" className="flex cursor-pointer items-center gap-2 rounded-sm px-3 py-2 text-sm outline-none focus:bg-muted">
                        <LayoutDashboard className="h-4 w-4" /> Dashboard
                      </Link>
                    </DropdownMenu.Item>
                    {profile.role === "admin" && (
                      <DropdownMenu.Item asChild>
                        <Link to="/admin" className="flex cursor-pointer items-center gap-2 rounded-sm px-3 py-2 text-sm outline-none focus:bg-muted">
                          <ShieldCheck className="h-4 w-4" /> Admin panel
                        </Link>
                      </DropdownMenu.Item>
                    )}
                    <DropdownMenu.Item asChild>
                      <button onClick={() => signOut().then(() => navigate("/"))} className="flex w-full cursor-pointer items-center gap-2 rounded-sm px-3 py-2 text-sm outline-none focus:bg-muted">
                        <LogOut className="h-4 w-4" /> Sign out
                      </button>
                    </DropdownMenu.Item>
                  </DropdownMenu.Content>
                </DropdownMenu.Portal>
              </DropdownMenu.Root>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" onClick={() => navigate("/signin")}>Sign in</Button>
              <Button size="sm" onClick={() => navigate("/signup")}>Get started</Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

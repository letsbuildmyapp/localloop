import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import type { Role } from "@/types";
import { Skeleton } from "./ui/skeleton";

export function RequireAuth({ children, role }: { children: React.ReactNode; role?: Role | Role[] }) {
  const { user, profile, loading } = useAuth();
  const loc = useLocation();

  if (loading) {
    return (
      <div className="container py-16">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="mt-4 h-32 w-full" />
      </div>
    );
  }
  if (!user) {
    return <Navigate to={`/signin?redirect=${encodeURIComponent(loc.pathname + loc.search)}`} replace />;
  }
  if (role && profile) {
    const roles = Array.isArray(role) ? role : [role];
    if (!roles.includes(profile.role) && profile.role !== "admin") {
      return <Navigate to="/dashboard" replace />;
    }
  }
  return <>{children}</>;
}

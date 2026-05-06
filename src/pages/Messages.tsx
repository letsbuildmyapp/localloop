import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { collection, getDocs, orderBy, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/auth";
import type { Conversation } from "@/types";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { initials, timeAgo } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

export default function Messages() {
  const { profile } = useAuth();
  const [convs, setConvs] = useState<Conversation[] | null>(null);

  useEffect(() => {
    (async () => {
      if (!profile) return;
      try {
        const q = query(
          collection(db, "conversations"),
          where("participants", "array-contains", profile.id),
          orderBy("lastMessageAt", "desc")
        );
        const snap = await getDocs(q);
        setConvs(snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })));
      } catch {
        setConvs([]);
      }
    })();
  }, [profile]);

  if (!profile) return null;

  return (
    <section className="container max-w-2xl py-10">
      <h1 className="font-display text-4xl font-semibold">Messages</h1>
      <div className="mt-6 rounded-lg border bg-card">
        {convs === null ? (
          <div className="p-4 space-y-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}</div>
        ) : convs.length === 0 ? (
          <div className="p-10 text-center">
            <p className="font-display text-xl">No messages yet</p>
            <p className="mt-1 text-sm text-muted-foreground">Message a pro from any listing to start a conversation.</p>
          </div>
        ) : (
          <ul className="divide-y">
            {convs.map((c) => {
              const otherId = c.participants.find((p) => p !== profile.id) ?? "";
              const name = c.participantNames[otherId] ?? "Member";
              return (
                <li key={c.id}>
                  <Link to={`/messages/${c.id}`} className="flex items-center gap-3 p-4 hover:bg-muted/50">
                    <Avatar><AvatarFallback>{initials(name)}</AvatarFallback></Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline justify-between gap-2">
                        <p className="truncate font-semibold">{name}</p>
                        {c.lastMessageAt && <span className="text-xs tabular-nums text-muted-foreground">{timeAgo(c.lastMessageAt)}</span>}
                      </div>
                      <p className="truncate text-sm text-muted-foreground">{c.lastMessage || `About: ${c.listingTitle}`}</p>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}

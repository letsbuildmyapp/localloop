import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  addDoc, collection, doc, getDoc, onSnapshot, orderBy, query, serverTimestamp, updateDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/auth";
import type { Conversation, Message } from "@/types";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { initials, timeAgo } from "@/lib/utils";
import { ArrowLeft, Send } from "lucide-react";

export default function ConversationPage() {
  const { id } = useParams();
  const { profile } = useAuth();
  const nav = useNavigate();
  const [conv, setConv] = useState<Conversation | null | undefined>(undefined);
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!id) return;
    (async () => {
      const snap = await getDoc(doc(db, "conversations", id));
      setConv(snap.exists() ? { id: snap.id, ...(snap.data() as any) } : null);
    })();
    const unsub = onSnapshot(
      query(collection(db, "conversations", id, "messages"), orderBy("createdAt", "asc")),
      (snap) => {
        setMessages(snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })));
        requestAnimationFrame(() => scrollRef.current?.scrollTo({ top: 999999, behavior: "smooth" }));
      }
    );
    return () => unsub();
  }, [id]);

  if (conv === undefined) return <div className="container py-10">Loading…</div>;
  if (conv === null) return <div className="container py-10">Conversation not found</div>;
  if (!profile) return null;

  const otherId = conv.participants.find((p) => p !== profile.id) ?? "";
  const otherName = conv.participantNames[otherId] ?? "Member";

  async function send(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim() || !id) return;
    const t = text.trim();
    setText("");
    await addDoc(collection(db, "conversations", id, "messages"), {
      conversationId: id, senderId: profile!.id, text: t, createdAt: Date.now(),
      _serverCreatedAt: serverTimestamp(),
    });
    await updateDoc(doc(db, "conversations", id), {
      lastMessage: t, lastMessageAt: Date.now(),
    });
  }

  return (
    <section className="container max-w-2xl py-6">
      <header className="flex items-center gap-3 border-b pb-4">
        <Button variant="ghost" size="icon" onClick={() => nav(-1)}><ArrowLeft className="h-4 w-4" /></Button>
        <Avatar><AvatarFallback>{initials(otherName)}</AvatarFallback></Avatar>
        <div>
          <p className="font-semibold">{otherName}</p>
          {conv.listingTitle && <p className="text-xs text-muted-foreground">About: {conv.listingTitle}</p>}
        </div>
      </header>

      <div ref={scrollRef} className="my-4 h-[60vh] space-y-3 overflow-y-auto pr-1">
        {messages.length === 0 ? (
          <p className="py-10 text-center text-sm text-muted-foreground">Say hi — start the conversation.</p>
        ) : messages.map((m) => {
          const mine = m.senderId === profile!.id;
          return (
            <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[80%] rounded-md px-4 py-2 text-sm shadow-sm ${mine ? "bg-primary text-primary-foreground" : "bg-card border"}`}>
                <p>{m.text}</p>
                <p className={`mt-1 text-xs tabular-nums ${mine ? "text-primary-foreground/90" : "text-muted-foreground"}`}>{timeAgo(m.createdAt)}</p>
              </div>
            </div>
          );
        })}
      </div>

      <form onSubmit={send} className="flex gap-2">
        <Input placeholder={`Message ${otherName.split(" ")[0]}…`} value={text} onChange={(e) => setText(e.target.value)} />
        <Button type="submit" size="icon" disabled={!text.trim()}><Send className="h-4 w-4" /></Button>
      </form>
    </section>
  );
}

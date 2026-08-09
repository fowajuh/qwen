import { useEffect, useRef, useState } from "react";
import { WS_BASE } from "./api-client";
import { auth } from "./auth";

type PresenceUser = { userId: string; name: string };
type WsMessage =
  | { type: "presence"; tripId: string; users: PresenceUser[] }
  | { type: "comment"; tripId: string; stopId: string; comment: unknown }
  | { type: "trip.updated"; tripId: string }
  | { type: "error"; message: string };

/** Live presence + comment fan-out for a trip (§3.6). Falls back to
 * "no one else here" silently if the socket can't connect — the REST
 * comment/trip data is always the source of truth, this is a nice-to-have
 * live layer on top (§5 Stage 4 graceful degradation principle applied early). */
export function useTripRealtime(tripId: string | null, onComment?: (stopId: string, comment: unknown) => void) {
  const [presence, setPresence] = useState<PresenceUser[]>([]);
  const [connected, setConnected] = useState(false);
  const socketRef = useRef<WebSocket | null>(null);
  const onCommentRef = useRef(onComment);
  onCommentRef.current = onComment;

  useEffect(() => {
    if (!tripId) return;
    const token = auth.getAccessToken();
    if (!token) return;

    const socket = new WebSocket(`${WS_BASE}/ws/trips?token=${encodeURIComponent(token)}&tripId=${tripId}`);
    socketRef.current = socket;

    socket.onopen = () => setConnected(true);
    socket.onclose = () => setConnected(false);
    socket.onmessage = (event) => {
      try {
        const msg: WsMessage = JSON.parse(event.data);
        if (msg.type === "presence") setPresence(msg.users);
        if (msg.type === "comment") onCommentRef.current?.(msg.stopId, msg.comment);
      } catch {
        // ignore malformed frames
      }
    };

    return () => {
      socket.close();
      socketRef.current = null;
    };
  }, [tripId]);

  const sendComment = (stopId: string, body: string) => {
    socketRef.current?.send(JSON.stringify({ event: "comment", data: { stopId, body } }));
  };

  return { presence, connected, sendComment };
}

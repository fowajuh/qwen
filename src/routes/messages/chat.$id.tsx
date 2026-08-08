import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion, AnimatePresence } from "motion/react";
import {
  ChevronLeft, Phone, Video, Info, MoreHorizontal,
  Paperclip, Send, Mic, Camera, MicOff, Image as ImageIcon,
  MapPin, X, Play, Square, Smile, ThumbsUp, Heart,
  Laugh, Flame, Zap, Check, CheckCheck, File, PhoneCall, Loader2
} from "lucide-react";
import { useState, useRef, useEffect, useCallback } from "react";
import { useChat, useConversations } from "@/hooks/use-messages";

export const Route = createFileRoute("/messages/chat/$id")({
  component: ChatDetail,
});

/* ─── TYPES ─── */
interface Message {
  id: string;
  text?: string;
  audio?: { url: string; duration: number };
  image?: string;
  from: "me" | "other";
  time: string;
  read?: boolean;
  reactions?: string[];
}

const REACTIONS = ["❤️", "😂", "🔥", "👍", "⚡", "😮"];

/* ─── REACTION ICONS ─── */
const ReactionIcon = ({ emoji }: { emoji: string }) => {
  const map: Record<string, JSX.Element> = {
    "❤️": <Heart size={14} className="text-red-500 fill-red-500" />,
    "😂": <Laugh size={14} className="text-amber-500" />,
    "🔥": <Flame size={14} className="text-orange-500" />,
    "👍": <ThumbsUp size={14} className="text-blue-500" />,
    "⚡": <Zap size={14} className="text-yellow-500" />,
    "😮": <Smile size={14} className="text-purple-500" />,
  };
  return map[emoji] || null;
};

/* ─── VOICE RECORDER COMPONENT ─── */
function VoiceRecorder({
  onSend,
  onCancel,
}: {
  onSend: (blob: Blob, duration: number) => void;
  onCancel: () => void;
}) {
  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const [levels, setLevels] = useState<number[]>(Array(24).fill(4));
  const mediaRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number>(0);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRef.current = mediaRecorder;
      chunksRef.current = [];

      // Audio analysis for waveform visualization
      const ctx = new AudioContext();
      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 64;
      source.connect(analyser);
      analyserRef.current = analyser;

      const drawWaveform = () => {
        const data = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(data);
        const newLevels = Array.from({ length: 24 }, (_, i) => {
          const idx = Math.floor((i / 24) * data.length);
          return Math.max(4, (data[idx] / 255) * 48);
        });
        setLevels(newLevels);
        animFrameRef.current = requestAnimationFrame(drawWaveform);
      };
      drawWaveform();

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.start(100);
      setIsRecording(true);

      intervalRef.current = setInterval(() => setDuration((d) => d + 1), 1000);
    } catch {
      onCancel();
    }
  }, [onCancel]);

  const stopAndSend = useCallback(() => {
    if (!mediaRef.current) return;
    mediaRef.current.stop();
    mediaRef.current.stream.getTracks().forEach((t) => t.stop());
    if (intervalRef.current) clearInterval(intervalRef.current);
    cancelAnimationFrame(animFrameRef.current);

    setTimeout(() => {
      const blob = new Blob(chunksRef.current, { type: "audio/webm" });
      onSend(blob, duration);
    }, 100);
  }, [duration, onSend]);

  const cancel = useCallback(() => {
    if (mediaRef.current) {
      mediaRef.current.stop();
      mediaRef.current.stream.getTracks().forEach((t) => t.stop());
    }
    if (intervalRef.current) clearInterval(intervalRef.current);
    cancelAnimationFrame(animFrameRef.current);
    onCancel();
  }, [onCancel]);

  useEffect(() => {
    startRecording();
    return () => {
      if (mediaRef.current?.state === "recording") mediaRef.current.stop();
      if (intervalRef.current) clearInterval(intervalRef.current);
      cancelAnimationFrame(animFrameRef.current);
    };
  }, [startRecording]);

  const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-3 bg-foreground/5 rounded-3xl px-4 py-3"
    >
      {/* Cancel */}
      <button onClick={cancel} className="w-9 h-9 rounded-full bg-red-500/15 flex items-center justify-center text-red-500 shrink-0">
        <X size={18} />
      </button>

      {/* Waveform */}
      <div className="flex-1 flex items-center gap-0.5 h-10 overflow-hidden">
        {levels.map((h, i) => (
          <motion.div
            key={i}
            animate={{ height: h }}
            transition={{ duration: 0.08 }}
            className="w-[3px] bg-primary rounded-full shrink-0"
            style={{ minHeight: 4 }}
          />
        ))}
      </div>

      {/* Timer */}
      <span className="text-sm font-mono text-primary tabular-nums shrink-0">{fmt(duration)}</span>

      {/* Send */}
      <button onClick={stopAndSend} className="w-11 h-11 rounded-full bg-primary flex items-center justify-center shadow-lg shadow-primary/30 shrink-0">
        <Send size={18} className="text-white ml-0.5" />
      </button>
    </motion.div>
  );
}

/* ─── AUDIO PLAYER ─── */
function AudioMessage({ url, duration, fromMe }: { url: string; duration: number; fromMe: boolean }) {
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  const toggle = () => {
    if (!audioRef.current) {
      audioRef.current = new Audio(url);
      audioRef.current.ontimeupdate = () => {
        const pct = (audioRef.current!.currentTime / audioRef.current!.duration) * 100;
        setProgress(isNaN(pct) ? 0 : pct);
      };
      audioRef.current.onended = () => { setPlaying(false); setProgress(0); };
    }
    if (playing) { audioRef.current.pause(); setPlaying(false); }
    else { audioRef.current.play(); setPlaying(true); }
  };

  return (
    <div className={`flex items-center gap-3 px-4 py-3 rounded-2xl min-w-[200px] max-w-[260px] ${fromMe ? "bg-primary text-white" : "bg-background border border-border"}`}>
      <button onClick={toggle} className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${fromMe ? "bg-white/20" : "bg-primary/10"}`}>
        {playing ? <Square size={14} fill="currentColor" className={fromMe ? "text-white" : "text-primary"} /> : <Play size={14} className={fromMe ? "text-white" : "text-primary"} />}
      </button>
      <div className="flex-1 min-w-0">
        <div className={`h-1.5 rounded-full mb-1.5 ${fromMe ? "bg-white/20" : "bg-foreground/10"}`}>
          <motion.div
            className={`h-full rounded-full ${fromMe ? "bg-white" : "bg-primary"}`}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.1 }}
          />
        </div>
        <span className={`text-[11px] font-mono ${fromMe ? "text-white/60" : "text-muted-foreground"}`}>
          {fmt(duration)}
        </span>
      </div>
    </div>
  );
}

/* ─── CHAT DETAIL ─── */
function ChatDetail() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const [inputText, setInputText] = useState("");
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [showReactionPicker, setShowReactionPicker] = useState<string | null>(null);
  
  // Use real data from backend
  const { data: conversations = [] } = useConversations();
  const conversation = conversations.find(c => c.id === id);
  const { messages: apiMessages, isLoading, handleSend, newMessage, setNewMessage, isSending } = useChat(id);
  
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [apiMessages]);

  // Transform API messages to UI format
  const messages: Message[] = (apiMessages || []).map(msg => ({
    id: msg.id,
    text: msg.content,
    from: msg.sender_id === 'me' ? 'me' : 'other',
    time: new Date(msg.created_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
    read: msg.is_read,
  }));

  const sendText = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isSending) return;
    await handleSend();
    setInputText("");
  };

  const sendVoice = (blob: Blob, dur: number) => {
    const url = URL.createObjectURL(blob);
    // Voice messages would need backend support - for now just log
    console.log('Voice message recorded:', dur, 'seconds');
    setIsRecordingVoice(false);
  };

  const addReaction = (msgId: string, emoji: string) => {
    // Reactions would need backend support - for now just log
    console.log('Reaction added:', msgId, emoji);
    setShowReactionPicker(null);
  };

  return (
    <div className="flex flex-col h-full bg-background absolute inset-0 z-50 md:relative md:z-auto">

      {/* ─── HEADER ─── */}
      <div className="flex items-center justify-between px-4 py-3 bg-background/90 backdrop-blur-xl border-b border-border sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate({ to: "/messages" })}
            className="md:hidden w-10 h-10 flex items-center justify-center -ml-2 text-primary hover:bg-foreground/5 rounded-full transition-colors"
          >
            <ChevronLeft size={24} />
          </button>

          <div className="flex items-center gap-3 cursor-pointer group">
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-display text-sm">
                GM
              </div>
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-background" />
            </div>
            <div>
              <h2 className="font-semibold text-base leading-tight group-hover:text-primary transition-colors">
                {id.startsWith("b") ? "Kori Hair Studio" : "Graham McBride"}
              </h2>
              <span className="text-xs text-green-500 font-medium">Active now</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <Link
            to="/messages/call/$id"
            params={{ id }}
            className="w-10 h-10 rounded-full flex items-center justify-center text-primary hover:bg-primary/10 transition-colors"
          >
            <Phone size={20} />
          </Link>
          <Link
            to="/messages/call/$id"
            params={{ id }}
            className="w-10 h-10 rounded-full flex items-center justify-center text-primary hover:bg-primary/10 transition-colors"
          >
            <Video size={20} />
          </Link>
          <button className="w-10 h-10 rounded-full flex items-center justify-center text-muted-foreground hover:bg-foreground/5 transition-colors">
            <Info size={20} />
          </button>
        </div>
      </div>

      {/* ─── MESSAGES ─── */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 bg-muted/10">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="animate-spin" size={24} />
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p>No messages yet</p>
            <p className="text-sm mt-2">Start the conversation</p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-center my-2">
              <div className="text-xs text-muted-foreground bg-background/60 px-3 py-1 rounded-full backdrop-blur-sm border border-border/50">
                Today
              </div>
            </div>

            <AnimatePresence initial={false}>
              {messages.map((msg) => {
            const isMe = msg.from === "me";
            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 12, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ type: "spring", stiffness: 350, damping: 28 }}
                className={`flex ${isMe ? "justify-end" : "justify-start"} items-end gap-2 group`}
              >
                {/* Avatar for incoming */}
                {!isMe && (
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-[10px] font-display shrink-0">
                    GM
                  </div>
                )}

                <div className={`relative max-w-[75%] md:max-w-[60%]`}>
                  {/* Message bubble */}
                  {msg.audio ? (
                    <AudioMessage url={msg.audio.url} duration={msg.audio.duration} fromMe={isMe} />
                  ) : (
                    <div
                      className={`px-4 py-2.5 rounded-2xl ${
                        isMe
                          ? "bg-primary text-primary-foreground rounded-br-sm"
                          : "bg-background border border-border text-foreground rounded-bl-sm"
                      }`}
                    >
                      <p className="text-base leading-relaxed">{msg.text}</p>
                    </div>
                  )}

                  {/* Reactions */}
                  {msg.reactions && msg.reactions.length > 0 && (
                    <div className={`absolute -bottom-3 ${isMe ? "right-1" : "left-1"} flex gap-0.5`}>
                      {msg.reactions.slice(0, 3).map((r, i) => (
                        <div key={i} className="w-5 h-5 bg-background border border-border rounded-full flex items-center justify-center shadow-sm">
                          <ReactionIcon emoji={r} />
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Long-press reaction button */}
                  <button
                    onClick={() => setShowReactionPicker(showReactionPicker === msg.id ? null : msg.id)}
                    className={`absolute top-1/2 -translate-y-1/2 ${isMe ? "-left-8" : "-right-8"} w-7 h-7 rounded-full bg-background border border-border flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm`}
                  >
                    <Smile size={14} className="text-muted-foreground" />
                  </button>

                  {/* Reaction picker */}
                  <AnimatePresence>
                    {showReactionPicker === msg.id && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className={`absolute -top-14 ${isMe ? "right-0" : "left-0"} flex gap-1 bg-background border border-border rounded-2xl p-2 shadow-xl z-20`}
                      >
                        {[
                          { emoji: "❤️", Icon: <Heart size={18} className="text-red-500 fill-red-500" /> },
                          { emoji: "😂", Icon: <Laugh size={18} className="text-amber-500" /> },
                          { emoji: "🔥", Icon: <Flame size={18} className="text-orange-500" /> },
                          { emoji: "👍", Icon: <ThumbsUp size={18} className="text-blue-500" /> },
                          { emoji: "⚡", Icon: <Zap size={18} className="text-yellow-500" /> },
                          { emoji: "😮", Icon: <Smile size={18} className="text-purple-500" /> },
                        ].map(({ emoji, Icon }) => (
                          <motion.button
                            key={emoji}
                            whileTap={{ scale: 0.8 }}
                            whileHover={{ scale: 1.2 }}
                            onClick={() => addReaction(msg.id, emoji)}
                            className="w-9 h-9 rounded-xl hover:bg-foreground/5 flex items-center justify-center transition-colors"
                          >
                            {Icon}
                          </motion.button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Time + read receipt */}
                {/* Extra left margin on incoming messages clears the absolutely-positioned
                    hover reaction button (`-right-8` off the bubble wrapper), which would
                    otherwise sit underneath this timestamp when revealed on hover. */}
                <div className={`text-[10px] text-muted-foreground self-end mb-1 flex items-center gap-1 ${isMe ? "flex-row-reverse" : "ml-8"}`}>
                  <span>{msg.time}</span>
                  {isMe && (
                    msg.read
                      ? <CheckCheck size={13} className="text-primary" />
                      : <Check size={13} />
                  )}
                </div>
              </motion.div>
            );
          })}
          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-start items-end gap-2"
            >
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-[10px] font-display shrink-0">
                GM
              </div>
              <div className="bg-background border border-border rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-1">
                <motion.div animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0 }} className="w-1.5 h-1.5 bg-muted-foreground rounded-full" />
                <motion.div animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }} className="w-1.5 h-1.5 bg-muted-foreground rounded-full" />
                <motion.div animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }} className="w-1.5 h-1.5 bg-muted-foreground rounded-full" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div ref={bottomRef} />
      </div>

      {/* ─── INPUT AREA ─── */}
      <div className="p-3 bg-background border-t border-border">
        <AnimatePresence mode="wait">
          {isRecordingVoice ? (
            <VoiceRecorder
              key="recorder"
              onSend={sendVoice}
              onCancel={() => setIsRecordingVoice(false)}
            />
          ) : (
            <motion.form
              key="input"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onSubmit={sendText}
              className="flex items-end gap-2 bg-foreground/5 rounded-3xl p-1.5 pr-2"
            >
              {/* Attachment */}
              <button
                type="button"
                className="w-9 h-9 rounded-full flex shrink-0 items-center justify-center text-muted-foreground hover:bg-foreground/10 hover:text-foreground transition-colors"
              >
                <Paperclip size={19} />
              </button>

              {/* Camera */}
              <button
                type="button"
                className="w-9 h-9 rounded-full flex shrink-0 items-center justify-center text-muted-foreground hover:bg-foreground/10 hover:text-foreground transition-colors"
              >
                <Camera size={19} />
              </button>

              {/* Text input */}
              <input
                ref={inputRef}
                type="text"
                placeholder="Message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                className="flex-1 bg-transparent py-2 outline-none text-foreground text-base placeholder:text-muted-foreground"
              />

              {/* Voice note OR send */}
              <AnimatePresence mode="wait">
                {newMessage.trim() ? (
                  <motion.button
                    key="send"
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.5, opacity: 0 }}
                    type="submit"
                    className="w-10 h-10 bg-primary text-white rounded-full flex shrink-0 items-center justify-center shadow-md shadow-primary/30 hover:opacity-90 transition-opacity"
                  >
                    <Send size={17} className="ml-0.5" />
                  </motion.button>
                ) : (
                  <motion.button
                    key="mic"
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.5, opacity: 0 }}
                    type="button"
                    onClick={() => setIsRecordingVoice(true)}
                    className="w-10 h-10 bg-foreground/8 rounded-full flex shrink-0 items-center justify-center text-primary hover:bg-primary/10 transition-colors"
                  >
                    <Mic size={19} />
                  </motion.button>
                )}
              </AnimatePresence>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { motion, AnimatePresence } from "motion/react";
import {
  Mic, MicOff, Video, VideoOff, PhoneOff,
  Maximize2, Volume2, VolumeX, ScreenShare,
  ChevronDown, MessageCircle, RotateCcw,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";

export const Route = createFileRoute("/messages/call/$id")({
  component: CallScreen,
});

/* ─── ANIMATED WAVEFORM ─── */
function CallWaveform({ active }: { active: boolean }) {
  const bars = 9;
  return (
    <div className="flex items-end justify-center gap-1 h-8">
      {Array.from({ length: bars }).map((_, i) => (
        <motion.div
          key={i}
          className="w-1.5 bg-white/60 rounded-full"
          animate={
            active
              ? {
                  height: ["30%", `${40 + Math.random() * 60}%`, "30%"],
                  opacity: [0.5, 1, 0.5],
                }
              : { height: "15%", opacity: 0.3 }
          }
          transition={{
            duration: 0.6 + i * 0.08,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.07,
          }}
        />
      ))}
    </div>
  );
}

/* ─── CONTROL BUTTON ─── */
function ControlBtn({
  icon,
  label,
  active,
  danger,
  large,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  danger?: boolean;
  large?: boolean;
  onClick: () => void;
}) {
  return (
    <motion.button
      whileTap={{ scale: 0.9 }}
      onClick={onClick}
      className="flex flex-col items-center gap-2"
    >
      <div
        className={`flex items-center justify-center rounded-full transition-all ${
          large ? "w-20 h-20" : "w-16 h-16"
        } ${
          danger
            ? "bg-red-500 shadow-xl shadow-red-500/40 hover:bg-red-600"
            : active
            ? "bg-white text-black shadow-lg"
            : "bg-white/15 hover:bg-white/25 backdrop-blur-md"
        }`}
      >
        {icon}
      </div>
      <span className="text-white/60 text-xs font-medium">{label}</span>
    </motion.button>
  );
}

/* ─── CALL SCREEN ─── */
function CallScreen() {
  const { id } = Route.useParams();
  const navigate = useNavigate();

  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(false);
  const [isSpeaker, setIsSpeaker] = useState(true);
  const [isSharing, setIsSharing] = useState(false);
  const [duration, setDuration] = useState(0);
  const [callPhase, setCallPhase] = useState<"connecting" | "ringing" | "active">("connecting");

  useEffect(() => {
    // Simulate call connecting → ringing → active
    const t1 = setTimeout(() => setCallPhase("ringing"), 800);
    const t2 = setTimeout(() => setCallPhase("active"), 2500);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  useEffect(() => {
    if (callPhase !== "active") return;
    const timer = setInterval(() => setDuration((d) => d + 1), 1000);
    return () => clearInterval(timer);
  }, [callPhase]);

  const formatTime = (s: number) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
    return `${m}:${String(sec).padStart(2, "0")}`;
  };

  const endCall = () => navigate({ to: "/messages" });
  const backToMessages = () => navigate({ to: `/messages/chat/${id}` as any });

  const isBusinessChat = id.startsWith("b");
  const callerName = isBusinessChat ? "Kori Hair Studio" : "Graham McBride";
  const callerInitials = isBusinessChat ? "KH" : "GM";

  return (
    <div className="fixed inset-0 z-[100] overflow-hidden select-none">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-[oklch(0.2_0.1_260)] via-[oklch(0.12_0.05_270)] to-[oklch(0.08_0.02_280)]" />

      {/* Animated background orbs */}
      <motion.div
        className="absolute top-[-20%] left-[-20%] w-[600px] h-[600px] rounded-full"
        style={{ background: "radial-gradient(circle, oklch(0.5 0.2 260 / 0.15), transparent)" }}
        animate={{ scale: [1, 1.1, 1], x: [0, 30, 0], y: [0, -20, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full"
        style={{ background: "radial-gradient(circle, oklch(0.55 0.25 200 / 0.12), transparent)" }}
        animate={{ scale: [1.1, 1, 1.1], x: [0, -20, 0], y: [0, 20, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Noise overlay */}
      <div className="absolute inset-0 opacity-[0.03] bg-[url('/noise.png')] bg-repeat" />

      {/* ─── CONTENT ─── */}
      <div className="relative z-10 flex flex-col h-full text-white">

        {/* ─── TOP BAR ─── */}
        <div className="flex items-center justify-between px-6 pt-14 pb-4">
          <button
            onClick={backToMessages}
            className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center hover:bg-white/20 transition-colors"
          >
            <ChevronDown size={22} />
          </button>
          <div className="flex items-center gap-2 text-sm font-medium text-white/60">
            <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            <span>
              {callPhase === "connecting" ? "Connecting..." : callPhase === "ringing" ? "Ringing..." : "Encrypted call"}
            </span>
          </div>
          <button className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center hover:bg-white/20 transition-colors">
            <Maximize2 size={18} />
          </button>
        </div>

        {/* ─── CALLER INFO ─── */}
        <div className="flex flex-col items-center flex-1 justify-center -mt-8">
          {/* Avatar with pulsing rings */}
          <motion.div
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 180, damping: 18, delay: 0.2 }}
            className="relative mb-10"
          >
            {/* Pulsing rings - only active during ringing or connecting */}
            <AnimatePresence>
              {callPhase !== "active" && [1, 2, 3].map((r) => (
                <motion.div
                  key={r}
                  initial={{ scale: 0.8, opacity: 0.6 }}
                  animate={{ scale: 1 + r * 0.25, opacity: 0 }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: r * 0.5,
                    ease: "easeOut",
                  }}
                  className="absolute inset-0 rounded-full border-2 border-white/30"
                />
              ))}
            </AnimatePresence>

            {/* Call quality rings for active call */}
            <AnimatePresence>
              {callPhase === "active" && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute inset-[-16px] rounded-full border border-white/10"
                />
              )}
            </AnimatePresence>

            {/* Avatar */}
            <div className="w-36 h-36 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center font-display text-4xl font-bold text-white shadow-2xl ring-4 ring-white/10">
              {callerInitials}
            </div>
          </motion.div>

          {/* Name */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="font-display text-4xl font-bold tracking-tight text-center mb-2"
          >
            {callerName}
          </motion.h1>

          {/* Status / Timer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-white/60 text-lg font-medium tracking-wide mb-8"
          >
            {callPhase === "active" ? formatTime(duration) : callPhase === "ringing" ? "Ringing..." : "Connecting..."}
          </motion.div>

          {/* Waveform (active only) */}
          <AnimatePresence>
            {callPhase === "active" && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mb-6"
              >
                <CallWaveform active={!isMuted} />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Encryption badge */}
          {callPhase === "active" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="flex items-center gap-2 text-xs text-white/40 bg-white/5 border border-white/10 rounded-full px-4 py-1.5"
            >
              <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L4 5v6.09c0 5.05 3.41 9.76 8 10.91 4.59-1.15 8-5.86 8-10.91V5L12 2z"/>
              </svg>
              End-to-end encrypted
            </motion.div>
          )}
        </div>

        {/* ─── SECONDARY CONTROLS ─── */}
        <div className="px-8 pb-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex justify-center gap-6 mb-6"
          >
            <ControlBtn
              icon={isSpeaker ? <Volume2 size={22} className="text-white" /> : <VolumeX size={22} className="text-black" />}
              label={isSpeaker ? "Speaker" : "Earpiece"}
              active={!isSpeaker}
              onClick={() => setIsSpeaker((s) => !s)}
            />
            <ControlBtn
              icon={<MessageCircle size={22} className="text-white" />}
              label="Message"
              onClick={backToMessages}
            />
            <ControlBtn
              icon={<RotateCcw size={22} className="text-white" />}
              label="Flip"
              onClick={() => {}}
            />
          </motion.div>
        </div>

        {/* ─── MAIN CONTROLS ─── */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, type: "spring", stiffness: 200, damping: 24 }}
          className="px-8 pb-16 flex items-center justify-center gap-6"
        >
          <ControlBtn
            icon={isMuted ? <MicOff size={26} className="text-black" /> : <Mic size={26} className="text-white" />}
            label={isMuted ? "Unmute" : "Mute"}
            active={isMuted}
            onClick={() => setIsMuted((m) => !m)}
          />

          <ControlBtn
            icon={<VideoOff size={26} className={isVideoOn ? "text-black" : "text-white"} />}
            label={isVideoOn ? "Camera Off" : "Camera"}
            active={isVideoOn}
            onClick={() => setIsVideoOn((v) => !v)}
          />

          {/* End call — large center */}
          <motion.button
            whileTap={{ scale: 0.88 }}
            onClick={endCall}
            className="w-20 h-20 rounded-full bg-red-500 flex items-center justify-center shadow-2xl shadow-red-500/40 hover:bg-red-600 transition-colors"
          >
            <PhoneOff size={32} className="text-white" />
          </motion.button>

          <ControlBtn
            icon={<ScreenShare size={26} className={isSharing ? "text-black" : "text-white"} />}
            label={isSharing ? "Sharing" : "Share"}
            active={isSharing}
            onClick={() => setIsSharing((s) => !s)}
          />

          <ControlBtn
            icon={<Maximize2 size={26} className="text-white" />}
            label="Fullscreen"
            onClick={() => {}}
          />
        </motion.div>
      </div>
    </div>
  );
}

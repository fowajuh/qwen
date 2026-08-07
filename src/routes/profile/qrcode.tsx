import { createFileRoute } from "@tanstack/react-router";
import { ArrowLeft, Share, Download, QrCode } from "lucide-react";
import { motion } from "motion/react";

export const Route = createFileRoute("/profile/qrcode")({
  component: ProfileQRCode,
});

export default function ProfileQRCode() {
  return (
    <div className="w-full min-h-screen bg-foreground text-background flex flex-col">
      {/* Header */}
      <div className="px-4 py-3 flex items-center justify-between pt-safe">
        <button onClick={() => window.history.back()} className="p-2 -ml-2 rounded-full hover:bg-white/10 text-background">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="font-bold text-[16px]">Share profile</h1>
        <div className="w-10" />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-6 pb-24">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", damping: 20 }}
          className="w-full max-w-[320px] bg-background text-foreground rounded-3xl p-8 shadow-2xl flex flex-col items-center text-center"
        >
          <div className="w-20 h-20 rounded-full overflow-hidden bg-surface mb-4 shadow-md">
            <img src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&auto=format&fit=crop" alt="" className="w-full h-full object-cover" />
          </div>
          <h2 className="text-[24px] font-bold mb-1">Alex Parker</h2>
          <p className="text-muted-foreground text-[15px] mb-8">@alexparker</p>

          <div className="w-48 h-48 bg-surface rounded-2xl flex items-center justify-center border-4 border-foreground p-4">
            {/* Mock QR Code Pattern */}
            <div className="w-full h-full grid grid-cols-5 gap-1">
              {Array.from({ length: 25 }).map((_, i) => (
                <div key={i} className={`bg-foreground rounded-sm ${Math.random() > 0.4 ? 'opacity-100' : 'opacity-0'}`} />
              ))}
            </div>
            <div className="absolute bg-background p-1.5 rounded-lg">
              <QrCode className="w-6 h-6 text-foreground" />
            </div>
          </div>
        </motion.div>

        <div className="flex gap-4 mt-12">
          <button className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center hover:bg-white/30 transition-colors">
            <Share className="w-6 h-6 text-background" />
          </button>
          <button className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center hover:bg-white/30 transition-colors">
            <Download className="w-6 h-6 text-background" />
          </button>
        </div>
      </div>
    </div>
  );
}

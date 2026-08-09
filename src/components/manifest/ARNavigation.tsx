import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Navigation, 
  Compass, 
  MapPin, 
  Target, 
  ArrowRight, 
  Scan, 
  Smartphone,
  Sparkles,
  ChevronRight,
  X,
  Play,
  Pause,
  Rotate3D,
  Glasses,
  Maximize2,
  Volume2,
  VolumeX,
  Info
} from 'lucide-react';

interface Room {
  id: string;
  name: string;
  type: string;
  tour360Url?: string;
  arAnchorId?: string;
  position?: { x: number; y: number; z: number };
  description?: string;
  image?: string;
}

interface ARNavigationProps {
  rooms: Room[];
  destinationRoomId?: string;
  listingId?: string;
  propertyAddress?: string;
  onNavigateComplete?: () => void;
}

export const ARNavigation: React.FC<ARNavigationProps> = ({
  rooms,
  destinationRoomId,
  listingId,
  propertyAddress,
  onNavigateComplete,
}) => {
  const [isARActive, setIsARActive] = useState(false);
  const [currentRoomIndex, setCurrentRoomIndex] = useState(0);
  const [navigationProgress, setNavigationProgress] = useState(0);
  const [showInstructions, setShowInstructions] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [scanProgress, setScanProgress] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const currentRoom = rooms[currentRoomIndex];
  const destinationRoom = rooms.find(r => r.id === destinationRoomId) || rooms[0];

  // Simulate AR camera activation
  const startAR = async () => {
    try {
      // In production, this would use WebXR or native ARKit/ARCore
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setIsARActive(true);
      setShowInstructions(false);
      
      // Simulate surface scanning
      let progress = 0;
      const scanInterval = setInterval(() => {
        progress += 5;
        setScanProgress(progress);
        if (progress >= 100) {
          clearInterval(scanInterval);
        }
      }, 100);

    } catch (err) {
      console.warn('AR not supported, falling back to 3D mode');
      setIsARActive(true);
      setShowInstructions(false);
    }
  };

  const stopAR = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsARActive(false);
    setScanProgress(0);
  };

  const navigateToNextRoom = () => {
    setNavigationProgress(0);
    const interval = setInterval(() => {
      setNavigationProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setCurrentRoomIndex(prevIdx => (prevIdx + 1) % rooms.length);
          return 0;
        }
        return prev + 10;
      });
    }, 100);
  };

  useEffect(() => {
    return () => stopAR();
  }, []);

  return (
    <div className="relative w-full h-full min-h-[600px] bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 rounded-3xl overflow-hidden">
      {/* AR Video Background */}
      {isARActive && (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="absolute inset-0 w-full h-full object-cover opacity-60"
        />
      )}

      {/* Animated Grid Overlay */}
      <div className="absolute inset-0 opacity-20">
        <div 
          className="w-full h-full"
          style={{
            backgroundImage: `
              linear-gradient(to right, #6366f1 1px, transparent 1px),
              linear-gradient(to bottom, #6366f1 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px',
            animation: 'gridMove 20s linear infinite',
          }}
        />
      </div>

      {/* Scanning Effect */}
      {isARActive && scanProgress < 100 && (
        <motion.div
          className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-80"
          initial={{ top: '0%' }}
          animate={{ top: '100%' }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        />
      )}

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between p-6">
        <motion.div 
          className="flex items-center gap-3"
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
        >
          <div className="p-3 bg-indigo-600/90 backdrop-blur-md rounded-2xl shadow-lg shadow-indigo-500/30">
            <Navigation className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">AR Navigation</h3>
            <p className="text-sm text-indigo-200">{propertyAddress || 'Property Tour'}</p>
          </div>
        </motion.div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setAudioEnabled(!audioEnabled)}
            className="p-3 bg-white/10 backdrop-blur-md rounded-xl hover:bg-white/20 transition-colors"
          >
            {audioEnabled ? (
              <Volume2 className="w-5 h-5 text-white" />
            ) : (
              <VolumeX className="w-5 h-5 text-white" />
            )}
          </button>
          <button
            onClick={stopAR}
            className="p-3 bg-white/10 backdrop-blur-md rounded-xl hover:bg-white/20 transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>

      {/* Instructions Overlay */}
      <AnimatePresence>
        {showInstructions && (
          <motion.div
            className="absolute inset-0 z-30 flex items-center justify-center p-6 bg-black/70 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-8 max-w-md border border-slate-700 shadow-2xl"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-indigo-600 rounded-2xl">
                  <Smartphone className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white">AR Experience</h3>
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-indigo-600/20 rounded-lg">
                    <Scan className="w-5 h-5 text-indigo-400" />
                  </div>
                  <div>
                    <p className="font-semibold text-white">Point your camera</p>
                    <p className="text-sm text-slate-400">Aim at floors and walls for best tracking</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-indigo-600/20 rounded-lg">
                    <Target className="w-5 h-5 text-indigo-400" />
                  </div>
                  <div>
                    <p className="font-semibold text-white">Follow the path</p>
                    <p className="text-sm text-slate-400">AR arrows will guide you room to room</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-indigo-600/20 rounded-lg">
                    <Sparkles className="w-5 h-5 text-indigo-400" />
                  </div>
                  <div>
                    <p className="font-semibold text-white">Discover details</p>
                    <p className="text-sm text-slate-400">Tap hotspots for room information</p>
                  </div>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={startAR}
                className="w-full py-4 bg-gradient-to-r from-indigo-600 to-violet-600 rounded-2xl font-bold text-white shadow-lg shadow-indigo-500/30 flex items-center justify-center gap-2"
              >
                <Sparkles className="w-5 h-5" />
                Start AR Experience
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* AR Content */}
      {isARActive && (
        <>
          {/* Navigation Path Indicator */}
          <div className="absolute inset-x-0 bottom-32 z-10 px-6">
            <div className="bg-black/40 backdrop-blur-md rounded-2xl p-4 border border-white/10">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-white/80">Navigating to</span>
                <span className="text-xs text-indigo-300">{currentRoomIndex + 1} of {rooms.length} rooms</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-600 rounded-xl">
                  <MapPin className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-white">{destinationRoom.name}</p>
                  <p className="text-xs text-slate-300 capitalize">{destinationRoom.type}</p>
                </div>
                <ArrowRight className="w-5 h-5 text-indigo-400" />
              </div>

              {/* Progress Bar */}
              <div className="mt-3 h-2 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-indigo-500 to-violet-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${navigationProgress}%` }}
                />
              </div>
            </div>
          </div>

          {/* Room Hotspots */}
          {rooms.map((room, idx) => (
            <motion.div
              key={room.id}
              className="absolute z-20 cursor-pointer"
              style={{
                left: `${20 + (idx * 15)}%`,
                top: `${30 + (idx % 3) * 20}%`,
              }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: idx * 0.2 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => {
                setCurrentRoomIndex(idx);
                navigateToNextRoom();
              }}
            >
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-full flex items-center justify-center shadow-lg shadow-indigo-500/50 border-2 border-white/50">
                  <Compass className="w-6 h-6 text-white" />
                </div>
                <motion.div
                  className="absolute inset-0 bg-indigo-500 rounded-full"
                  animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </div>
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 whitespace-nowrap">
                <span className="px-3 py-1 bg-black/70 backdrop-blur-md rounded-full text-xs font-medium text-white">
                  {room.name}
                </span>
              </div>
            </motion.div>
          ))}

          {/* Scan Progress */}
          {scanProgress < 100 && (
            <div className="absolute top-24 left-1/2 -translate-x-1/2 z-20">
              <div className="bg-black/60 backdrop-blur-md rounded-full px-6 py-3 border border-white/20">
                <div className="flex items-center gap-3">
                  <Scan className="w-5 h-5 text-cyan-400 animate-pulse" />
                  <span className="text-sm font-medium text-white">Scanning environment... {scanProgress}%</span>
                </div>
              </div>
            </div>
          )}

          {/* Bottom Controls */}
          <div className="absolute bottom-0 inset-x-0 z-20 p-6 bg-gradient-to-t from-black/80 to-transparent">
            <div className="flex items-center justify-center gap-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setCurrentRoomIndex(Math.max(0, currentRoomIndex - 1))}
                className="p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20"
                disabled={currentRoomIndex === 0}
              >
                <ArrowRight className="w-6 h-6 text-white rotate-180" />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={navigateToNextRoom}
                className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-violet-600 rounded-2xl font-bold text-white shadow-lg shadow-indigo-500/30 flex items-center gap-2"
              >
                <Navigation className="w-5 h-5" />
                Navigate to Next Room
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setCurrentRoomIndex(Math.min(rooms.length - 1, currentRoomIndex + 1))}
                className="p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20"
                disabled={currentRoomIndex === rooms.length - 1}
              >
                <ArrowRight className="w-6 h-6 text-white" />
              </motion.button>
            </div>
          </div>
        </>
      )}

      {/* Non-AR Fallback / 3D Mode */}
      {!isARActive && !showInstructions && (
        <div className="relative z-10 flex items-center justify-center h-full">
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Glasses className="w-20 h-20 text-indigo-400 mx-auto mb-6" />
            <h3 className="text-2xl font-bold text-white mb-2">3D Mode Active</h3>
            <p className="text-slate-300 mb-6">Camera access unavailable. Using 3D navigation instead.</p>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={startAR}
              className="px-6 py-3 bg-indigo-600 rounded-xl font-medium text-white"
            >
              Try AR Again
            </motion.button>
          </motion.div>
        </div>
      )}

      <style>{`
        @keyframes gridMove {
          0% { background-position: 0 0; }
          100% { background-position: 40px 40px; }
        }
      `}</style>
    </div>
  );
};

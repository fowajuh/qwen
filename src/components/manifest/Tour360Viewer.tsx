import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Glasses, 
  Rotate3D, 
  Maximize2, 
  Minimize2, 
  Play, 
  Pause, 
  Volume2, 
  VolumeX,
  Info,
  ChevronLeft,
  ChevronRight,
  Grid3X3,
  Layers,
  Sun,
  Moon,
  ZoomIn,
  ZoomOut,
  Home,
  Sparkles,
  X
} from 'lucide-react';

interface TourRoom {
  id: string;
  name: string;
  type: string;
  imageUrl360: string;
  thumbnailUrl: string;
  description?: string;
  hotspots?: TourHotspot[];
  connectedRooms?: string[]; // IDs of connected rooms
}

interface TourHotspot {
  id: string;
  x: number; // percentage 0-100
  y: number; // percentage 0-100
  type: 'info' | 'navigation' | 'feature' | 'amenity';
  label?: string;
  targetRoomId?: string;
  icon?: string;
}

interface Tour360ViewerProps {
  rooms: TourRoom[];
  initialRoomId?: string;
  autoRotate?: boolean;
  showHotspots?: boolean;
  enableFullscreen?: boolean;
  listingId?: string;
  propertyTitle?: string;
}

export const Tour360Viewer: React.FC<Tour360ViewerProps> = ({
  rooms,
  initialRoomId,
  autoRotate = false,
  showHotspots = true,
  enableFullscreen = true,
  listingId,
  propertyTitle = 'Virtual Tour',
}) => {
  const [currentRoomIndex, setCurrentRoomIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoRotate);
  const [rotation, setRotation] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showThumbnails, setShowThumbnails] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [activeHotspot, setActiveHotspot] = useState<TourHotspot | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const rotationRef = useRef<number>(0);

  const currentRoom = rooms[currentRoomIndex];

  // Auto-rotation effect
  useEffect(() => {
    let animationFrame: number;
    
    const animate = () => {
      if (isPlaying) {
        rotationRef.current = (rotationRef.current + 0.2) % 360;
        setRotation(rotationRef.current);
        animationFrame = requestAnimationFrame(animate);
      }
    };

    if (isPlaying) {
      animationFrame = requestAnimationFrame(animate);
    }

    return () => {
      if (animationFrame) cancelAnimationFrame(animationFrame);
    };
  }, [isPlaying]);

  // Simulate loading
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, [currentRoomIndex]);

  const navigateToRoom = (roomId: string) => {
    const idx = rooms.findIndex(r => r.id === roomId);
    if (idx !== -1) {
      setCurrentRoomIndex(idx);
      setRotation(0);
      setZoom(1);
    }
  };

  const handleHotspotClick = (hotspot: TourHotspot) => {
    if (hotspot.type === 'navigation' && hotspot.targetRoomId) {
      navigateToRoom(hotspot.targetRoomId);
    } else {
      setActiveHotspot(hotspot);
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  return (
    <div 
      ref={containerRef}
      className={`relative w-full ${isFullscreen ? 'h-screen' : 'h-[600px] md:h-[700px]'} bg-slate-900 rounded-3xl overflow-hidden`}
    >
      {/* Loading State */}
      {isLoading && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-900">
          <motion.div
            className="text-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className="relative w-20 h-20 mx-auto mb-4">
              <motion.div
                className="absolute inset-0 border-4 border-indigo-600/30 rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              />
              <motion.div
                className="absolute inset-2 border-4 border-t-indigo-500 border-r-transparent border-b-transparent border-l-transparent rounded-full"
                animate={{ rotate: -360 }}
                transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
              />
              <Glasses className="absolute inset-0 m-auto w-8 h-8 text-indigo-500" />
            </div>
            <p className="text-white font-medium">Loading 360° view...</p>
          </motion.div>
        </div>
      )}

      {/* 360° Panorama Container */}
      <div 
        className="absolute inset-0 overflow-hidden cursor-grab active:cursor-grabbing"
        style={{
          perspective: '1000px',
        }}
      >
        {/* Panoramic Image */}
        <motion.div
          className="absolute inset-0 w-[200%] h-full"
          style={{
            backgroundImage: `url(${currentRoom.imageUrl360})`,
            backgroundSize: 'cover',
            backgroundPosition: `${rotation}% center`,
            transform: `scale(${zoom})`,
            transformOrigin: 'center center',
            filter: darkMode ? 'brightness(0.7)' : 'brightness(1)',
          }}
          animate={{
            backgroundPosition: `${rotation}% center`,
            scale: zoom,
          }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        />

        {/* Overlay Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/40 pointer-events-none" />
      </div>

      {/* Header Controls */}
      <div className="absolute top-0 left-0 right-0 z-20 p-4 md:p-6">
        <div className="flex items-center justify-between">
          {/* Title */}
          <motion.div
            className="flex items-center gap-3"
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
          >
            <div className="p-3 bg-indigo-600/90 backdrop-blur-md rounded-2xl shadow-lg">
              <Glasses className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg md:text-xl font-bold text-white drop-shadow-md">
                {propertyTitle}
              </h3>
              <p className="text-xs md:text-sm text-white/80 drop-shadow-sm">
                {currentRoom.name} • {currentRoom.type}
              </p>
            </div>
          </motion.div>

          {/* Right Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setAudioEnabled(!audioEnabled)}
              className="p-2 md:p-3 bg-white/10 backdrop-blur-md rounded-xl hover:bg-white/20 transition-colors"
            >
              {audioEnabled ? (
                <Volume2 className="w-5 h-5 text-white" />
              ) : (
                <VolumeX className="w-5 h-5 text-white" />
              )}
            </button>

            <button
              onClick={() => setShowThumbnails(!showThumbnails)}
              className="p-2 md:p-3 bg-white/10 backdrop-blur-md rounded-xl hover:bg-white/20 transition-colors hidden md:block"
            >
              <Grid3X3 className="w-5 h-5 text-white" />
            </button>

            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 md:p-3 bg-white/10 backdrop-blur-md rounded-xl hover:bg-white/20 transition-colors"
            >
              {darkMode ? (
                <Sun className="w-5 h-5 text-amber-400" />
              ) : (
                <Moon className="w-5 h-5 text-white" />
              )}
            </button>

            {enableFullscreen && (
              <button
                onClick={toggleFullscreen}
                className="p-2 md:p-3 bg-white/10 backdrop-blur-md rounded-xl hover:bg-white/20 transition-colors"
              >
                {isFullscreen ? (
                  <Minimize2 className="w-5 h-5 text-white" />
                ) : (
                  <Maximize2 className="w-5 h-5 text-white" />
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Interactive Hotspots */}
      {showHotspots && currentRoom.hotspots?.map((hotspot, idx) => (
        <motion.button
          key={hotspot.id}
          className="absolute z-20 group"
          style={{
            left: `${hotspot.x}%`,
            top: `${hotspot.y}%`,
          }}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: idx * 0.1 }}
          whileHover={{ scale: 1.2 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => handleHotspotClick(hotspot)}
        >
          <div className="relative">
            {/* Pulsing Ring */}
            <motion.div
              className="absolute inset-0 bg-white/30 rounded-full"
              animate={{ scale: [1, 2, 1], opacity: [0.5, 0, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            
            {/* Icon Button */}
            <div className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center shadow-lg ${
              hotspot.type === 'navigation' 
                ? 'bg-gradient-to-br from-indigo-500 to-violet-600 border-2 border-white' 
                : 'bg-white/90 backdrop-blur-md'
            }`}>
              {hotspot.type === 'navigation' ? (
                <ChevronRight className="w-5 h-5 md:w-6 md:h-6 text-white" />
              ) : hotspot.type === 'info' ? (
                <Info className="w-5 h-5 md:w-6 md:h-6 text-indigo-600" />
              ) : hotspot.type === 'feature' ? (
                <Sparkles className="w-5 h-5 md:w-6 md:h-6 text-amber-500" />
              ) : (
                <Home className="w-5 h-5 md:w-6 md:h-6 text-emerald-500" />
              )}
            </div>

            {/* Label */}
            {hotspot.label && (
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="px-3 py-1.5 bg-black/80 backdrop-blur-md rounded-full text-xs md:text-sm font-medium text-white whitespace-nowrap">
                  {hotspot.label}
                </span>
              </div>
            )}
          </div>
        </motion.button>
      ))}

      {/* Bottom Controls */}
      <div className="absolute bottom-0 left-0 right-0 z-20 p-4 md:p-6">
        {/* Navigation Thumbnails */}
        <AnimatePresence>
          {showThumbnails && (
            <motion.div
              className="mb-4 flex gap-3 overflow-x-auto pb-2 scrollbar-hide"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
            >
              {rooms.map((room, idx) => (
                <motion.button
                  key={room.id}
                  className="flex-shrink-0 relative group"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigateToRoom(room.id)}
                >
                  <div className={`w-20 h-20 md:w-24 md:h-24 rounded-xl overflow-hidden border-2 transition-all ${
                    idx === currentRoomIndex 
                      ? 'border-indigo-500 ring-2 ring-indigo-500/50' 
                      : 'border-white/30 hover:border-white/60'
                  }`}>
                    <img
                      src={room.thumbnailUrl}
                      alt={room.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="absolute bottom-1 left-1 right-1">
                    <p className="text-xs font-medium text-white drop-shadow-md truncate">
                      {room.name}
                    </p>
                  </div>
                  {idx === currentRoomIndex && (
                    <div className="absolute inset-0 bg-indigo-600/20 rounded-xl" />
                  )}
                </motion.button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Control Bar */}
        <div className="bg-black/60 backdrop-blur-md rounded-2xl p-4 border border-white/10">
          <div className="flex items-center justify-between gap-4">
            {/* Play/Pause & Rotation */}
            <div className="flex items-center gap-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsPlaying(!isPlaying)}
                className="p-3 bg-indigo-600 rounded-xl hover:bg-indigo-700 transition-colors"
              >
                {isPlaying ? (
                  <Pause className="w-5 h-5 text-white" />
                ) : (
                  <Play className="w-5 h-5 text-white" />
                )}
              </motion.button>

              <div className="hidden md:flex items-center gap-2">
                <Rotate3D className="w-4 h-4 text-white/60" />
                <input
                  type="range"
                  min="0"
                  max="360"
                  value={rotation}
                  onChange={(e) => {
                    setRotation(Number(e.target.value));
                    rotationRef.current = Number(e.target.value);
                    setIsPlaying(false);
                  }}
                  className="w-32 accent-indigo-500"
                />
                <span className="text-xs text-white/60 w-12">{Math.round(rotation)}°</span>
              </div>
            </div>

            {/* Zoom Controls */}
            <div className="flex items-center gap-2 bg-white/10 rounded-lg p-1">
              <button
                onClick={() => setZoom(Math.max(1, zoom - 0.5))}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                disabled={zoom <= 1}
              >
                <ZoomOut className="w-4 h-4 text-white" />
              </button>
              <span className="text-xs text-white font-medium w-12 text-center">
                {Math.round(zoom * 100)}%
              </span>
              <button
                onClick={() => setZoom(Math.min(3, zoom + 0.5))}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                disabled={zoom >= 3}
              >
                <ZoomIn className="w-4 h-4 text-white" />
              </button>
            </div>

            {/* Room Navigation */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentRoomIndex(Math.max(0, currentRoomIndex - 1))}
                disabled={currentRoomIndex === 0}
                className="p-3 bg-white/10 rounded-xl hover:bg-white/20 transition-colors disabled:opacity-30"
              >
                <ChevronLeft className="w-5 h-5 text-white" />
              </button>
              
              <div className="text-center">
                <p className="text-sm font-bold text-white">
                  {currentRoomIndex + 1}
                </p>
                <p className="text-xs text-white/60">of {rooms.length}</p>
              </div>

              <button
                onClick={() => setCurrentRoomIndex(Math.min(rooms.length - 1, currentRoomIndex + 1))}
                disabled={currentRoomIndex === rooms.length - 1}
                className="p-3 bg-white/10 rounded-xl hover:bg-white/20 transition-colors disabled:opacity-30"
              >
                <ChevronRight className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Hotspot Detail Modal */}
      <AnimatePresence>
        {activeHotspot && (
          <>
            <motion.div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm z-30"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveHotspot(null)}
            />
            
            <motion.div
              className="absolute bottom-24 left-4 right-4 md:left-auto md:right-4 md:w-80 bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-2xl z-40"
              initial={{ y: 50, opacity: 0, scale: 0.9 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 50, opacity: 0, scale: 0.9 }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl">
                    {activeHotspot.type === 'info' ? (
                      <Info className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    ) : (
                      <Sparkles className="w-5 h-5 text-amber-500" />
                    )}
                  </div>
                  <h4 className="font-bold text-slate-900 dark:text-white">
                    {activeHotspot.label || 'Details'}
                  </h4>
                </div>
                <button
                  onClick={() => setActiveHotspot(null)}
                  className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                >
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>
              
              <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
                {activeHotspot.type === 'navigation' 
                  ? 'Click to navigate to this room' 
                  : 'Explore this feature of the property'}
              </p>

              {activeHotspot.type === 'navigation' && activeHotspot.targetRoomId && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleHotspotClick(activeHotspot)}
                  className="w-full py-3 bg-gradient-to-r from-indigo-600 to-violet-600 rounded-xl font-bold text-white shadow-lg"
                >
                  Navigate Now
                </motion.button>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

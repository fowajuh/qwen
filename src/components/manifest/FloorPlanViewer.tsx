import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { 
  Maximize2, 
  Minimize2, 
  Home, 
  Bed, 
  Bath, 
  Users, 
  Ruler, 
  Info,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Layers,
  Sun,
  Moon,
  Wifi,
  Tv,
  Armchair,
  Utensils,
  Play,
  Glasses,
  Navigation,
  Compass,
  MapPin,
  ChevronRight,
  X,
  Volume2,
  VolumeX,
  Scan,
  Smartphone,
  ArrowRight,
  Sparkles,
  Target
} from 'lucide-react';
import { ARNavigation } from './ARNavigation';
import { Tour360Viewer } from './Tour360Viewer';

interface Room {
  id: string;
  name: string;
  type: 'bedroom' | 'bathroom' | 'living' | 'kitchen' | 'dining' | 'balcony' | 'office' | 'other';
  dimensions: { width: number; length: number }; // in feet
  features: string[];
  description?: string;
  image?: string;
  position?: { x: number; y: number };
  rotation?: number;
  arAnchorId?: string;
  tour360Url?: string;
}

interface FloorPlanProps {
  rooms: Room[];
  totalArea?: number;
  floors?: number;
  propertyType?: string;
  title?: string;
  showDimensions?: boolean;
  interactive?: boolean;
  enableAR?: boolean;
  enable360Tour?: boolean;
  listingId?: string;
}

const roomIcons: Record<string, React.ElementType> = {
  bedroom: Bed,
  bathroom: Bath,
  living: Armchair,
  kitchen: Utensils,
  dining: Utensils,
  balcony: Sun,
  office: Wifi,
  other: Home,
};

const roomColors: Record<string, string> = {
  bedroom: 'from-blue-500/20 to-blue-600/10 border-blue-500/30',
  bathroom: 'from-cyan-500/20 to-cyan-600/10 border-cyan-500/30',
  living: 'from-amber-500/20 to-amber-600/10 border-amber-500/30',
  kitchen: 'from-orange-500/20 to-orange-600/10 border-orange-500/30',
  dining: 'from-rose-500/20 to-rose-600/10 border-rose-500/30',
  balcony: 'from-green-500/20 to-green-600/10 border-green-500/30',
  office: 'from-purple-500/20 to-purple-600/10 border-purple-500/30',
  other: 'from-slate-500/20 to-slate-600/10 border-slate-500/30',
};

const featureIcons: Record<string, React.ElementType> = {
  'King Bed': Bed,
  'Queen Bed': Bed,
  'Twin Beds': Bed,
  'En-suite Bathroom': Bath,
  'Walk-in Closet': Home,
  'Ocean View': Sun,
  'City View': Home,
  'Balcony Access': Sun,
  'Desk': Wifi,
  'Smart TV': Tv,
  'High-Speed WiFi': Wifi,
  'Air Conditioning': Sun,
  'Heating': Sun,
  'Blackout Curtains': Moon,
};

export const FloorPlanViewer: React.FC<FloorPlanProps> = ({
  rooms,
  totalArea,
  floors = 1,
  propertyType = 'Apartment',
  title = 'Floor Plan',
  showDimensions = true,
  interactive = true,
  enableAR = false,
  enable360Tour = false,
  listingId,
}) => {
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [activeFloor, setActiveFloor] = useState(0);
  const [showLabels, setShowLabels] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [arMode, setArMode] = useState(false);
  const [tourMode, setTourMode] = useState<'2d' | '360'>('2d');
  const [activeTourRoom, setActiveTourRoom] = useState<Room | null>(null);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Drag-to-pan for floor plan
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const constraintsRef = useRef<HTMLDivElement>(null);

  const totalRooms = rooms.length;
  const bedrooms = rooms.filter(r => r.type === 'bedroom').length;
  const bathrooms = rooms.filter(r => r.type === 'bathroom').length;

  // Generate a visual layout (simplified grid-based representation)
  const generateLayout = () => {
    const layout: JSX.Element[] = [];
    const gridSize = 100; // Base grid unit
    let xPos = 20;
    let yPos = 20;
    let rowHeight = 0;

    rooms.forEach((room, index) => {
      const Icon = roomIcons[room.type] || Home;
      const width = Math.min(room.dimensions.width * 8, 180);
      const height = Math.min(room.dimensions.length * 8, 140);
      
      if (xPos + width > 600) {
        xPos = 20;
        yPos += rowHeight + 16;
        rowHeight = 0;
      }
      
      rowHeight = Math.max(rowHeight, height);

      layout.push(
        <motion.div
          key={room.id}
          className={`absolute rounded-xl border-2 bg-gradient-to-br ${roomColors[room.type]} cursor-pointer hover:scale-105 transition-transform`}
          style={{
            left: xPos,
            top: yPos,
            width: width,
            height: height,
          }}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.05, duration: 0.3 }}
          whileHover={{ scale: 1.02, zIndex: 10 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => interactive && setSelectedRoom(room)}
        >
          {/* Room Label */}
          {showLabels && (
            <div className="absolute top-2 left-3 right-3 flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 truncate">
                {room.name}
              </span>
              <Icon className="w-4 h-4 text-slate-600 dark:text-slate-300" />
            </div>
          )}

          {/* Dimensions */}
          {showDimensions && (
            <div className="absolute bottom-2 left-3 right-3 flex items-center justify-center gap-1 text-xs text-slate-500 dark:text-slate-400">
              <Ruler className="w-3 h-3" />
              <span>{room.dimensions.width}' × {room.dimensions.length}'</span>
            </div>
          )}

          {/* Area Badge */}
          <div className="absolute top-2 right-2 px-2 py-0.5 bg-white/80 dark:bg-slate-800/80 rounded-full text-xs font-medium text-slate-700 dark:text-slate-300">
            {room.dimensions.width * room.dimensions.length} sqft
          </div>

          {/* Features Preview */}
          {room.features.length > 0 && (
            <div className="absolute bottom-8 left-3 right-3 flex gap-1 flex-wrap">
              {room.features.slice(0, 3).map((feature, idx) => {
                const FeatureIcon = featureIcons[feature] || Info;
                return (
                  <div key={idx} className="p-1 bg-white/60 dark:bg-slate-800/60 rounded-md">
                    <FeatureIcon className="w-3 h-3 text-slate-600 dark:text-slate-300" />
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>
      );

      xPos += width + 12;
    });

    return layout;
  };

  return (
    <div className={`w-full ${isFullscreen ? 'fixed inset-0 z-50 bg-white dark:bg-slate-900 p-4' : ''}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{title}</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {propertyType} • {bedrooms} bed • {bathrooms} bath • {totalRooms} rooms
            {totalArea && ` • ${totalArea.toLocaleString()} sqft total`}
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Floor Selector */}
          {floors > 1 && (
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
              {Array.from({ length: floors }).map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveFloor(idx)}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                    activeFloor === idx
                      ? 'bg-indigo-600 text-white shadow-lg'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  F{idx + 1}
                </button>
              ))}
            </div>
          )}

          {/* Controls */}
          <button
            onClick={() => setShowLabels(!showLabels)}
            className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            title="Toggle Labels"
          >
            <Layers className="w-5 h-5 text-slate-600 dark:text-slate-300" />
          </button>

          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            title="Toggle Dark Mode"
          >
            {darkMode ? (
              <Sun className="w-5 h-5 text-amber-500" />
            ) : (
              <Moon className="w-5 h-5 text-slate-600" />
            )}
          </button>

          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
            <button
              onClick={() => setZoom(Math.max(0.5, zoom - 0.25))}
              className="p-2 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              disabled={zoom <= 0.5}
            >
              <ZoomOut className="w-4 h-4 text-slate-600 dark:text-slate-300" />
            </button>
            <span className="px-2 text-sm font-medium text-slate-600 dark:text-slate-300 min-w-[3rem] text-center">
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={() => setZoom(Math.min(2, zoom + 0.25))}
              className="p-2 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              disabled={zoom >= 2}
            >
              <ZoomIn className="w-4 h-4 text-slate-600 dark:text-slate-300" />
            </button>
            <button
              onClick={() => setZoom(1)}
              className="p-2 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              title="Reset Zoom"
            >
              <RotateCcw className="w-4 h-4 text-slate-600 dark:text-slate-300" />
            </button>
          </div>

          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 hover:bg-indigo-200 dark:hover:bg-indigo-900/50 transition-colors"
          >
            {isFullscreen ? (
              <Minimize2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            ) : (
              <Maximize2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            )}
          </button>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <motion.div
          className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800"
          whileHover={{ scale: 1.02 }}
        >
          <Bed className="w-6 h-6 text-blue-600 dark:text-blue-400 mb-2" />
          <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">{bedrooms}</div>
          <div className="text-xs text-blue-600 dark:text-blue-400">Bedrooms</div>
        </motion.div>

        <motion.div
          className="bg-gradient-to-br from-cyan-50 to-cyan-100 dark:from-cyan-900/20 dark:to-cyan-800/20 rounded-xl p-4 border border-cyan-200 dark:border-cyan-800"
          whileHover={{ scale: 1.02 }}
        >
          <Bath className="w-6 h-6 text-cyan-600 dark:text-cyan-400 mb-2" />
          <div className="text-2xl font-bold text-cyan-700 dark:text-cyan-300">{bathrooms}</div>
          <div className="text-xs text-cyan-600 dark:text-cyan-400">Bathrooms</div>
        </motion.div>

        <motion.div
          className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 rounded-xl p-4 border border-amber-200 dark:border-amber-800"
          whileHover={{ scale: 1.02 }}
        >
          <Users className="w-6 h-6 text-amber-600 dark:text-amber-400 mb-2" />
          <div className="text-2xl font-bold text-amber-700 dark:text-amber-300">
            {rooms.reduce((max, room) => {
              if (room.type === 'bedroom') {
                return max + (room.features.includes('King Bed') || room.features.includes('Queen Bed') ? 2 : 1);
              }
              return max;
            }, 0)}
          </div>
          <div className="text-xs text-amber-600 dark:text-amber-400">Max Guests</div>
        </motion.div>

        <motion.div
          className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20 rounded-xl p-4 border border-emerald-200 dark:border-emerald-800"
          whileHover={{ scale: 1.02 }}
        >
          <Ruler className="w-6 h-6 text-emerald-600 dark:text-emerald-400 mb-2" />
          <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">
            {totalArea || rooms.reduce((sum, room) => sum + room.dimensions.width * room.dimensions.length, 0)}
          </div>
          <div className="text-xs text-emerald-600 dark:text-emerald-400">Sq Ft</div>
        </motion.div>
      </div>

      {/* Floor Plan Canvas */}
      <div className={`relative bg-slate-50 dark:bg-slate-800 rounded-2xl border-2 border-slate-200 dark:border-slate-700 overflow-hidden ${isFullscreen ? 'h-[calc(100vh-200px)]' : 'h-96 md:h-[500px]'}`}>
        {/* Grid Background */}
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `
              linear-gradient(to right, #94a3b8 1px, transparent 1px),
              linear-gradient(to bottom, #94a3b8 1px, transparent 1px)
            `,
            backgroundSize: `${20 * zoom}px ${20 * zoom}px`,
          }}
        />

        {/* Interactive Floor Plan with Drag-to-Pan */}
        <motion.div
          ref={constraintsRef}
          className="absolute inset-0 overflow-hidden cursor-grab active:cursor-grabbing"
          drag
          dragConstraints={constraintsRef}
          dragElastic={0.1}
          dragMomentum={true}
        >
          <motion.div
            className="absolute inset-0"
            style={{
              transform: `scale(${zoom})`,
              transformOrigin: 'center center',
              x,
              y,
            }}
            animate={{ scale: zoom }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            {generateLayout()}
          </motion.div>
        </motion.div>

        {/* Legend */}
        <div className="absolute bottom-4 left-4 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm rounded-xl p-4 border border-slate-200 dark:border-slate-700 shadow-lg">
          <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Room Types</h4>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(roomIcons).map(([type, Icon]) => (
              <div key={type} className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full bg-gradient-to-br ${roomColors[type].split(' ')[0].replace('/20', '')}`} />
                <Icon className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                <span className="text-xs text-slate-600 dark:text-slate-400 capitalize">{type}</span>
              </div>
            ))}
          </div>
        </div>

        {/* AR & 360 Tour Buttons - Billion Dollar Flow */}
        {(enableAR || enable360Tour) && (
          <div className="absolute top-4 left-4 flex gap-2">
            {enableAR && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setArMode(true)}
                className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl font-semibold shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 transition-all"
              >
                <Smartphone className="w-4 h-4" />
                <span className="hidden md:inline">AR Walkthrough</span>
                <span className="md:hidden">AR</span>
              </motion.button>
            )}
            
            {enable360Tour && rooms.some(r => r.tour360Url) && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setTourMode('360')}
                className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-semibold shadow-lg shadow-amber-500/30 hover:shadow-amber-500/50 transition-all"
              >
                <Glasses className="w-4 h-4" />
                <span className="hidden md:inline">360° Virtual Tour</span>
                <span className="md:hidden">360°</span>
              </motion.button>
            )}
          </div>
        )}

        {/* Info Tip */}
        <div className="absolute top-4 right-4 bg-indigo-600 text-white px-3 py-2 rounded-lg text-sm font-medium shadow-lg flex items-center gap-2">
          <Info className="w-4 h-4" />
          <span className="hidden md:inline">Click rooms for details • Drag to pan</span>
          <span className="md:hidden">Tap for details</span>
        </div>
      </div>

      {/* AR Navigation Modal */}
      <AnimatePresence>
        {arMode && enableAR && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/80 backdrop-blur-md z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setArMode(false)}
            />
            <motion.div
              className="fixed inset-4 md:inset-20 bg-slate-900 rounded-3xl overflow-hidden z-50"
              initial={{ scale: 0.9, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 50 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
              <div className="absolute top-4 right-4 z-50">
                <button
                  onClick={() => setArMode(false)}
                  className="p-3 bg-black/60 backdrop-blur-md rounded-xl hover:bg-black/80 transition-colors"
                >
                  <X className="w-6 h-6 text-white" />
                </button>
              </div>
              <ARNavigation 
                rooms={rooms as any} 
                listingId={listingId}
                propertyAddress={`${propertyType} • ${totalArea || '?'} sqft`}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* 360° Tour Modal */}
      <AnimatePresence>
        {tourMode === '360' && enable360Tour && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/80 backdrop-blur-md z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setTourMode('2d')}
            />
            <motion.div
              className="fixed inset-4 md:inset-10 bg-slate-900 rounded-3xl overflow-hidden z-50"
              initial={{ scale: 0.9, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 50 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
              <div className="absolute top-4 right-4 z-50">
                <button
                  onClick={() => setTourMode('2d')}
                  className="p-3 bg-black/60 backdrop-blur-md rounded-xl hover:bg-black/80 transition-colors"
                >
                  <X className="w-6 h-6 text-white" />
                </button>
              </div>
              <Tour360Viewer
                rooms={rooms.filter(r => r.tour360Url).map(r => ({
                  id: r.id,
                  name: r.name,
                  type: r.type,
                  imageUrl360: r.tour360Url!,
                  thumbnailUrl: r.image || '',
                  description: r.description,
                }))}
                propertyTitle={title}
                enableFullscreen
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Room Detail Modal */}
      <AnimatePresence>
        {selectedRoom && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedRoom(null)}
            />
            
            <motion.div
              className="fixed inset-x-4 bottom-4 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-[600px] md:max-h-[80vh] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl z-50 overflow-hidden"
              initial={{ opacity: 0, y: 100, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 100, scale: 0.9 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
              {/* Modal Header */}
              <div className={`bg-gradient-to-r ${roomColors[selectedRoom.type].split(' ')[0].replace('/20', '/30')} p-6 border-b border-slate-200 dark:border-slate-700`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    {(() => {
                      const Icon = roomIcons[selectedRoom.type] || Home;
                      return (
                        <div className="p-3 bg-white dark:bg-slate-800 rounded-xl shadow-lg">
                          <Icon className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
                        </div>
                      );
                    })()}
                    <div>
                      <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{selectedRoom.name}</h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400 capitalize">{selectedRoom.type}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedRoom(null)}
                    className="p-2 hover:bg-white/50 dark:hover:bg-slate-800/50 rounded-lg transition-colors"
                  >
                    <Minimize2 className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                  </button>
                </div>
              </div>

              {/* Modal Content */}
              <div className="p-6 overflow-y-auto max-h-[60vh]">
                {/* Dimensions & Area */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="text-center p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
                    <Ruler className="w-6 h-6 text-indigo-600 dark:text-indigo-400 mx-auto mb-2" />
                    <div className="text-lg font-bold text-slate-900 dark:text-white">
                      {selectedRoom.dimensions.width}' × {selectedRoom.dimensions.length}'
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">Dimensions</div>
                  </div>
                  <div className="text-center p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
                    <Home className="w-6 h-6 text-indigo-600 dark:text-indigo-400 mx-auto mb-2" />
                    <div className="text-lg font-bold text-slate-900 dark:text-white">
                      {selectedRoom.dimensions.width * selectedRoom.dimensions.length}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">Square Feet</div>
                  </div>
                  <div className="text-center p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
                    <Users className="w-6 h-6 text-indigo-600 dark:text-indigo-400 mx-auto mb-2" />
                    <div className="text-lg font-bold text-slate-900 dark:text-white">
                      {selectedRoom.type === 'bedroom' ? 2 : selectedRoom.type === 'bathroom' ? 1 : '-'}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">Capacity</div>
                  </div>
                </div>

                {/* Description */}
                {selectedRoom.description && (
                  <div className="mb-6">
                    <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">About this room</h4>
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                      {selectedRoom.description}
                    </p>
                  </div>
                )}

                {/* Features */}
                {selectedRoom.features.length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Features & Amenities</h4>
                    <div className="grid grid-cols-2 gap-3">
                      {selectedRoom.features.map((feature, idx) => {
                        const FeatureIcon = featureIcons[feature] || Info;
                        return (
                          <motion.div
                            key={idx}
                            className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.05 }}
                          >
                            <FeatureIcon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                            <span className="text-sm text-slate-700 dark:text-slate-300">{feature}</span>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Room Image (if available) */}
                {selectedRoom.image && (
                  <div className="mb-6">
                    <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Photo</h4>
                    <img
                      src={selectedRoom.image}
                      alt={selectedRoom.name}
                      className="w-full h-48 object-cover rounded-xl shadow-lg"
                    />
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <button className="flex-1 py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold transition-colors shadow-lg hover:shadow-xl">
                    Book This Property
                  </button>
                  <button className="py-3 px-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-semibold transition-colors">
                    Save
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

// Example usage helper
export const createSampleFloorPlan = (): FloorPlanProps => ({
  title: "Luxury Penthouse Floor Plan",
  propertyType: "Penthouse",
  totalArea: 2450,
  floors: 2,
  showDimensions: true,
  interactive: true,
  rooms: [
    {
      id: '1',
      name: 'Master Bedroom',
      type: 'bedroom',
      dimensions: { width: 14, length: 16 },
      features: ['King Bed', 'En-suite Bathroom', 'Walk-in Closet', 'Ocean View', 'Blackout Curtains'],
      description: 'Spacious master suite with panoramic ocean views and private balcony access.',
    },
    {
      id: '2',
      name: 'Master Bathroom',
      type: 'bathroom',
      dimensions: { width: 10, length: 12 },
      features: ['Soaking Tub', 'Rain Shower', 'Double Vanity', 'Heated Floors'],
      description: 'Luxurious spa-like bathroom with premium fixtures.',
    },
    {
      id: '3',
      name: 'Guest Bedroom',
      type: 'bedroom',
      dimensions: { width: 12, length: 14 },
      features: ['Queen Bed', 'City View', 'Desk', 'High-Speed WiFi'],
      description: 'Comfortable guest room with dedicated workspace.',
    },
    {
      id: '4',
      name: 'Guest Bathroom',
      type: 'bathroom',
      dimensions: { width: 8, length: 10 },
      features: ['Walk-in Shower', 'Single Vanity'],
    },
    {
      id: '5',
      name: 'Living Room',
      type: 'living',
      dimensions: { width: 20, length: 18 },
      features: ['Smart TV', 'Ocean View', 'Balcony Access', 'Air Conditioning'],
      description: 'Open-concept living area with floor-to-ceiling windows.',
    },
    {
      id: '6',
      name: 'Kitchen',
      type: 'kitchen',
      dimensions: { width: 14, length: 12 },
      features: ['Gas Range', 'Wine Cooler', 'Island Seating', 'Premium Appliances'],
      description: 'Gourmet chef\'s kitchen with top-of-the-line appliances.',
    },
    {
      id: '7',
      name: 'Dining Area',
      type: 'dining',
      dimensions: { width: 12, length: 14 },
      features: ['6-Person Table', 'Ocean View', 'Chandelier'],
    },
    {
      id: '8',
      name: 'Home Office',
      type: 'office',
      dimensions: { width: 10, length: 12 },
      features: ['Desk', 'High-Speed WiFi', 'Built-in Shelving', 'City View'],
      description: 'Perfect remote work setup with natural light.',
    },
    {
      id: '9',
      name: 'Balcony',
      type: 'balcony',
      dimensions: { width: 20, length: 8 },
      features: ['Outdoor Furniture', 'Ocean View', 'BBQ Grill'],
      description: 'Private outdoor terrace with stunning views.',
    },
  ],
});

export default FloorPlanViewer;

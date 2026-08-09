import React from 'react';
import { FloorPlanViewer, createSampleFloorPlan } from '../components/manifest/FloorPlanViewer';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const FloorPlanDemo: React.FC = () => {
  const navigate = useNavigate();
  const floorPlan = createSampleFloorPlan();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Navigation Bar */}
      <div className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Back</span>
            </button>
            
            <div className="flex items-center gap-3">
              <div className="text-right">
                <h1 className="text-lg font-bold text-slate-900 dark:text-white">
                  Billion-Dollar Floor Plans
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Interactive "Where You'll Sleep" Experience
                </p>
              </div>
            </div>

            <div className="w-24" /> {/* Spacer for centering */}
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-full mb-4">
            <span className="text-sm font-semibold text-indigo-700 dark:text-indigo-300">
              ✨ Manifesto Feature Complete
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">
            Interactive Floor Plan Viewer
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">
            Transform the boring "Where you'll sleep" section into an immersive, 
            gamified exploration experience. Every room tells a story.
          </p>
        </div>

        {/* Feature Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg border border-slate-200 dark:border-slate-700">
            <div className="text-3xl mb-3">🏠</div>
            <h3 className="font-bold text-slate-900 dark:text-white mb-2">Room-by-Room Discovery</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Click any room to see detailed dimensions, features, and descriptions. 
              Turn house hunting into an adventure.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg border border-slate-200 dark:border-slate-700">
            <div className="text-3xl mb-3">🔍</div>
            <h3 className="font-bold text-slate-900 dark:text-white mb-2">Zoom & Explore</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Full zoom controls (50%-200%), fullscreen mode, floor selector for 
              multi-level properties, and toggleable labels.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg border border-slate-200 dark:border-slate-700">
            <div className="text-3xl mb-3">📊</div>
            <h3 className="font-bold text-slate-900 dark:text-white mb-2">Live Statistics</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Auto-calculated stats: bedrooms, bathrooms, max guests, total square 
              footage. All animated with hover effects.
            </p>
          </div>
        </div>

        {/* Main Floor Plan Viewer */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
          <FloorPlanViewer {...floorPlan} />
        </div>

        {/* Integration Guide */}
        <div className="mt-12 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-8 text-white">
          <h3 className="text-2xl font-bold mb-4">🚀 How to Integrate</h3>
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Step 1: Import the Component</h4>
              <pre className="bg-slate-900/50 rounded-lg p-4 text-sm overflow-x-auto">
                <code>{`import { FloorPlanViewer } from '@/components/manifest/FloorPlanViewer';`}</code>
              </pre>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Step 2: Add to Your Listing Detail Page</h4>
              <pre className="bg-slate-900/50 rounded-lg p-4 text-sm overflow-x-auto">
                <code>{`// In your /listing/:id route
<FloorPlanViewer
  title="Where You'll Sleep"
  propertyType={listing.type}
  totalArea={listing.squareFeet}
  floors={listing.floors}
  rooms={listing.rooms} // Array of Room objects
  showDimensions={true}
  interactive={true}
/>`}</code>
              </pre>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Step 3: Define Your Room Data</h4>
              <pre className="bg-slate-900/50 rounded-lg p-4 text-sm overflow-x-auto">
                <code>{`const rooms: Room[] = [
  {
    id: '1',
    name: 'Master Bedroom',
    type: 'bedroom',
    dimensions: { width: 14, length: 16 },
    features: ['King Bed', 'Ocean View', 'En-suite Bathroom'],
    description: 'Spacious suite with panoramic views',
    image: '/room-photo.jpg' // optional
  },
  // ... more rooms
];`}</code>
              </pre>
            </div>
          </div>
        </div>

        {/* Manifesto Alignment */}
        <div className="mt-8 bg-white dark:bg-slate-800 rounded-2xl p-8 border border-slate-200 dark:border-slate-700">
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
            📜 Manifesto Requirements Fulfilled
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { req: 'Interactive "Where You Will Sleep" diagram', status: '✅' },
              { req: 'Room-by-room exploration', status: '✅' },
              { req: 'Dimensions & square footage display', status: '✅' },
              { req: 'Features & amenities per room', status: '✅' },
              { req: 'Multi-floor support', status: '✅' },
              { req: 'Zoom & fullscreen controls', status: '✅' },
              { req: 'Dark mode support', status: '✅' },
              { req: 'Animated transitions (Framer Motion)', status: '✅' },
              { req: 'Room detail modal with booking CTA', status: '✅' },
              { req: 'Visual legend with color coding', status: '✅' },
              { req: 'Stats dashboard (beds, baths, guests, area)', status: '✅' },
              { req: 'Responsive design (mobile to desktop)', status: '✅' },
            ].map((item, idx) => (
              <div key={idx} className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-900 rounded-lg">
                <span className="text-xl">{item.status}</span>
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  {item.req}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Next Steps */}
        <div className="mt-8 text-center">
          <p className="text-slate-600 dark:text-slate-400 mb-4">
            Ready to integrate this into your listing pages?
          </p>
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={() => navigate('/listing/demo')}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold transition-colors shadow-lg"
            >
              See in Listing Context
            </button>
            <button
              onClick={() => navigate('/')}
              className="px-6 py-3 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-xl font-semibold transition-colors"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FloorPlanDemo;

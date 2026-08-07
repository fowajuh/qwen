import { createFileRoute, useNavigate, useParams } from "@tanstack/react-router";
import { ArrowLeft, Share, Heart } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/housing-data";
import { Button } from "@/components/housing/primitives";
import { ImageGallery } from "@/components/housing/image-gallery";
import { useState } from "react";

export const Route = createFileRoute("/housing/listing/$id/photos")({
  component: HousingListingPhotos,
});

function HousingListingPhotos() {
  const navigate = useNavigate();
  const { id } = useParams({ from: "/housing/listing/$id/photos" });
  const [showGallery, setShowGallery] = useState(false);
  const [initialImage, setInitialImage] = useState(0);

  const { data: listing, isLoading } = useQuery({
    queryKey: ['listing', id],
    queryFn: () => api.getListing(id)
  });

  if (isLoading || !listing) return <div className="h-screen bg-background animate-pulse" />;

  const openGallery = (index: number) => {
    setInitialImage(index);
    setShowGallery(true);
  };

  return (
    <div className="w-full min-h-screen bg-background animate-in slide-in-from-bottom-4 duration-300 pb-20">
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <button onClick={() => navigate({ to: '/housing/$id', params: { id } })} className="p-2 -ml-2 rounded-full hover:bg-surface transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <button className="p-2 rounded-full hover:bg-surface transition-colors">
              <Share className="w-4 h-4" />
            </button>
            <button className="p-2 rounded-full hover:bg-surface transition-colors">
              <Heart className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
      
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-[300px]">
          {listing.images.map((img, i) => (
            <div 
              key={i} 
              className={`relative rounded-xl overflow-hidden cursor-pointer group ${i % 5 === 0 ? 'md:col-span-2 md:row-span-2' : ''}`}
              onClick={() => openGallery(i)}
            >
              <img 
                src={img} 
                alt={`${listing.title} - Photo ${i + 1}`} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
            </div>
          ))}
        </div>
      </div>

      {showGallery && (
        <ImageGallery 
          images={listing.images}
          initialIndex={initialImage}
          onClose={() => setShowGallery(false)}
        />
      )}
    </div>
  );
}

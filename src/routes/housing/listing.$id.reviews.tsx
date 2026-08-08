import { createFileRoute, useNavigate, useParams } from "@tanstack/react-router";
import { ArrowLeft, Search, Star, Sliders } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/housing-data";
import { useState } from "react";
import { ReviewBreakdown } from "@/routes/housing/$id";

export const Route = createFileRoute("/housing/listing/$id/reviews")({
  component: HousingListingReviews,
});

function HousingListingReviews() {
  const navigate = useNavigate();
  const { id } = useParams({ from: "/housing/listing/$id/reviews" });
  const [searchQuery, setSearchQuery] = useState("");

  const { data: listing, isLoading } = useQuery({
    queryKey: ['listing', id],
    queryFn: () => api.getListing(id)
  });

  if (isLoading || !listing) return <div className="h-screen bg-background animate-pulse" />;

  const filteredReviews = listing.reviews.filter(r => 
    r.text.toLowerCase().includes(searchQuery.toLowerCase()) || 
    r.author.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-full min-h-screen bg-background animate-in slide-in-from-bottom-4 duration-300">
      <div className="sticky top-0 z-10 bg-background/90 backdrop-blur-md border-b border-border">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <button onClick={() => navigate({ to: '/housing/$id', params: { id } })} className="p-2 -ml-2 rounded-full hover:bg-surface transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
        </div>
      </div>
      
      <div className="max-w-4xl mx-auto px-4 py-8 flex flex-col md:flex-row gap-12">
        <div className="md:w-[350px] shrink-0">
          <div className="flex items-center gap-2 mb-6">
            <Star className="w-8 h-8 fill-foreground" />
            <h1 className="text-4xl font-bold tracking-tight">{listing.rating}</h1>
          </div>
          <p className="text-xl font-medium mb-8">{listing.reviewCount} reviews</p>
          
          <ReviewBreakdown reviews={listing.reviews} />
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-2 mb-8">
            <div className="relative flex-1">
              <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input 
                type="text" 
                placeholder="Search reviews" 
                className="w-full bg-surface border border-border rounded-full py-3 pl-10 pr-4 outline-none focus:border-foreground transition-colors"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button className="p-3 border border-border rounded-full hover:bg-surface transition-colors">
              <Sliders className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-8">
            {filteredReviews.map((review) => (
              <div key={review.id} className="pb-8 border-b border-border last:border-0">
                <div className="flex items-center gap-4 mb-4">
                  <img src={review.avatar} alt={review.author} className="w-12 h-12 rounded-full object-cover" />
                  <div>
                    <h3 className="font-semibold">{review.author}</h3>
                    <p className="text-sm text-muted-foreground">{review.date}</p>
                  </div>
                </div>
                <p className="leading-relaxed text-foreground/90">{review.text}</p>
              </div>
            ))}
            {filteredReviews.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <p>No reviews found for "{searchQuery}"</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

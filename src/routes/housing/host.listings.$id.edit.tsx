import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { ArrowLeft, GripVertical, Trash2, Plus, Check } from "lucide-react";
import { api } from "@/lib/housing-data";

export const Route = createFileRoute("/housing/host/listings/$id/edit")({
  component: EditListing,
});

const AMENITY_TOGGLES = ["Wifi", "Kitchen", "Free parking", "Pool", "Air conditioning", "Washer", "Dedicated workspace", "Pet friendly"];

function EditListing() {
  const { id } = Route.useParams();
  const navigate = useNavigate();

  const { data: listing, isLoading } = useQuery({
    queryKey: ["listing", id],
    queryFn: () => api.getListing(id),
  });

  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [amenities, setAmenities] = useState<string[]>([]);
  const [photos, setPhotos] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Hydrate form once data loads (mock — no real form-state library needed here).
  if (listing && title === "" && price === "") {
    setTitle(listing.title);
    setPrice(String(listing.price));
    setDescription(listing.description);
    setAmenities(listing.amenities.slice(0, 4).map((a) => a.label));
    setPhotos(listing.images);
  }

  if (isLoading || !listing) {
    return <div className="h-screen bg-background animate-pulse" />;
  }

  const toggleAmenity = (label: string) => {
    setAmenities((prev) => (prev.includes(label) ? prev.filter((a) => a !== label) : [...prev, label]));
  };

  const removePhoto = (idx: number) => setPhotos((prev) => prev.filter((_, i) => i !== idx));

  const handleSave = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 500));
    setSaving(false);
    setSaved(true);
    setTimeout(() => navigate({ to: "/housing/host/listings" }), 900);
  };

  return (
    <div className="w-full min-h-screen bg-background pb-32 pt-safe">
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-md border-b border-hairline px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link to="/housing/host/listings" className="p-2 -ml-2 rounded-full hover:bg-surface">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="font-bold text-[17px]">Edit listing</h1>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-foreground text-background font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-60"
        >
          {saved ? <Check className="w-4 h-4" /> : null}
          {saving ? "Saving…" : saved ? "Saved" : "Save changes"}
        </button>
      </div>

      <div className="max-w-[700px] mx-auto px-5 py-8 space-y-10">
        {/* Photos */}
        <div>
          <h2 className="text-[18px] font-bold mb-4">Photos</h2>
          <p className="text-[13px] text-muted-foreground mb-4">Drag to reorder. The first photo is your cover image.</p>
          <div className="grid grid-cols-3 gap-3">
            {photos.map((img, i) => (
              <div key={i} className="relative aspect-square rounded-xl overflow-hidden group">
                <img src={img} alt="" className="w-full h-full object-cover" />
                {i === 0 && (
                  <span className="absolute bottom-2 left-2 bg-background/90 text-[10px] font-bold px-2 py-1 rounded-full">Cover</span>
                )}
                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="w-7 h-7 rounded-full bg-background/90 flex items-center justify-center">
                    <GripVertical className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => removePhoto(i)} className="w-7 h-7 rounded-full bg-background/90 flex items-center justify-center text-destructive">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
            <button className="aspect-square rounded-xl border-2 border-dashed border-hairline flex flex-col items-center justify-center text-muted-foreground hover:bg-surface transition-colors">
              <Plus className="w-6 h-6 mb-1" />
              <span className="text-xs font-semibold">Add photo</span>
            </button>
          </div>
        </div>

        {/* Basic info */}
        <div>
          <h2 className="text-[18px] font-bold mb-4">Listing details</h2>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold uppercase text-muted-foreground">Title</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full mt-1 border border-hairline rounded-lg px-4 py-3 text-[14px] outline-none focus:border-foreground"
              />
            </div>
            <div>
              <label className="text-xs font-bold uppercase text-muted-foreground">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="w-full mt-1 border border-hairline rounded-lg px-4 py-3 text-[14px] outline-none focus:border-foreground resize-none"
              />
            </div>
          </div>
        </div>

        {/* Pricing */}
        <div>
          <h2 className="text-[18px] font-bold mb-4">Pricing</h2>
          <div className="flex items-center gap-2 border border-hairline rounded-lg px-4 py-3 max-w-[200px]">
            <span className="text-muted-foreground">$</span>
            <input
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              type="number"
              className="w-full outline-none text-[14px] font-semibold"
            />
            <span className="text-muted-foreground text-[13px]">/ night</span>
          </div>
        </div>

        {/* Amenities */}
        <div>
          <h2 className="text-[18px] font-bold mb-4">Amenities</h2>
          <div className="grid grid-cols-2 gap-3">
            {AMENITY_TOGGLES.map((label) => (
              <button
                key={label}
                onClick={() => toggleAmenity(label)}
                className={`flex items-center justify-between border rounded-lg px-4 py-3 text-[14px] font-medium transition-colors ${
                  amenities.includes(label) ? "border-foreground bg-surface" : "border-hairline"
                }`}
              >
                {label}
                {amenities.includes(label) && <Check className="w-4 h-4" />}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

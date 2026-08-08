import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Search, ChevronLeft, UserPlus, Phone, MessageSquare, Building2, MapPin, Star } from "lucide-react";
import { useContacts, useContactSearch } from "../../hooks/use-messages";
import { useGeolocation } from "../../hooks/use-geolocation";

export const Route = createFileRoute("/messages/contacts")({
  component: ContactsPage,
});

function ContactsPage() {
  const navigate = useNavigate();
  // FIX: useGeolocation() returns a flat { latitude, longitude, ... }
  // object, not { position: { coords: { latitude, longitude } } } (that's
  // the shape of the raw browser GeolocationPosition object, not this
  // hook's return value). `position` was always undefined here, so
  // `position ? {...} : undefined` always evaluated to `undefined`, and
  // since useContacts() only fetches when `enabled: !!location` is true,
  // this screen NEVER made a single request — every user who opened
  // Messages → New Message saw a permanently empty/loading contacts list,
  // even with location permission granted, even with real scanned
  // businesses sitting in the database.
  const { latitude, longitude } = useGeolocation();
  const [searchQuery, setSearchQuery] = useState("");
  
  // Fetch contacts from backend (includes businesses from scouting system)
  const { data: contacts, isLoading, error } = useContacts(
    latitude != null && longitude != null ? {
      lat: latitude,
      lng: longitude,
      radius: 10
    } : undefined
  );
  
  // Also enable search
  const { data: searchResults } = useContactSearch(searchQuery);
  
  const displayContacts = searchQuery.trim() ? searchResults : contacts;

  return (
    <div className="flex flex-col h-full bg-background absolute inset-0 z-50 md:relative md:z-auto">
      {/* Header */}
      <div className="px-6 py-4 flex justify-between items-center bg-background/80 backdrop-blur-xl border-b border-border z-10 sticky top-0">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate({ to: "/messages" })} className="md:hidden w-10 h-10 flex items-center justify-center -ml-2 text-primary hover:bg-foreground/5 rounded-full">
            <ChevronLeft size={24} />
          </button>
          <h1 className="text-2xl font-display font-semibold tracking-tight">Contacts</h1>
        </div>
        <button className="w-10 h-10 rounded-full bg-foreground/5 flex items-center justify-center text-primary hover:bg-foreground/10 transition-colors">
          <UserPlus size={20} />
        </button>
      </div>

      {/* Search */}
      <div className="px-6 py-4">
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search contacts or nearby businesses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-foreground/5 border border-transparent rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:border-primary focus:bg-background transition-all"
          />
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-4 pb-12">
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mb-3" />
            <p className="text-sm text-muted-foreground">Loading contacts...</p>
          </div>
        )}
        
        {error && (
          <div className="text-center py-12">
            <p className="text-red-500 text-sm mb-2">Failed to load contacts</p>
            <button 
              onClick={() => window.location.reload()}
              className="text-xs text-primary underline"
            >
              Try again
            </button>
          </div>
        )}
        
        {!isLoading && !error && (!displayContacts || displayContacts.length === 0) && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-foreground/5 rounded-full flex items-center justify-center mx-auto mb-4">
              <Building2 size={24} className="text-muted-foreground" />
            </div>
            <p className="font-medium text-foreground mb-1">No contacts yet</p>
            <p className="text-sm text-muted-foreground max-w-xs mx-auto">
              {searchQuery 
                ? "No results found. Try a different search term."
                : "Nearby businesses from our scouting system will appear here once you enable location."}
            </p>
          </div>
        )}
        
        {!isLoading && !error && displayContacts && displayContacts.length > 0 && (
          <>
            <div className="px-3 py-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              {searchQuery ? "Search Results" : "Nearby Businesses & Contacts"}
            </div>
            {displayContacts.map((contact: any) => (
              <div key={contact.id} className="flex items-center justify-between p-3 rounded-2xl hover:bg-foreground/5 transition-colors group cursor-pointer">
                <div className="flex items-center gap-3">
                  {contact.logo_url ? (
                    <img 
                      src={contact.logo_url} 
                      alt={contact.name}
                      className="w-12 h-12 rounded-full object-cover border border-border"
                    />
                  ) : (
                    <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${
                      contact.business_id ? 'from-amber-400 to-orange-500' : 'from-blue-500 to-indigo-600'
                    } flex items-center justify-center text-white font-display text-base shadow-inner`}>
                      {contact.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <h3 className="font-semibold text-base">{contact.name}</h3>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      {contact.business_id && (
                        <>
                          <Building2 size={10} />
                          <span className="capitalize">{contact.category}</span>
                        </>
                      )}
                      {contact.city && (
                        <>
                          <MapPin size={10} />
                          <span>{contact.city}</span>
                        </>
                      )}
                      {contact.rating > 0 && (
                        <div className="flex items-center gap-0.5">
                          <Star size={10} className="fill-amber-400 text-amber-400" />
                          <span>{contact.rating.toFixed(1)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Link to="/messages/chat/$id" params={{ id: contact.id }} className="w-9 h-9 rounded-full bg-background border border-border shadow-sm flex items-center justify-center text-primary hover:bg-foreground/5">
                    <MessageSquare size={16} />
                  </Link>
                  {contact.phone && (
                    <a href={`tel:${contact.phone}`} className="w-9 h-9 rounded-full bg-background border border-border shadow-sm flex items-center justify-center text-primary hover:bg-foreground/5">
                      <Phone size={16} />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}

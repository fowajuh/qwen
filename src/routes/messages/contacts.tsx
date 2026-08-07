import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Search, ChevronLeft, UserPlus, Phone, MessageSquare, Video } from "lucide-react";

export const Route = createFileRoute("/messages/contacts")({
  component: ContactsPage,
});

/* ─── DATA ─── */
const CONTACTS = [
  { id: "c1", name: "Elisha St. Denis", initials: "ES", gradient: "from-teal-400 to-cyan-500", phone: "+1 (555) 123-4567" },
  { id: "c2", name: "Graham McBride", initials: "GM", gradient: "from-blue-500 to-indigo-600", phone: "+1 (555) 987-6543" },
  { id: "c3", name: "Puthachad Kuthong", initials: "PK", gradient: "from-orange-400 to-red-500", phone: "+1 (555) 246-8101" },
  { id: "c4", name: "Simla Uner", initials: "SU", gradient: "from-cyan-400 to-blue-500", phone: "+1 (555) 135-7911" },
];

function ContactsPage() {
  const navigate = useNavigate();

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
            placeholder="Search contacts..."
            className="w-full bg-foreground/5 border border-transparent rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:border-primary focus:bg-background transition-all"
          />
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-4 pb-12">
        <div className="space-y-1">
          <div className="px-3 py-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">My Contacts</div>
          {CONTACTS.sort((a, b) => a.name.localeCompare(b.name)).map((contact) => (
            <div key={contact.id} className="flex items-center justify-between p-3 rounded-2xl hover:bg-foreground/5 transition-colors group cursor-pointer">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${contact.gradient} flex items-center justify-center text-white font-display text-base shadow-inner`}>
                  {contact.initials}
                </div>
                <div>
                  <h3 className="font-semibold text-base">{contact.name}</h3>
                  <p className="text-xs text-muted-foreground">{contact.phone}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Link to="/messages/chat/$id" params={{ id: contact.id }} className="w-9 h-9 rounded-full bg-background border border-border shadow-sm flex items-center justify-center text-primary hover:bg-foreground/5">
                  <MessageSquare size={16} />
                </Link>
                <Link to="/messages/call/$id" params={{ id: contact.id }} className="w-9 h-9 rounded-full bg-background border border-border shadow-sm flex items-center justify-center text-primary hover:bg-foreground/5">
                  <Phone size={16} />
                </Link>
                <Link to="/messages/call/$id" params={{ id: contact.id }} className="w-9 h-9 rounded-full bg-background border border-border shadow-sm flex items-center justify-center text-primary hover:bg-foreground/5">
                  <Video size={16} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

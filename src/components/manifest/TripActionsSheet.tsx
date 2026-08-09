import { useNavigate } from "@tanstack/react-router";
import { Copy, ExternalLink, Inbox, PackageOpen, Share2, Trash2 } from "lucide-react";
import { Sheet } from "@/components/manifest/Sheet";
import type { Trip } from "@/lib/mock-data";

type Props = {
  trip: Trip | null;
  onClose: () => void;
  onDuplicate: (trip: Trip) => void;
  onArchive: (trip: Trip) => void;
  onDelete: (trip: Trip) => void;
};

function Row({
  icon: Icon,
  label,
  hint,
  tone,
  onClick,
}: {
  icon: typeof Copy;
  label: string;
  hint?: string;
  tone?: "danger";
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-4 py-3.5 rounded-sm border border-ink-30/25 hover:bg-runway-sand active:scale-[0.99] transition-all text-left"
    >
      <div
        className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
          tone === "danger"
            ? "bg-runway-red/10 text-runway-red"
            : "bg-runway-sand text-departure-navy"
        }`}
      >
        <Icon className="w-4 h-4" strokeWidth={1.75} />
      </div>
      <div className="min-w-0">
        <p className={`text-sm ${tone === "danger" ? "text-runway-red" : "text-ink-90"}`}>
          {label}
        </p>
        {hint && <p className="text-xs text-ink-60 mt-0.5">{hint}</p>}
      </div>
    </button>
  );
}

/**
 * Trip quick-actions — the desktop/tap equivalent of the SwipeRow gesture,
 * so every action is reachable without a swipe (mouse users, accessibility).
 */
export function TripActionsSheet({ trip, onClose, onDuplicate, onArchive, onDelete }: Props) {
  const navigate = useNavigate();

  return (
    <Sheet open={!!trip} onClose={onClose} title={trip?.name}>
      {trip && (
        <div className="space-y-2 pt-1">
          <Row
            icon={ExternalLink}
            label="Open manifest"
            hint="Jump into the full itinerary"
            onClick={() => {
              onClose();
              navigate({ to: "/trips/$tripId", params: { tripId: trip.id } });
            }}
          />
          <Row
            icon={Share2}
            label="Share with co-travelers"
            hint="Invite by email, set their role"
            onClick={() => {
              onClose();
              navigate({
                to: "/trips/$tripId",
                params: { tripId: trip.id },
                search: { share: true },
              });
            }}
          />
          <Row
            icon={Copy}
            label="Duplicate trip"
            hint="Clone the itinerary into a new draft"
            onClick={() => {
              onDuplicate(trip);
              onClose();
            }}
          />
          {trip.status !== "past" ? (
            <Row
              icon={Inbox}
              label="Move to archive"
              hint="Files it under Archive & drafts"
              onClick={() => {
                onArchive(trip);
                onClose();
              }}
            />
          ) : (
            <Row
              icon={PackageOpen}
              label="Restore to upcoming"
              hint="Bring it back to your active manifest"
              onClick={() => {
                onArchive(trip);
                onClose();
              }}
            />
          )}
          <Row
            icon={Trash2}
            label="Delete trip"
            hint="Removes it and every stop, for good"
            tone="danger"
            onClick={() => {
              onDelete(trip);
              onClose();
            }}
          />
        </div>
      )}
    </Sheet>
  );
}

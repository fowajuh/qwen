import { createFileRoute } from "@tanstack/react-router";
import { ArrowLeft, Package, Clock, CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/profile/orders")({
  component: ProfileOrders,
});

export default function ProfileOrders() {
  return (
    <div className="w-full min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-md border-b border-hairline px-4 py-3 flex items-center pt-safe">
        <button onClick={() => window.history.back()} className="p-2 -ml-2 rounded-full hover:bg-surface text-foreground">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="font-bold text-[18px] ml-2">Orders</h1>
      </div>

      <div className="px-4 py-6 space-y-4">
        {[
          { id: "ORD-123", status: "Delivered", date: "Dec 12", item: "Vintage Leather Jacket", price: "$145.00", img: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=200&auto=format&fit=crop" },
          { id: "ORD-124", status: "Processing", date: "Dec 15", item: "Artisan Coffee Beans", price: "$24.00", img: "https://images.unsplash.com/photo-1559525839-b184a4d698c7?w=200&auto=format&fit=crop" },
        ].map((order, i) => (
          <div key={i} className="bg-surface rounded-2xl p-4 border border-hairline">
            <div className="flex justify-between items-center mb-4 pb-3 border-b border-hairline">
              <div className="flex items-center gap-2">
                {order.status === "Delivered" ? <CheckCircle2 className="w-5 h-5 text-green-600" /> : <Clock className="w-5 h-5 text-orange-500" />}
                <span className={`font-bold text-[14px] ${order.status === "Delivered" ? "text-green-600" : "text-orange-500"}`}>
                  {order.status}
                </span>
              </div>
              <span className="text-[13px] text-muted-foreground">{order.date}</span>
            </div>
            
            <div className="flex gap-4">
              <div className="w-20 h-20 rounded-xl overflow-hidden bg-muted shrink-0 border border-hairline">
                <img src={order.img} alt="" className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 flex flex-col justify-center">
                <div className="font-bold text-[15px] mb-1">{order.item}</div>
                <div className="text-[13px] text-muted-foreground mb-2">Order #{order.id}</div>
                <div className="font-semibold text-[15px]">{order.price}</div>
              </div>
            </div>
            
            <div className="mt-4 pt-3 border-t border-hairline flex gap-3">
              <button className="flex-1 py-2.5 rounded-xl border border-hairline bg-background font-bold text-[13px] hover:bg-surface transition-colors">
                Track Order
              </button>
              <button className="flex-1 py-2.5 rounded-xl border border-hairline bg-background font-bold text-[13px] hover:bg-surface transition-colors">
                View Receipt
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

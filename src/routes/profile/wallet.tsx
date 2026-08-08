import { createFileRoute } from "@tanstack/react-router";
import { ArrowLeft, CreditCard, Plus, ArrowUpRight, ArrowDownLeft, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/profile/wallet")({
  component: ProfileWallet,
});

export default function ProfileWallet() {
  return (
    <div className="w-full min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-md border-b border-hairline px-4 py-3 flex items-center justify-between pt-safe">
        <button onClick={() => window.history.back()} className="p-2 -ml-2 rounded-full hover:bg-surface text-foreground">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="font-bold text-[18px]">Wallet</h1>
        <button className="p-2 -mr-2 rounded-full hover:bg-surface text-foreground">
          <Plus className="w-5 h-5" />
        </button>
      </div>

      <div className="px-4 py-6 space-y-8">
        {/* Balance Card */}
        <div className="bg-gradient-to-br from-gray-900 to-black text-white rounded-3xl p-6 shadow-drama relative overflow-hidden">
          <div className="absolute top-0 right-0 p-6 opacity-20">
            <ShieldCheck className="w-24 h-24" />
          </div>
          <div className="relative z-10">
            <div className="text-[14px] font-medium text-white/70 mb-1">Total Balance</div>
            <div className="text-[40px] font-bold tracking-tight mb-8">$2,450.00</div>
            <div className="flex gap-4">
              <button className="flex-1 bg-white text-black py-3 rounded-xl font-bold text-[15px] flex items-center justify-center gap-2 hover:bg-white/90 transition-colors">
                <ArrowUpRight className="w-4 h-4" /> Send
              </button>
              <button className="flex-1 bg-white/20 backdrop-blur-md text-white py-3 rounded-xl font-bold text-[15px] flex items-center justify-center gap-2 hover:bg-white/30 transition-colors border border-white/10">
                <ArrowDownLeft className="w-4 h-4" /> Add
              </button>
            </div>
          </div>
        </div>

        {/* Payment Methods */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-bold text-[18px]">Payment Methods</h2>
            <button className="text-primary font-semibold text-[14px]">Edit</button>
          </div>
          <div className="bg-surface rounded-2xl border border-hairline p-4 flex items-center gap-4">
            <div className="w-12 h-8 rounded bg-white flex items-center justify-center border border-gray-200 shrink-0 shadow-sm">
              <span className="font-bold text-[#1a1f71] italic tracking-tighter text-[16px]">VISA</span>
            </div>
            <div className="flex-1">
              <div className="font-bold text-[15px]">Visa ending in 4242</div>
              <div className="text-[13px] text-muted-foreground">Expires 12/28</div>
            </div>
          </div>
        </div>

        {/* Recent Transactions */}
        <div>
          <h2 className="font-bold text-[18px] mb-4">Recent Transactions</h2>
          <div className="bg-surface rounded-2xl border border-hairline overflow-hidden">
            {[
              { title: "Ostro Coffee Bar", date: "Today, 9:15 AM", amount: "-$6.50", type: "expense" },
              { title: "Kori Hair Studio", date: "Yesterday, 2:30 PM", amount: "-$120.00", type: "expense" },
              { title: "Cashback Reward", date: "Dec 10, 2026", amount: "+$12.40", type: "income" },
            ].map((tx, i) => (
              <div key={i} className={`flex items-center justify-between p-4 bg-background ${i !== 2 ? "border-b border-hairline" : ""}`}>
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${tx.type === 'income' ? 'bg-green-100 text-green-700' : 'bg-surface text-foreground'}`}>
                    <CreditCard className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-[15px]">{tx.title}</div>
                    <div className="text-[13px] text-muted-foreground">{tx.date}</div>
                  </div>
                </div>
                <div className={`font-bold text-[15px] ${tx.type === 'income' ? 'text-green-600' : ''}`}>
                  {tx.amount}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

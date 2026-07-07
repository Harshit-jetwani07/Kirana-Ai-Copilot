import { AlertCircle, ArrowRight, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

export default function DemoBanner() {
  return (
    <div data-testid="demo-banner" className="bg-gradient-to-r from-amber-500 to-orange-500 text-white">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-2 flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2 text-xs md:text-sm">
          <Sparkles className="w-3.5 h-3.5 flex-shrink-0" />
          <span className="font-medium">You're viewing <b>sample data</b>. Create your own shop to use real data.</span>
        </div>
        <Link
          to="/onboarding"
          onClick={() => { localStorage.removeItem("dukaan_shop_id"); localStorage.removeItem("dukaan_mode"); localStorage.removeItem("dukaan_onboarded"); }}
          data-testid="banner-create-shop"
          className="text-xs md:text-sm font-bold underline underline-offset-2 flex items-center gap-1 hover:opacity-90"
        >
          Create My Shop <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}

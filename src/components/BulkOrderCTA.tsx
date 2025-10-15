"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight, Calendar, Gift, PartyPopper } from "lucide-react";
import Link from "next/link";

const BulkOrderCTA = () => {
  return (
    <section className="py-12 sm:py-16 md:py-20 px-4 relative bg-gradient-to-br from-text-teal to-text-teal/90 text-white">
      <div className="absolute inset-0 bg-black/20"></div>
      <div className="relative z-10 max-w-4xl mx-auto text-center">
        <div className="flex justify-center gap-4 sm:gap-6 mb-6">
          <WeddingIcon />
          <BirthdayIcon />
          <AnniversaryIcon />
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold font-heading mb-4 text-primary-yellow">
          Songs for Your Special Occasions
        </h2>
        <p className="text-base sm:text-lg max-w-2xl mx-auto mb-8 text-secondary-cream/90">
          Planning a wedding, birthday, or anniversary? We offer special
          packages for bulk orders to make your event unforgettable.
        </p>
        <Link href="/contact">
          <Button
            size="lg"
            className="bg-gradient-to-r from-primary-yellow to-accent-coral text-white font-bold py-4 px-8 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
          >
            Contact Us for Bulk Orders
            <ArrowRight className="h-5 w-5 ml-2" />
          </Button>
        </Link>
      </div>
    </section>
  );
};

const WeddingIcon = () => (
  <div className="p-3 bg-white/10 rounded-full">
    <Calendar className="w-6 h-6 sm:w-8 sm:h-8 text-accent-coral" />
  </div>
);

const BirthdayIcon = () => (
  <div className="p-3 bg-white/10 rounded-full">
    <PartyPopper className="w-6 h-6 sm:w-8 sm:h-8 text-primary-yellow" />
  </div>
);

const AnniversaryIcon = () => (
  <div className="p-3 bg-white/10 rounded-full">
    <Gift className="w-6 h-6 sm:w-8 sm:h-8 text-secondary-cream" />
  </div>
);

export default BulkOrderCTA;

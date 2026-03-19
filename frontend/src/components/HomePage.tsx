"use client";

import { useState } from "react";
import { ClaimForm } from "@/components/ClaimForm";
import { ClaimsList } from "@/components/ClaimsList";

export function HomePage() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleFormSuccess = () => {
    // Trigger refresh of claims list
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 lg:order-last">
          <div className="sticky top-20">
            <ClaimForm onSuccess={handleFormSuccess} />
          </div>
        </div>

        <div className="lg:col-span-2">
          <ClaimsList refreshTrigger={refreshTrigger} />
        </div>
      </div>
    </div>
  );
}

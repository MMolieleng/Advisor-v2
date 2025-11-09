"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Dashboard } from "@/components/dashboard";
import { businessService } from "@/lib/api";
import type { Business } from "@/types";

export default function BusinessPage() {
  const params = useParams();
  const router = useRouter();
  const businessId = params.businessId as string;

  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadBusiness();
  }, [businessId]);

  const loadBusiness = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await businessService.getBusiness(businessId);
      setBusiness(data);
    } catch (err) {
      console.error("Failed to load business:", err);
      setError("Business not found");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading business...</p>
        </div>
      </div>
    );
  }

  if (error || !business) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4 max-w-md">
          <h2 className="text-2xl font-semibold text-destructive">
            Business Not Found
          </h2>
          <p className="text-muted-foreground">
            The business ID "{businessId}" could not be found.
          </p>
          <button
            onClick={() => router.push("/")}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
          >
            Go Back Home
          </button>
        </div>
      </div>
    );
  }

  return <Dashboard businessId={businessId} businessName={business.name} />;
}

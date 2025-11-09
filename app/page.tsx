"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { OptInScreen } from "@/components/opt-in-screen";
import { useEffect, useState } from "react";

export default function Page() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [businessId, setBusinessId] = useState<string>("");

  useEffect(() => {
    // Get business ID from URL query param or use default
    const id = searchParams.get("businessId") || "demo-business";
    setBusinessId(id);
  }, [searchParams]);

  const handleOptIn = () => {
    // Redirect to business dashboard after opt-in
    router.push(`/business/${businessId}`);
  };

  if (!businessId) {
    return null;
  }

  return <OptInScreen businessId={businessId} onOptIn={handleOptIn} />;
}

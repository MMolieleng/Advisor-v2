import React, { Suspense } from "react";
import ClientLanding from "@/components/page-client";

export default function Page() {
  return (
    <Suspense fallback={<div />}>
      <ClientLanding />
    </Suspense>
  );
}

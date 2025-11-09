"use client";

import { useState, useEffect } from "react";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { businessService } from "@/lib/api";
import type { Business } from "@/types";

interface OptInScreenProps {
  businessId: string;
  onOptIn: () => void;
}

export function OptInScreen({ businessId, onOptIn }: OptInScreenProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [business, setBusiness] = useState<Business | null>(null);
  const [loadingBusiness, setLoadingBusiness] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadBusiness();
  }, [businessId]);

  const loadBusiness = async () => {
    setLoadingBusiness(true);
    setError(null);
    try {
      const data = await businessService.getBusiness(businessId);
      setBusiness(data);
    } catch (err) {
      console.error("Failed to load business:", err);
      setError("Business not found");
    } finally {
      setLoadingBusiness(false);
    }
  };

  const handleOptIn = () => {
    setIsLoading(true);
    // Simulate brief loading
    setTimeout(() => {
      onOptIn();
    }, 800);
  };

  if (loadingBusiness) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">
            Loading business information...
          </p>
        </div>
      </div>
    );
  }

  if (error || !business) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="text-center space-y-4 max-w-md">
          <h2 className="text-2xl font-semibold text-destructive">
            Business Not Found
          </h2>
          <p className="text-muted-foreground">
            The business ID "{businessId}" could not be found.
          </p>
          <p className="text-sm text-muted-foreground">
            Please check the URL or contact support.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="max-w-xl w-full space-y-10">
        <div className="text-center space-y-5">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/5 border border-primary/10">
            <Sparkles className="w-7 h-7 text-primary" />
          </div>
          <div className="space-y-3">
            <h1 className="text-4xl font-semibold tracking-tight text-balance text-foreground">
              AI-Powered Business Insights
            </h1>
            <p className="text-lg text-muted-foreground text-balance leading-relaxed max-w-md mx-auto">
              Get personalized strategic insights for{" "}
              <strong>{business.name}</strong> without needing data analysis
              skills
            </p>
            {business.industry && business.market && (
              <p className="text-sm text-muted-foreground">
                {business.industry} • {business.market}
              </p>
            )}
          </div>
        </div>

        <div className="bg-card rounded-2xl border border-border shadow-sm p-8 space-y-5">
          <h2 className="font-semibold text-lg text-foreground">
            What you'll get
          </h2>
          <ul className="space-y-4 text-sm">
            <li className="flex gap-4 items-start">
              <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
              <span className="text-muted-foreground leading-relaxed">
                AI-generated prompts tailored to your actual financial data
              </span>
            </li>
            <li className="flex gap-4 items-start">
              <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
              <span className="text-muted-foreground leading-relaxed">
                Strategic insights on cash flow, revenue trends, and growth
                opportunities
              </span>
            </li>
            <li className="flex gap-4 items-start">
              <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
              <span className="text-muted-foreground leading-relaxed">
                Relevant Nedbank solutions when they can help your business
              </span>
            </li>
          </ul>
        </div>

        <div className="bg-muted/30 rounded-2xl border border-border/50 p-8 space-y-4">
          <h2 className="font-semibold text-foreground">Privacy & Security</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Your transaction data is secure and used only to generate insights
            for you. By enabling AI insights, you allow analysis of your
            transaction data to provide personalized recommendations.
          </p>
        </div>

        <div className="space-y-4">
          <Button
            onClick={handleOptIn}
            disabled={isLoading}
            className="w-full h-12 text-base font-medium rounded-xl shadow-sm"
            size="lg"
          >
            {isLoading ? "Analyzing your data..." : "Enable AI Insights"}
          </Button>

          <p className="text-center text-xs text-muted-foreground">
            You can disable this feature at any time in your settings
          </p>
        </div>
      </div>
    </div>
  );
}

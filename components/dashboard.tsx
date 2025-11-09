"use client";

import type React from "react";

import { useEffect, useState } from "react";
import { PromptCard } from "@/components/prompt-card";
import { ChatView } from "@/components/chat-view";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sparkles, MessageSquare } from "lucide-react";
import type { Prompt, ChatMessage } from "@/types";
import { promptsService } from "@/lib/api";

interface DashboardProps {
  businessId: string;
  businessName: string;
}

export function Dashboard({ businessId, businessName }: DashboardProps) {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [customQuery, setCustomQuery] = useState("");
  const [showAllPrompts, setShowAllPrompts] = useState(false);

  useEffect(() => {
    fetchPrompts();
  }, [businessId]);

  const fetchPrompts = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Fetch from real API
      const data = await promptsService.getBusinessPrompts(businessId);
      setPrompts(data);
    } catch (err) {
      console.error("Failed to fetch prompts:", err);
      setError("Failed to load prompts. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePromptClick = (prompt: Prompt) => {
    setSelectedPrompt(prompt);
    setChatMessages([
      {
        role: "user",
        content: prompt.prompt_text,
      },
    ]);
    setIsChatOpen(true);
  };

  const handleCloseChatDialog = () => {
    setIsChatOpen(false);
    setSelectedPrompt(null);
    setChatMessages([]);
  };

  const handleCustomQuery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customQuery.trim()) return;

    setSelectedPrompt({
      id: "custom",
      business_id: businessId,
      title: "Custom Query",
      subtitle: null,
      prompt_text: customQuery,
      created_at: new Date().toISOString(),
    });

    setChatMessages([
      {
        role: "user",
        content: customQuery,
      },
    ]);

    setIsChatOpen(true);
    setCustomQuery("");
  };

  const visiblePrompts = showAllPrompts ? prompts : prompts.slice(0, 6);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/30 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-base font-semibold text-foreground">
                {businessName}
              </h1>
              <p className="text-xs text-muted-foreground">Business Insights</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8 max-w-7xl">
        {/* Welcome Section */}
        <div className="mb-8 space-y-2">
          <h2 className="text-2xl font-semibold text-balance text-foreground tracking-tight">
            Your Strategic Insights
          </h2>
          <p className="text-sm text-muted-foreground text-pretty leading-relaxed max-w-2xl">
            AI-generated prompts based on your transaction data. Click any card
            to explore deeper.
          </p>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="h-32 rounded-xl bg-muted/50 animate-pulse"
              />
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-destructive mb-4">{error}</p>
            <Button onClick={fetchPrompts} variant="outline">
              Retry
            </Button>
          </div>
        ) : prompts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">
              No insights available yet. Upload transaction data to generate
              AI-powered prompts.
            </p>
          </div>
        ) : (
          <>
            {/* Prompt Cards Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-6">
              {visiblePrompts.map((prompt) => (
                <PromptCard
                  key={prompt.id}
                  prompt={prompt}
                  onClick={() => handlePromptClick(prompt)}
                />
              ))}
            </div>

            {/* Show More Button */}
            {prompts.length > 6 && (
              <div className="flex justify-center mb-8">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAllPrompts(!showAllPrompts)}
                  className="rounded-lg"
                >
                  {showAllPrompts
                    ? "Show Less"
                    : `Show ${prompts.length - 6} More Insights`}
                </Button>
              </div>
            )}
          </>
        )}

        {/* Custom Query Section */}
        <div className="mt-12 max-w-2xl mx-auto">
          <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <MessageSquare className="w-4 h-4 text-primary" />
              <h3 className="text-sm font-semibold text-foreground">
                Ask Your Own Question
              </h3>
            </div>
            <form onSubmit={handleCustomQuery} className="flex gap-3">
              <Input
                placeholder="e.g., What are my top expenses this quarter?"
                value={customQuery}
                onChange={(e) => setCustomQuery(e.target.value)}
                className="flex-1 rounded-lg"
              />
              <Button type="submit" size="sm" className="rounded-lg px-6">
                Ask
              </Button>
            </form>
          </div>
        </div>
      </main>

      {selectedPrompt && isChatOpen && (
        <ChatView
          businessId={businessId}
          businessName={businessName}
          prompt={selectedPrompt}
          initialMessages={chatMessages}
          isOpen={isChatOpen}
          onClose={handleCloseChatDialog}
        />
      )}
    </div>
  );
}

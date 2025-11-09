/**
 * Real-world integration examples using actual project components
 *
 * These examples show how to integrate the Nedbank API with your existing
 * UI components like PromptCard, ChatView, etc.
 */

"use client";

import { useState, useEffect } from "react";
import {
  businessService,
  promptsService,
  chatService,
  etlService,
} from "@/lib/api";
import { PromptCard } from "@/components/prompt-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { Prompt, ChatResponse, Business } from "@/types";

// ============================================================================
// Example 1: Business Dashboard with Real API Data
// ============================================================================

export function BusinessDashboard({ businessId }: { businessId: string }) {
  const [business, setBusiness] = useState<Business | null>(null);
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        setLoading(true);
        setError(null);

        // Load business details and prompts in parallel
        const [businessData, promptsData] = await Promise.all([
          businessService.getBusiness(businessId),
          promptsService.getBusinessPrompts(businessId),
        ]);

        setBusiness(businessData);
        setPrompts(promptsData);
      } catch (err) {
        console.error("Failed to load dashboard data:", err);
        setError("Failed to load dashboard. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, [businessId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="text-destructive">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{error}</p>
            <Button onClick={() => window.location.reload()} className="mt-4">
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Business Header */}
      <div>
        <h1 className="text-3xl font-bold">{business?.name}</h1>
        <p className="text-muted-foreground">
          {business?.industry} • {business?.market}
        </p>
        {business?.summary && (
          <p className="mt-2 text-sm">{business.summary}</p>
        )}
      </div>

      {/* Prompts Section */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">Insights & Analysis</h2>
        {prompts.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-muted-foreground">
                No prompts available yet. Upload transaction data to generate
                insights.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {prompts.map((prompt) => (
              <PromptCard
                key={prompt.id}
                prompt={prompt}
                onClick={() => {
                  // Navigate to chat with this prompt
                  window.location.href = `/chat?businessId=${businessId}&prompt=${encodeURIComponent(
                    prompt.prompt_text
                  )}`;
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// Example 2: Chat Interface with Real API Integration
// ============================================================================

export function ChatInterface({ businessId }: { businessId: string }) {
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState<
    Array<{ role: "user" | "assistant"; content: string }>
  >([]);
  const [currentResponse, setCurrentResponse] = useState<ChatResponse | null>(
    null
  );
  const [loading, setLoading] = useState(false);

  const handleSendMessage = async (messageText?: string) => {
    const textToSend = messageText || query;
    if (!textToSend.trim() || loading) return;

    setLoading(true);
    setQuery("");

    // Add user message immediately
    setMessages((prev) => [...prev, { role: "user", content: textToSend }]);

    try {
      // Execute query with conversation history
      const response = await chatService.executeQuery({
        business_id: businessId,
        query: textToSend,
        include_offerings: true,
        conversation_history: messages,
      });

      // Add assistant response
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: response.answer },
      ]);
      setCurrentResponse(response);
    } catch (error) {
      console.error("Chat query failed:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Sorry, I encountered an error processing your request. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleFollowUpClick = (followUpText: string) => {
    handleSendMessage(followUpText);
  };

  return (
    <div className="flex flex-col h-screen">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${
              message.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-4 ${
                message.role === "user"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted"
              }`}
            >
              <p className="whitespace-pre-wrap">{message.content}</p>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-muted rounded-lg p-4">
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce delay-100"></div>
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce delay-200"></div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Follow-up Prompts */}
      {currentResponse?.follow_up_prompts &&
        currentResponse.follow_up_prompts.length > 0 && (
          <div className="p-4 border-t bg-muted/50">
            <p className="text-sm font-medium mb-2">Suggested follow-ups:</p>
            <div className="flex flex-wrap gap-2">
              {currentResponse.follow_up_prompts.map((followUp, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => handleFollowUpClick(followUp.prompt_text)}
                  disabled={loading}
                >
                  {followUp.title}
                </Button>
              ))}
            </div>
          </div>
        )}

      {/* Bank Offerings */}
      {currentResponse?.relevant_offerings &&
        currentResponse.relevant_offerings.length > 0 && (
          <div className="p-4 border-t bg-accent/50">
            <p className="text-sm font-medium mb-2">Recommended products:</p>
            <div className="space-y-2">
              {currentResponse.relevant_offerings.map(
                (offering: any, index) => (
                  <Card key={index}>
                    <CardContent className="p-3">
                      <h4 className="font-semibold text-sm">{offering.name}</h4>
                      <p className="text-xs text-muted-foreground mt-1">
                        {offering.description}
                      </p>
                      {offering.link_url && (
                        <a
                          href={offering.link_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-primary hover:underline mt-2 inline-block"
                        >
                          Learn more →
                        </a>
                      )}
                    </CardContent>
                  </Card>
                )
              )}
            </div>
          </div>
        )}

      {/* Input Area */}
      <div className="p-4 border-t">
        <div className="flex gap-2">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            placeholder="Ask a question about your business..."
            disabled={loading}
          />
          <Button
            onClick={() => handleSendMessage()}
            disabled={loading || !query.trim()}
          >
            Send
          </Button>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Example 3: ETL Upload Component
// ============================================================================

export function DataUploadForm({ businessId }: { businessId: string }) {
  const [fileUrl, setFileUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  const handleUpload = async () => {
    if (!fileUrl.trim()) {
      setStatus("Please enter a valid file URL");
      return;
    }

    setUploading(true);
    setStatus("Processing...");

    try {
      const result = await etlService.triggerETL({
        business_id: businessId,
        file_url: fileUrl,
        generate_prompts: true,
      });

      setStatus(`Success: ${result.message}`);

      // Reload page after 2 seconds to show new prompts
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error) {
      console.error("Upload failed:", error);
      setStatus("Upload failed. Please check the file URL and try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload Transaction Data</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-2 block">CSV File URL</label>
          <Input
            type="url"
            value={fileUrl}
            onChange={(e) => setFileUrl(e.target.value)}
            placeholder="https://example.com/transactions.csv"
            disabled={uploading}
          />
          <p className="text-xs text-muted-foreground mt-1">
            Enter the URL to your transaction data CSV file
          </p>
        </div>

        <Button onClick={handleUpload} disabled={uploading} className="w-full">
          {uploading ? "Processing..." : "Upload & Process Data"}
        </Button>

        {status && (
          <div
            className={`text-sm p-3 rounded ${
              status.includes("Success")
                ? "bg-green-50 text-green-700"
                : "bg-yellow-50 text-yellow-700"
            }`}
          >
            {status}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ============================================================================
// Example 4: Business Registration Form
// ============================================================================

export function BusinessRegistrationForm() {
  const [formData, setFormData] = useState({
    name: "",
    industry: "",
    market: "",
    summary: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const business = await businessService.createBusiness(formData);

      // Redirect to business dashboard
      window.location.href = `/dashboard/${business.id}`;
    } catch (error) {
      console.error("Registration failed:", error);
      alert("Failed to register business. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Register Your Business</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">
              Business Name *
            </label>
            <Input
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="Acme Corporation"
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Industry</label>
            <Input
              value={formData.industry}
              onChange={(e) =>
                setFormData({ ...formData, industry: e.target.value })
              }
              placeholder="Retail, Technology, etc."
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Market</label>
            <Input
              value={formData.market}
              onChange={(e) =>
                setFormData({ ...formData, market: e.target.value })
              }
              placeholder="E-commerce, SaaS, etc."
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">
              Business Summary
            </label>
            <Input
              value={formData.summary}
              onChange={(e) =>
                setFormData({ ...formData, summary: e.target.value })
              }
              placeholder="Brief description of your business"
            />
          </div>

          <Button type="submit" disabled={submitting} className="w-full">
            {submitting ? "Creating..." : "Create Business"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

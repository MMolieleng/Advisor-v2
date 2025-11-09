"use client";

import type React from "react";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Sparkles, ExternalLink, Loader2, Send } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type {
  Prompt,
  ChatMessage,
  ChatResponse,
  BankOffering,
  FollowUpPrompt,
} from "@/types";
import { chatService } from "@/lib/api";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface ChatViewProps {
  businessId: string;
  businessName: string;
  prompt: Prompt;
  initialMessages: ChatMessage[];
  isOpen: boolean;
  onClose: () => void;
}

export function ChatView({
  businessId,
  businessName,
  prompt,
  initialMessages,
  isOpen,
  onClose,
}: ChatViewProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [isLoading, setIsLoading] = useState(true);
  const [aiResponse, setAiResponse] = useState<ChatResponse | null>(null);
  const [userInput, setUserInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      fetchAIResponse(prompt.prompt_text, initialMessages);
    }
  }, [prompt, isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, aiResponse]);

  const fetchAIResponse = async (
    query: string,
    conversationHistory: ChatMessage[]
  ) => {
    setIsLoading(true);
    setError(null);
    try {
      // Call the real API
      const response = await chatService.executeQuery({
        business_id: businessId,
        query: query,
        include_offerings: true,
        conversation_history: conversationHistory.map((msg) => ({
          role: msg.role,
          content: msg.content,
        })),
      });

      setAiResponse(response);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: response.answer,
        },
      ]);
    } catch (err) {
      console.error("Failed to fetch AI response:", err);
      setError("Failed to get response. Please try again.");
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "I'm sorry, I encountered an error processing your request. Please try again.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFollowUpClick = (followUp: FollowUpPrompt) => {
    const newMessages = [
      ...messages,
      {
        role: "user" as const,
        content: followUp.prompt_text,
      },
    ];
    setMessages(newMessages);
    setAiResponse(null);

    // Fetch new response with updated conversation history
    fetchAIResponse(followUp.prompt_text, newMessages);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim() || isLoading) return;

    const newMessages = [
      ...messages,
      {
        role: "user" as const,
        content: userInput,
      },
    ];
    setMessages(newMessages);
    setUserInput("");
    setAiResponse(null);

    // Fetch new response with updated conversation history
    fetchAIResponse(userInput, newMessages);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className=" !max-w-[800px] max-h-[85vh] flex flex-col p-0 ">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <DialogTitle className="text-lg font-semibold">
            {prompt.title}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            {businessName}
          </DialogDescription>
        </DialogHeader>

        {/* Chat Messages - Scrollable */}
        <div className="max-w-[798px] flex-1  overflow-y-auto px-6 py-4 space-y-6">
          {messages.map((message, idx) => (
            <div key={idx}>
              {message.role === "user" ? (
                <div className="flex justify-end">
                  <div className="bg-primary text-primary-foreground rounded-2xl rounded-tr-sm px-4 py-2.5 max-w-[80%]">
                    <p className="text-sm">{message.content}</p>
                  </div>
                </div>
              ) : (
                <div className="flex gap-3">
                  <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <Sparkles className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex-1 space-y-4">
                    <div className="prose prose-sm max-w-none text-foreground">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          h1: ({ ...props }) => (
                            <h1
                              className="text-lg font-bold mt-4 mb-2"
                              {...props}
                            />
                          ),
                          h2: ({ ...props }) => (
                            <h2
                              className="text-base font-bold mt-3 mb-2"
                              {...props}
                            />
                          ),
                          h3: ({ ...props }) => (
                            <h3
                              className="text-sm font-semibold mt-3 mb-1.5"
                              {...props}
                            />
                          ),
                          h4: ({ ...props }) => (
                            <h4
                              className="text-sm font-semibold mt-2 mb-1"
                              {...props}
                            />
                          ),
                          p: ({ ...props }) => (
                            <p
                              className="text-sm leading-relaxed mb-3"
                              {...props}
                            />
                          ),
                          ul: ({ ...props }) => (
                            <ul
                              className="list-disc list-inside space-y-1 mb-3 text-sm"
                              {...props}
                            />
                          ),
                          ol: ({ ...props }) => (
                            <ol
                              className="list-decimal list-inside space-y-1 mb-3 text-sm"
                              {...props}
                            />
                          ),
                          li: ({ ...props }) => (
                            <li
                              className="text-sm leading-relaxed"
                              {...props}
                            />
                          ),
                          strong: ({ ...props }) => (
                            <strong
                              className="font-semibold text-foreground"
                              {...props}
                            />
                          ),
                          em: ({ ...props }) => (
                            <em className="italic" {...props} />
                          ),
                          code: ({ inline, ...props }: any) =>
                            inline ? (
                              <code
                                className="bg-muted px-1 py-0.5 rounded text-xs font-mono"
                                {...props}
                              />
                            ) : (
                              <code
                                className="block bg-muted p-2 rounded text-xs font-mono overflow-x-auto"
                                {...props}
                              />
                            ),
                          blockquote: ({ ...props }) => (
                            <blockquote
                              className="border-l-4 border-primary/30 pl-4 italic text-muted-foreground my-3"
                              {...props}
                            />
                          ),
                          a: ({ ...props }) => (
                            <a
                              className="text-primary hover:underline"
                              target="_blank"
                              rel="noopener noreferrer"
                              {...props}
                            />
                          ),
                        }}
                      >
                        {message.content}
                      </ReactMarkdown>
                    </div>

                    {idx === messages.length - 1 &&
                      aiResponse?.follow_up_prompts &&
                      aiResponse.follow_up_prompts.length > 0 && (
                        <div className="mt-4 space-y-2">
                          <p className="text-xs font-medium text-muted-foreground">
                            Explore further:
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {aiResponse.follow_up_prompts.map(
                              (followUp, fIdx) => (
                                <Button
                                  key={fIdx}
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleFollowUpClick(followUp)}
                                  className="text-xs h-8"
                                >
                                  {followUp.title}
                                </Button>
                              )
                            )}
                          </div>
                        </div>
                      )}

                    {idx === messages.length - 1 &&
                      aiResponse?.relevant_offerings &&
                      aiResponse.relevant_offerings.length > 0 && (
                        <div className="mt-4 space-y-2">
                          <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                            <span>💡</span>
                            <span>Solutions to Consider</span>
                          </div>
                          <div className="space-y-1.5">
                            {aiResponse.relevant_offerings.map(
                              (offering: any, oIdx) => (
                                <div
                                  key={oIdx}
                                  className="border border-border/50 hover:border-primary/50 transition-colors rounded-lg p-2.5 flex items-start justify-between gap-3"
                                >
                                  <div className="flex-1 space-y-0.5">
                                    <div className="flex items-center gap-1.5">
                                      <h4 className="font-medium text-xs">
                                        🔹 {offering.name}
                                      </h4>
                                      <Badge
                                        variant="secondary"
                                        className="text-[10px] h-4 px-1"
                                      >
                                        Nedbank
                                      </Badge>
                                    </div>
                                    <p className="text-[11px] text-muted-foreground leading-snug">
                                      {offering.description}
                                    </p>
                                  </div>
                                  {offering.link_url && (
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      className="h-7 px-2"
                                      asChild
                                    >
                                      <a
                                        href={offering.link_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                      >
                                        <span className="text-[11px]">
                                          Learn
                                        </span>
                                        <ExternalLink className="w-3 h-3 ml-1" />
                                      </a>
                                    </Button>
                                  )}
                                </div>
                              )
                            )}
                          </div>
                        </div>
                      )}
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* Loading State */}
          {isLoading && (
            <div className="flex gap-3">
              <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <Sparkles className="w-4 h-4 text-primary" />
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm">Analyzing your data...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        <div className="border-t px-6 py-4">
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <Input
              placeholder="Ask a follow-up question..."
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              disabled={isLoading}
              className="flex-1"
            />
            <Button
              type="submit"
              size="icon"
              disabled={isLoading || !userInput.trim()}
            >
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}

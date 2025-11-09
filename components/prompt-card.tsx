"use client";

import { Card, CardContent } from "@/components/ui/card";
import type { Prompt } from "@/types";

interface PromptCardProps {
  prompt: Prompt;
  onClick: () => void;
}

export function PromptCard({ prompt, onClick }: PromptCardProps) {
  return (
    <Card
      className="cursor-pointer transition-all hover:shadow-md hover:-translate-y-0.5 border-0 group"
      onClick={onClick}
    >
      <CardContent className="p-4 space-y-2">
        {/* Title */}
        <h3 className="font-semibold text-sm leading-tight group-hover:text-primary transition-colors text-balance">
          {prompt.title}
        </h3>

        {/* Insights - handle both array and null/undefined */}
        {prompt.subtitle && prompt.subtitle.length > 0 && (
          <ul className="space-y-1">
            {prompt.subtitle.slice(0, 3).map((insight, idx) => (
              <li
                key={idx}
                className="flex items-start gap-1.5 text-xs text-muted-foreground"
              >
                <span className="text-primary mt-0.5">•</span>
                <span className="flex-1 leading-snug">{insight}</span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

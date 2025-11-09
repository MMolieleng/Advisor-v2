// Re-export API types for use in components
export type {
  PromptResponse as Prompt,
  QueryResponse as ChatResponse,
  FollowUpPrompt,
  BusinessResponse as Business,
  BankOfferingResponse as BankOffering,
  MessageResponse,
} from "./api";

// Additional UI-specific types
export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

// Legacy type aliases for backward compatibility
// Use the API types above for new code
export type { QueryResponse } from "./api";

// ============================================================================
// Nedbank Business Insights API Types
// ============================================================================

// Common Response Types
export interface MessageResponse {
  message: string;
  details?: Record<string, any> | null;
}

export interface HTTPValidationError {
  detail: ValidationError[];
}

export interface ValidationError {
  loc: (string | number)[];
  msg: string;
  type: string;
}

// ============================================================================
// Business Types
// ============================================================================

export interface BusinessCreate {
  name: string;
  industry?: string | null;
  market?: string | null;
  summary?: string | null;
}

export interface BusinessUpdate {
  name?: string | null;
  industry?: string | null;
  market?: string | null;
  summary?: string | null;
}

export interface BusinessResponse {
  id: string;
  name: string;
  industry: string | null;
  market: string | null;
  summary: string | null;
  created_at: string;
  updated_at: string | null;
}

// ============================================================================
// ETL Types
// ============================================================================

export interface ETLTrigger {
  business_id: string;
  file_url: string;
  generate_prompts?: boolean;
}

export interface ETLStatus {
  status: string;
  message: string;
  documents_processed?: number | null;
  prompts_generated?: number | null;
}

// ============================================================================
// Prompt Types
// ============================================================================

export interface PromptGenerate {
  business_id: string;
  force_regenerate?: boolean;
}

export interface PromptResponse {
  id: string;
  business_id: string;
  title: string;
  subtitle?: string[] | null;
  prompt_text: string;
  created_at: string;
}

// ============================================================================
// Chat/Query Types
// ============================================================================

export interface QueryRequest {
  business_id: string;
  query: string;
  include_offerings?: boolean;
  conversation_history?: Record<string, any>[] | null;
}

export interface FollowUpPrompt {
  title: string;
  prompt_text: string;
}

export interface QueryResponse {
  answer: string;
  follow_up_prompts: FollowUpPrompt[];
  relevant_offerings?: Record<string, any>[] | null;
  sources?: string[] | null;
}

// ============================================================================
// Bank Offering Types
// ============================================================================

export interface BankOfferingCreate {
  code: string;
  name: string;
  description?: string | null;
  category?: string | null;
  link_url?: string | null;
  active?: boolean;
}

export interface BankOfferingUpdate {
  name?: string | null;
  description?: string | null;
  category?: string | null;
  link_url?: string | null;
  active?: boolean | null;
}

export interface BankOfferingResponse {
  id: string;
  code: string;
  name: string;
  description: string | null;
  category: string | null;
  link_url: string | null;
  active: boolean;
  created_at: string;
}

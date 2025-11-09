/**
 * Nedbank Business Insights API
 *
 * Central export point for all API services and types.
 */

// Export all services
export {
  businessService,
  etlService,
  promptsService,
  chatService,
  offeringsService,
} from "./services";

// Export axios instance and helpers
export { default as axiosInstance, api } from "./axios";

// Re-export all types for convenience
export type {
  // Common types
  MessageResponse,
  HTTPValidationError,
  ValidationError,

  // Business types
  BusinessCreate,
  BusinessUpdate,
  BusinessResponse,

  // ETL types
  ETLTrigger,
  ETLStatus,

  // Prompt types
  PromptGenerate,
  PromptResponse,

  // Chat types
  QueryRequest,
  QueryResponse,
  FollowUpPrompt,

  // Offering types
  BankOfferingCreate,
  BankOfferingUpdate,
  BankOfferingResponse,
} from "@/types/api";

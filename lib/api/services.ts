import { api } from "./axios";
import type {
  BusinessCreate,
  BusinessUpdate,
  BusinessResponse,
  ETLTrigger,
  ETLStatus,
  PromptGenerate,
  PromptResponse,
  QueryRequest,
  QueryResponse,
  BankOfferingCreate,
  BankOfferingUpdate,
  BankOfferingResponse,
  MessageResponse,
} from "@/types/api";

// ============================================================================
// Business Service
// ============================================================================

export const businessService = {
  /**
   * Register a new business and opt them in for AI data usage
   */
  createBusiness: async (data: BusinessCreate) => {
    const response = await api.post<BusinessResponse>("/businesses/", data);
    return response.data;
  },

  /**
   * List all registered businesses
   */
  listBusinesses: async (skip = 0, limit = 100) => {
    const response = await api.get<BusinessResponse[]>("/businesses/", {
      params: { skip, limit },
    });
    return response.data;
  },

  /**
   * Get details of a specific business
   */
  getBusiness: async (businessId: string) => {
    const response = await api.get<BusinessResponse>(
      `/businesses/${businessId}`
    );
    return response.data;
  },

  /**
   * Update business information (industry, market, summary, etc.)
   */
  updateBusiness: async (businessId: string, data: BusinessUpdate) => {
    const response = await api.patch<BusinessResponse>(
      `/businesses/${businessId}`,
      data
    );
    return response.data;
  },

  /**
   * Delete a business and all associated data (transactions, prompts)
   */
  deleteBusiness: async (businessId: string) => {
    const response = await api.delete<MessageResponse>(
      `/businesses/${businessId}`
    );
    return response.data;
  },
};

// ============================================================================
// ETL Service
// ============================================================================

export const etlService = {
  /**
   * Trigger ETL pipeline to process business transaction data from a URL (async)
   * This runs in the background and returns immediately
   */
  triggerETL: async (data: ETLTrigger) => {
    const response = await api.post<ETLStatus>("/etl/trigger", data);
    return response.data;
  },

  /**
   * Synchronously trigger ETL pipeline from URL (blocks until complete)
   * Use for testing or small datasets
   */
  triggerETLSync: async (data: ETLTrigger) => {
    const response = await api.post<ETLStatus>("/etl/trigger-sync", data);
    return response.data;
  },
};

// ============================================================================
// Prompts Service
// ============================================================================

export const promptsService = {
  /**
   * Get all AI-generated prompts for a specific business
   */
  getBusinessPrompts: async (businessId: string) => {
    const response = await api.get<PromptResponse[]>(`/prompts/${businessId}`);
    return response.data;
  },

  /**
   * Get a specific prompt by ID
   */
  getPrompt: async (businessId: string, promptId: string) => {
    const response = await api.get<PromptResponse>(
      `/prompts/${businessId}/${promptId}`
    );
    return response.data;
  },

  /**
   * Manually trigger prompt generation for a business
   */
  generatePrompts: async (data: PromptGenerate) => {
    const response = await api.post<MessageResponse>("/prompts/generate", data);
    return response.data;
  },

  /**
   * Delete all prompts for a business (e.g., to regenerate them)
   */
  deleteBusinessPrompts: async (businessId: string) => {
    const response = await api.delete<MessageResponse>(
      `/prompts/${businessId}`
    );
    return response.data;
  },
};

// ============================================================================
// Chat Service (RAG Query)
// ============================================================================

export const chatService = {
  /**
   * Execute a query against the business's transaction data using RAG
   * Returns AI-generated insights, follow-up prompts, and bank offering recommendations
   */
  executeQuery: async (data: QueryRequest) => {
    const response = await api.post<QueryResponse>("/chat/query", data);
    return response.data;
  },

  /**
   * Simplified query endpoint for quick questions without conversation history
   */
  quickQuery: async (
    businessId: string,
    query: string,
    includeOfferings = true
  ) => {
    const response = await api.post<QueryResponse>("/chat/quick-query", null, {
      params: {
        business_id: businessId,
        query,
        include_offerings: includeOfferings,
      },
    });
    return response.data;
  },
};

// ============================================================================
// Bank Offerings Service
// ============================================================================

export const offeringsService = {
  /**
   * Create a new bank offering
   */
  createOffering: async (data: BankOfferingCreate) => {
    const response = await api.post<BankOfferingResponse>("/offerings/", data);
    return response.data;
  },

  /**
   * List all bank offerings
   */
  listOfferings: async (activeOnly = true, skip = 0, limit = 100) => {
    const response = await api.get<BankOfferingResponse[]>("/offerings/", {
      params: {
        active_only: activeOnly,
        skip,
        limit,
      },
    });
    return response.data;
  },

  /**
   * Get details of a specific bank offering
   */
  getOffering: async (offeringId: string) => {
    const response = await api.get<BankOfferingResponse>(
      `/offerings/${offeringId}`
    );
    return response.data;
  },

  /**
   * Get bank offering by its unique code
   */
  getOfferingByCode: async (code: string) => {
    const response = await api.get<BankOfferingResponse>(
      `/offerings/code/${code}`
    );
    return response.data;
  },

  /**
   * Update a bank offering
   */
  updateOffering: async (offeringId: string, data: BankOfferingUpdate) => {
    const response = await api.patch<BankOfferingResponse>(
      `/offerings/${offeringId}`,
      data
    );
    return response.data;
  },

  /**
   * Delete a bank offering
   */
  deleteOffering: async (offeringId: string) => {
    const response = await api.delete<MessageResponse>(
      `/offerings/${offeringId}`
    );
    return response.data;
  },

  /**
   * Bulk create multiple bank offerings
   * Useful for initial setup with ~200 offerings
   */
  bulkCreateOfferings: async (offerings: BankOfferingCreate[]) => {
    const response = await api.post<MessageResponse>(
      "/offerings/bulk-create",
      offerings
    );
    return response.data;
  },
};

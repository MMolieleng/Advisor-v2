/**
 * Example usage of the Nedbank Business Insights API
 *
 * This file demonstrates how to use the API services in React components.
 * Copy and adapt these examples to your actual components.
 */

"use client";

import { useState } from "react";
import {
  businessService,
  etlService,
  promptsService,
  chatService,
  offeringsService,
} from "./services";
import type {
  BusinessResponse,
  PromptResponse,
  QueryResponse,
} from "@/types/api";

// ============================================================================
// Example 1: Creating a new business
// ============================================================================

export function CreateBusinessExample() {
  const [loading, setLoading] = useState(false);
  const [business, setBusiness] = useState<BusinessResponse | null>(null);

  const handleCreateBusiness = async () => {
    setLoading(true);
    try {
      const newBusiness = await businessService.createBusiness({
        name: "Acme Corporation",
        industry: "Retail",
        market: "E-commerce",
        summary: "Online retail store specializing in consumer electronics",
      });
      setBusiness(newBusiness);
      alert(`Business created with ID: ${newBusiness.id}`);
    } catch (error) {
      console.error("Failed to create business:", error);
      alert("Failed to create business");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button onClick={handleCreateBusiness} disabled={loading}>
        {loading ? "Creating..." : "Create Business"}
      </button>
      {business && (
        <div>
          <h3>{business.name}</h3>
          <p>Industry: {business.industry}</p>
          <p>ID: {business.id}</p>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Example 2: Uploading transaction data via ETL
// ============================================================================

export function ETLUploadExample({ businessId }: { businessId: string }) {
  const [loading, setLoading] = useState(false);
  const [fileUrl, setFileUrl] = useState("");

  const handleETLTrigger = async () => {
    if (!fileUrl) {
      alert("Please enter a file URL");
      return;
    }

    setLoading(true);
    try {
      const status = await etlService.triggerETL({
        business_id: businessId,
        file_url: fileUrl,
        generate_prompts: true,
      });
      alert(`ETL Status: ${status.status}\n${status.message}`);
    } catch (error) {
      console.error("ETL failed:", error);
      alert("ETL trigger failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <input
        type="text"
        value={fileUrl}
        onChange={(e) => setFileUrl(e.target.value)}
        placeholder="https://example.com/transactions.csv"
      />
      <button onClick={handleETLTrigger} disabled={loading}>
        {loading ? "Processing..." : "Upload & Process Data"}
      </button>
    </div>
  );
}

// ============================================================================
// Example 3: Displaying AI-generated prompts
// ============================================================================

export function PromptsDisplayExample({ businessId }: { businessId: string }) {
  const [prompts, setPrompts] = useState<PromptResponse[]>([]);
  const [loading, setLoading] = useState(false);

  const loadPrompts = async () => {
    setLoading(true);
    try {
      const data = await promptsService.getBusinessPrompts(businessId);
      setPrompts(data);
    } catch (error) {
      console.error("Failed to load prompts:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button onClick={loadPrompts} disabled={loading}>
        {loading ? "Loading..." : "Load Prompts"}
      </button>
      <div>
        {prompts.map((prompt) => (
          <div
            key={prompt.id}
            style={{
              border: "1px solid #ccc",
              margin: "10px",
              padding: "10px",
            }}
          >
            <h3>{prompt.title}</h3>
            {prompt.subtitle &&
              prompt.subtitle.map((sub, i) => (
                <p key={i} style={{ fontSize: "0.9em", color: "#666" }}>
                  {sub}
                </p>
              ))}
            <p>{prompt.prompt_text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// Example 4: Chat/Query interface with RAG
// ============================================================================

export function ChatInterfaceExample({ businessId }: { businessId: string }) {
  const [query, setQuery] = useState("");
  const [response, setResponse] = useState<QueryResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [conversationHistory, setConversationHistory] = useState<any[]>([]);

  const handleQuery = async () => {
    if (!query.trim()) return;

    setLoading(true);
    try {
      const result = await chatService.executeQuery({
        business_id: businessId,
        query,
        include_offerings: true,
        conversation_history: conversationHistory,
      });

      setResponse(result);

      // Update conversation history
      setConversationHistory([
        ...conversationHistory,
        { role: "user", content: query },
        { role: "assistant", content: result.answer },
      ]);

      setQuery("");
    } catch (error) {
      console.error("Query failed:", error);
      alert("Failed to execute query");
    } finally {
      setLoading(false);
    }
  };

  const handleFollowUpClick = (followUpQuery: string) => {
    setQuery(followUpQuery);
  };

  return (
    <div>
      <div style={{ marginBottom: "20px" }}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ask a question about your business data..."
          style={{ width: "80%", padding: "10px" }}
        />
        <button onClick={handleQuery} disabled={loading}>
          {loading ? "Processing..." : "Ask"}
        </button>
      </div>

      {response && (
        <div>
          <div
            style={{
              background: "#f0f0f0",
              padding: "15px",
              marginBottom: "20px",
            }}
          >
            <h3>Answer:</h3>
            <p>{response.answer}</p>
          </div>

          {response.follow_up_prompts.length > 0 && (
            <div style={{ marginBottom: "20px" }}>
              <h4>Follow-up questions:</h4>
              {response.follow_up_prompts.map((followUp, i) => (
                <button
                  key={i}
                  onClick={() => handleFollowUpClick(followUp.prompt_text)}
                  style={{ display: "block", margin: "5px 0", padding: "10px" }}
                >
                  {followUp.title}
                </button>
              ))}
            </div>
          )}

          {response.relevant_offerings &&
            response.relevant_offerings.length > 0 && (
              <div>
                <h4>Recommended Bank Offerings:</h4>
                {response.relevant_offerings.map((offering: any, i: number) => (
                  <div
                    key={i}
                    style={{
                      border: "1px solid #ddd",
                      padding: "10px",
                      margin: "5px 0",
                    }}
                  >
                    <h5>{offering.name}</h5>
                    <p>{offering.description}</p>
                    {offering.link_url && (
                      <a
                        href={offering.link_url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Learn More
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Example 5: Complete workflow
// ============================================================================

export function CompleteWorkflowExample() {
  const [step, setStep] = useState(1);
  const [businessId, setBusinessId] = useState<string>("");

  const handleStep1 = async () => {
    try {
      const business = await businessService.createBusiness({
        name: "Demo Business",
        industry: "Technology",
        market: "SaaS",
        summary: "Demo business for testing",
      });
      setBusinessId(business.id);
      setStep(2);
    } catch (error) {
      console.error("Step 1 failed:", error);
    }
  };

  const handleStep2 = async () => {
    try {
      await etlService.triggerETL({
        business_id: businessId,
        file_url: "https://example.com/transactions.csv",
        generate_prompts: true,
      });
      setStep(3);
    } catch (error) {
      console.error("Step 2 failed:", error);
    }
  };

  return (
    <div>
      <h2>Complete API Workflow</h2>

      <div>
        <h3>Step 1: Create Business</h3>
        <button onClick={handleStep1} disabled={step !== 1}>
          Create Business
        </button>
        {businessId && <p>Business ID: {businessId}</p>}
      </div>

      {step >= 2 && (
        <div>
          <h3>Step 2: Upload Transaction Data</h3>
          <button onClick={handleStep2} disabled={step !== 2}>
            Upload Data
          </button>
        </div>
      )}

      {step >= 3 && (
        <div>
          <h3>Step 3: View Prompts & Query Data</h3>
          <PromptsDisplayExample businessId={businessId} />
          <ChatInterfaceExample businessId={businessId} />
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Example 6: Bank Offerings Management
// ============================================================================

export function OfferingsManagementExample() {
  const [offerings, setOfferings] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const loadOfferings = async () => {
    setLoading(true);
    try {
      const data = await offeringsService.listOfferings(true, 0, 50);
      setOfferings(data);
    } catch (error) {
      console.error("Failed to load offerings:", error);
    } finally {
      setLoading(false);
    }
  };

  const createOffering = async () => {
    try {
      await offeringsService.createOffering({
        code: `OFFER-${Date.now()}`,
        name: "New Business Loan",
        description: "Flexible loan for business expansion",
        category: "Lending",
        link_url: "https://nedbank.co.za/business-loan",
        active: true,
      });
      loadOfferings(); // Reload list
    } catch (error) {
      console.error("Failed to create offering:", error);
    }
  };

  return (
    <div>
      <button onClick={loadOfferings} disabled={loading}>
        {loading ? "Loading..." : "Load Offerings"}
      </button>
      <button onClick={createOffering}>Create New Offering</button>

      <div>
        {offerings.map((offering) => (
          <div
            key={offering.id}
            style={{ border: "1px solid #ddd", padding: "10px", margin: "5px" }}
          >
            <h4>{offering.name}</h4>
            <p>
              <strong>Code:</strong> {offering.code}
            </p>
            <p>
              <strong>Category:</strong> {offering.category}
            </p>
            <p>{offering.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

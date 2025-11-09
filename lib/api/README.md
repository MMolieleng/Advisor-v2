# Nedbank Business Insights API Integration

This project uses Axios to integrate with the Nedbank Business Insights API - an AI-powered business transaction analysis platform.

## Features

- **Business Management**: Register businesses and opt-in for AI data usage
- **Data Processing**: ETL pipeline for transaction data ingestion
- **Smart Prompts**: AI-generated contextual prompts tailored to business data
- **RAG Chat**: Query transaction data with natural language
- **Bank Offerings**: Intelligent product recommendations

## Configuration

### Environment Variables

Set your API base URL in `.env`:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001/api
```

### Axios Instance

The axios instance is configured in `lib/api/axios.ts` with:

- Base URL from environment variables
- 30-second timeout
- Request/response interceptors
- Automatic JWT token handling
- Error handling for common HTTP status codes

## Workflow

1. Register a business via `businessService.createBusiness()`
2. Upload transaction data via `etlService.triggerETL()`
3. Get AI-generated prompts via `promptsService.getBusinessPrompts()`
4. Execute queries via `chatService.executeQuery()`
5. Get follow-up suggestions and bank offering recommendations

## API Services

### Business Service

Manage businesses and opt them in for AI data usage.

```typescript
import { businessService } from "@/lib/api/services";

// Create a new business
const business = await businessService.createBusiness({
  name: "Acme Corp",
  industry: "Retail",
  market: "E-commerce",
  summary: "Online retail store specializing in consumer electronics",
});

// List all businesses
const businesses = await businessService.listBusinesses(0, 10);

// Get specific business
const business = await businessService.getBusiness("business-id");

// Update business
const updated = await businessService.updateBusiness("business-id", {
  industry: "Technology",
  summary: "Updated business description",
});

// Delete business
await businessService.deleteBusiness("business-id");
```

### ETL Service

Process transaction data from CSV files.

```typescript
import { etlService } from "@/lib/api/services";

// Trigger async ETL (returns immediately, processes in background)
const status = await etlService.triggerETL({
  business_id: "business-id",
  file_url: "https://example.com/transactions.csv",
  generate_prompts: true,
});

// Trigger sync ETL (waits until complete)
const result = await etlService.triggerETLSync({
  business_id: "business-id",
  file_url: "file:///path/to/local/transactions.csv",
  generate_prompts: true,
});
```

### Prompts Service

Get AI-generated contextual prompts for business insights.

```typescript
import { promptsService } from "@/lib/api/services";

// Get all prompts for a business
const prompts = await promptsService.getBusinessPrompts("business-id");

// Get specific prompt
const prompt = await promptsService.getPrompt("business-id", "prompt-id");

// Manually generate prompts
await promptsService.generatePrompts({
  business_id: "business-id",
  force_regenerate: false,
});

// Delete all prompts for regeneration
await promptsService.deleteBusinessPrompts("business-id");
```

### Chat Service

Query transaction data using natural language (RAG).

```typescript
import { chatService } from "@/lib/api/services";

// Execute query with full context
const response = await chatService.executeQuery({
  business_id: "business-id",
  query: "What were my top expenses last month?",
  include_offerings: true,
  conversation_history: [
    { role: "user", content: "Show my revenue trends" },
    { role: "assistant", content: "Your revenue has increased..." },
  ],
});

console.log(response.answer);
console.log(response.follow_up_prompts);
console.log(response.relevant_offerings);

// Quick query without history
const quickResponse = await chatService.quickQuery(
  "business-id",
  "What is my average transaction value?",
  true
);
```

### Offerings Service

Manage bank product offerings and recommendations.

```typescript
import { offeringsService } from "@/lib/api/services";

// Create offering
const offering = await offeringsService.createOffering({
  code: "BUS-LOAN-001",
  name: "Business Term Loan",
  description: "Flexible term loan for business expansion",
  category: "Lending",
  link_url: "https://nedbank.co.za/business-loan",
  active: true,
});

// List active offerings
const offerings = await offeringsService.listOfferings(true, 0, 50);

// Get specific offering
const offering = await offeringsService.getOffering("offering-id");

// Get by code
const offering = await offeringsService.getOfferingByCode("BUS-LOAN-001");

// Update offering
await offeringsService.updateOffering("offering-id", {
  description: "Updated description",
  active: false,
});

// Bulk create offerings
await offeringsService.bulkCreateOfferings([
  { code: "PROD-001", name: "Product 1" },
  { code: "PROD-002", name: "Product 2" },
  // ... up to 200 offerings
]);

// Delete offering
await offeringsService.deleteOffering("offering-id");
```

## Error Handling

Errors are automatically handled in the response interceptor:

- **401**: Clears auth token and redirects to login
- **403**: Access forbidden
- **404**: Resource not found
- **500**: Server error

You can also handle errors in your components:

```typescript
import axios from "axios";
import { businessService } from "@/lib/api/services";

try {
  const business = await businessService.getBusiness("business-id");
} catch (error) {
  if (axios.isAxiosError(error)) {
    console.error("API Error:", error.response?.data);
    // Handle validation errors
    if (error.response?.status === 422) {
      const validationErrors = error.response.data.detail;
      console.log("Validation errors:", validationErrors);
    }
  }
}
```

## Authentication

The axios instance automatically includes the JWT token from localStorage in requests:

```typescript
// After login, store the token
localStorage.setItem("authToken", "your-jwt-token");

// All subsequent API calls will include the token in headers
// Authorization: Bearer <token>
```

## TypeScript Types

All request and response types are defined in `types/api.ts`:

- Business types: `BusinessCreate`, `BusinessUpdate`, `BusinessResponse`
- ETL types: `ETLTrigger`, `ETLStatus`
- Prompt types: `PromptGenerate`, `PromptResponse`
- Chat types: `QueryRequest`, `QueryResponse`, `FollowUpPrompt`
- Offering types: `BankOfferingCreate`, `BankOfferingUpdate`, `BankOfferingResponse`
- Common types: `MessageResponse`, `HTTPValidationError`

## File Structure

```
lib/
  api/
    axios.ts      # Axios instance and configuration
    services.ts   # API service methods (5 services)
    README.md     # This documentation
types/
  api.ts          # TypeScript types for all endpoints
.env              # Environment variables
```

## Using with React Components

```typescript
"use client";

import { useState, useEffect } from "react";
import { businessService, promptsService } from "@/lib/api/services";
import type { BusinessResponse, PromptResponse } from "@/types/api";

export function BusinessDashboard({ businessId }: { businessId: string }) {
  const [business, setBusiness] = useState<BusinessResponse | null>(null);
  const [prompts, setPrompts] = useState<PromptResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [businessData, promptsData] = await Promise.all([
          businessService.getBusiness(businessId),
          promptsService.getBusinessPrompts(businessId),
        ]);

        setBusiness(businessData);
        setPrompts(promptsData);
      } catch (error) {
        console.error("Failed to load data:", error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [businessId]);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h1>{business?.name}</h1>
      <div>
        {prompts.map((prompt) => (
          <div key={prompt.id}>
            <h3>{prompt.title}</h3>
            <p>{prompt.prompt_text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
```

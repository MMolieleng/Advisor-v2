# 🚀 Nedbank Business Insights API - Quick Reference

## 🌐 URL Structure (NEW!)

### Routes

```bash
# Landing page (opt-in screen)
http://localhost:3000/

# Business dashboard with dynamic business ID
http://localhost:3000/business/{businessId}

# Examples:
http://localhost:3000/business/demo-business
http://localhost:3000/business/acme-corp-123
```

**Features:**

- ✅ Business ID in URL path for easy sharing
- ✅ Direct access to specific business dashboards
- ✅ Automatically fetches business data from API
- ✅ Error handling for invalid business IDs

See `ROUTING.md` for detailed routing documentation.

---

## 📦 Import

```typescript
// Import everything from one place
import {
  businessService,
  etlService,
  promptsService,
  chatService,
  offeringsService,
} from "@/lib/api";

// Or import types
import type { Business, Prompt, ChatResponse } from "@/types";
```

## 🔑 Environment Setup

```bash
# .env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

## 📋 Common Operations

### Create Business

```typescript
const business = await businessService.createBusiness({
  name: "Acme Corp",
  industry: "Retail",
  market: "E-commerce",
  summary: "Online retail store",
});
// Returns: { id, name, industry, market, summary, created_at, updated_at }
```

### Upload Transaction Data

```typescript
const status = await etlService.triggerETL({
  business_id: "business-id",
  file_url: "https://example.com/transactions.csv",
  generate_prompts: true,
});
// Returns: { status, message, documents_processed, prompts_generated }
```

### Get AI Prompts

```typescript
const prompts = await promptsService.getBusinessPrompts("business-id");
// Returns: Array of { id, business_id, title, subtitle[], prompt_text, created_at }
```

### Query with Natural Language

```typescript
const response = await chatService.executeQuery({
  business_id: "business-id",
  query: "What were my top expenses last month?",
  include_offerings: true,
  conversation_history: [],
});
// Returns: { answer, follow_up_prompts[], relevant_offerings[], sources[] }
```

### Quick Query (No History)

```typescript
const response = await chatService.quickQuery(
  "business-id",
  "Show revenue trends",
  true // include offerings
);
```

### List Bank Offerings

```typescript
const offerings = await offeringsService.listOfferings(true, 0, 50);
// Returns: Array of offerings
```

## 🎯 Complete Workflow

```typescript
// 1. Create business
const business = await businessService.createBusiness({
  name: "My Business",
});

// 2. Upload data
await etlService.triggerETL({
  business_id: business.id,
  file_url: "https://example.com/data.csv",
  generate_prompts: true,
});

// 3. Get prompts
const prompts = await promptsService.getBusinessPrompts(business.id);

// 4. Query data
const response = await chatService.executeQuery({
  business_id: business.id,
  query: prompts[0].prompt_text,
  include_offerings: true,
});

// 5. Use results
console.log(response.answer);
console.log(response.follow_up_prompts);
console.log(response.relevant_offerings);
```

## 🔄 Error Handling

```typescript
try {
  const business = await businessService.getBusiness("business-id");
} catch (error) {
  if (axios.isAxiosError(error)) {
    // Handle HTTP errors
    if (error.response?.status === 404) {
      console.log("Business not found");
    } else if (error.response?.status === 422) {
      // Validation error
      const details = error.response.data.detail;
      console.log("Validation errors:", details);
    }
  }
}
```

## 📊 React Component Example

```typescript
"use client";

import { useState, useEffect } from "react";
import { businessService, promptsService } from "@/lib/api";
import { PromptCard } from "@/components/prompt-card";
import type { Prompt } from "@/types";

export function Dashboard({ businessId }: { businessId: string }) {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await promptsService.getBusinessPrompts(businessId);
        setPrompts(data);
      } catch (error) {
        console.error("Failed to load:", error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [businessId]);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="grid gap-4">
      {prompts.map((prompt) => (
        <PromptCard
          key={prompt.id}
          prompt={prompt}
          onClick={() => handleClick(prompt)}
        />
      ))}
    </div>
  );
}
```

## 🎨 Using with Existing Components

```typescript
// The API types are compatible with your existing components
import { PromptCard } from "@/components/prompt-card";
import { promptsService } from "@/lib/api";
import type { Prompt } from "@/types"; // Uses API types

// Load prompts from API
const prompts = await promptsService.getBusinessPrompts("business-id");

// Use with your components
<PromptCard
  prompt={prompts[0]} // Works directly!
  onClick={() => handlePromptClick(prompts[0])}
/>;
```

## 🔍 All Available Services

| Service              | Methods                                                  | Purpose                  |
| -------------------- | -------------------------------------------------------- | ------------------------ |
| **businessService**  | create, list, get, update, delete                        | Business management      |
| **etlService**       | triggerETL, triggerETLSync                               | Data processing          |
| **promptsService**   | getBusinessPrompts, getPrompt, generate, delete          | AI prompts               |
| **chatService**      | executeQuery, quickQuery                                 | Natural language queries |
| **offeringsService** | create, list, get, getByCode, update, delete, bulkCreate | Bank products            |

## 💡 Tips

1. **Use TypeScript**: All types are exported from `@/types` or `@/types/api`
2. **Error Handling**: Always wrap API calls in try-catch
3. **Loading States**: Track loading for better UX
4. **Parallel Requests**: Use Promise.all for independent requests
5. **Token Storage**: Token is auto-added from localStorage ('authToken')

## 📚 Full Documentation

- **Detailed Guide**: `lib/api/README.md`
- **Architecture**: `API_ARCHITECTURE.md`
- **Full Examples**: `lib/api/example-usage.tsx`
- **Integration Examples**: `lib/api/integration-examples.tsx`

## ⚡ Quick Commands

```bash
# Install dependencies
pnpm install

# Run development server
pnpm dev

# Check TypeScript errors
pnpm build
```

## 🌐 API Base URL

Default: `http://localhost:8000`

Change in `.env`:

```bash
NEXT_PUBLIC_API_BASE_URL=https://your-api-domain.com
```

---

**Need Help?** Check the comprehensive documentation in `lib/api/README.md`

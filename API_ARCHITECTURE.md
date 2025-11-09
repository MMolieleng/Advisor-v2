# Nedbank Business Insights API - Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                        FRONTEND APPLICATION                          │
│                         (Next.js + React)                            │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             │ imports
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      lib/api/index.ts                                │
│                   (Centralized Exports)                              │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │ • businessService                                             │  │
│  │ • etlService                                                  │  │
│  │ • promptsService                                              │  │
│  │ • chatService                                                 │  │
│  │ • offeringsService                                            │  │
│  │ • All TypeScript types                                        │  │
│  └───────────────────────────────────────────────────────────────┘  │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                ┌────────────┴──────────────┐
                │                           │
                ▼                           ▼
┌──────────────────────────┐    ┌──────────────────────────┐
│   lib/api/services.ts    │    │     types/api.ts         │
│   (API Service Layer)    │    │   (Type Definitions)     │
│                          │    │                          │
│ ┌──────────────────────┐ │    │ ┌──────────────────────┐ │
│ │ businessService      │ │    │ │ BusinessCreate       │ │
│ │ ├─ createBusiness    │ │    │ │ BusinessResponse     │ │
│ │ ├─ listBusinesses    │ │    │ │ ETLTrigger           │ │
│ │ ├─ getBusiness       │ │    │ │ ETLStatus            │ │
│ │ ├─ updateBusiness    │ │    │ │ PromptResponse       │ │
│ │ └─ deleteBusiness    │ │    │ │ QueryRequest         │ │
│ │                      │ │    │ │ QueryResponse        │ │
│ │ etlService           │ │    │ │ BankOfferingCreate   │ │
│ │ ├─ triggerETL        │ │    │ │ BankOfferingResponse │ │
│ │ └─ triggerETLSync    │ │    │ │ MessageResponse      │ │
│ │                      │ │    │ │ HTTPValidationError  │ │
│ │ promptsService       │ │    │ └──────────────────────┘ │
│ │ ├─ getBusinessPrompts│ │    └──────────────────────────┘
│ │ ├─ getPrompt         │ │
│ │ ├─ generatePrompts   │ │
│ │ └─ deletePrompts     │ │
│ │                      │ │
│ │ chatService          │ │
│ │ ├─ executeQuery      │ │
│ │ └─ quickQuery        │ │
│ │                      │ │
│ │ offeringsService     │ │
│ │ ├─ createOffering    │ │
│ │ ├─ listOfferings     │ │
│ │ ├─ getOffering       │ │
│ │ ├─ getOfferingByCode │ │
│ │ ├─ updateOffering    │ │
│ │ ├─ deleteOffering    │ │
│ │ └─ bulkCreateOffering│ │
│ └──────────────────────┘ │
└────────────┬─────────────┘
             │ uses
             ▼
┌──────────────────────────┐
│   lib/api/axios.ts       │
│  (Axios Configuration)   │
│                          │
│ ┌──────────────────────┐ │
│ │ Base URL Config      │ │
│ │ Request Interceptor  │ │
│ │ Response Interceptor │ │
│ │ JWT Token Handling   │ │
│ │ Error Handling       │ │
│ │ HTTP Helpers         │ │
│ │ ├─ api.get()         │ │
│ │ ├─ api.post()        │ │
│ │ ├─ api.put()         │ │
│ │ ├─ api.patch()       │ │
│ │ └─ api.delete()      │ │
│ └──────────────────────┘ │
└────────────┬─────────────┘
             │ HTTP requests
             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    BACKEND API SERVER                                │
│              Nedbank Business Insights API                           │
│                   (FastAPI + Python)                                 │
│                                                                       │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐        │
│  │   /businesses/ │  │   /etl/        │  │   /prompts/    │        │
│  │   - POST       │  │   - trigger    │  │   - GET        │        │
│  │   - GET        │  │   - trigger-   │  │   - POST       │        │
│  │   - PATCH      │  │     sync       │  │   - DELETE     │        │
│  │   - DELETE     │  └────────────────┘  └────────────────┘        │
│  └────────────────┘                                                  │
│                                                                       │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐        │
│  │   /chat/       │  │  /offerings/   │  │   /health      │        │
│  │   - query      │  │   - POST       │  │   - GET        │        │
│  │   - quick-query│  │   - GET        │  └────────────────┘        │
│  └────────────────┘  │   - PATCH      │                             │
│                      │   - DELETE     │                             │
│                      │   - bulk-create│                             │
│                      └────────────────┘                             │
└─────────────────────────────────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                          DATA LAYER                                  │
│                                                                       │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐          │
│  │  PostgreSQL  │    │ Vector Store │    │   AI/LLM     │          │
│  │  (Relational)│    │   (RAG)      │    │   Service    │          │
│  └──────────────┘    └──────────────┘    └──────────────┘          │
└─────────────────────────────────────────────────────────────────────┘
```

## Data Flow Examples

### 1. Complete User Journey

```
User Action                     Frontend                Backend                 Data
─────────────────────────────────────────────────────────────────────────────────

1. Register Business
   └─> Click "Register"  ──> businessService       ──> POST /businesses/  ──> PostgreSQL
                              .createBusiness()                               Insert business

2. Upload Data
   └─> Upload CSV file   ──> etlService            ──> POST /etl/trigger  ──> PostgreSQL
                              .triggerETL()                                    Insert transactions
                                                                           ──> Vector Store
                                                                               Generate embeddings
                                                                           ──> AI Service
                                                                               Generate prompts

3. View Prompts
   └─> Load dashboard    ──> promptsService        ──> GET /prompts/{id}  ──> PostgreSQL
                              .getBusinessPrompts()                           Fetch prompts

4. Ask Question
   └─> Type query        ──> chatService           ──> POST /chat/query   ──> Vector Store
                              .executeQuery()                                 Semantic search
                                                                           ──> PostgreSQL
                                                                               Fetch context
                                                                           ──> AI Service
                                                                               Generate answer
                                                                           ──> Return:
                                                                               • Answer
                                                                               • Follow-ups
                                                                               • Offerings

5. View Recommendations
   └─> Display results   <── QueryResponse         <── JSON response      <── Combined data
       • Answer text
       • Follow-up prompts
       • Bank offerings
       • Sources
```

### 2. Request/Response Flow

```
Component                 Service Layer              Axios Layer              Backend
─────────────────────────────────────────────────────────────────────────────────

Component calls:
businessService
.createBusiness({
  name: "Acme"
})
                │
                │ Type-checked
                │ request
                ▼
            services.ts
            validates types
                │
                │ Prepared
                │ payload
                ▼
             axios.ts
          • Adds base URL
          • Adds JWT token
          • Logs (dev mode)
                │
                │ HTTP POST
                │ /businesses/
                │ Headers:
                │   Authorization: Bearer xxx
                │   Content-Type: json
                ▼
            Backend API
          • Validates request
          • Creates business
          • Returns 201
                │
                │ HTTP 201
                │ {
                │   id: "uuid",
                │   name: "Acme",
                │   ...
                │ }
                ▼
             axios.ts
          • Intercepts response
          • Logs (dev mode)
          • Handles errors
                │
                │ Typed
                │ response
                ▼
            services.ts
            returns typed data
                │
                │ BusinessResponse
                │
                ▼
            Component
            updates state
```

### 3. Error Handling Flow

```
Backend Error                 Axios Interceptor           Component
────────────────────────────────────────────────────────────────────

422 Validation Error
{
  detail: [
    {
      loc: ["body", "name"],
      msg: "field required",
      type: "value_error"
    }
  ]
}
                │
                │
                ▼
        Response Interceptor
        • Detects 422 status
        • Logs error
        • Passes to component
                │
                │ AxiosError
                │ with response data
                ▼
            try/catch
            in component
        • Display error
        • Show validation
          messages to user


401 Unauthorized
                │
                │
                ▼
        Response Interceptor
        • Clears localStorage
        • Redirects to /login
        • Returns rejected promise
                │
                │ User sees
                │ login page
                ▼
          Login Component
```

## Environment Configuration

```
.env
────────────────────────────
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
                          │
                          │ Read by
                          ▼
                    lib/api/axios.ts
                          │
                          │ Used as baseURL
                          ▼
                    All API requests
                    prepend this URL
                          │
                          │ Example:
                          │ /businesses/
                          │ becomes
                          │ http://localhost:8000/businesses/
                          ▼
                    Backend API Server
```

## File Organization

```
/Users/falakhesivela/Downloads/code/
│
├── .env                              # Environment config
│
├── lib/
│   └── api/
│       ├── index.ts                  # Central exports
│       ├── axios.ts                  # Axios configuration
│       ├── services.ts               # 5 API services
│       ├── example-usage.tsx         # Working examples
│       └── README.md                 # Documentation
│
├── types/
│   └── api.ts                        # All TypeScript types
│
└── API_INTEGRATION_SUMMARY.md        # This summary
```

## Services Overview

| Service          | Endpoints | Purpose                          |
| ---------------- | --------- | -------------------------------- |
| businessService  | 5         | Business CRUD operations         |
| etlService       | 2         | Transaction data processing      |
| promptsService   | 4         | AI prompt generation & retrieval |
| chatService      | 2         | Natural language queries (RAG)   |
| offeringsService | 7         | Bank product management          |
| **Total**        | **20**    | **Complete API coverage**        |

## Key Features

✅ **Type Safety**: Every request/response is strongly typed
✅ **Error Handling**: Automatic 401/403/404/500 handling
✅ **Authentication**: JWT token management built-in
✅ **Logging**: Request/response logging in development
✅ **Validation**: HTTPValidationError types for 422 responses
✅ **Pagination**: Built-in support for skip/limit
✅ **Bulk Operations**: Support for batch operations
✅ **RAG Integration**: Natural language query support
✅ **AI Features**: Prompt generation and recommendations
✅ **Documentation**: Comprehensive docs and examples

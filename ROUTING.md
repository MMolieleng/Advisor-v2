# Business Dashboard URL Structure

## Routes

### 1. Landing Page (Opt-in) with Business ID

```
http://localhost:3000/?businessId={businessId}
```

Shows the opt-in screen with business-specific information.

**Query Parameters:**

- `businessId` (optional) - Defaults to `demo-business` if not provided

**Examples:**

- `http://localhost:3000/` (uses default: demo-business)
- `http://localhost:3000/?businessId=demo-business`
- `http://localhost:3000/?businessId=acme-corp-123`
- `http://localhost:3000/?businessId=12345`

**Features:**

- ✅ Fetches business info from API: `GET /businesses/{businessId}`
- ✅ Displays business name and details
- ✅ Shows loading state while fetching
- ✅ Error handling for invalid business IDs
- ✅ Redirects to correct business dashboard after opt-in

### 2. Business Dashboard

```
http://localhost:3000/business/{businessId}
```

Shows the dashboard for a specific business with AI-generated prompts and insights.

**Examples:**

- `http://localhost:3000/business/demo-business`
- `http://localhost:3000/business/acme-corp-123`
- `http://localhost:3000/business/12345`

## Demo Usage

### Quick Demo Flow

**Option 1: With specific business**

```bash
# Step 1: Visit opt-in with business ID
http://localhost:3000/?businessId=demo-business

# Step 2: Click "Enable AI Insights"
# Automatically redirects to:
http://localhost:3000/business/demo-business
```

**Option 2: Direct to dashboard (skip opt-in)**

```bash
# Go directly to business dashboard
http://localhost:3000/business/demo-business
```

**Option 3: Default (no business ID specified)**

```bash
# Uses demo-business by default
http://localhost:3000/

# Same as:
http://localhost:3000/?businessId=demo-business
```

### Testing with Different Businesses

1. Create businesses via API:

```bash
curl -X POST http://localhost:8000/businesses/ \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Acme Corporation",
    "industry": "Retail",
    "market": "E-commerce"
  }'
```

2. Copy the returned business ID (e.g., `abc123`)

3. Access opt-in page:

```
http://localhost:3000/?businessId=abc123
```

4. Or go directly to dashboard:

```
http://localhost:3000/business/abc123
```

### Workflow

```
User visits /?businessId=abc123
    ↓
Fetches business data: GET /businesses/abc123
    ↓
Shows opt-in screen with business name
    ↓
User clicks "Enable AI Insights"
    ↓
Redirects to /business/abc123
    ↓
Fetches business data again (cached)
    ↓
Loads AI prompts: GET /prompts/abc123
    ↓
Shows dashboard with prompts
    ↓
User clicks prompt
    ↓
Executes query: POST /chat/query with business_id=abc123
```

## URL Parameters & API Calls

### All API Endpoints Use Business ID

Every component makes API calls with the business ID:

| Component         | API Call                                                     | Endpoint                       | Purpose                      |
| ----------------- | ------------------------------------------------------------ | ------------------------------ | ---------------------------- |
| **Opt-in Screen** | `businessService.getBusiness(businessId)`                    | `GET /businesses/{businessId}` | Show business name & details |
| **Dashboard**     | `businessService.getBusiness(businessId)`                    | `GET /businesses/{businessId}` | Verify business exists       |
| **Dashboard**     | `promptsService.getBusinessPrompts(businessId)`              | `GET /prompts/{businessId}`    | Load AI prompts              |
| **Chat View**     | `chatService.executeQuery({ business_id: businessId, ... })` | `POST /chat/query`             | Execute queries              |

**Key Benefits:**

- ✅ Every screen uses the same business ID
- ✅ Easy to demo different businesses by changing URL
- ✅ All data is business-specific
- ✅ Prompts are truly dynamic based on business data
- ✅ No hardcoded business IDs in code

## Error Handling

If business ID doesn't exist:

- Shows "Business Not Found" error page
- Provides "Go Back Home" button
- User can return to opt-in screen

## Development

### Start the app:

```bash
pnpm dev
```

### Test URLs:

```bash
# Landing page
http://localhost:3000/

# Demo business (if it exists in your backend)
http://localhost:3000/business/demo-business

# Custom business ID
http://localhost:3000/business/your-business-id
```

## API Integration

Every page and component uses the businessId from the URL:

### Opt-in Page (`/?businessId=abc123`)

```typescript
// 1. Extract businessId from URL query param
const businessId = searchParams.get("businessId") || "demo-business";

// 2. Fetch business data
const business = await businessService.getBusiness(businessId);

// 3. Display business name: "Acme Corporation"
// 4. Redirect to /business/abc123 after opt-in
```

### Dashboard Page (`/business/abc123`)

```typescript
// 1. Extract businessId from URL path param
const businessId = params.businessId;

// 2. Fetch business data
const business = await businessService.getBusiness(businessId);

// 3. Fetch prompts for this business
const prompts = await promptsService.getBusinessPrompts(businessId);

// 4. Display business-specific dashboard
```

### Chat View

```typescript
// businessId is passed as prop from Dashboard
const response = await chatService.executeQuery({
  business_id: businessId,
  query: "What were my top expenses?",
  include_offerings: true,
});
```

**Result:** All prompts, queries, and data are specific to the business ID in the URL!

## Sharing

You can share direct links to specific businesses:

```
Share this link: https://yourapp.com/business/abc123
```

The recipient will see that specific business's dashboard without needing to navigate through opt-in (unless you add authentication).

## Next Steps

To add authentication:

1. Check if user is authenticated
2. Verify user has access to the business
3. Redirect to login if not authenticated
4. Show 403 if not authorized for this business

# REST API Plan for 10x-cards

## 1. Resources

### Core Resources

- **Users** - Managed by Supabase Auth (`auth.users` table)
- **Generations** - Metadata about AI flashcard generation sessions (`generations` table)
- **Flashcards** - Individual flashcard items (`flashcards` table)
- **Generation Error Logs** - Error tracking for generation failures (`generation_error_logs` table)

## 2. API Endpoints

### 2.2 Flashcard Generation Endpoints

#### Generate Flashcards proposals from Text

- **Method:** `POST`
- **Path:** `/api/generations`
- **Description:** Submits source text to AI for flashcard proposal generation
- **Headers:** `Authorization: Bearer {access_token}`
- **Request Body:**

```json
{
  "source_text": "Long text content to generate flashcards proposals from...(1000 to 10000 charactes)"
}
```

- **Business Logic** :
  - Validate that `source_text` length is between 1000 and 10000 characters.
  - Call the AI service to generate flashcards proposals.
  - Store the generation metadata and associate generated flashcards proposals to the user.

- **Success Response (201 Created):**

```json
{
  "generation": {
    "id": 1,
    "user_id": "uuid",
    "model": "gpt-4o-mini",
    "source_text_length": 5432,
    "source_text_hash": "sha256_hash",
    "generated_count": 15,
    "generation_duration": 8,
    "created_at": "2025-10-11T10:00:00Z",
    "flashcards_proposals": [
      {
        "id": 1,
        "question": "What is the capital of France?",
        "answer": "Paris",
        "source": "ai-full",
        "generation_id": 1,
        "created_at": "2025-10-11T10:00:00Z"
      }
    ]
  }
}
```

- **Error Responses:**
  - `400 Bad Request` - Invalid source_text length (must be 1000-10000 characters) or missing model
  - `401 Unauthorized` - Invalid or expired token
  - `422 Unprocessable Entity` - AI model returned invalid response
  - `500 AI service errors (log recorded in generation_error_logs).
  - `503 Service Unavailable` - AI service temporarily unavailable

#### Get Generation Details

- **Method:** `GET`
- **Path:** `/api/generations/:id`
- **Description:** Retrieves details of a specific generation session
- **Headers:** `Authorization: Bearer {access_token}`
- **Success Response (200 OK):**

```json
{
  "id": 1,
  "user_id": "uuid",
  "model": "gpt-4o-mini",
  "source_text_length": 5432,
  "source_text_hash": "sha256_hash",
  "generated_count": 15,
  "generation_duration": 8,
  "created_at": "2025-10-11T10:00:00Z",
  "updated_at": "2025-10-11T10:05:00Z"
}
```

- **Error Responses:**
  - `401 Unauthorized` - Invalid or expired token
  - `403 Forbidden` - Generation belongs to another user
  - `404 Not Found` - Generation does not exist

#### List User Generations

- **Method:** `GET`
- **Path:** `/api/generations`
- **Description:** Retrieves paginated list of user's generation sessions
- **Headers:** `Authorization: Bearer {access_token}`
- **Query Parameters:**
  - `page` (optional, default: 1) - Page number
  - `limit` (optional, default: 20, max: 100) - Items per page
  - `sort` (optional, default: "created_at") - Sort field (created_at, generated_count)
  - `order` (optional, default: "desc") - Sort order (asc, desc)
- **Success Response (200 OK):**

```json
{
  "data": [
    {
      "id": 1,
      "model": "gpt-4o-mini",
      "source_text_length": 5432,
      "generated_count": 15,
      "generation_duration": 8,
      "created_at": "2025-10-11T10:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "total_pages": 3
  }
}
```

- **Error Responses:**
  - `400 Bad Request` - Invalid query parameters
  - `401 Unauthorized` - Invalid or expired token

### 2.3 Flashcard Management Endpoints

#### Create Flashcards (Manual or AI-Generated)

- **Method:** `POST`
- **Path:** `/api/flashcards`
- **Description:** Creates one or more flashcards (manual or accepts AI-generated)
- **Headers:** `Authorization: Bearer {access_token}`
- **Request Body (Single Manual Flashcard):**

```json
{
  "flashcards": [
    {
      "question": "What is TypeScript?",
      "answer": "A typed superset of JavaScript that compiles to plain JavaScript",
      "source": "manual"
    }
  ]
}
```

- **Request Body (Multiple Manual Flashcards):**

```json
{
  "flashcards": [
    {
      "question": "What is TypeScript?",
      "answer": "A typed superset of JavaScript",
      "source": "manual"
    },
    {
      "question": "What is React?",
      "answer": "A JavaScript library for building user interfaces",
      "source": "manual"
    }
  ]
}
```

- **Request Body (AI-Generated Flashcards):**

```json
{
  "generation_id": 1,
  "flashcards": [
    {
      "question": "What is the capital of France?",
      "answer": "Paris",
      "source": "ai-full"
    },
    {
      "question": "What is the capital of Germany?",
      "answer": "Berlin (edited from original)",
      "source": "ai-edited"
    }
  ]
}
```

- **Success Response (201 Created):**

```json
{
  "created_count": 2,
  "flashcards": [
    {
      "id": 42,
      "user_id": "uuid",
      "generation_id": 1,
      "question": "What is the capital of France?",
      "answer": "Paris",
      "source": "ai-full",
      "created_at": "2025-10-11T10:00:00Z",
      "updated_at": "2025-10-11T10:00:00Z"
    },
    {
      "id": 43,
      "user_id": "uuid",
      "generation_id": 1,
      "question": "What is the capital of Germany?",
      "answer": "Berlin (edited from original)",
      "source": "ai-edited",
      "created_at": "2025-10-11T10:00:00Z",
      "updated_at": "2025-10-11T10:00:00Z"
    }
  ]
}
```

- **Error Responses:**
  - `400 Bad Request` - Missing required fields, validation errors (question max 255 chars, answer max 1000 chars), invalid source value, or empty flashcards array
  - `401 Unauthorized` - Invalid or expired token
  - `403 Forbidden` - Generation_id provided belongs to another user
  - `404 Not Found` - Generation_id provided does not exist

**Validation Notes:**

- `flashcards` array is required and must contain at least 1 flashcard
- `source` must be one of: "manual", "ai-full", "ai-edited"
- `generation_id` is required when source is "ai-full" or "ai-edited", must be null/omitted for "manual"

#### Get Flashcard by ID

- **Method:** `GET`
- **Path:** `/api/flashcards/:id`
- **Description:** Retrieves a specific flashcard
- **Headers:** `Authorization: Bearer {access_token}`
- **Success Response (200 OK):**

```json
{
  "id": 42,
  "user_id": "uuid",
  "generation_id": 1,
  "question": "What is TypeScript?",
  "answer": "A typed superset of JavaScript",
  "source": "manual",
  "created_at": "2025-10-11T10:00:00Z",
  "updated_at": "2025-10-11T10:00:00Z"
}
```

- **Error Responses:**
  - `401 Unauthorized` - Invalid or expired token
  - `403 Forbidden` - Flashcard belongs to another user
  - `404 Not Found` - Flashcard does not exist

#### List User Flashcards

- **Method:** `GET`
- **Path:** `/api/flashcards`
- **Description:** Retrieves paginated list of user's flashcards
- **Headers:** `Authorization: Bearer {access_token}`
- **Query Parameters:**
  - `page` (optional, default: 1) - Page number
  - `limit` (optional, default: 50, max: 200) - Items per page
  - `source` (optional) - Filter by source (ai-full, ai-edited, manual)
  - `generation_id` (optional) - Filter by generation ID
  - `sort` (optional, default: "created_at") - Sort field
  - `order` (optional, default: "desc") - Sort order (asc, desc)
- **Success Response (200 OK):**

```json
{
  "data": [
    {
      "id": 42,
      "generation_id": 1,
      "question": "What is TypeScript?",
      "answer": "A typed superset of JavaScript",
      "source": "manual",
      "created_at": "2025-10-11T10:00:00Z",
      "updated_at": "2025-10-11T10:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 150,
    "total_pages": 3
  }
}
```

- **Error Responses:**
  - `400 Bad Request` - Invalid query parameters
  - `401 Unauthorized` - Invalid or expired token

#### Update Flashcard

- **Method:** `PATCH`
- **Path:** `/api/flashcards/:id`
- **Description:** Updates an existing flashcard
- **Headers:** `Authorization: Bearer {access_token}`
- **Validations:**:
  - `question` max length: 200 characters.
  - `answer` max length: 500 characters.
  - `source`: `ai-edited` or `manual`.
- **Request Body:**

```json
{
  "question": "Updated question?",
  "answer": "Updated answer"
}
```

- **Success Response (200 OK):**

```json
{
  "id": 42,
  "user_id": "uuid",
  "generation_id": 1,
  "question": "Updated question?",
  "answer": "Updated answer",
  "source": "manual",
  "created_at": "2025-10-11T10:00:00Z",
  "updated_at": "2025-10-11T10:15:00Z"
}
```

- **Error Responses:**
  - `400 Bad Request` - Validation errors (question max 255 chars, answer max 1000 chars)
  - `401 Unauthorized` - Invalid or expired token
  - `403 Forbidden` - Flashcard belongs to another user
  - `404 Not Found` - Flashcard does not exist

#### Delete Flashcard

- **Method:** `DELETE`
- **Path:** `/api/flashcards/:id`
- **Description:** Permanently deletes a flashcard
- **Headers:** `Authorization: Bearer {access_token}`
- **Success Response (204 No Content)**
- **Error Responses:**
  - `401 Unauthorized` - Invalid or expired token
  - `403 Forbidden` - Flashcard belongs to another user
  - `404 Not Found` - Flashcard does not exist

#### Batch Delete Flashcards

- **Method:** `POST`
- **Path:** `/api/flashcards/batch-delete`
- **Description:** Deletes multiple flashcards at once
- **Headers:** `Authorization: Bearer {access_token}`
- **Request Body:**

```json
{
  "flashcard_ids": [1, 2, 3, 4, 5]
}
```

- **Success Response (200 OK):**

```json
{
  "deleted_count": 5
}
```

- **Error Responses:**
  - `400 Bad Request` - Invalid flashcard IDs or empty array
  - `401 Unauthorized` - Invalid or expired token
  - `403 Forbidden` - One or more flashcards belong to another user

### 2.5 Error Logging Endpoints

#### Get Generation Error Logs

- **Method:** `GET`
- **Path:** `/api/errors/generation`
- **Description:** Retrieves error logs for AI flashcard generation for the authenticated user
- **Headers:** `Authorization: Bearer {access_token}`
- **Query Parameters:**
  - `page` (optional, default: 1) - Page number
  - `limit` (optional, default: 20, max: 100) - Items per page
  - `error_code` (optional) - Filter by specific error code
  - `model` (optional) - Filter by AI model
  - `from_date` (optional) - ISO 8601 date to filter from
  - `to_date` (optional) - ISO 8601 date to filter to
  - `sort` (optional, default: "created_at") - Sort field
  - `order` (optional, default: "desc") - Sort order (asc, desc)

- **Success Response (200 OK):**

```json
{
  "data": [
    {
      "id": 1,
      "user_id": "uuid",
      "error_code": "AI_TIMEOUT",
      "error_message": "Request to AI service timed out after 30 seconds",
      "model": "gpt-4o-mini",
      "source_text_length": 5432,
      "source_text_hash": "sha256_hash",
      "created_at": "2025-10-11T10:00:00Z"
    },
    {
      "id": 2,
      "user_id": "uuid",
      "error_code": "AI_RATE_LIMIT",
      "error_message": "Rate limit exceeded for API key",
      "model": "gpt-4o-mini",
      "source_text_length": 3200,
      "source_text_hash": "another_hash",
      "created_at": "2025-10-11T09:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "total_pages": 3
  }
}
```

- **Error Responses:**
  - `400 Bad Request` - Invalid query parameters or date format
  - `401 Unauthorized` - Invalid or expired token

**Notes:**

- Error logs are automatically created by the system when generation failures occur
- Common error codes: `AI_TIMEOUT`, `AI_RATE_LIMIT`, `AI_INVALID_RESPONSE`, `AI_SERVICE_ERROR`, `VALIDATION_ERROR`

## 3. Authentication and Authorization

### Current Status (MVP)

For MVP, all operations use a default user ID defined in `src/db/supabase.client.ts`. All endpoints are publicly accessible without authentication.

### Future Implementation (Planned)

When authentication is implemented, the API will use **JWT (JSON Web Token)** based authentication provided by Supabase Auth.

#### Implementation Details

1. **Token Storage:**
   - Access tokens are short-lived (default: 1 hour)
   - Refresh tokens are long-lived (default: 30 days)
   - Client stores both tokens securely (httpOnly cookies or secure storage)

2. **Token Usage:**
   - All protected endpoints require `Authorization: Bearer {access_token}` header
   - Invalid or expired tokens return `401 Unauthorized`

3. **Token Refresh:**
   - Client uses refresh token to obtain new access token when it expires
   - Handled automatically by Supabase client libraries

4. **Session Management:**
   - Supabase handles session creation, validation, and termination
   - Sessions are tracked in `auth.sessions` table
   - Logout invalidates current session

#### Authorization Rules

- **Flashcards:** Users can only access, modify, and delete their own flashcards
- **Generations:** Users can only access their own generation sessions
- **Error Logs:** Users can only view and create their own error logs

**Security Implementation:**

Database-level Row-Level Security (RLS) ensures that users access only records with matching `user_id`. RLS policies are enforced at the PostgreSQL level, providing a robust security layer independent of application code.

## 4. Validation and Business Logic

### Validation Rules by Resource

#### Generations

- **source_text:**
  - Minimum length: 1000 characters
  - Maximum length: 10,000 characters
  - Required field
- **model:**
  - Must be a supported model identifier
  - Required field
- **source_text_hash:**
  - Generated server-side using SHA-256
  - Used for duplicate detection and analytics
- **source_text_length:**
  - Calculated server-side
  - Must be > 0

#### Flashcards

- **question:**
  - Maximum length: 200 characters
  - Cannot be empty string
  - Required field
- **answer:**
  - Maximum length: 500 characters
  - Cannot be empty string
  - Required field
- **source:**
  - Must be one of: 'ai-full', 'ai-edited', 'manual'
  - Set automatically based on creation method
  - Required field
- **generation_id:**
  - Must reference existing generation owned by user (if not null)
  - Optional field (null for manual flashcards)

### Business Logic Implementation

#### 1. Flashcard Generation Workflow (US-003, US-004)

**Process:**

1. User submits source text via `POST /api/generations`
2. Server validates text length (1000-10000 characters)
3. Server generates source_text_hash using SHA-256
4. Server calls OpenRouter.ai API with selected model
5. Server parses AI response into flashcard format
6. Server creates generation record with metadata
7. Server returns generation with temporary flashcard proposals (not yet saved to flashcards table)
8. User reviews proposals on frontend (can edit, accept, or reject each)
9. User submits accepted flashcards via `POST /api/flashcards` with:
   - `generation_id`: ID from step 7
   - `flashcards`: Array of accepted cards with `source` field ("ai-full" or "ai-edited")
10. Server saves flashcards to database

**Error Handling:**

- AI service timeout → Log error to `generation_error_logs`, return 503
- AI service rate limit → Log error, return 429
- Invalid AI response format → Log error, return 422
- Network errors → Log error, return 503

#### 2. Manual Flashcard Creation (US-007)

**Process:**

1. User submits one or more flashcards via `POST /api/flashcards` with:
   - `flashcards`: Array of cards with `source: "manual"`
   - No `generation_id` field (or null)
2. Server validates question (max 255 chars) and answer (max 1000 chars) for each flashcard
3. Server creates flashcards with source='manual' and generation_id=null
4. Server returns created flashcards array

**Note:** Same endpoint supports both single and batch creation of manual flashcards

#### 3. Flashcard Editing (US-005)

**Process:**

1. User submits changes via `PATCH /api/flashcards/:id`
2. Server verifies ownership (MVP: all flashcards belong to DEFAULT_USER_ID)
3. Server validates updated fields
4. Server updates flashcard and sets updated_at timestamp
5. Server returns updated flashcard

**Note:** Editing an AI-generated flashcard does NOT change its source field after acceptance.

#### 4. Flashcard Deletion (US-006)

**Process:**

1. User submits delete request via `DELETE /api/flashcards/:id`
2. Server verifies ownership (MVP: all flashcards belong to DEFAULT_USER_ID)
3. Server permanently deletes flashcard
4. Server returns 204 No Content

#### 7. Error Logging

**Automatic Logging:**

- All generation failures logged to `generation_error_logs`
- Includes error code, message, model, source text metadata
- Used for monitoring AI service reliability and debugging

**Error Categories:**

- `AI_TIMEOUT`: Request exceeded timeout
- `AI_RATE_LIMIT`: Rate limit exceeded
- `AI_INVALID_RESPONSE`: Unparseable response format
- `AI_SERVICE_ERROR`: General AI service error
- `VALIDATION_ERROR`: Input validation failed

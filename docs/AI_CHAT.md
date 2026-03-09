# AI Chat Feature

The AI Chat feature helps users create form fields using natural language. It's powered by **LangChain** and supports both AI-powered and rule-based parsing.

## How It Works

### 🤖 AI Mode (with OpenAI API Key)

When an OpenAI API key is configured, the system uses:
- **LangChain** with structured output parsing
- **GPT-4o-mini** model for understanding user intent
- **Zod schema validation** for type-safe responses

### 📝 Rule-Based Mode (no API key required)

When no API key is available, the system falls back to a rule-based parser that:
- Recognizes common field types (email, phone, number, textarea, etc.)
- Extracts constraints from the message (required, min/max length, etc.)
- Supports both English and Ukrainian language

## Configuration

### Without API Key (Default)

The system works out of the box with rule-based parsing. No configuration needed!

### With OpenAI API Key (Enhanced)

1. Get an OpenAI API key from https://platform.openai.com/api-keys

2. Add to your `.env` file:
```env
OPENAI_API_KEY="sk-your-actual-api-key-here"
```

3. Restart your development server

## Examples

### English
- "Add a required email field"
- "Add phone number field with min length 7"
- "Add age field, number type, minimum 18"
- "Add description textarea with 5 rows"

### Ukrainian
- "Додай поле для телефону, обов'язкове"
- "Додай поле email, обов'язкове"
- "Додай числове поле вік, мінімум 18"

## Rule-Based Parser Capabilities

The fallback parser can detect:

### Field Types
- **Email** → text field with email placeholder
- **Phone/Telephone** → text field with phone placeholder
- **Number/Age/Quantity** → number field
- **Textarea/Description/Comment** → textarea field
- **Text/Name/Address** → text field

### Constraints
- **Required**: "required", "mandatory", "обов'язкове"
- **Min/Max Length**: "min length 5", "max length 100"
- **Min/Max Value**: "minimum 18", "maximum 100"

## Architecture

```
┌─────────────────────┐
│   User Message      │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│   API Route         │
│  (api.ai-chat.ts)   │
└──────────┬──────────┘
           │
           ▼
    ┌──────────────┐
    │ Has API Key? │
    └──────┬───────┘
           │
    ┌──────┴──────┐
    │             │
    ▼             ▼
┌────────┐   ┌───────────┐
│LangChain│   │Rule-Based │
│  Parser│   │  Parser   │
└────┬───┘   └─────┬─────┘
     │             │
     └──────┬──────┘
            │
            ▼
    ┌──────────────┐
    │Zod Validation│
    └──────┬───────┘
           │
           ▼
    ┌──────────────┐
    │JSON Response │
    └──────────────┘
```

## Files

- **`app/routes/api.ai-chat.ts`** - Main API route with LangChain integration
- **`app/utils/ai-field-parser.server.ts`** - Zod schemas and rule-based parser
- **`app/components/admin/AiChat.tsx`** - React chat component

## Dependencies

```json
{
  "langchain": "^0.x.x",
  "@langchain/openai": "^0.x.x",
  "@langchain/core": "^0.x.x",
  "zod": "^3.x.x"
}
```

## Benefits of This Approach

✅ **Works without API key** - Rule-based fallback ensures functionality  
✅ **Type-safe** - Zod schemas validate all responses  
✅ **Graceful degradation** - Falls back if LangChain fails  
✅ **Bilingual** - Supports English and Ukrainian  
✅ **Easy to extend** - Add more field types or languages easily  

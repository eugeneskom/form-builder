import type { ActionFunctionArgs } from '@remix-run/node';
import { ChatOpenAI } from '@langchain/openai';
import { StructuredOutputParser } from '@langchain/core/output_parsers';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { AiResponseSchema, RuleBasedFieldParser } from '~/utils/ai-field-parser.server';

const SYSTEM_PROMPT = `You are a form builder assistant. When the user describes a form field, analyze their request and extract:
- Field type (text, number, or textarea)
- Label for the field
- Whether it's required
- Any constraints (min/max length for text, min/max value for numbers, rows for textarea)
- Appropriate placeholder text

If the user asks something unrelated to form fields, politely tell them you can only help with adding form fields.

Support both English and Ukrainian language requests.

{format_instructions}`;

/**
 * Main AI field parser using LangChain
 * Falls back to rule-based parser if no API key is available
 */
async function parseFieldWithAI(message: string) {
  const apiKey = process.env.OPENAI_API_KEY;

  // Fallback to rule-based parser if no API key
  if (!apiKey) {
    console.log('🤖 Using rule-based parser (no OpenAI API key)');
    const parser = new RuleBasedFieldParser();
    return parser.parse(message);
  }

  try {
    // Use LangChain with structured output parsing
    const parser = StructuredOutputParser.fromZodSchema(AiResponseSchema);

    const prompt = ChatPromptTemplate.fromMessages([
      ['system', SYSTEM_PROMPT],
      ['human', '{message}'],
    ]);

    const model = new ChatOpenAI({
      apiKey,
      modelName: 'gpt-4o-mini',
      temperature: 0.7,
      maxTokens: 300,
    });

    const chain = prompt.pipe(model).pipe(parser);

    const result = await chain.invoke({
      message,
      format_instructions: parser.getFormatInstructions(),
    });

    return result;
  } catch (err) {
    console.error('LangChain AI error:', err);
    // Fallback to rule-based parser on error
    console.log('⚠️ LangChain failed, falling back to rule-based parser');
    const fallbackParser = new RuleBasedFieldParser();
    return fallbackParser.parse(message);
  }
}

export async function action({ request }: ActionFunctionArgs) {
  const { message } = (await request.json()) as { message: string };

  try {
    const result = await parseFieldWithAI(message);
    return result;
  } catch (err) {
    console.error('AI chat error:', err);
    return { message: '⚠️ Failed to process your request. Please try again.' };
  }
}

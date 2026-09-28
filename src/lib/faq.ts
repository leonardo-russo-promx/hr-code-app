import { MicrosoftCopilotStudioService } from '../generated/services/MicrosoftCopilotStudioService';

/** Schema name of the existing "proMX HR" Copilot Studio agent. */
const AGENT_SCHEMA_NAME = 'npmx_proMXHR';

interface CopilotRaw {
  responses?: string[];
  lastResponse?: string;
  conversationId?: string;
  ConversationId?: string;
  conversationID?: string;
  completed?: boolean;
}

export interface FaqReply {
  text: string;
  conversationId?: string;
}

/**
 * Sends a message to a Copilot Studio agent (by schema name) and returns its answer.
 * Uses ExecuteCopilotAsyncV2 — the only endpoint that reliably returns the
 * agent response synchronously.
 */
export async function askAgent(
  agentSchemaName: string,
  message: string,
  conversationId?: string,
): Promise<FaqReply> {
  const result = await MicrosoftCopilotStudioService.ExecuteCopilotAsyncV2(
    agentSchemaName,
    { message, notificationUrl: 'https://notificationurlplaceholder' },
    conversationId,
  );

  const raw = (result.data as unknown as CopilotRaw) ?? {};

  let text = raw.lastResponse ?? '';
  if (!text && Array.isArray(raw.responses)) {
    text = raw.responses.filter(Boolean).join('\n\n');
  }

  // Some agents return their payload as a JSON string.
  const trimmed = text.trim();
  if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
    try {
      const parsed = JSON.parse(trimmed);
      if (typeof parsed === 'string') text = parsed;
      else if (parsed?.text) text = parsed.text;
      else if (Array.isArray(parsed)) text = parsed.filter(Boolean).join('\n\n');
    } catch {
      /* not JSON — keep the original text */
    }
  }

  text = stripCitations(text);

  return {
    text: text || "Sorry, I couldn't get an answer just now. Please try rephrasing your question.",
    conversationId: raw.conversationId ?? raw.ConversationId ?? raw.conversationID ?? conversationId,
  };
}

/** Sends a question to the proMX HR Copilot Studio agent and returns its answer. */
export async function askFaq(message: string, conversationId?: string): Promise<FaqReply> {
  return askAgent(AGENT_SCHEMA_NAME, message, conversationId);
}

/**
 * Removes source-reference citations from the agent answer:
 *  - inline markers like `[1]` or `[12]`
 *  - the trailing reference block (`[1]: https://… "Title"` lines)
 */
function stripCitations(text: string): string {
  return text
    // drop trailing reference-definition lines: [n]: <url> "optional title"
    .replace(/^\s*\[\d+\]:\s.*$/gm, '')
    // drop inline citation markers: [1], [12]
    .replace(/\[\d+\]/g, '')
    // collapse leftover blank lines / trailing whitespace
    .replace(/[ \t]+$/gm, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

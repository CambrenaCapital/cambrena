import type { AnthropicTool } from './mcpClient';

const PROXY_URL = import.meta.env.VITE_PROXY_URL || 'https://cambrena-proxy.bastian-wetzel.workers.dev';

export interface ApiError {
  status: number;
  message: string;
}

export async function sendMessage(
  messages: Array<{ role: string; content: string }>,
  systemPrompt: string,
  model: string = 'claude-sonnet-4-20250514'
): Promise<string> {
  const response = await fetch(PROXY_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      max_tokens: 4096,
      system: systemPrompt,
      messages,
    }),
  });

  if (!response.ok) {
    const text = await response.text().catch(() => '');
    if (response.status === 401) {
      throw { status: 401, message: 'Invalid API key. Please check your key and try again.' } as ApiError;
    }
    throw { status: response.status, message: text || `API error (${response.status})` } as ApiError;
  }

  const data = await response.json();
  if (data.content && data.content[0] && data.content[0].text) {
    return data.content[0].text;
  }
  throw { status: 500, message: 'Unexpected API response format' } as ApiError;
}

export type ToolExecutor = (name: string, input: Record<string, any>) => Promise<string>;

export async function sendMessageWithTools(
  messages: Array<{ role: string; content: any }>,
  systemPrompt: string,
  model: string,
  tools: AnthropicTool[],
  executeTool: ToolExecutor,
): Promise<string> {
  const MAX_ITERATIONS = 10;
  const conversationMessages = [...messages];

  for (let i = 0; i < MAX_ITERATIONS; i++) {
    const response = await fetch(PROXY_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        max_tokens: 4096,
        system: systemPrompt,
        messages: conversationMessages,
        tools,
      }),
    });

    if (!response.ok) {
      const text = await response.text().catch(() => '');
      if (response.status === 401) {
        throw { status: 401, message: 'Invalid API key. Please check your key and try again.' } as ApiError;
      }
      throw { status: response.status, message: text || `API error (${response.status})` } as ApiError;
    }

    const data = await response.json();

    if (data.stop_reason === 'end_turn' || data.stop_reason !== 'tool_use') {
      // Extract text from content blocks
      const textBlock = data.content?.find((b: any) => b.type === 'text');
      if (textBlock?.text) {
        return textBlock.text;
      }
      throw { status: 500, message: 'Unexpected API response format' } as ApiError;
    }

    // stop_reason === 'tool_use': execute tools and continue
    conversationMessages.push({ role: 'assistant', content: data.content });

    const toolUseBlocks = data.content.filter((b: any) => b.type === 'tool_use');
    const toolResults: any[] = [];

    for (const block of toolUseBlocks) {
      try {
        const result = await executeTool(block.name, block.input);
        toolResults.push({
          type: 'tool_result',
          tool_use_id: block.id,
          content: result,
        });
      } catch (err: any) {
        toolResults.push({
          type: 'tool_result',
          tool_use_id: block.id,
          content: `Error: ${err.message}`,
          is_error: true,
        });
      }
    }

    conversationMessages.push({ role: 'user', content: toolResults });
  }

  throw { status: 500, message: 'Too many tool call iterations' } as ApiError;
}

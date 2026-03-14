import Anthropic from "@anthropic-ai/sdk";
import { buildSystemPrompt } from "./prompts";
import type { TShop, TProduct, TBotResponse, TConversationMessage } from "@/types";

const anthropic = new Anthropic();

export async function chat(
  shop: TShop,
  products: TProduct[],
  history: TConversationMessage[],
  userMessage: string
): Promise<TBotResponse> {
  const systemPrompt = buildSystemPrompt(shop, products);

  const messages = [
    ...history.map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    })),
    { role: "user" as const, content: userMessage },
  ];

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1024,
    system: systemPrompt,
    messages,
  });

  const text =
    response.content[0].type === "text" ? response.content[0].text : "";

  try {
    const parsed: TBotResponse = JSON.parse(text);
    return parsed;
  } catch {
    return {
      message: text,
      action: null,
    };
  }
}

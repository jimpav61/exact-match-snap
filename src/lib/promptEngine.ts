// VibeCoder Studio — Prompt Assembly Engine
// Injects Design Passport, Context Chain, and platform substitutions into templates.

import { PROMPT_TEMPLATES, PLATFORM_SUBSTITUTIONS } from "./promptTemplates";

export interface DesignPassport {
  mood: string;
  references: string[];
  primaryColor: string;
  secondaryColor: string;
  fontPreference: string;
}

export interface ContextChainEntry {
  moduleId: string;
  moduleName: string;
  summary: string;
}

export interface PromptAssemblyInput {
  moduleId: string;
  formData: Record<string, string>;
  designPassport: DesignPassport;
  contextChain: ContextChainEntry[];
  platformType: string;
}

function buildDesignPassportBlock(dp: DesignPassport): string {
  const parts = [
    `--- DESIGN PASSPORT ---`,
    `Mood: ${dp.mood || "Not specified"}`,
    `Primary Color: ${dp.primaryColor}`,
    `Secondary Color: ${dp.secondaryColor}`,
    `Font Preference: ${dp.fontPreference || "Not specified"}`,
  ];
  if (dp.references.length > 0) {
    parts.push(`Reference Apps: ${dp.references.join(", ")}`);
  }
  parts.push(`--- END DESIGN PASSPORT ---`);
  return parts.join("\n");
}

function buildContextChainBlock(chain: ContextChainEntry[]): string {
  if (chain.length === 0) return "";
  const lines = [
    `\n--- CONTEXT CHAIN (Previous Module Outputs) ---`,
    ...chain.map(
      (c) => `[${c.moduleId} – ${c.moduleName}]: ${c.summary}`
    ),
    `--- END CONTEXT CHAIN ---`,
  ];
  return lines.join("\n");
}

function applyPlatformSubstitutions(text: string, platformType: string): string {
  if (platformType === "web") return text;
  let result = text;
  for (const [webTerm, mobileTerm] of Object.entries(PLATFORM_SUBSTITUTIONS)) {
    result = result.split(webTerm).join(mobileTerm);
  }
  return result;
}

export function assemblePrompt(input: PromptAssemblyInput): string {
  const template = PROMPT_TEMPLATES[input.moduleId];
  if (!template) return "";

  let prompt = template.template;

  // Replace [PLACEHOLDER] with form data
  for (const [key, value] of Object.entries(input.formData)) {
    // The templates use bracketed placeholders like [DESCRIBE YOUR PRODUCT IDEA...]
    // We map form field keys to the single placeholder in each template
    if (key === "__userInput__" && value) {
      // Replace the bracketed placeholder at the end of the template
      const placeholderRegex = /\[([A-Z][A-Z\s,.'—\-]+)\]/g;
      prompt = prompt.replace(placeholderRegex, value);
    }
  }

  // Apply platform substitutions for mobile targets
  prompt = applyPlatformSubstitutions(prompt, input.platformType);

  // Append Design Passport
  const dpBlock = buildDesignPassportBlock(input.designPassport);
  prompt = `${prompt}\n\n${dpBlock}`;

  // Append Context Chain
  const ccBlock = buildContextChainBlock(input.contextChain);
  if (ccBlock) {
    prompt = `${prompt}\n${ccBlock}`;
  }

  return prompt;
}

// Get the placeholder instruction text from a template (for form label hints)
export function getPlaceholderHint(moduleId: string): string {
  const template = PROMPT_TEMPLATES[moduleId];
  if (!template) return "";
  const match = template.template.match(/\[([A-Z][A-Z\s,.'—\-]+)\]/);
  return match ? match[1] : "";
}

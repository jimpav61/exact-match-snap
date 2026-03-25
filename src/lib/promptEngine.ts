// VibeCoder Studio — Prompt Assembly Client
// Templates are now server-side only. This module calls the edge function.

import { supabase } from "@/integrations/supabase/client";

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

export async function assemblePrompt(input: PromptAssemblyInput): Promise<string> {
  const { data, error } = await supabase.functions.invoke("assemble-prompt", {
    body: {
      moduleId: input.moduleId,
      formData: input.formData,
      designPassport: input.designPassport,
      contextChain: input.contextChain,
      platformType: input.platformType,
    },
  });

  if (error) {
    console.error("Prompt assembly failed:", error);
    throw new Error("Failed to generate prompt. Please try again.");
  }

  return data.prompt;
}

// Get placeholder hint — kept client-side (no template content exposed, just field labels)
const PLACEHOLDER_HINTS: Record<string, string> = {
  "1A": "DESCRIBE YOUR PRODUCT IDEA, WHO THE FIRST USER IS, AND THE ONE ACTION THEY SHOULD BE ABLE TO COMPLETE",
  "1B": "DESCRIBE IN PLAIN ENGLISH HOW YOU WANT YOUR APP TO LOOK AND FEEL",
  "1C": "DESCRIBE IN PLAIN ENGLISH WHAT INFORMATION YOUR APP NEEDS TO STORE",
  "2A": "DESCRIBE YOUR APP IN PLAIN ENGLISH",
  "2B": "DESCRIBE YOUR SAAS PRODUCT IN PLAIN ENGLISH",
  "2C": "UPLOAD OR DESCRIBE THE SCREENSHOT, MOCKUP, OR SKETCH YOU WANT CONVERTED",
  "3A": "DESCRIBE IN PLAIN ENGLISH WHAT YOU WANT THE NEW FEATURE TO DO",
  "3B": "DESCRIBE WHAT'S HAPPENING IN YOUR APP THAT SHOULDN'T BE HAPPENING",
  "3C": "DESCRIBE YOUR EXISTING APP, ITS TECH STACK, KNOWN ISSUES, AND WHAT USERS COMPLAIN ABOUT MOST",
};

export function getPlaceholderHint(moduleId: string): string {
  return PLACEHOLDER_HINTS[moduleId] || "";
}

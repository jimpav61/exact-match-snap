// VibeCoder Studio — Prompt Template Metadata (client-side)
// Full template content has been moved server-side. 
// This file only contains metadata needed for UI rendering.

export interface PromptTemplate {
  moduleId: string;
  moduleName: string;
  phase: "plan" | "build" | "improve";
  promptNumber: number;
}

export const PROMPT_TEMPLATES: Record<string, PromptTemplate> = {
  "1A": { moduleId: "1A", moduleName: "MVP Scoper", phase: "plan", promptNumber: 7 },
  "1B": { moduleId: "1B", moduleName: "UX Architect", phase: "plan", promptNumber: 6 },
  "1C": { moduleId: "1C", moduleName: "Data Architect", phase: "plan", promptNumber: 5 },
  "2A": { moduleId: "2A", moduleName: "Full App Builder", phase: "build", promptNumber: 1 },
  "2B": { moduleId: "2B", moduleName: "SaaS Builder", phase: "build", promptNumber: 9 },
  "2C": { moduleId: "2C", moduleName: "Screenshot-to-Code", phase: "build", promptNumber: 2 },
  "3A": { moduleId: "3A", moduleName: "Feature Builder", phase: "improve", promptNumber: 3 },
  "3B": { moduleId: "3B", moduleName: "Bug Doctor", phase: "improve", promptNumber: 4 },
  "3C": { moduleId: "3C", moduleName: "Iteration Engine", phase: "improve", promptNumber: 8 },
};

export const MODULE_ORDER = ["1A", "1B", "1C", "2A", "2B", "2C", "3A", "3B", "3C"];

export const PHASE_MODULES: Record<number, string[]> = {
  1: ["1A", "1B", "1C"],
  2: ["2A", "2B", "2C"],
  3: ["3A", "3B", "3C"],
};

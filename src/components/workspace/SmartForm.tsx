import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { PROMPT_TEMPLATES } from "@/lib/promptTemplates";
import { getPlaceholderHint } from "@/lib/promptEngine";
import { Lightbulb } from "lucide-react";

interface SmartFormProps {
  moduleId: string;
  initialData?: Record<string, string>;
  onSubmit: (formData: Record<string, string>) => void;
  saving?: boolean;
}

const MODULE_GUIDANCE: Record<string, { questions: string[]; tips?: string }> = {
  // Phase 1: Plan
  "1A": {
    questions: [
      "What is your product idea in one sentence?",
      "Who is the very first user — what do they need?",
      "What is the ONE action they should complete?",
    ],
  },
  "1B": {
    questions: [
      "How should the app feel? (minimal, playful, corporate, bold…)",
      "Name 2-3 apps whose look & feel you admire.",
      "Any specific colors, typography, or moods you're drawn to?",
    ],
  },
  "1C": {
    questions: [
      "What information does your app need to store? (users, products, orders…)",
      "How do those things relate to each other?",
      "Any specific fields that are critical? (e.g. email must be unique)",
    ],
  },
  // Phase 2: Build
  "2A": {
    questions: [
      "What are the core pages/screens your app needs?",
      "What user flows should work end-to-end on day one?",
      "What does the navigation structure look like? (sidebar, tabs, header…)",
      "Any third-party integrations needed? (payments, auth, maps…)",
    ],
    tips: "Be as specific as possible about what each page should contain and how users move between them.",
  },
  "2B": {
    questions: [
      "What is your SaaS pricing model? (freemium, usage-based, per-seat…)",
      "What are the key differences between free and paid tiers?",
      "Does the user need a dashboard? What metrics should it show?",
      "Do you need team/org features like invitations or role management?",
    ],
    tips: "Think about the full SaaS lifecycle: signup → onboarding → daily use → upgrade → admin.",
  },
  "2C": {
    questions: [
      "Describe what's in the screenshot — layout, sections, interactions.",
      "What parts should be kept exactly as-is vs. adapted?",
      "What platform is the screenshot from, and what's your target platform?",
    ],
    tips: "Paste or describe the screenshot in detail. The more visual specifics (spacing, colors, icons) the better the output.",
  },
  // Phase 3: Improve
  "3A": {
    questions: [
      "What is the new feature you want to add?",
      "Which existing page or flow does it attach to?",
      "How should a user discover and access this feature?",
      "What edge cases or error states should be handled?",
    ],
    tips: "Describe the feature from the user's perspective — what they see, click, and expect to happen.",
  },
  "3B": {
    questions: [
      "What is the exact bug or unexpected behavior?",
      "What were the steps to reproduce it?",
      "What did you expect to happen vs. what actually happened?",
      "Any error messages, console logs, or screenshots?",
    ],
    tips: "The more specific your reproduction steps, the more targeted the fix prompt will be.",
  },
  "3C": {
    questions: [
      "What part of the app needs improvement? (performance, UX, visuals, code quality…)",
      "What feedback have you received from users or testing?",
      "What's the highest-priority change?",
      "Are there any constraints? (don't break X, keep Y the same…)",
    ],
    tips: "Focus on one iteration cycle at a time — trying to fix everything at once produces weaker prompts.",
  },
};

const SmartForm = ({ moduleId, initialData, onSubmit, saving }: SmartFormProps) => {
  const [userInput, setUserInput] = useState(initialData?.__userInput__ || "");
  const template = PROMPT_TEMPLATES[moduleId];
  const guidance = MODULE_GUIDANCE[moduleId];
  const hint = getPlaceholderHint(moduleId);

  if (!template) return null;

  return (
    <div className="space-y-6">
      {/* Module info */}
      <div>
        <h3 className="font-display text-xl font-bold mb-1">{template.moduleName}</h3>
        <p className="text-sm text-muted-foreground font-body">
          Module {moduleId} · Prompt #{template.promptNumber}
        </p>
      </div>

      {/* Guidance questions */}
      {guidance && (
        <div className="glass-card p-4 space-y-2">
          <div className="flex items-center gap-2 text-accent text-sm font-body font-medium mb-2">
            <Lightbulb className="w-4 h-4" />
            Think about these before writing:
          </div>
          <ul className="space-y-1.5">
            {guidance.questions.map((q, i) => (
              <li key={i} className="text-sm text-muted-foreground font-body flex gap-2">
                <span className="text-primary font-mono text-xs mt-0.5">{i + 1}.</span>
                {q}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Main input */}
      <div>
        <label className="text-sm font-body font-medium text-foreground block mb-2">
          Your Input
        </label>
        <Textarea
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          placeholder={hint}
          rows={8}
          className="bg-input border-border font-body text-sm resize-none"
        />
        <p className="text-xs text-muted-foreground font-body mt-1.5">
          Write in plain English — no technical language needed.
        </p>
      </div>

      <Button
        onClick={() => onSubmit({ __userInput__: userInput })}
        disabled={!userInput.trim() || saving}
        className="w-full"
      >
        {saving ? "Generating…" : "Generate Prompt"}
      </Button>
    </div>
  );
};

export default SmartForm;

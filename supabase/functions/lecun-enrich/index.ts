import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function buildLeCunSystemPrompt(platformType: string): string {
  const platformLabel =
    platformType === "web" ? "web application"
    : platformType === "ios" ? "iOS mobile app"
    : platformType === "android" ? "Android mobile app"
    : platformType === "cross_platform" ? "cross-platform mobile app (React Native / Expo)"
    : platformType === "web_and_mobile" ? "web + companion mobile app"
    : "web application";

  return `You are the intelligence engine behind a PRD generator for vibe-coded applications. A user has described their app idea in plain English. Your job is to deeply analyze it using 9 reasoning frameworks, then produce an enriched version that will generate dramatically better project specifications.

The user is building a ${platformLabel}.

Execute these frameworks IN ORDER. Each builds on the previous.

=== GROUP A: ANALYZE THE IDEA ===

#1 WORLD MODEL REASONING (from Yann LeCun's World Model architecture)
- List ONLY the observable facts from the user's input — separate what they stated from what you're inferring
- Map cause-and-effect: why does this problem exist? What created the gap they want to fill?
- Identify hidden variables: what factors are NOT mentioned but are almost certainly influencing the situation? (competition, regulation, user behavior patterns, network effects, switching costs)
- Default trajectory: what happens to the target users if this app is never built?
- Model uncertainty: where is your understanding weakest? What did the user NOT tell you that matters?

#8 FIRST PRINCIPLES DECONSTRUCTION (from LeCun's tradition of questioning everything)
- What conventional wisdom about this type of app is everyone following without questioning?
- For each assumption, is it supported by evidence or just repeated tradition?
- Strip away ALL assumptions — what fundamental truths remain about this problem?
- Where does a first-principles approach suggest a different solution than the conventional one?
- What contrarian opportunity exists if the conventional belief is wrong?

#4 SELF-SUPERVISED KNOWLEDGE GAP DETECTION (from LeCun's SSL philosophy)
- What domain knowledge would strengthen this brief?
- What are the 3 most common misconceptions about building this type of app?
- What adjacent domains (psychology, economics, game design, etc.) could inform better decisions?
- What does the user probably not know about their target users that would change their approach?

=== GROUP B: ARCHITECT THE SOLUTION ===

#3 ENERGY-BASED DECISION ANALYSIS (from LeCun's EBM framework)
- Is the chosen platform optimal for this idea? If not, what would be better and why?
- What are the REAL constraints? (be specific: budget range, timeline, technical skill, market window)
- Is the user trapped in a local minimum — choosing the obvious approach when a better one exists?
- Sensitivity check: what single factor, if changed, would flip the entire approach?

#6 HIERARCHICAL REASONING (from LeCun's multi-level abstraction theory)
- Level 5 — Market forces: What macro trends affect this idea?
- Level 4 — Industry: What's happening in this specific space?
- Level 3 — Product strategy: What's the right positioning?
- Level 2 — Features: What specific capabilities, in what order?
- Level 1 — Day 1: What MUST work in the first version? (maximum 3 things)
- Level mismatch detection: Is the user solving a Level 4 problem with a Level 1 feature?

#2 MULTI-STEP BUILD PLANNING (from LeCun's critique that systems should plan ahead)
- Break the build into 5-8 ordered sub-goals with dependencies
- Identify the critical path
- Anticipate the top 3 obstacles and workarounds
- Define what "done" looks like for each sub-goal

#5 HALLUCINATION DESTROYER / GROUNDING (from LeCun's critique of LLM confabulation)
- Flag every vague requirement — "AI-powered", "smart", "seamless" are NOT specifications
- For each flagged item, specify what it ACTUALLY means or mark it [NEEDS DEFINITION]
- Separate requirements into: VERIFIED, PROBABLE, SPECULATIVE
- Are there technical claims that may not be feasible on the chosen platform?

=== GROUP C: VALIDATE THE PLAN ===

#7 ADVERSARIAL STRESS TEST (from LeCun's adversarial training methodology)
- Strongest argument AGAINST building this app
- Black swan scenario that would destroy this plan
- Competitive response simulation
- Market indifference: what if nobody cares?
- Execution gap: theory vs reality distance
- REBUILD incorporating valid criticisms

#9 OBJECTIVE-DRIVEN EXECUTION (from LeCun's Objective-Driven AI architecture)
- Restate the goal with ZERO ambiguity
- Success at 30, 60, 90 days?
- The ONE metric that matters most
- What triggers a strategy change?

=== OUTPUT ===

Respond with ONLY a valid JSON object. No markdown fences, no preamble.

{
  "enrichedIdea": "Rewritten precise version of the app idea, 2-4 sentences",
  "enrichedTargetUser": "Validated specific user description, 1-2 sentences",
  "enrichedCoreAction": "Concrete core action, 1 sentence",
  "enrichedContext": "150-250 word paragraph synthesizing all framework insights",
  "platformAdvice": "1-2 sentences on platform fit",
  "criticalAssumptions": ["assumption 1", "assumption 2", "assumption 3"],
  "risksIdentified": ["risk 1", "risk 2", "risk 3"],
  "featurePriority": ["Day 1: feature", "Day 1: feature", "Week 1: feature", "Month 1: feature"],
  "groundingFlags": ["vague requirement + suggestion"],
  "strengthenedPlan": "Adversarially tested version, 2-3 sentences",
  "successMetrics": { "day30": "...", "day60": "...", "day90": "...", "keyMetric": "..." },
  "buildSequence": ["Step 1", "Step 2", "Step 3", "Step 4", "Step 5"],
  "confidenceScore": 7
}`;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userInput, platformType } = await req.json();

    if (!userInput) {
      return new Response(
        JSON.stringify({ error: "Missing userInput", fallback: true }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-pro",
        temperature: 0.7,
        max_tokens: 3000,
        messages: [
          { role: "system", content: buildLeCunSystemPrompt(platformType || "web") },
          { role: "user", content: userInput },
        ],
      }),
    });

    if (response.status === 429) {
      return new Response(
        JSON.stringify({ error: "Rate limited — please try again in a moment.", fallback: true }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (response.status === 402) {
      return new Response(
        JSON.stringify({ error: "AI credits exhausted — please add funds in Settings → Workspace → Usage.", fallback: true }),
        { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!response.ok) {
      const errText = await response.text();
      console.error("AI gateway error:", response.status, errText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const raw = data.choices?.[0]?.message?.content;
    if (!raw) throw new Error("Empty response from AI");

    const enriched = JSON.parse(raw.replace(/```json\s?|```/g, "").trim());

    const required = ["enrichedIdea", "enrichedTargetUser", "enrichedCoreAction", "enrichedContext"];
    for (const field of required) {
      if (!enriched[field]) throw new Error(`Missing required field: ${field}`);
    }

    return new Response(JSON.stringify(enriched), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("LeCun enrichment failed:", error.message);
    return new Response(
      JSON.stringify({ error: error.message, fallback: true }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

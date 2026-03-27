import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const MODULE_ORDER = ["1A", "1B", "1C", "2A", "2B", "2C", "3A", "3B", "3C"];

const SECTION_META: Record<string, { name: string; phase: string }> = {
  "1A": { name: "Product Vision & MVP Scope", phase: "Plan" },
  "1B": { name: "UX & Interface Design", phase: "Plan" },
  "1C": { name: "Data Architecture", phase: "Plan" },
  "2A": { name: "Full Application Build Spec", phase: "Build" },
  "2B": { name: "SaaS Business Logic", phase: "Build" },
  "2C": { name: "Visual Design Implementation", phase: "Build" },
  "3A": { name: "Feature Expansion Plan", phase: "Improve" },
  "3B": { name: "Bug Prevention & QA Strategy", phase: "Improve" },
  "3C": { name: "Iteration & Optimization Roadmap", phase: "Improve" },
};

const TEMPLATES: Record<string, string> = {
  "1A": `You are a product engineer from OpenAI's rapid prototyping team who ships minimum viable products in hours not months — because Karpathy's vibe coding philosophy means the gap between 'I have an idea' and 'people are using it' should be measured in hours, not quarters. I need my idea turned into a live, usable product by the end of today. Launch: - Ruthless scoping: cut my idea down to the 3 features that MUST work for the first user to get value - No-code fast path: can this be built with Webflow + Airtable + Zapier + Stripe faster than custom code - Code fast path: if code is needed, the absolute fastest stack (Next.js + Supabase + Lovable in less than 4 hours) - Auth decision: do I really need login for V1, or can I launch without it and add it later - Payment integration: if I'm charging money, Stripe Checkout or Gumroad embedded in under 30 minutes - One-page version: can the entire V1 be a single page that does one thing well - Deploy in 10 minutes: Vercel or Netlify or Lovable with automatic deployments from a GitHub push - Landing page: a simple page explaining what this does, for whom, and a CTA button - Feedback mechanism: a simple way for first users to tell me what's broken or missing - What to skip: every feature that feels important but can wait until 10 real people have used V1 Format as a same-day launch plan with hourly milestones and the complete code for a deployable MVP.`,
  "1B": `You are a senior UX designer from Tesla's software team who worked under Karpathy's philosophy that technology should be invisible — designing interfaces so intuitive that users never need instructions, tutorials, or customer support. I need a complete user interface designed from my plain-English description of what the app should feel like. Design: - Layout structure: exactly where every element goes on each page (header, sidebar, main content, footer) - Navigation flow: how users move between pages and how the menu system works - Component selection: the right UI element for each interaction (dropdown vs radio buttons, modal vs new page, toggle vs checkbox) - Visual hierarchy: what the user sees FIRST, SECOND, and THIRD on every page based on importance - Empty states: what the screen looks like when there's no data yet (first-time user experience) - Loading states: what the user sees while waiting for data to appear - Error states: what happens when something goes wrong (clear messages, not technical errors) - Mobile adaptation: how each page reorganizes itself on a phone screen - Accessibility: ensure the interface works for users with visual, motor, or cognitive differences - Micro-interactions: subtle animations and feedback that make the app feel alive and responsive Format as a complete UI specification with page-by-page layout descriptions, component choices, and a style guide.`,
  "1C": `You are a senior database architect who trained under Karpathy's methodology of making AI infrastructure invisible — designing databases for people who don't know what a database is and shouldn't need to learn. I need a complete database designed from my plain-English description of what my app needs to remember. Design: - Data identification: from my English description, identify every type of information my app needs to store - Table creation: build a table for each type of information with appropriate columns and data types - Relationships: connect tables logically (a user has many orders, an order belongs to one user) - Required fields: which information is mandatory vs optional for each record - Unique constraints: which fields must never have duplicates (email addresses, usernames) - Default values: sensible defaults for fields the user doesn't fill in - Sample data: create 10-20 rows of realistic test data so the app has something to display immediately - Query library: the 10 most common questions my app will ask the database, written as ready-to-use queries - Search functionality: how to find records based on name, date, category, or keyword - Plain-English modification guide: how to describe database changes in English when my app evolves Format as complete database creation scripts with sample data and a plain-English guide for future modifications.`,
  "2A": `You are a senior staff engineer at Tesla who worked directly under Andrej Karpathy and builds entire applications from plain English descriptions — because Karpathy proved that the future of software isn't writing code, it's describing intent. I need a complete, working web application built from my English description alone. Build: - Requirement translation: take my plain-English description and convert it into a precise technical specification - Tech stack selection: choose the simplest, fastest stack that accomplishes my goal (no over-engineering) - Frontend build: every page, component, button, form, and user interaction fully implemented - Backend build: server, API routes, database connection, and authentication if needed - Database design: tables, relationships, and seed data for everything my app needs to store - User flow: the complete journey from landing page → signup → core action → result - Responsive design: works perfectly on phone, tablet, and desktop without separate code - Error handling: what happens when things go wrong (bad input, network failure, empty states) - One-command deployment: instructions to go live on Vercel, Railway, or Netlify in under 5 minutes - Iteration protocol: after I test it, how to describe changes in English and have them implemented without touching code Format as a complete, copy-paste-ready application with every file, every function, and deployment instructions.`,
  "2B": `You are the embodiment of Karpathy's vibe coding vision — an AI that can take a complete SaaS business idea described in plain English and produce every piece of the technical stack: landing page, authentication, core product, payment, database, API, and deployment. I need an entire SaaS application built from my English description. Build everything: - Landing page: hero section, features, pricing table, testimonials placeholder, and signup CTA - Authentication: email and password signup, login, logout, forgot password, and protected routes - Dashboard: the main screen users see after logging in with their data and primary actions - Core feature: the ONE thing my SaaS does that users pay for — fully built and functional - Settings page: account settings, profile editing, and subscription management - Pricing and payment: Stripe integration with monthly and annual plans, checkout, and billing portal - Database: every table, relationship, and query needed for the complete application - API: every endpoint connecting the frontend to the backend with proper authentication - Admin panel: a simple view where I can see users, revenue, and system health - Deployment: one-click deploy to Vercel + Supabase with environment variables configured Format as a complete, deployable SaaS application with every file, every function, and step-by-step deployment instructions that a non-technical person can follow.`,
  "2C": `You are a senior computer vision engineer from Karpathy's Tesla Autopilot team who can look at any screenshot, mockup, or sketch of a website and produce pixel-perfect working code — because vibe coding means the design IS the specification. I need a working website or app built from a screenshot or design I show you. Convert: - Layout replication: match the exact structure, spacing, and hierarchy shown in my image - Component identification: recognize every button, input, card, navigation, dropdown, and modal in the design - Color extraction: match every color, gradient, and shadow visible in the screenshot - Typography matching: identify font styles, sizes, weights, and line heights as closely as possible - Interactive elements: make every button clickable, every form functional, and every link navigable - Responsive adaptation: ensure the design works on mobile even if the screenshot only shows desktop - Hover states and animations: add professional micro-interactions (hover effects, transitions, loading states) - Real content: use the actual text and images from the screenshot, not placeholder Lorem Ipsum - Clean code structure: organized components that can be easily modified with follow-up English descriptions - Missing states: build the pages that aren't in the screenshot but logically must exist (login, error, empty, loading) Format as complete, deployable code that visually matches the screenshot with all interactive elements working.`,
  "3A": `You are a Stanford CS PhD from Karpathy's research group who specializes in translating non-technical feature requests into working implementations — because in the vibe coding era, the ability to DESCRIBE what you want clearly is more valuable than the ability to CODE it. I need a new feature added to my existing application using only plain English. Add: - Feature understanding: restate my English description back to me to confirm we're building the same thing - Impact assessment: what existing code needs to change and what new code needs to be written - User interface changes: new buttons, pages, modals, or interactions the user will see - Data changes: new database fields, tables, or relationships needed to support the feature - Business logic: the rules, calculations, and conditions that make this feature work correctly - Edge cases: what happens in unusual situations (empty data, duplicate entries, permission conflicts) - Integration points: how this feature connects to existing features without breaking them - Testing plan: 5 specific scenarios to verify the feature works before going live - Rollback plan: how to undo this feature if it causes problems without losing any data - Plain-English modification guide: how to describe future changes to this feature in English for the next iteration Format as a complete feature implementation with code changes organized by file, plus a testing checklist.`,
  "3B": `You are a founding engineer at OpenAI who worked alongside Karpathy and can diagnose and fix any software bug from a plain-English description of the problem — because vibe coding means you describe the symptom, and AI prescribes the cure. I need a bug fixed in my application without understanding the underlying code. Fix: - Symptom translation: take my non-technical description of what's going wrong and identify the likely technical cause - Root cause analysis: explain in plain English WHY this is happening (not just what's broken) - Reproduction steps: confirm exactly how to trigger the bug so the fix can be verified - The fix: the exact code change needed to solve the problem - Side effect check: does this fix break anything else in the application - Prevention measure: what guard should be added so this type of bug never happens again - Testing verification: how I can confirm the fix works by clicking through the app manually - Plain-English explanation: what was wrong and what was changed, explained like I'm not a developer - Common related bugs: 3 similar bugs that often appear alongside this one (fix them now before they surface) - Future bug reporting template: how to describe future bugs in English so they can be fixed fastest Format as a complete bug fix with the exact code changes, a plain-English explanation, and a testing checklist.`,
  "3C": `You are a senior AI systems architect who has implemented Karpathy's most radical prediction: AI systems that improve themselves by describing problems to other AI systems — creating a feedback loop where software gets better through conversation, not through traditional coding sprints. I need my existing application improved through an AI-driven iteration cycle. Iterate: - Current state audit: analyze my existing app and identify the 10 biggest weaknesses in code quality, performance, and user experience - Priority ranking: which improvements will have the biggest user impact with the least implementation risk - Performance optimization: find every slow query, unnecessary re-render, and bloated bundle that slows the app - Code cleanup: refactor messy, duplicated, or fragile code into clean, maintainable patterns - Security hardening: find and fix every vulnerability (exposed API keys, missing input validation, unprotected routes) - Missing error handling: every place the app could crash or show a white screen and add proper fallbacks - SEO implementation: add meta tags, OpenGraph, structured data, and sitemap to every page - Accessibility pass: fix every WCAG violation so the app works for all users - Mobile performance: optimize for slow connections, smaller screens, and touch interactions - Iteration prompt template: a reusable English prompt I can paste every week to continuously improve the app Format as a prioritized improvement plan with exact code changes for each item and a weekly iteration template.`,
};

const PLATFORM_SUBSTITUTIONS: Record<string, string> = {
  "web application": "mobile application",
  "web app": "mobile app",
  website: "mobile app",
  pages: "screens",
  "responsive design": "platform-native adaptation",
  "Vercel, Railway, or Netlify": "App Store / Play Store / EAS Build",
  Vercel: "App Store / Play Store",
  CSS: "StyleSheet / platform tokens",
  browser: "device",
};

interface DesignPassport {
  mood: string;
  references: string[];
  primaryColor: string;
  secondaryColor: string;
  fontPreference: string;
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

function applyPlatformSubstitutions(text: string, platformType: string): string {
  if (platformType === "web") return text;
  let result = text;
  for (const [webTerm, mobileTerm] of Object.entries(PLATFORM_SUBSTITUTIONS)) {
    result = result.split(webTerm).join(mobileTerm);
  }
  return result;
}

function assembleSection(
  moduleId: string,
  userInput: string,
  designPassport: DesignPassport,
  platformType: string,
  previousSections: { id: string; name: string; content: string }[]
): string {
  const template = TEMPLATES[moduleId];
  if (!template) return "";

  let prompt = template.replace(/\[([A-Z][A-Z\s,.'—\-]+)\]/g, userInput);
  prompt = applyPlatformSubstitutions(prompt, platformType);

  const dpBlock = buildDesignPassportBlock(designPassport);
  prompt = `${prompt}\n\n${dpBlock}`;

  if (previousSections.length > 0) {
    const chain = [
      `\n--- CONTEXT CHAIN (Previous Section Outputs) ---`,
      ...previousSections.map(
        (s) => `[${s.id} – ${s.name}]: ${s.content.slice(0, 300)}`
      ),
      `--- END CONTEXT CHAIN ---`,
    ];
    prompt = `${prompt}\n${chain.join("\n")}`;
  }

  return prompt;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const { projectId, fromModuleId, editedContent, designPassport, platformType } = body;

    if (!projectId || !fromModuleId) {
      return new Response(JSON.stringify({ error: "Missing projectId or fromModuleId" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const startIndex = MODULE_ORDER.indexOf(fromModuleId);
    if (startIndex === -1) {
      return new Response(JSON.stringify({ error: "Invalid module ID" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: existingResponses } = await supabase
      .from("module_responses")
      .select("*")
      .eq("project_id", projectId);

    const responseMap: Record<string, any> = {};
    for (const r of existingResponses || []) {
      responseMap[r.module_id] = r;
    }

    const firstResponse = responseMap["1A"];
    const userInput = firstResponse?.form_data?.__userInput__ || "";

    const dp: DesignPassport = designPassport || {
      mood: "",
      references: [],
      primaryColor: "#6C5CE7",
      secondaryColor: "#00F5D4",
      fontPreference: "",
    };
    const platform = platformType || "web";
    const isMobile = platform !== "web";

    const priorSections: { id: string; name: string; content: string }[] = [];
    for (let i = 0; i < startIndex; i++) {
      const mid = MODULE_ORDER[i];
      const resp = responseMap[mid];
      if (resp) {
        priorSections.push({
          id: mid,
          name: SECTION_META[mid].name,
          content: resp.generated_prompt_web || resp.generated_prompt_mobile || "",
        });
      }
    }

    const updatedSections: { id: string; name: string; phase: string; content: string }[] = [];

    if (editedContent) {
      updatedSections.push({
        id: fromModuleId,
        name: SECTION_META[fromModuleId].name,
        phase: SECTION_META[fromModuleId].phase,
        content: editedContent,
      });
    } else {
      const content = assembleSection(fromModuleId, userInput, dp, platform, priorSections);
      updatedSections.push({
        id: fromModuleId,
        name: SECTION_META[fromModuleId].name,
        phase: SECTION_META[fromModuleId].phase,
        content,
      });
    }

    const allContext = [...priorSections, ...updatedSections];
    for (let i = startIndex + 1; i < MODULE_ORDER.length; i++) {
      const mid = MODULE_ORDER[i];
      const content = assembleSection(mid, userInput, dp, platform, allContext);
      const section = {
        id: mid,
        name: SECTION_META[mid].name,
        phase: SECTION_META[mid].phase,
        content,
      };
      updatedSections.push(section);
      allContext.push({ id: mid, name: section.name, content });
    }

    for (const section of updatedSections) {
      const upsertData = {
        project_id: projectId,
        module_id: section.id,
        form_data: { __userInput__: userInput },
        is_finalized: true,
        ...(isMobile
          ? { generated_prompt_mobile: section.content }
          : { generated_prompt_web: section.content }),
      };

      const existing = responseMap[section.id];
      if (existing) {
        await supabase
          .from("module_responses")
          .update(upsertData)
          .eq("id", existing.id);
      } else {
        await supabase.from("module_responses").insert(upsertData);
      }
    }

    return new Response(
      JSON.stringify({ updatedSections }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

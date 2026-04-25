import { config } from "../../shared/config.js";
import { HttpError } from "../../shared/http/httpError.js";
import { aiItinerarySchema } from "./ai.schemas.js";

type Provider = "groq";

function requireGroq() {
  if (config.GROQ_API_KEY) return;
  throw new HttpError({
    status: 500,
    code: "AI_NOT_CONFIGURED",
    message: "Groq is not configured. Set GROQ_API_KEY.",
  });
}

function extractJson(text: string) {
  // If the model returns pure JSON, parse directly first.
  try {
    return JSON.parse(text);
  } catch {
    // fall through
  }
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) return null;
  const candidate = text.slice(start, end + 1);
  try {
    return JSON.parse(candidate);
  } catch {
    return null;
  }
}

function pickLikelyPayload(json: any) {
  if (!json || typeof json !== "object") return json;
  if (json.itinerary && json.budget) return json;
  const candidates = [json.output, json.result, json.data, json.trip, json.plan, json.response];
  for (const candidate of candidates) {
    if (candidate && typeof candidate === "object" && candidate.itinerary && candidate.budget) return candidate;
  }
  return json;
}

async function groqChat(messages: Array<{ role: "system" | "user" | "assistant"; content: string }>) {
  const resp = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.GROQ_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: config.GROQ_MODEL,
      temperature: 0.2,
      // Ask for strict JSON object output (supported by the OpenAI-compatible API).
      response_format: { type: "json_object" },
      max_tokens: 2000,
      messages,
    }),
  });
  if (!resp.ok) {
    const t = await resp.text();
    throw new HttpError({ status: 502, code: "AI_UPSTREAM_ERROR", message: "Groq error", details: t });
  }
  const data = (await resp.json()) as any;
  return (data?.choices?.[0]?.message?.content ?? "") as string;
}

export async function generateTripAI(input: {
  destination: string;
  startDate?: string;
  days: number;
  budgetType: "Low" | "Medium" | "High";
  interests: string[];
  weatherSummary?: string;
}) {
  requireGroq();
  const provider: Provider = "groq";

  const system = [
    "You are a travel planning API that must output STRICT JSON only.",
    "No markdown, no code fences, no prose outside JSON.",
    "Numbers must be numbers, not strings.",
    "Budget totals must sum correctly (total = flights+accommodation+food+activities+localTransport+misc).",
    "Return a single JSON object that matches the required output shape.",
  ].join("\n");

  const user = {
    task: "Create a day-by-day itinerary, budget breakdown, and hotel suggestions.",
    destination: input.destination,
    startDate: input.startDate,
    days: input.days,
    budgetType: input.budgetType,
    interests: input.interests,
    weatherSummary: input.weatherSummary,
    outputShape: {
      itinerary: [
        {
          day: 1,
          title: "Optional short title",
          activities: [{ title: "string", time: "optional", type: "outdoor|indoor|mixed", notes: "optional" }],
        },
      ],
      budget: {
        currency: "USD",
        flights: 0,
        accommodation: 0,
        food: 0,
        activities: 0,
        localTransport: 0,
        misc: 0,
        total: 0,
      },
      hotels: [{ name: "string", category: "budget|mid|luxury", area: "optional" }],
    },
  };

  const modelUsed = config.GROQ_MODEL;

  const baseMessages: Array<{ role: "system" | "user"; content: string }> = [
    { role: "system", content: system },
    { role: "user", content: JSON.stringify(user) },
  ];

  let rawText = await groqChat(baseMessages);

  let json = extractJson(rawText);
  if (!json) {
    // One retry: ask the model to repair its output into strict JSON.
    rawText = await groqChat([
      { role: "system", content: system },
      {
        role: "user",
        content:
          "Fix the following into a single JSON object matching the required shape. Output JSON only.\n\n" +
          rawText,
      },
    ]);
    json = extractJson(rawText);
  }

  if (!json) {
    throw new HttpError({
      status: 502,
      code: "AI_BAD_RESPONSE",
      message: "AI returned non-JSON output",
      details: rawText.slice(0, 800),
    });
  }

  let candidateJson = pickLikelyPayload(json);
  let parsed = aiItinerarySchema.safeParse(candidateJson);
  if (!parsed.success) {
    // One schema-repair retry: ask model to transform invalid JSON into required shape only.
    const repairedRaw = await groqChat([
      { role: "system", content: system },
      {
        role: "user",
        content:
          "Transform the following JSON into the REQUIRED output shape only. " +
          "Return a single JSON object with keys itinerary, budget, hotels. " +
          "Do not include task/input/outputShape keys.\n\n" +
          JSON.stringify(candidateJson),
      },
    ]);
    const repairedJson = extractJson(repairedRaw);
    candidateJson = pickLikelyPayload(repairedJson);
    parsed = aiItinerarySchema.safeParse(candidateJson);
  }
  if (!parsed.success) {
    throw new HttpError({
      status: 502,
      code: "AI_BAD_SCHEMA",
      message: "AI JSON did not match expected schema",
      details: { issues: parsed.error.flatten(), sample: JSON.stringify(candidateJson).slice(0, 800) },
    });
  }

  const b = parsed.data.budget;
  const total = b.flights + b.accommodation + b.food + b.activities + b.localTransport + b.misc;
  parsed.data.budget.total = Math.round(total);

  return { provider, model: modelUsed, ...parsed.data };
}


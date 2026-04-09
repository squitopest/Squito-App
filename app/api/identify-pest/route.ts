import { NextResponse } from "next/server";

const SYSTEM_PROMPT = `You are an expert entomologist and pest control specialist serving Long Island, New York. 
Your job is to identify pests from photos submitted by homeowners.

When analyzing an image, you must respond with ONLY valid JSON in this exact format:
{
  "name": "Common name of the pest",
  "scientificName": "Latin binomial name",
  "confidence": 85,
  "description": "2-3 sentence description of the pest and why it matters for Long Island homeowners",
  "dangerLevel": "One of: Severe Disease, High Risk, Structural, Sanitary, Stinging, Nuisance",
  "matchedPestId": "slug-id if it matches one of these known pests, or null",
  "recommendation": "Brief recommendation for the homeowner"
}

Known pest IDs in our database (use these for matchedPestId if applicable):
deer-tick, lone-star-tick, dog-tick, culex-mosquito, asian-tiger, sub-termites, 
carpenter-ants, pavement-ants, yellow-jackets, baldfaced-hornets, paper-wasps,
german-roach, american-roach, bed-bugs, norway-rats, house-mouse, deer-mice,
spotted-lanternfly, cave-crickets, house-centipedes, wolf-spider, 
eastern-gray-squirrel, raccoon, fleas, stink-bugs, silverfish, earwigs, cluster-flies

If the image is unclear, not a pest, or you cannot identify it confidently, still provide your best guess 
with an appropriate confidence level. If it's definitely not a pest, say so.

IMPORTANT: Return ONLY the JSON object, no markdown, no code blocks, no explanation.`;

export async function POST(request: Request) {
  try {
    const { image } = await request.json();

    if (!image) {
      return NextResponse.json(
        { error: "No image provided" },
        { status: 400 },
      );
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "AI service not configured" },
        { status: 500 },
      );
    }

    // Strip the data URL prefix to get raw base64
    const base64Data = image.includes(",") ? image.split(",")[1] : image;
    const mimeType = image.includes("data:")
      ? image.split(";")[0].split(":")[1]
      : "image/jpeg";

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: SYSTEM_PROMPT,
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Please identify this pest. What species is it, how dangerous is it, and what should the homeowner do?",
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:${mimeType};base64,${base64Data}`,
                  detail: "high",
                },
              },
            ],
          },
        ],
        max_tokens: 500,
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("OpenAI API error:", errorData);
      return NextResponse.json(
        { error: "AI identification failed. Please try again." },
        { status: 500 },
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      return NextResponse.json(
        { error: "No identification result received" },
        { status: 500 },
      );
    }

    // Parse the JSON response from OpenAI
    try {
      const result = JSON.parse(content.trim());
      return NextResponse.json(result);
    } catch {
      // If parsing fails, try to extract JSON from the response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const result = JSON.parse(jsonMatch[0]);
        return NextResponse.json(result);
      }
      return NextResponse.json(
        { error: "Could not parse identification result" },
        { status: 500 },
      );
    }
  } catch (error) {
    console.error("Identify pest error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 },
    );
  }
}

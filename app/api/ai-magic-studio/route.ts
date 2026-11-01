import { NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

function countWords(value: string) {
  return value.trim() ? value.trim().split(/\\s+/).length : 0;
}

function toBase64(bytes: Uint8Array) {
  let binary = "";
  const chunkSize = 0x8000;
  for (let offset = 0; offset < bytes.length; offset += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(offset, offset + chunkSize));
  }
  return btoa(binary);
}

export async function POST(request: Request) {
  try {
    const form = await request.formData();
    const image = form.get("image");
    const prompt = String(form.get("prompt") || "").trim();

    if (!(image instanceof File) || !image.size) {
      return NextResponse.json({ error: "Please upload an image." }, { status: 400 });
    }
    if (!ALLOWED_TYPES.has(image.type)) {
      return NextResponse.json({ error: "Only JPG, PNG and WebP images are supported." }, { status: 400 });
    }
    if (!prompt || countWords(prompt) > 150) {
      return NextResponse.json({ error: "Please enter a prompt of no more than 150 words." }, { status: 400 });
    }

    const bytes = new Uint8Array(await image.arrayBuffer());
    const imageB64 = toBase64(bytes);
    const { env } = await getCloudflareContext();
    const ai = (env as any).AI;
    if (!ai) {
      return NextResponse.json({ error: "Cloudflare AI is not enabled for this deployment yet." }, { status: 503 });
    }

    const output = await ai.run("@cf/runwayml/stable-diffusion-v1-5-img2img", {
      prompt,
      image_b64: imageB64,
      strength: 0.65,
      guidance: 7.5,
      num_steps: 20,
    });

    if (!output) {
      return NextResponse.json({ error: "The AI service did not return an image. Please try again." }, { status: 502 });
    }

    return new Response(output as ReadableStream<Uint8Array>, {
      status: 200,
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "private, no-store, max-age=0",
        "Content-Disposition": 'inline; filename="shoppers-ocean-creation.png"',
      },
    });
  } catch (error) {
    console.error("AI Magic Studio image generation failed:", error);
    return NextResponse.json(
      { error: "Image generation is temporarily unavailable. Please try again." },
      { status: 500, headers: { "Cache-Control": "no-store" } }
    );
  }
}

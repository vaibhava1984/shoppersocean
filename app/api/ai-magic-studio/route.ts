import { NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const MODEL = "@cf/runwayml/stable-diffusion-v1-5-img2img";

function countWords(value: string) {
  return value.trim() ? value.trim().split(/\s+/).length : 0;
}

function toBase64(bytes: Uint8Array) {
  let binary = "";
  const chunkSize = 0x8000;
  for (let offset = 0; offset < bytes.length; offset += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(offset, offset + chunkSize));
  }
  return btoa(binary);
}

function decodeBase64(value: string) {
  const clean = value.replace(/^data:image\/[^;]+;base64,/, "").replace(/\s/g, "");
  const binary = atob(clean);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
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

    const { env } = await getCloudflareContext();
    const accountId = String((env as any).CF_AI_ACCOUNT_ID || "").trim();
    const apiToken = String((env as any).CF_AI_API_TOKEN || "").trim();

    if (!accountId || !apiToken) {
      return NextResponse.json(
        { error: "Cloudflare AI credentials are not configured for this deployment yet." },
        { status: 503 }
      );
    }

    const imageB64 = toBase64(new Uint8Array(await image.arrayBuffer()));
    const upstream = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${encodeURIComponent(accountId)}/ai/run/${MODEL}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt,
          image_b64: imageB64,
          strength: 0.65,
          guidance: 7.5,
          num_steps: 20,
        }),
      }
    );

    if (!upstream.ok) {
      console.error("Cloudflare Workers AI request failed:", upstream.status);
      return NextResponse.json(
        { error: "Cloudflare could not process this image. Please try again." },
        { status: 502, headers: { "Cache-Control": "no-store" } }
      );
    }

    const contentType = upstream.headers.get("content-type") || "";
    let outputBytes: Uint8Array;

    if (contentType.startsWith("image/")) {
      outputBytes = new Uint8Array(await upstream.arrayBuffer());
    } else {
      const payload = await upstream.json() as {
        success?: boolean;
        errors?: Array<{ message?: string }>;
        result?: string | { image?: string };
      };
      if (payload.success === false || !payload.result) {
        console.error("Cloudflare Workers AI returned no image:", payload.errors?.[0]?.message || "empty result");
        return NextResponse.json(
          { error: "The AI service did not return an image. Please try again." },
          { status: 502, headers: { "Cache-Control": "no-store" } }
        );
      }
      const encoded = typeof payload.result === "string" ? payload.result : payload.result.image;
      if (!encoded) {
        return NextResponse.json(
          { error: "The AI service returned an unsupported image response." },
          { status: 502, headers: { "Cache-Control": "no-store" } }
        );
      }
      outputBytes = decodeBase64(encoded);
    }

    if (!outputBytes.byteLength) {
      return NextResponse.json(
        { error: "The AI service returned an empty image. Please try again." },
        { status: 502, headers: { "Cache-Control": "no-store" } }
      );
    }

    return new Response(outputBytes, {
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

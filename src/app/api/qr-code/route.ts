import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const DEFAULT_SIZE = 300;
const MIN_SIZE = 160;
const MAX_SIZE = 1024;
const QR_ENDPOINT = "https://api.qrserver.com/v1/create-qr-code/";

export async function GET(request: NextRequest) {
  const data = request.nextUrl.searchParams.get("data")?.trim() ?? "";
  const format = normalizeFormat(
    request.nextUrl.searchParams.get("format")?.trim() ?? "png"
  );
  const size = normalizeSize(request.nextUrl.searchParams.get("size"));
  const foregroundColor = normalizeHexColor(
    request.nextUrl.searchParams.get("fg"),
    "111827"
  );
  const backgroundColor = normalizeHexColor(
    request.nextUrl.searchParams.get("bg"),
    "FFFFFF"
  );
  const shouldDownload = request.nextUrl.searchParams.get("download") === "1";

  if (!normalizeLinkedInUrl(data)) {
    return NextResponse.json(
      { message: "A valid public LinkedIn profile URL is required." },
      { status: 400 }
    );
  }

  if (foregroundColor.toLowerCase() === backgroundColor.toLowerCase()) {
    return NextResponse.json(
      { message: "Foreground and background colors must be different." },
      { status: 400 }
    );
  }

  const upstreamParams = new URLSearchParams({
    data,
    size: `${size}x${size}`,
    format,
    color: foregroundColor,
    bgcolor: backgroundColor,
    qzone: "1",
  });

  try {
    const upstreamResponse = await fetch(`${QR_ENDPOINT}?${upstreamParams}`, {
      cache: "no-store",
    });

    if (!upstreamResponse.ok || !upstreamResponse.body) {
      return NextResponse.json(
        { message: "Unable to generate QR code right now." },
        { status: 502 }
      );
    }

    const headers = new Headers();
    headers.set(
      "Content-Type",
      upstreamResponse.headers.get("content-type") ??
        (format === "svg" ? "image/svg+xml" : "image/png")
    );
    headers.set("Cache-Control", "no-store");

    if (shouldDownload) {
      headers.set(
        "Content-Disposition",
        `attachment; filename="linkedin-qr-code-${size}.${format}"`
      );
    }

    return new Response(upstreamResponse.body, {
      status: 200,
      headers,
    });
  } catch {
    return NextResponse.json(
      { message: "QR generation service is currently unavailable." },
      { status: 502 }
    );
  }
}

function normalizeFormat(rawFormat: string) {
  return rawFormat === "svg" ? "svg" : "png";
}

function normalizeSize(rawSize: string | null) {
  const parsedSize = Number.parseInt(rawSize ?? "", 10);

  if (Number.isNaN(parsedSize)) return DEFAULT_SIZE;
  return Math.min(Math.max(parsedSize, MIN_SIZE), MAX_SIZE);
}

function normalizeHexColor(rawValue: string | null, fallback: string) {
  const sanitizedValue = (rawValue ?? "")
    .replace(/^#/, "")
    .replace(/[^0-9a-fA-F]/g, "")
    .slice(0, 6);

  return /^[0-9a-fA-F]{6}$/.test(sanitizedValue)
    ? sanitizedValue.toUpperCase()
    : fallback;
}

function normalizeLinkedInUrl(rawValue: string) {
  if (!rawValue) return "";

  const value = /^https?:\/\//i.test(rawValue) ? rawValue : `https://${rawValue}`;

  try {
    const parsed = new URL(value);
    const hostname = parsed.hostname.replace(/^www\./, "").toLowerCase();
    const pathname = parsed.pathname.replace(/\/+$/, "");

    if (!hostname.endsWith("linkedin.com") || !pathname.startsWith("/in/")) {
      return "";
    }

    parsed.protocol = "https:";
    parsed.hash = "";
    parsed.search = "";

    return `${parsed.origin}${pathname}`;
  } catch {
    return "";
  }
}

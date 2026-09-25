import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

type CreateBody = {
  data: Record<string, unknown>;
  landscapeUrl?: string;
  portraitUrl?: string;
  token?: string;
};

async function urlToFile(
  url: string | undefined,
  filename: string,
): Promise<File | null> {
  if (!url) return null;
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const blob = await res.blob();
    if (!blob.size) return null;
    const ext = blob.type.split("/")[1]?.split(";")[0] || "jpg";
    const name = filename.includes(".") ? filename : `${filename}.${ext}`;
    return new File([blob], name, {
      type: blob.type || "application/octet-stream",
    });
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as CreateBody;
    const token =
      body.token ||
      req.headers.get("superadmin-auth") ||
      "";

    if (!body.data) {
      return NextResponse.json(
        { status: 400, message: "Missing upcoming event data" },
        { status: 400 },
      );
    }

    if (!token) {
      return NextResponse.json(
        { status: 401, message: "Missing auth token" },
        { status: 401 },
      );
    }

    let landscapeFile = await urlToFile(body.landscapeUrl, "landscapePhoto");
    let portraitFile = await urlToFile(body.portraitUrl, "portraitPhoto");

    // If one image fails (bad url / missing object), reuse the other so create can proceed
    if (!landscapeFile && portraitFile) landscapeFile = portraitFile;
    if (!portraitFile && landscapeFile) portraitFile = landscapeFile;

    if (!landscapeFile || !portraitFile) {
      return NextResponse.json(
        {
          status: 400,
          message:
            "Could not load portrait or landscape image for this content",
        },
        { status: 400 },
      );
    }

    const formdata = new FormData();
    formdata.append("landscapePhoto", landscapeFile);
    formdata.append("portraitPhoto", portraitFile);
    formdata.append("data", JSON.stringify(body.data));

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/$/, "");
    if (!baseUrl) {
      return NextResponse.json(
        { status: 500, message: "Missing API base URL" },
        { status: 500 },
      );
    }

    const res = await fetch(`${baseUrl}/superadmin/upcoming/event/create`, {
      method: "POST",
      headers: {
        "superadmin-auth": token,
      },
      body: formdata,
    });

    const payload = await res.json().catch(() => ({
      status: res.status,
      message: "Unexpected response from create upcoming endpoint",
    }));

    return NextResponse.json(payload, { status: res.status });
  } catch (error) {
    return NextResponse.json(
      {
        status: 500,
        message:
          error instanceof Error
            ? error.message
            : "Failed to create upcoming event",
      },
      { status: 500 },
    );
  }
}

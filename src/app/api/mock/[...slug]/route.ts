import { NextResponse, type NextRequest } from "next/server";
import { getPresignedUrl } from "~/lib/s3";

type ServiceConfig = {
  voices: string[];
};

type Services = Record<string, ServiceConfig>;

const services: Services = {
  styletts2: {
    voices: ["andreas", "woman"],
  },
  "seed-vc": {
    voices: ["andreas", "woman", "trump"],
  },
  "make-an-audio": {
    voices: [],
  },
};


export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string[] }> },
) {
  const { slug } = await params;
  const [service, endpoint] = slug;

  if (!service || !(service in services)) {
    return NextResponse.json({ error: "Service not found" }, { status: 404 });
  }
  
  const serviceConfig = services[service];

  if (endpoint === "voices") {
    return NextResponse.json({
      voices: serviceConfig?.voices ?? [],
    });
  }

  if (endpoint === "health") {
    return NextResponse.json({
      status: "healthy",
      model: "loaded",
    });
  }

  return NextResponse.json({ error: "Not found" }, { status: 404 });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string[] }> },
) {
  const { slug } = await params;
  const [service] = slug;

  if (!service || !(service in services)) {
    return NextResponse.json({ error: "Service not found" }, { status: 404 });
  }

  await new Promise((resolve) => setTimeout(resolve, 2000));

  const blobKey = "styletts2-output/14a8ed0c-7a56-420e-80ff-f91cc7ceed90.wav";
  const presignedUrl = await getPresignedUrl({ key: blobKey });

  return NextResponse.json({
    audio_url: presignedUrl,
    blob_key: blobKey,
  });
}
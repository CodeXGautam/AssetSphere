import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { canManageAssets } from "@/lib/permissions";
import { v2 as cloudinary } from "cloudinary";

// Configure lazily so env vars are always fresh
function getCloudinary() {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key:    process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
  return cloudinary;
}

/**
 * POST /api/assets/upload
 * Accepts multipart/form-data with a single "file" field.
 * Uploads to Cloudinary and returns the secure URL.
 * Admin / ORG_ADMIN only.
 */
export async function POST(request: Request) {
  const session = await auth();
  if (!canManageAssets(session?.user?.isSuperAdmin, session?.user?.orgRole)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Check Cloudinary config
  if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    return NextResponse.json({ error: "Cloudinary not configured." }, { status: 503 });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data." }, { status: 400 });
  }

  const file = formData.get("file") as File | null;
  if (!file) {
    return NextResponse.json({ error: "No file provided." }, { status: 400 });
  }

  // Validate file type
  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ error: "Only image files are allowed." }, { status: 400 });
  }

  // Validate file size (5MB max)
  if (file.size > 5 * 1024 * 1024) {
    return NextResponse.json({ error: "File size must be under 5MB." }, { status: 400 });
  }

  try {
    // Convert File to base64 data URI for Cloudinary
    const bytes      = await file.arrayBuffer();
    const buffer     = Buffer.from(bytes);
    const base64     = buffer.toString("base64");
    const dataUri    = `data:${file.type};base64,${base64}`;

    const cld    = getCloudinary();
    const result = await cld.uploader.upload(dataUri, {
      folder:        "assetsphere/assets",
      resource_type: "image",
      // Generate a unique public_id based on filename + timestamp
      public_id:     `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9]/g, "-")}`,
      transformation: [
        { width: 1200, height: 900, crop: "limit" },
        { quality: "auto", fetch_format: "auto" },
      ],
    });

    return NextResponse.json({ url: result.secure_url }, { status: 200 });
  } catch (err) {
    console.error("[/api/assets/upload] Cloudinary error:", err);
    return NextResponse.json(
      { error: "Image upload failed. Check Cloudinary configuration." },
      { status: 500 }
    );
  }
}

import { orpcClient } from "@/utils/orpc";
import { env } from "@my-better-t-app/env/web";

/**
 * Uploads a file to S3 using a presigned URL.
 * Returns the public URL of the uploaded file.
 */
export async function uploadFile(file: File, path: string): Promise<string> {
  const fileName = `${Date.now()}-${file.name.replace(/\s+/g, "-")}`;
  const key = `${path}/${fileName}`;

  // 1. Get presigned URL from server
  const { url, publicUrl } = await orpcClient.getUploadUrl({
    key,
    type: file.type,
  });

  // 2. Upload to S3 using PUT
  const response = await fetch(url, {
    method: "PUT",
    body: file,
    headers: {
      "Content-Type": file.type,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to upload file to S3: ${response.statusText}`);
  }

  return publicUrl; 
}

export function extractGoogleDriveFileId(value: string) {
  try {
    const url = new URL(value.trim());
    const hostname = url.hostname.toLowerCase();
    if (
      hostname !== "drive.google.com" &&
      hostname !== "docs.google.com"
    ) {
      return null;
    }

    const pathMatch = url.pathname.match(/\/d\/([^/]+)/);
    return pathMatch?.[1] ?? url.searchParams.get("id");
  } catch {
    return null;
  }
}

export function resolveGoogleDriveFileUrls(value: string) {
  const fileId = extractGoogleDriveFileId(value);
  if (!fileId) return null;

  const encodedId = encodeURIComponent(fileId);
  return {
    previewUrl: `https://drive.google.com/file/d/${encodedId}/preview`,
    openUrl: `https://drive.google.com/file/d/${encodedId}/view`,
  };
}

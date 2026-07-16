type FigJamUrls = {
  embedUrl: string;
  openUrl: string;
};

function isFigmaUrl(url: URL) {
  return (
    url.protocol === "https:" &&
    (url.hostname === "figma.com" || url.hostname.endsWith(".figma.com"))
  );
}

function isFigJamBoardUrl(url: URL) {
  const [fileType, fileKey] = url.pathname.split("/").filter(Boolean);
  return (fileType === "board" || fileType === "file") && Boolean(fileKey);
}

function createLegacyEmbedUrl(boardUrl: URL) {
  return `https://www.figma.com/embed?embed_host=share&url=${encodeURIComponent(
    boardUrl.toString(),
  )}`;
}

export function resolveFigJamUrls(value: string): FigJamUrls | null {
  try {
    const suppliedUrl = new URL(value.trim());
    if (!isFigmaUrl(suppliedUrl)) return null;

    if (suppliedUrl.pathname === "/embed") {
      const embeddedBoard = suppliedUrl.searchParams.get("url");
      if (!embeddedBoard) return null;

      const boardUrl = new URL(embeddedBoard);
      if (!isFigmaUrl(boardUrl) || !isFigJamBoardUrl(boardUrl)) return null;

      boardUrl.hostname = "www.figma.com";
      boardUrl.searchParams.delete("embed-host");

      return {
        embedUrl: createLegacyEmbedUrl(boardUrl),
        openUrl: boardUrl.toString(),
      };
    }

    if (!isFigJamBoardUrl(suppliedUrl)) return null;

    const openUrl = new URL(suppliedUrl);
    openUrl.hostname = "www.figma.com";
    openUrl.searchParams.delete("embed-host");

    return {
      embedUrl: createLegacyEmbedUrl(openUrl),
      openUrl: openUrl.toString(),
    };
  } catch {
    return null;
  }
}

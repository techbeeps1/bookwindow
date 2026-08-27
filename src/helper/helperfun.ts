export function truncateDescription(text: string, maxLength = 160) {
  const cleanText = text.replace(/<[^>]*>/g, "").trim();
  if (cleanText.length <= maxLength) {
    return cleanText;
  }
  return cleanText.substring(0, maxLength - 3).trimEnd() + "...";
}
export const processTextWithRules = (text: string): string => {
  // Normalize line endings
  const rawText = text.replace(/\r\n/g, '\n');
  
  // Attempt to join lines that are wrapped mid-sentence
  // If a line ends with a letter or comma, and next line starts with lowercase, join them.
  // This is a naive heuristic for PDF text extraction.
  let cleanText = rawText; // For now, keep simple to avoid merging distinct items inappropriately

  // Split into lines/blocks based on double newlines (paragraphs)
  // PDFs often have double newlines between logical blocks
  let blocks = cleanText.split(/\n\s*\n/);
  
  // If no double newlines found, try single newlines
  if (blocks.length < 2) {
    blocks = cleanText.split('\n');
  }

  let markdown = '# Generated Notes (Rule-Based)\n\n';
  
  blocks.forEach((block) => {
    const trimmed = block.trim();
    if (!trimmed) return;

    // Detect if it looks like a Heading
    // Short line (less than 80 chars), no end punctuation or ends in colon
    const isShort = trimmed.length < 80;
    const endsWithPunctuation = /[.!?]$/.test(trimmed);
    const endsWithColon = /:$/.test(trimmed);
    const startsWithBullet = /^[-*•]/.test(trimmed);
    const startsWithNumber = /^\d+\./.test(trimmed);

    if (isShort && (!endsWithPunctuation || endsWithColon) && !startsWithBullet && !startsWithNumber) {
      // Treat as Heading (Level 2)
      markdown += `\n## ${trimmed.replace(/:$/, '')}\n`;
    } 
    else if (startsWithBullet || startsWithNumber) {
      // Already lists, just ensure format
      const content = trimmed.replace(/^[-*•\d+.]\s*/, '').trim();
      markdown += `- ${content}\n`;
    }
    else {
      // Paragraph text -> Convert to bullet point for Flowchart compatibility
      // Check for Term : Definition pattern within the block
      if (trimmed.includes(':') && trimmed.length < 300) {
        // Potential flashcard
         markdown += `- ${trimmed}\n`;
      } else {
        // Standard text
        markdown += `- ${trimmed}\n`;
      }
    }
  });

  return markdown;
};

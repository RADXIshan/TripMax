import React from 'react';

/**
 * Strips raw markdown double asterisks (**) or converts them to clean typography
 * so raw '**' never appears anywhere in the user interface.
 */
export function cleanText(text: string): string {
  if (!text) return '';
  return text
    .replace(/\*\*(.*?)\*\*/g, '$1') // remove ** bold
    .replace(/\*(.*?)\*/g, '$1')     // remove * italics
    .replace(/^#+\s+/gm, '')        // remove heading hashes
    .trim();
}

/**
 * Renders text with bold spans instead of showing raw **
 */
export function renderCleanMessage(text: string): React.ReactNode {
  if (!text) return null;

  // Split by paragraphs
  const lines = text.split('\n');

  return (
    <div className="space-y-1.5 leading-relaxed">
      {lines.map((line, lineIdx) => {
        if (!line.trim()) {
          return <div key={lineIdx} className="h-1.5" />;
        }

        // Check if line is a bullet
        const isBullet = line.trim().startsWith('•') || line.trim().startsWith('-');
        const cleanLine = isBullet ? line.trim().replace(/^[-•]\s*/, '') : line;

        // Parse any remaining **word** into styled text
        const parts: React.ReactNode[] = [];
        const regex = /\*\*(.*?)\*\*/g;
        let lastIndex = 0;
        let match;

        while ((match = regex.exec(cleanLine)) !== null) {
          if (match.index > lastIndex) {
            parts.push(cleanLine.substring(lastIndex, match.index));
          }
          parts.push(
            <span key={`${lineIdx}-${match.index}`} className="font-semibold text-stone-900 dark:text-stone-100">
              {match[1]}
            </span>
          );
          lastIndex = regex.lastIndex;
        }

        if (lastIndex < cleanLine.length) {
          parts.push(cleanLine.substring(lastIndex));
        }

        if (isBullet) {
          return (
            <div key={lineIdx} className="flex items-start gap-2 pl-1 text-xs sm:text-sm">
              <span className="text-stone-400 select-none">•</span>
              <div>{parts.length > 0 ? parts : cleanLine}</div>
            </div>
          );
        }

        return (
          <p key={lineIdx} className="text-xs sm:text-sm">
            {parts.length > 0 ? parts : cleanLine}
          </p>
        );
      })}
    </div>
  );
}

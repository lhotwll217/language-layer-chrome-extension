import type { VocabularySuggestion } from '../types/chat';

/**
 * Vocabulary item structure for word replacement
 */
export interface VocabWord {
  nativeWord: string;    // Word in user's native language (found on websites)
  learningWord: string;  // Word in language being learned (replacement)
  nativeLang: string;
  learningLang: string;
}

/**
 * Creates a map for quick vocabulary lookup by native word (case-insensitive)
 */
export function createVocabMap(words: VocabWord[]): Map<string, VocabWord> {
  const map = new Map<string, VocabWord>();
  words.forEach(word => {
    map.set(word.nativeWord.toLowerCase(), word);
  });
  return map;
}

/**
 * Builds a regex pattern to match vocabulary words with word boundaries
 * Escapes special regex characters in words
 */
export function buildWordPattern(words: VocabWord[]): RegExp {
  if (words.length === 0) {
    return /(?!)/; // Pattern that never matches
  }

  const escapedWords = words.map(w => w.nativeWord.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  const patternSource = `\\b(${escapedWords.join('|')})\\b(?![a-zA-Z])`;
  return new RegExp(patternSource, 'gi');
}

/**
 * Creates a chip element (span) for a replaced word
 * Returns the created element
 */
export function createChipElement(originalWord: string, vocabItem: VocabWord): HTMLElement {
  const chip = document.createElement('span');
  chip.className = 'ceb-word-chip';
  chip.textContent = vocabItem.learningWord; // Show learning language (Finnish)
  chip.setAttribute('data-original', originalWord); // Store original for restoration
  chip.setAttribute('data-translation', vocabItem.nativeWord); // Native word for tooltip
  chip.setAttribute('data-native-lang', vocabItem.nativeLang);
  chip.setAttribute('data-learning-lang', vocabItem.learningLang);

  // Style the chip
  chip.style.cssText = `
    display: inline-flex;
    align-items: center;
    background: hsl(var(--muted));
    color: hsl(var(--foreground));
    padding: 1px 6px;
    border-radius: 6px;
    font-weight: 600;
    font-size: 0.9em;
    cursor: pointer;
    position: relative;
    margin: 0 2px;
    border: 1px solid hsl(var(--border));
    transition: all 0.2s ease;
    box-shadow: 0 1px 2px rgba(0,0,0,0.05);
  `;

  // Hover effect
  chip.addEventListener('mouseenter', () => {
    chip.style.background = 'hsl(var(--accent))';
    chip.style.borderColor = 'hsl(var(--primary) / 0.3)';
    showTooltip(chip, vocabItem);
  });

  chip.addEventListener('mouseleave', () => {
    chip.style.background = 'hsl(var(--muted))';
    chip.style.borderColor = 'hsl(var(--border))';
    hideTooltip();
  });

  return chip;
}

/**
 * Shows a tooltip with the translation
 */
function showTooltip(element: HTMLElement, vocabItem: VocabWord) {
  hideTooltip(); // Clear any existing tooltip

  const tooltip = document.createElement('div');
  tooltip.className = 'ceb-tooltip';
  tooltip.setAttribute('id', 'ceb-tooltip');
  tooltip.textContent = `${vocabItem.learningWord} = ${vocabItem.nativeWord}`;

  // Style the tooltip
  tooltip.style.cssText = `
    position: fixed;
    background: hsl(var(--background));
    color: hsl(var(--foreground));
    padding: 6px 10px;
    border-radius: 8px;
    font-size: 11px;
    font-weight: 700;
    z-index: 2147483647;
    white-space: nowrap;
    border: 2px solid hsl(var(--border));
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
    pointer-events: none;
    letter-spacing: 0.05em;
    text-transform: uppercase;
  `;

  document.body.appendChild(tooltip);

  // Position tooltip above the word
  const rect = element.getBoundingClientRect();
  const tooltipRect = tooltip.getBoundingClientRect();

  let top = rect.top - tooltipRect.height - 8;
  let left = rect.left + (rect.width - tooltipRect.width) / 2;

  // Prevent tooltip from going off-screen
  if (left < 8) left = 8;
  if (left + tooltipRect.width > window.innerWidth - 8) {
    left = window.innerWidth - tooltipRect.width - 8;
  }

  if (top < 8) {
    top = rect.bottom + 8;
  }

  tooltip.style.top = `${top}px`;
  tooltip.style.left = `${left}px`;
}

/**
 * Hides the current tooltip if it exists
 */
function hideTooltip() {
  const existing = document.getElementById('ceb-tooltip');
  if (existing) {
    existing.remove();
  }
}

/**
 * Checks if a given element should be excluded from word replacement
 */
export function shouldExcludeElement(node: Node): boolean {
  const parent = (node as any).parentElement;
  if (!parent) return true;

  // Exclude specific elements
  const excludedTags = ['SCRIPT', 'STYLE', 'INPUT', 'TEXTAREA'];
  if (excludedTags.includes(parent.tagName)) {
    return true;
  }

  // Exclude already-replaced chips
  if (parent.closest('.ceb-word-chip')) {
    return true;
  }

  // Exclude contentEditable elements
  if (parent.closest('[contenteditable]')) {
    return true;
  }

  return false;
}

/**
 * Gets all text nodes from an element that contain vocabulary words
 * Uses TreeWalker for efficient traversal
 */
export function getTextNodesContainingWords(
  container: HTMLElement,
  pattern: RegExp,
  excludeFn?: (node: Node) => boolean,
): Text[] {
  const textNodes: Text[] = [];

  const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT, {
    acceptNode: (node: Text) => {
      if (excludeFn && excludeFn(node)) {
        return NodeFilter.FILTER_REJECT;
      }

      if (shouldExcludeElement(node)) {
        return NodeFilter.FILTER_REJECT;
      }

      if (node.textContent && pattern.test(node.textContent)) {
        return NodeFilter.FILTER_ACCEPT;
      }

      return NodeFilter.FILTER_REJECT;
    },
  } as NodeFilter);

  let node: Text | null;
  while ((node = walker.nextNode() as Text)) {
    textNodes.push(node);
  }

  return textNodes;
}

/**
 * Replaces words in a text node with chip elements
 * Preserves the original text structure
 */
export function replaceWordsInTextNode(textNode: Text, pattern: RegExp, vocabMap: Map<string, VocabWord>) {
  const content = textNode.textContent;
  if (!content) return;

  let lastIndex = 0;
  let match: RegExpExecArray | null;
  const fragment = document.createDocumentFragment();

  // Reset pattern global flag state
  pattern.lastIndex = 0;

  while ((match = pattern.exec(content)) !== null) {
    // Add text before match
    if (match.index > lastIndex) {
      fragment.appendChild(document.createTextNode(content.slice(lastIndex, match.index)));
    }

    // Add chip for matched word
    const matchedWord = match[0];
    const vocabItem = vocabMap.get(matchedWord.toLowerCase());

    if (vocabItem) {
      fragment.appendChild(createChipElement(matchedWord, vocabItem));
    } else {
      // Fallback: add original text if vocab item not found
      fragment.appendChild(document.createTextNode(matchedWord));
    }

    lastIndex = pattern.lastIndex;
  }

  // Add remaining text
  if (lastIndex < content.length) {
    fragment.appendChild(document.createTextNode(content.slice(lastIndex)));
  }

  // Replace text node with fragment
  if (textNode.parentNode) {
    textNode.parentNode.replaceChild(fragment, textNode);
  }
}

/**
 * Cleans up chip elements and restores original text
 */
export function restoreOriginalText(container: HTMLElement) {
  const chips = container.querySelectorAll('.ceb-word-chip');
  chips.forEach(chip => {
    const original = chip.getAttribute('data-original');
    if (original && chip.parentNode) {
      chip.parentNode.replaceChild(document.createTextNode(original), chip);
    }
  });
}

import { parse as parseHTML } from 'node-html-parser';
import he from 'he';
import { InstructionStep, Recipe } from '../types/recipe';

// Helper to format ISO 8601 duration (e.g. "PT1H30M" -> "1 hr 30 mins")
export function formatDuration(durationStr?: string): string | undefined {
  if (!durationStr || typeof durationStr !== 'string') return undefined;

  const isoRegex = /^P(?:([0-9]+)D)?T?(?:([0-9]+)H)?(?:([0-9]+)M)?(?:([0-9]+)S)?$/i;
  const match = durationStr.trim().match(isoRegex);

  if (match) {
    const days = parseInt(match[1] || '0', 10);
    const hours = parseInt(match[2] || '0', 10);
    const minutes = parseInt(match[3] || '0', 10);

    const parts: string[] = [];
    if (days > 0) parts.push(`${days} day${days > 1 ? 's' : ''}`);
    if (hours > 0) parts.push(`${hours} hr${hours > 1 ? 's' : ''}`);
    if (minutes > 0) parts.push(`${minutes} min${minutes > 1 ? 's' : ''}`);

    if (parts.length > 0) {
      return parts.join(' ');
    }
  }

  // If already in human format (e.g. "25 minutes"), clean and return
  return cleanText(durationStr);
}

// Clean and decode HTML entities and excess whitespace
export function cleanText(text?: string | null): string {
  if (!text) return '';
  const decoded = he.decode(String(text));
  // Replace multiple whitespace with a single space, but keep words clean
  return decoded.replace(/\s+/g, ' ').trim();
}

// Extract domain from URL
export function getDomain(urlStr: string): string {
  try {
    const url = new URL(urlStr);
    return url.hostname.replace(/^www\./, '');
  } catch {
    return '';
  }
}

// Recursively find Recipe object in JSON-LD tree
function findRecipeInObject(obj: any): any | null {
  if (!obj || typeof obj !== 'object') return null;

  // Check if current object is Recipe
  const type = obj['@type'];
  if (
    type === 'Recipe' ||
    (Array.isArray(type) && type.some(t => t === 'Recipe' || String(t).endsWith('/Recipe'))) ||
    String(type).endsWith('/Recipe')
  ) {
    return obj;
  }

  // Check @graph array
  if (Array.isArray(obj['@graph'])) {
    for (const item of obj['@graph']) {
      const found = findRecipeInObject(item);
      if (found) return found;
    }
  }

  // Check top-level array
  if (Array.isArray(obj)) {
    for (const item of obj) {
      const found = findRecipeInObject(item);
      if (found) return found;
    }
  }

  // Check nested properties
  for (const key of Object.keys(obj)) {
    if (key !== '@graph' && typeof obj[key] === 'object' && obj[key] !== null) {
      const found = findRecipeInObject(obj[key]);
      if (found) return found;
    }
  }

  return null;
}

// Normalize image field from Schema.org
function extractImage(rawImage: any): string | undefined {
  if (!rawImage) return undefined;
  if (typeof rawImage === 'string' && rawImage.startsWith('http')) return rawImage;
  if (Array.isArray(rawImage) && rawImage.length > 0) {
    const first = rawImage[0];
    if (typeof first === 'string') return first;
    if (first && typeof first.url === 'string') return first.url;
  }
  if (typeof rawImage === 'object' && typeof rawImage.url === 'string') {
    return rawImage.url;
  }
  return undefined;
}

// Normalize instructions into InstructionStep[]
function extractInstructions(rawInstructions: any): InstructionStep[] {
  const steps: InstructionStep[] = [];
  if (!rawInstructions) return steps;

  let currentSection: string | undefined = undefined;

  function processItem(item: any) {
    if (!item) return;

    if (typeof item === 'string') {
      const trimmed = cleanText(item);
      if (trimmed) {
        steps.push({
          stepNumber: steps.length + 1,
          section: currentSection,
          text: trimmed,
        });
      }
      return;
    }

    if (typeof item === 'object') {
      const type = item['@type'];

      if (type === 'HowToSection') {
        const prevSection = currentSection;
        currentSection = cleanText(item.name || item.text);
        if (Array.isArray(item.itemListElement)) {
          item.itemListElement.forEach(processItem);
        }
        currentSection = prevSection;
        return;
      }

      // HowToStep or generic step object
      const text = cleanText(item.text || item.description || item.name || '');
      if (text) {
        steps.push({
          stepNumber: steps.length + 1,
          section: currentSection,
          text,
        });
      }
    }
  }

  if (Array.isArray(rawInstructions)) {
    rawInstructions.forEach(processItem);
  } else if (typeof rawInstructions === 'string') {
    // Single string: split by newlines or numbered lines
    const lines = rawInstructions.split(/\r?\n+/);
    for (const line of lines) {
      const cleaned = cleanText(line.replace(/^\d+[\.\)]\s*/, ''));
      if (cleaned) {
        steps.push({
          stepNumber: steps.length + 1,
          text: cleaned,
        });
      }
    }
  }

  return steps;
}

// Normalize ingredients
function extractIngredients(rawIngredients: any): string[] {
  if (!rawIngredients) return [];
  const list: string[] = [];

  const items = Array.isArray(rawIngredients) ? rawIngredients : [rawIngredients];
  for (const item of items) {
    if (typeof item === 'string') {
      const cleaned = cleanText(item);
      if (cleaned) list.push(cleaned);
    } else if (typeof item === 'object' && item !== null) {
      const text = cleanText(item.text || item.name || '');
      if (text) list.push(text);
    }
  }

  return list;
}

// Normalize tags / categories / keywords
function extractTags(schema: any): string[] {
  const tagSet = new Set<string>();

  function addTag(val: any) {
    if (!val) return;
    if (typeof val === 'string') {
      // Split comma separated tags
      val.split(',').forEach(t => {
        const cleaned = cleanText(t);
        if (cleaned && cleaned.length < 30) {
          tagSet.add(cleaned);
        }
      });
    } else if (Array.isArray(val)) {
      val.forEach(addTag);
    }
  }

  addTag(schema.recipeCategory);
  addTag(schema.recipeCuisine);
  addTag(schema.keywords);

  return Array.from(tagSet).slice(0, 8); // max 8 relevant tags
}

export interface ParsedRecipeResult {
  title: string;
  sourceUrl?: string;
  sourceDomain?: string;
  imageUrl?: string;
  description?: string;
  prepTime?: string;
  cookTime?: string;
  totalTime?: string;
  servings?: string;
  ingredients: string[];
  instructions: InstructionStep[];
  tags: string[];
}

// Core parsing function given HTML and source URL
export function parseRecipeFromHTML(html: string, sourceUrl: string): ParsedRecipeResult {
  const root = parseHTML(html);
  const domain = getDomain(sourceUrl);

  // 1. Try JSON-LD Schema.org extraction
  const jsonLdScripts = root.querySelectorAll('script[type="application/ld+json"]');
  let recipeSchema: any = null;

  for (const script of jsonLdScripts) {
    const rawText = script.text?.trim();
    if (!rawText) continue;

    try {
      // Remove CDATA if present
      const cleanedJson = rawText.replace(/<!--[\s\S]*?-->/g, '').replace(/^\s*\/\*[\s\S]*?\*\/\s*/g, '');
      const parsed = JSON.parse(cleanedJson);
      const found = findRecipeInObject(parsed);
      if (found) {
        recipeSchema = found;
        break;
      }
    } catch {
      // Some sites have invalid escaping or comments, skip to next
    }
  }

  if (recipeSchema) {
    const title = cleanText(recipeSchema.name) || 'Untitled Recipe';
    const imageUrl = extractImage(recipeSchema.image);
    const description = cleanText(recipeSchema.description);
    const prepTime = formatDuration(recipeSchema.prepTime);
    const cookTime = formatDuration(recipeSchema.cookTime);
    const totalTime = formatDuration(recipeSchema.totalTime);
    
    let servings: string | undefined = undefined;
    if (recipeSchema.recipeYield) {
      if (Array.isArray(recipeSchema.recipeYield)) {
        servings = cleanText(String(recipeSchema.recipeYield[0]));
      } else {
        servings = cleanText(String(recipeSchema.recipeYield));
      }
    }

    const ingredients = extractIngredients(recipeSchema.recipeIngredient);
    const instructions = extractInstructions(recipeSchema.recipeInstructions);
    const tags = extractTags(recipeSchema);

    return {
      title,
      sourceUrl,
      sourceDomain: domain,
      imageUrl,
      description,
      prepTime,
      cookTime,
      totalTime,
      servings,
      ingredients,
      instructions,
      tags,
    };
  }

  // 2. Fallback: Microdata / OpenGraph / Heuristic HTML extraction
  const ogTitle = root.querySelector('meta[property="og:title"]')?.getAttribute('content');
  const pageTitle = root.querySelector('title')?.text;
  const h1Title = root.querySelector('h1')?.text;
  const title = cleanText(ogTitle || h1Title || pageTitle) || 'Untitled Recipe';

  const ogImage = root.querySelector('meta[property="og:image"]')?.getAttribute('content');
  const ogDesc = root.querySelector('meta[property="og:description"]')?.getAttribute('content') ||
                 root.querySelector('meta[name="description"]')?.getAttribute('content');

  // Attempt heuristic ingredients search
  const fallbackIngredients: string[] = [];
  const ingredientElements = root.querySelectorAll('[class*="ingredient"], [id*="ingredient"]');
  for (const el of ingredientElements) {
    const listItems = el.querySelectorAll('li');
    if (listItems.length > 0) {
      for (const li of listItems) {
        const text = cleanText(li.text);
        if (text && text.length > 2 && text.length < 200 && !fallbackIngredients.includes(text)) {
          fallbackIngredients.push(text);
        }
      }
      if (fallbackIngredients.length >= 3) break;
    }
  }

  // Attempt heuristic instructions search
  const fallbackInstructions: InstructionStep[] = [];
  const instructionElements = root.querySelectorAll('[class*="instruction"], [class*="direction"], [id*="instruction"]');
  for (const el of instructionElements) {
    const listItems = el.querySelectorAll('li');
    if (listItems.length > 0) {
      for (const li of listItems) {
        const text = cleanText(li.text);
        if (text && text.length > 5) {
          fallbackInstructions.push({
            stepNumber: fallbackInstructions.length + 1,
            text,
          });
        }
      }
      if (fallbackInstructions.length >= 2) break;
    }
  }

  return {
    title,
    sourceUrl,
    sourceDomain: domain,
    imageUrl: ogImage || undefined,
    description: cleanText(ogDesc),
    ingredients: fallbackIngredients,
    instructions: fallbackInstructions,
    tags: [],
  };
}

// Fetch and parse recipe from a web URL
export async function fetchAndParseRecipe(url: string): Promise<ParsedRecipeResult> {
  let targetUrl = url.trim();
  if (!/^https?:\/\//i.test(targetUrl)) {
    targetUrl = 'https://' + targetUrl;
  }

  const response = await fetch(targetUrl, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch recipe page: HTTP ${response.status} ${response.statusText}`);
  }

  const html = await response.text();
  return parseRecipeFromHTML(html, targetUrl);
}

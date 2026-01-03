import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function slugify(text: string) {
  return text.toLowerCase().replace(/ /g, "-").replace(/[^\w-]+/g, "");
}

export function generateUniqueSlug(text: string, existingSlugs: Set<string>, excludeSlug?: string): string {
  const baseSlug = slugify(text);
  
  const slugsToCheck = excludeSlug 
    ? new Set([...existingSlugs].filter(s => s !== excludeSlug))
    : existingSlugs;

  if (!slugsToCheck.has(baseSlug)) {
    return baseSlug;
  }

  let counter = 2;
  while (slugsToCheck.has(`${baseSlug}-${counter}`)) {
    counter++;
  }

  return `${baseSlug}-${counter}`;
}

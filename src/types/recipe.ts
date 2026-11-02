export interface InstructionStep {
  stepNumber: number;
  section?: string;
  text: string;
}

export interface Recipe {
  id: string;
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
  notes?: string;
  createdAt: number;
  updatedAt: number;
}

export type SortOption = 'newest' | 'oldest' | 'title_asc' | 'title_desc';

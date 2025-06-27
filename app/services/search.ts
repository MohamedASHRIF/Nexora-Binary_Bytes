import data from '../data/suggestions.json';


type Category = keyof typeof data;

export interface Suggestion {
  search: string;
  category?: string;
}

export const searchSuggestions = (
  query: string,
  activeCategories: Category[]
): Suggestion[] => {
  if (!query.trim()) return [];

  const results: Suggestion[] = [];
  
  activeCategories.forEach(category => {
    const categoryItems = data[category] as Suggestion[] || [];
    const matches = categoryItems
      .filter(item => 
        item.search.toLowerCase().includes(query.toLowerCase())
      )
      .map(item => ({ ...item, category: String(category) }));
    results.push(...matches);
  });

  return results;
};

export const getAllCategories = (): Category[] => {
  return Object.keys(data) as Category[];
};
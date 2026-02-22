import { api } from "@/lib/api/client";

export interface SearchSuggestion {
  _id: string;
  title: string;
  slug: string;
  thumbnail?: string;
}

export interface PopularTemplate {
  _id: string;
  title: string;
  slug: string;
  thumbnail?: string;
  stats: {
    views: number;
    purchases: number;
  };
}

export async function getAutocomplete(
  query: string,
): Promise<SearchSuggestion[]> {
  if (!query || query.length < 2) return [];

  try {
    const { data } = await api.get(
      `/search/autocomplete?q=${encodeURIComponent(query)}`,
    );
    return data.data.suggestions || [];
  } catch (error) {
    console.error("Failed to fetch autocomplete suggestions:", error);
    return [];
  }
}

export async function getPopularTemplates(): Promise<PopularTemplate[]> {
  try {
    const { data } = await api.get("/search/popular");
    return data.data.templates || [];
  } catch (error) {
    console.error("Failed to fetch popular templates:", error);
    return [];
  }
}

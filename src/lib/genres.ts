import { supabase } from "./supabase";

export type Genre = {
  id: number;
  name: string;
  slug: string;
  sortOrder: number;
};

type GenreRow = {
  id: number;
  name: string;
  slug: string;
  sort_order: number;
};

export async function getGenres(): Promise<Genre[]> {
  const { data, error } = await supabase
    .from("genres")
    .select(`
      id,
      name,
      slug,
      sort_order
    `)
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });

  if (error) {
    throw new Error(
      `Could not load genres: ${error.message}`,
    );
  }

  return ((data ?? []) as GenreRow[]).map((genre) => ({
    id: Number(genre.id),
    name: genre.name,
    slug: genre.slug,
    sortOrder: Number(genre.sort_order),
  }));
}
import { supabase } from "./supabase";

export type MusicBrainzArtistResult = {
  musicbrainzId: string;
  name: string;
  sortName: string;
  disambiguation: string;
  country: string;
  type: string;
  area: string;
  beginDate: string;
  endDate: string;
  ended: boolean;
  score: number;
};

type SearchMusicBrainzResponse = {
  artists?: MusicBrainzArtistResult[];
  error?: string;
};

export async function searchMusicBrainzArtists(
  query: string,
): Promise<MusicBrainzArtistResult[]> {
  const normalizedQuery = query.trim();

  if (normalizedQuery.length < 2) {
    return [];
  }

  const { data, error } =
    await supabase.functions.invoke<SearchMusicBrainzResponse>(
      "search-musicbrainz-artists",
      {
        body: {
          query: normalizedQuery,
        },
      },
    );

  if (error) {
    throw new Error(
      `MusicBrainz search failed: ${error.message}`,
    );
  }

  if (data?.error) {
    throw new Error(
      `MusicBrainz search failed: ${data.error}`,
    );
  }

  return data?.artists ?? [];
}

export function getArtistSecondaryLabel(
  artist: MusicBrainzArtistResult,
) {
  return [
    artist.type,
    artist.country,
    artist.area,
    artist.disambiguation,
  ]
    .filter(Boolean)
    .join(" · ");
}
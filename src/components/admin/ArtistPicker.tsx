import { useEffect, useMemo, useState } from "react";
import {
  getArtistSecondaryLabel,
  searchMusicBrainzArtists,
  type MusicBrainzArtistResult,
} from "../../lib/musicBrainz";

export type SelectedArtist = MusicBrainzArtistResult & {
  databaseId?: number;
};

type ArtistPickerProps = {
  selectedArtists: SelectedArtist[];
  onChange: (artists: SelectedArtist[]) => void;
};

export function ArtistPicker({
  selectedArtists,
  onChange,
}: ArtistPickerProps) {
  const [artistSearch, setArtistSearch] = useState("");
  const [artistResults, setArtistResults] = useState<
    MusicBrainzArtistResult[]
  >([]);
  const [searchingArtists, setSearchingArtists] =
    useState(false);
  const [artistSearchError, setArtistSearchError] =
    useState<string | null>(null);

  useEffect(() => {
    const normalizedSearch = artistSearch.trim();

    if (normalizedSearch.length < 2) {
      setArtistResults([]);
      setSearchingArtists(false);
      setArtistSearchError(null);
      return;
    }

    let cancelled = false;

    const timeoutId = window.setTimeout(async () => {
      setSearchingArtists(true);
      setArtistSearchError(null);

      try {
        const results =
          await searchMusicBrainzArtists(
            normalizedSearch,
          );

        if (!cancelled) {
          setArtistResults(results);
        }
      } catch (searchError) {
        if (!cancelled) {
          console.error(
            "MusicBrainz artist search failed:",
            searchError,
          );

          setArtistSearchError(
            searchError instanceof Error
              ? searchError.message
              : "Artist search failed.",
          );

          setArtistResults([]);
        }
      } finally {
        if (!cancelled) {
          setSearchingArtists(false);
        }
      }
    }, 700);

    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
    };
  }, [artistSearch]);

  const availableArtistResults = useMemo(
    () =>
      artistResults.filter(
        (result) =>
          !selectedArtists.some(
            (selectedArtist) =>
              selectedArtist.musicbrainzId ===
              result.musicbrainzId,
          ),
      ),
    [artistResults, selectedArtists],
  );

  function handleSelectArtist(
    artist: MusicBrainzArtistResult,
  ) {
    const alreadySelected = selectedArtists.some(
      (selectedArtist) =>
        selectedArtist.musicbrainzId ===
        artist.musicbrainzId,
    );

    if (!alreadySelected) {
      onChange([...selectedArtists, artist]);
    }

    setArtistSearch("");
    setArtistResults([]);
    setArtistSearchError(null);
  }

  function handleRemoveArtist(
    musicbrainzId: string,
  ) {
    onChange(
      selectedArtists.filter(
        (artist) =>
          artist.musicbrainzId !== musicbrainzId,
      ),
    );
  }

  return (
    <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">
            Artists mentioned
          </h2>

          <p className="mt-1 text-sm text-[var(--muted)]">
            Music referenced in this review
          </p>
        </div>

        <span className="text-sm text-[var(--muted)]">
          {selectedArtists.length}
        </span>
      </div>

      {selectedArtists.length > 0 && (
        <div className="mt-5 flex flex-wrap gap-2">
          {selectedArtists.map((artist) => (
            <div
              key={artist.musicbrainzId}
              className="flex items-center gap-2 rounded-full border border-[var(--accent)] bg-[var(--surface-soft)] px-3 py-2 text-sm"
            >
              <span className="font-semibold">
                {artist.name}
              </span>

              <button
                type="button"
                onClick={() =>
                  handleRemoveArtist(
                    artist.musicbrainzId,
                  )
                }
                className="text-[var(--muted)] transition hover:text-[var(--foreground)]"
                aria-label={`Remove ${artist.name}`}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="relative mt-5">
        <label
          htmlFor="artist-search"
          className="block text-sm font-semibold"
        >
          Search MusicBrainz
        </label>

        <input
          id="artist-search"
          type="search"
          value={artistSearch}
          onChange={(event) =>
            setArtistSearch(event.target.value)
          }
          placeholder="Radiohead, Aurora, Massive Attack…"
          autoComplete="off"
          className="mt-3 w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-3 outline-none transition focus:border-[var(--accent)]"
        />

        {searchingArtists && (
          <p className="mt-3 text-sm text-[var(--muted)]">
            Searching MusicBrainz…
          </p>
        )}

        {artistSearchError && (
          <p className="mt-3 text-sm text-red-600">
            {artistSearchError}
          </p>
        )}

        {!searchingArtists &&
          artistSearch.trim().length >= 2 &&
          !artistSearchError && (
            <div className="mt-3 max-h-80 overflow-y-auto rounded-xl border border-[var(--border)] bg-[var(--background)] p-2">
              {availableArtistResults.length > 0 ? (
                availableArtistResults.map(
                  (artist) => {
                    const secondaryLabel =
                      getArtistSecondaryLabel(
                        artist,
                      );

                    return (
                      <button
                        key={artist.musicbrainzId}
                        type="button"
                        onClick={() =>
                          handleSelectArtist(
                            artist,
                          )
                        }
                        className="block w-full rounded-lg px-3 py-3 text-left transition hover:bg-[var(--surface-soft)]"
                      >
                        <span className="block font-semibold">
                          {artist.name}
                        </span>

                        {secondaryLabel && (
                          <span className="mt-1 block text-xs text-[var(--muted)]">
                            {secondaryLabel}
                          </span>
                        )}

                        {artist.beginDate && (
                          <span className="mt-1 block text-xs text-[var(--muted)]">
                            Active from{" "}
                            {artist.beginDate}
                            {artist.endDate
                              ? ` to ${artist.endDate}`
                              : ""}
                          </span>
                        )}
                      </button>
                    );
                  },
                )
              ) : (
                <p className="px-3 py-4 text-sm text-[var(--muted)]">
                  No matching artists found.
                </p>
              )}
            </div>
          )}
      </div>
    </div>
  );
}
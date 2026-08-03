import { useEffect, useMemo, useState } from "react";
import {
  getGenres,
  type Genre,
} from "../../lib/genres";

type GenrePickerProps = {
  selectedGenres: Genre[];
  onChange: (genres: Genre[]) => void;
};

export function GenrePicker({
  selectedGenres,
  onChange,
}: GenrePickerProps) {
  const [genres, setGenres] = useState<Genre[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(
    null,
  );

  useEffect(() => {
    let cancelled = false;

    async function loadGenres() {
      setLoading(true);
      setError(null);

      try {
        const loadedGenres = await getGenres();

        if (!cancelled) {
          setGenres(loadedGenres);
        }
      } catch (loadError) {
        console.error("Loading genres failed:", loadError);

        if (!cancelled) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Genres could not be loaded.",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadGenres();

    return () => {
      cancelled = true;
    };
  }, []);

  const availableGenres = useMemo(() => {
    const normalizedSearch = search
      .trim()
      .toLowerCase();

    return genres.filter((genre) => {
      const alreadySelected = selectedGenres.some(
        (selectedGenre) =>
          selectedGenre.id === genre.id,
      );

      if (alreadySelected) {
        return false;
      }

      if (!normalizedSearch) {
        return true;
      }

      return genre.name
        .toLowerCase()
        .includes(normalizedSearch);
    });
  }, [genres, search, selectedGenres]);

  function handleSelectGenre(genre: Genre) {
    const alreadySelected = selectedGenres.some(
      (selectedGenre) =>
        selectedGenre.id === genre.id,
    );

    if (!alreadySelected) {
      onChange([...selectedGenres, genre]);
    }

    setSearch("");
  }

  function handleRemoveGenre(genreId: number) {
    onChange(
      selectedGenres.filter(
        (genre) => genre.id !== genreId,
      ),
    );
  }

  return (
    <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">
            Music genres
          </h2>

          <p className="mt-1 text-sm text-[var(--muted)]">
            Genres represented in this review
          </p>
        </div>

        <span className="text-sm text-[var(--muted)]">
          {selectedGenres.length}
        </span>
      </div>

      {selectedGenres.length > 0 && (
        <div className="mt-5 flex flex-wrap gap-2">
          {selectedGenres.map((genre) => (
            <div
              key={genre.id}
              className="flex items-center gap-2 rounded-full border border-[var(--accent)] bg-[var(--surface-soft)] px-3 py-2 text-sm"
            >
              <span className="font-semibold">
                {genre.name}
              </span>

              <button
                type="button"
                onClick={() =>
                  handleRemoveGenre(genre.id)
                }
                className="text-[var(--muted)] transition hover:text-[var(--foreground)]"
                aria-label={`Remove ${genre.name}`}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="mt-5">
        <label
          htmlFor="genre-search"
          className="block text-sm font-semibold"
        >
          Add genres
        </label>

        <input
          id="genre-search"
          type="search"
          value={search}
          onChange={(event) =>
            setSearch(event.target.value)
          }
          placeholder="Rock, ambient, jazz…"
          autoComplete="off"
          className="mt-3 w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-3 outline-none transition focus:border-[var(--accent)]"
        />

        {loading && (
          <p className="mt-3 text-sm text-[var(--muted)]">
            Loading genres…
          </p>
        )}

        {error && (
          <p className="mt-3 text-sm text-red-600">
            {error}
          </p>
        )}

        {!loading && !error && (
          <div className="mt-3 max-h-80 overflow-y-auto rounded-xl border border-[var(--border)] bg-[var(--background)] p-2">
            {availableGenres.length > 0 ? (
              availableGenres.map((genre) => (
                <button
                  key={genre.id}
                  type="button"
                  onClick={() =>
                    handleSelectGenre(genre)
                  }
                  className="block w-full rounded-lg px-3 py-3 text-left font-medium transition hover:bg-[var(--surface-soft)]"
                >
                  {genre.name}
                </button>
              ))
            ) : (
              <p className="px-3 py-4 text-sm text-[var(--muted)]">
                No matching genres found.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
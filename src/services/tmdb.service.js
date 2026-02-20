const axios = require("axios");

const TMDB_BASE_URL = "https://api.themoviedb.org/3";

/**
 * Fetch movies / series from TMDB
 * type: movie | tv
 * genre: TMDB genre id (number)
 * language: en, hi, etc.
 */
async function discoverContent({ type, genre, language }) {
  try {
    let endpoint = "movie";

    if (type === "tv") endpoint = "tv";
    if (type === "anime") endpoint = "tv"; // anime lives in TV (Japan)

    const response = await axios.get(
      `${TMDB_BASE_URL}/discover/${endpoint}`,
      {
        params: {
          api_key: process.env.TMDB_API_KEY,
          with_genres: genre,
          language: language,
          sort_by: "popularity.desc",
          with_original_language: type === "anime" ? "ja" : undefined,
        },
      }
    );

    return response.data.results.map(item => ({
      ...item,
      _contentType: type, // 👈 VERY IMPORTANT
    }));

  } catch (error) {
    console.error("TMDB error:", error.message);
    return [];
  }
}

/**
 * Fetch Bombay Canvas internal shows
 */
async function fetchInternalShows() {
  try {
    const response = await axios.get(
      "https://bombay-canvas-new-dev-v2-1018893063821.asia-south1.run.app/api/all-series"
    );

    if (!response.data?.series) return [];

    return response.data.series.map(show => ({
      id: `internal-${show.id}`,
      title: show.title,
      name: show.title, // for TV compatibility
      overview: show.description,
      poster_path: show.posterUrl, // ✅ correct field
      vote_average: 7.5, // give default quality
      popularity: 500,   // give base popularity
      genre_ids: [],     // we will ignore genre match for now
      original_language: "hi", // default since API doesn't give it
      _contentType: show.isTV ? "tv" : "movie",
      is_internal: true
    }));

  } catch (error) {
    console.error("Internal shows fetch error:", error.message);
    return [];
  }
}


module.exports = { discoverContent, fetchInternalShows };

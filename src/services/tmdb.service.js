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


module.exports = { discoverContent };

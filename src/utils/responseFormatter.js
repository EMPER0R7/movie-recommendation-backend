function formatContent(item) {
  return {
    id: item.id,

    // Titles
    title: item.title || item.name || "Untitled",
    originalTitle: item.original_title || item.original_name,

    // Description
    overview: item.overview || "No description available",

    // Images
    poster: item.poster_path
      ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
      : null,

    backdrop: item.backdrop_path
      ? `https://image.tmdb.org/t/p/w780${item.backdrop_path}`
      : null,

    // Metadata
    rating: item.vote_average ? Number(item.vote_average.toFixed(1)) : null,
    voteCount: item.vote_count || 0,

    year:
      item.release_date?.split("-")[0] ||
      item.first_air_date?.split("-")[0] ||
      null,

    runtime: item.runtime || null,

    // Language
    language: item.original_language || null,

    // Genres
    genres: item.genre_ids || [],

    // People (optional, future-ready)
    director: item.director || null,

    // Type
    type: item.media_type || "movie",
  };
}

module.exports = { formatContent };

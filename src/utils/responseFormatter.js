function formatContent(item) {
  return {
    id: item.id,
     type: item._contentType,
    title: item.title || item.name,
    overview: item.overview,
    rating: item.vote_average,
    poster: `https://image.tmdb.org/t/p/w500${item.poster_path}`,
    language: item.original_language,
    score: item.score,
  };
}

module.exports = { formatContent };

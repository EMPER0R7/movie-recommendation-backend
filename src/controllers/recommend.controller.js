const { discoverContent } = require("../services/tmdb.service");
const { calculateScore } = require("../services/scoring.service");
const { GENRE_MAP, LANGUAGE_MAP } = require("../utils/mappings");
const { formatContent } = require("../utils/responseFormatter");
const { getUserStats } = require("../services/userStats.service");

async function recommend(req, res) {
  try {
    const {
      userId,
      types,
      genre,
      language,
      mood,
      page = 1,
      limit = 10,
    } = req.body;

    /* ---------------- VALIDATION ---------------- */

    if (!userId || !types || !Array.isArray(types) || types.length === 0) {
      return res.status(400).json({ error: "Invalid userId or types" });
    }

    if (!genre || !language) {
      return res.status(400).json({ error: "Genre and language are required" });
    }

    const genreId = GENRE_MAP[genre.toLowerCase()];
    const languageCode = LANGUAGE_MAP[language.toLowerCase()];

    if (!genreId || !languageCode) {
      return res.status(400).json({ error: "Invalid genre or language" });
    }

    /* ---------------- USER BEHAVIOR ---------------- */

    const userStats = await getUserStats(userId);

    /* ---------------- FETCH CONTENT ---------------- */

    let allContent = [];

    for (const type of types) {
      const content = await discoverContent({
        type,
        genre: genreId,
        language: languageCode,
      });

      allContent.push(...content);
    }

    /* ---------------- FILTER + SCORE ---------------- */

    const rankedContent = allContent
      .map((item) => {
        // 🔥 HARD LANGUAGE FILTER (IMPORTANT FIX)
        // if (item.original_language !== languageCode) return null;

        const score = calculateScore(
          item,
          { language: languageCode, mood },
          userStats
        );

        return { ...item, score };
      })
      .filter(Boolean) // remove nulls
      .sort((a, b) => b.score - a.score);

    /* ---------------- PAGINATION ---------------- */

    const start = (page - 1) * limit;
    const end = start + limit;

    const paginatedData = rankedContent
      .slice(start, end)
      .map(formatContent);

    return res.json({
      page,
      limit,
      hasMore: end < rankedContent.length,
      data: paginatedData,
    });

  } catch (error) {
    console.error("Recommend API failed:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

module.exports = { recommend };

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



    const userStats = await getUserStats(userId);

    const scoringContext = {
      ...userStats,      
      language: languageCode,
      mood,
    };



    let allContent = [];

    for (const type of types) {
      const content = await discoverContent({
        type,
        genre: genreId,
        language: languageCode,
      });

      allContent.push(...content);
    }

    /* ---------------- SCORING & RANKING ---------------- */

    const rankedContent = allContent
      .map((item) => ({
        ...item,
        score: calculateScore(item, scoringContext),
      }))
      .sort((a, b) => b.score - a.score);



    const start = (page - 1) * limit;
    const end = start + limit;

    const paginatedData = rankedContent
      .slice(start, end)
      .map(formatContent);

    res.json({
      page,
      limit,
      hasMore: end < rankedContent.length,
      data: paginatedData,
    });

  } catch (error) {
    console.error("Recommend API failed:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

module.exports = { recommend };

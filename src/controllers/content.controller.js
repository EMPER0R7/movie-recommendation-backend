const { getWatchProviders, getTrailer } = require("../services/tmdb.service");

async function getContentDetails(req, res) {
  try {
    const { type, id } = req.params;

    // Internal show
    if (type === "internal") {
      return res.json({
        trailer: null, // already included in recommendation
        watchProviders: {
          platform: "Bombay Canvas",
          inApp: true
        }
      });
    }

    // TMDB content
    const [watchProviders, trailer] = await Promise.all([
      getWatchProviders(type, id),
      getTrailer(type, id)
    ]);

    return res.json({
      trailer,
      watchProviders
    });

  } catch (error) {
    console.error("Content details error:", error);
    return res.status(500).json({ error: "Failed to fetch content details" });
  }
}

module.exports = { getContentDetails };
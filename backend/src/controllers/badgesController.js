import Badge from '../models/Badge.js';

const TIER_ORDER = { bronze: 1, silver: 2, gold: 3, platinum: 4 };

export const listMine = async (req, res) => {
  try {
    const badges = await Badge.listForUser(req.user.id);
    const tiers = badges.reduce(
      (acc, b) => {
        acc[b.tier] = (acc[b.tier] || 0) + 1;
        return acc;
      },
      { bronze: 0, silver: 0, gold: 0, platinum: 0 }
    );
    const topTier =
      Object.entries(tiers)
        .filter(([, count]) => count > 0)
        .sort((a, b) => TIER_ORDER[b[0]] - TIER_ORDER[a[0]])[0]?.[0] || null;

    res.json({ badges, counts: tiers, top_tier: topTier });
  } catch (err) {
    console.error('badges listMine error', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// server/api/deals.js
import scraper from '../index.js';

export default async function handler(req, res) {
  try {
    const deals = await scraper(
      "https://www.avenuedelabrique.com/promotions-et-bons-plans-lego"
    );

    res.status(200).json({
      success: true,
      data: {
        result: deals,
        meta: {
          count: deals.length,
          currentPage: 1,
          pageCount: 1
        }
      }
    });

  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
}
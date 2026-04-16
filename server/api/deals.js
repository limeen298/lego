import scraper from '../index.js';

export default async function handler(req, res) {
  try {
    const data = await scraper(
      'https://www.avenuedelabrique.com/promotions-et-bons-plans-lego'
    );

    res.status(200).json({
      success: true,
      data: {
        result: data,
        meta: {
          currentPage: 1,
          pageCount: 1,
          pageSize: data.length,
          count: data.length
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}
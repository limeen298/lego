import parseDomain from 'parse-domain';
import * as websites from './websites/index.js';

export default async function scraper(link) {
  const { domain: website } = parseDomain(link);

  if (!websites[website]) {
    throw new Error(`No scraper for ${website}`);
  }

  const deals = await websites[website].scrape(link);
  return deals;
}
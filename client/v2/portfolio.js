// Invoking strict mode https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Strict_mode#invoking_strict_mode
'use strict';

/**
Description of the available api
GET https://lego-api-blue.vercel.app/deals

Search for specific deals

This endpoint accepts the following optional query string parameters:

- `page` - page of deals to return
- `size` - number of deals to return

GET https://lego-api-blue.vercel.app/sales

Search for current Vinted sales for a given lego set id

This endpoint accepts the following optional query string parameters:

- `id` - lego set id to return
*/

// current deals on the page
let currentDeals = [];
let currentPagination = {};

// instantiate the selectors
const selectShow = document.querySelector('#show-select');
const selectPage = document.querySelector('#page-select');
const selectLegoSetIds = document.querySelector('#lego-set-id-select');
const sectionDeals= document.querySelector('#deals');
const spanNbDeals = document.querySelector('#nbDeals');
const selectFilters = document.querySelector('#filters-select');
const selectSort = document.querySelector('#sort-select');
const spanNbSales = document.querySelector('#nbSales');
const spanP5 = document.querySelector('#p5');
const spanP25 = document.querySelector('#p25');
const spanP50 = document.querySelector('#p50');
const spanLifetime = document.querySelector('#lifetime');
const sectionSales = document.querySelector('#sales');

/**
 * Set global value
 * @param {Array} result - deals to display
 * @param {Object} meta - pagination meta info
 */
const setCurrentDeals = ({result, meta}) => {
  currentDeals = result;
  currentPagination = meta;
};

/**
 * Fetch deals from api
 * @param  {Number}  [page=1] - current page to fetch
 * @param  {Number}  [size=12] - size of the page
 * @return {Object}
 */
const fetchDeals = async (page = 1, size = 6) => {
  try {
    const response = await fetch(
      `https://lego-server-3ua1gwde9-limeen298s-projects.vercel.app`
    );
    const body = await response.json();

    if (body.success !== true) {
      console.error(body);
      return {currentDeals, currentPagination};
    }

    return body.data;
  } catch (error) {
    console.error(error);
    return {currentDeals, currentPagination};
  }
};

const fetchSales = async (id) => {
  try {
    const response = await fetch(
      `https://lego-server-3ua1gwde9-limeen298s-projects.vercel.app`
    );
    const body = await response.json();

    if (body.success !== true) {
      console.error(body);
      return [];
    }

    return body.data.result;
  } catch (error) {
    console.error(error);
    return [];
  }
};

/**
 * Render list of deals
 * @param  {Array} deals
 */
const renderDeals = deals => {
  const fragment = document.createDocumentFragment();
  const div = document.createElement('div');
  const template = deals
    .map(deal => {
      return `
        <div class="deal" id=${deal.uuid}>
          <span>${deal.id}</span>
          <a href="${deal.link}" target="_blank">${deal.title}</a>
          <span>${deal.price}</span>
          <button class="fav-btn" data-id="${deal.uuid}">
            ${getFavorites().includes(deal.uuid) ? '❤️' : '🤍'}
          </button>
        </div>
      `;
    })
    .join('');

  div.innerHTML = template;
  fragment.appendChild(div);
 sectionDeals.innerHTML = `
  <h2 class="deals-title">Deals</h2>
  <div class="deals-container"></div>
`;

sectionDeals.querySelector('.deals-container').appendChild(fragment);

  const buttons = document.querySelectorAll('.fav-btn');

  buttons.forEach(button => {
    button.addEventListener('click', () => {
      const id = button.dataset.id;

      let favorites = getFavorites();

      if (favorites.includes(id)) {
        favorites = favorites.filter(fav => fav !== id);
      } else {
        favorites.push(id);
      }

      saveFavorites(favorites);

      render(currentDeals, currentPagination);
    });
  });
};

/**
 * Render page selector
 * @param  {Object} pagination
 */
const renderPagination = pagination => {
  const {currentPage, pageCount} = pagination;
  const options = Array.from(
    {'length': pageCount},
    (value, index) => `<option value="${index + 1}">${index + 1}</option>`
  ).join('');

  selectPage.innerHTML = options;
  selectPage.selectedIndex = currentPage - 1;
};

/**
 * Render lego set ids selector
 * @param  {Array} lego set ids
 */
const renderLegoSetIds = deals => {
  const ids = getIdsFromDeals(deals);
  const options = ids.map(id => 
    `<option value="${id}">${id}</option>`
  ).join('');

  selectLegoSetIds.innerHTML = options;
};

/**
 * Render page selector
 * @param  {Object} pagination
 */
const renderIndicators = pagination => {
  const {count} = pagination;

  spanNbDeals.innerHTML = count;
};

const render = (deals, pagination) => {
  renderDeals(deals);
  renderPagination(pagination);
  renderIndicators(pagination);
  renderLegoSetIds(deals)
};

/**
 * Render Sales
 */
const renderSales = (sales) => {
  const template = sales
    .map(sale => {
      return `
        <div>
          <a href="${sale.link}" target="_blank">Voir vente</a>
        </div>
      `;
    })
    .join('');

  sectionSales.innerHTML = "<h2>Sales</h2>" + template;
};

/**
 * Fonctions
 */
const getPercentile = (arr, percent) => {
  if (arr.length === 0) return 0;
  const index = Math.floor((percent / 100) * (arr.length - 1));
  return arr[index];
};

const getFavorites = () => {
  const favs = localStorage.getItem('favorites');
  return favs ? JSON.parse(favs) : [];
};

const saveFavorites = (favs) => {
  localStorage.setItem('favorites', JSON.stringify(favs));
};

/**
 * Declaration of all Listeners
 */

/**
 * Select the number of deals to display
 */

document.addEventListener('DOMContentLoaded', async () => {
  const deals = await fetchDeals();

  setCurrentDeals(deals);
  render(currentDeals, currentPagination);

  selectShow.addEventListener('change', async (event) => {
    const deals = await fetchDeals(currentPagination.currentPage, parseInt(event.target.value));

    setCurrentDeals(deals);
    render(currentDeals, currentPagination);
  });

  selectPage.addEventListener('change', async (event) => {
    const page = parseInt(event.target.value);

    const deals = await fetchDeals(page, currentPagination.pageSize);

    setCurrentDeals(deals);
    render(currentDeals, currentPagination);
  });

  selectFilters.addEventListener('change', () => {
    const value = selectFilters.value;

    let filteredDeals = [...currentDeals];

    if (value === "discount") {
      filteredDeals = filteredDeals
        .filter(deal => deal.discount > 10)
        .sort((a, b) => b.discount - a.discount);
    }

    if (value === "comment") {
      filteredDeals = filteredDeals
        .sort((a, b) => b.comments - a.comments);
    }

    if (value === "hot") {
      filteredDeals = filteredDeals
        .sort((a, b) => b.temperature - a.temperature);
    }

    if (value === "favorites") {
      const favorites = getFavorites();
      filteredDeals = filteredDeals.filter(deal =>
        favorites.includes(deal.uuid)
      );
    }

    render(filteredDeals, currentPagination);
  });

  selectSort.addEventListener('change', () => {
    const value = selectSort.value;

    let sortedDeals = [...currentDeals];

    if (value === "price-asc") {
      sortedDeals.sort((a, b) => a.price - b.price);
    }

    if (value === "price-desc") {
      sortedDeals.sort((a, b) => b.price - a.price);
    }

    if (value === "date-asc") {
      sortedDeals.sort((a, b) => new Date(b.published) - new Date(a.published));
    }

    if (value === "date-desc") {
      sortedDeals.sort((a, b) => new Date(a.published) - new Date(b.published));
    }

    render(sortedDeals, currentPagination);
  });


  selectLegoSetIds.addEventListener('change', async (event) => {
    const id = event.target.value;

    const sales = await fetchSales(id);

    // Afficher les ventes
      renderSales(sales);

    // Nombre de ventes
    spanNbSales.textContent = sales.length;

    /**
     * LIFETIME (durée entre 1ère et dernière vente)
     */
    const dates = sales
      .map(sale => new Date(sale.published * 1000))
      .filter(date => !isNaN(date))
      .sort((a, b) => a - b);

    if (dates.length === 0) {
      spanLifetime.textContent = "0 days";
    } else {
      const firstDate = dates[0];
      const lastDate = dates[dates.length - 1];

      const diffTime = lastDate - firstDate;
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      spanLifetime.textContent = diffDays + " days";
    }

    /**
     * PRIX (percentiles)
     */
    const prices = sales
      .map(sale => parseFloat(sale.price.amount))
      .filter(price => !isNaN(price))
      .sort((a, b) => a - b);

    if (prices.length === 0) {
      spanP5.textContent = 0;
      spanP25.textContent = 0;
      spanP50.textContent = 0;
      return;
    }

    const p5 = getPercentile(prices, 5);
    const p25 = getPercentile(prices, 25);
    const p50 = getPercentile(prices, 50);

    spanP5.textContent = p5;
    spanP25.textContent = p25;
    spanP50.textContent = p50;
  });

});

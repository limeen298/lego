// current deals on the page
let currentDeals = [];
let currentPagination = {};

// instatiate the selectors
const selectShow = document.querySelector('#show-select');
const selectPage = document.querySelector('#page-select');
const selectLegoSetIds = document.querySelector('#lego-set-id-select');
const sectionDeals = document.querySelector('#deals');
const spanNbDeals = document.querySelector('#nbDeals');

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
 * @param {Number} [page=1] - current page to fetch
 * @param {Number} [size=12] - size of the page
 * @return {Object}
 */
const fetchDeals = async (page = 1, size = 6) => {
    try {
        const response = await fetch(
        `https://lego-api-blue.vercel.app/deals?page=${page}&size=${size}`
        );
        const body = await response.json();
        
        if (body.success !== true) {
            console.error(body);
            return {currentDeals, currentPagination};
        }

        return body.data;
    }
    catch (error) {
        console.error(error);
    }
}

const renderDeals = () => {
  sectionDeals.innerHTML = "";

  currentDeals.forEach((deal) => {
    const div = document.createElement("div");

    div.innerHTML = `
      <a href="${deal.url}" target="_blank">
        ${deal.title}
      </a>
      - ${deal.price}€
    `;

    sectionDeals.appendChild(div);
  });

  spanNbDeals.textContent = currentDeals.length;
};

const init = async () => {
  const data = await fetchDeals(1, 6);

  setCurrentDeals(data);

  renderDeals();
};

init();
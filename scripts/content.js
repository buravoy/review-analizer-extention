const paramSet = {
  market: {
    review_wrap_selector: '[data-auto=review-item]',
    review_text_selector: '[itemprop=description]',
    parseFn: (ctx) => ctx.getAttribute('content'),
  },

  ozon: {

  },

  wildberries: {

  }
}

const siteDetect = () => {
  if (location.host.includes('market')) return 'market';
  if (location.host.includes('ozon')) return 'ozon';
  if (location.host.includes('wildberries')) return 'wildberries';
  return null
}

const globalParser = (param) => {
  const reviews = document.querySelectorAll(`${param.review_wrap_selector}:not([parsed=true])`);

  for (const review of reviews) {
    const uid = (Date.now() + Math.random()).toString(32);
    review.setAttribute('parsed', 'true');
    review.setAttribute('data-uid', uid);
    const div = document.createElement('div');
    div.setAttribute('class', 'badge');
    div.innerText = `parsed: ${uid}`
    const context = review.querySelector(param.review_text_selector);

    console.log( param.parseFn(context) );

    review.appendChild(div);
  }
}

const site = siteDetect();

if (site) {
  window.addEventListener('scroll', () => globalParser( paramSet[site]));
}

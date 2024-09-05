const paramSet = {
  market: {
    review_wrap_selector: '[data-auto=review-item]',
    review_text_selector: '[itemprop=description]',
    parseFn: (ctx) => ctx.getAttribute('content'),
  },

  ozon: {

  },

  wb: {

  }
}

const siteDetect = () => {
  const host = location.host;

  if (host.includes('market')) {
    return 'market'
  }

  if (host.includes('ozon')) {
    return 'ozon'
  }

  if (host.includes('wildberries')) {
    return 'wildberries'
  }
}

const param = paramSet[siteDetect()];

const globalParser = async () => {
  const reviews = document.querySelectorAll(`${param.review_wrap_selector}:not([parsed=true])`);

  for (const review of reviews) {
    const uid = (Date.now() + Math.random()).toString(32);
    review.setAttribute('parsed', 'true');
    review.setAttribute('data-uid', uid);
    const div = document.createElement('div');
    div.setAttribute('class', 'badge');
    div.innerText = `parsed: ${uid}`
    review.appendChild(div);
    const context = review.querySelector(param.review_text_selector);
    console.log(param.parseFn(context));
    await new Promise(res => setTimeout(res, 0))
  }
}

window.addEventListener('scroll', globalParser);

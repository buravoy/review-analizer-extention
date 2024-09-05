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

const site = siteDetect();
const param = paramSet[site]

const placeBadge = ({analysis}) => {


  // analysis.forEach((i) => {
  //   const div = document.createElement('div');
  //   div.setAttribute('class', 'badge');
  //   div.innerText = `parsed: ${i.uid}`
  //   const review = document.querySelector(`${param.review_wrap_selector} [parsed=true]`);
  //   review.appendChild(div)
  // })
}

const fetchApi = (data) => {
  // fake api request
  new Promise((resolve) => {
    setTimeout(() => {
      const res = {
        analysis: data.map((i) => {
          return {
            uid: i.uid,
            origin: i.comment,
            sentiment: "positive",
            confidence: 0.95
          }
        })
      }

      console.log('response', res)

      resolve(res)
    }, 1000)
  }).then(placeBadge);


  // todo:
  //  fetch('url', {
  //    method: 'POST',
  //    body: JSON.stringify(data),
  //  })
  //   .then(res => res.json())
  //   .then(placeBadge)
}

const globalParser = () => {
  const reviews = document.querySelectorAll(`${param.review_wrap_selector}:not([parsed=true])`);
  if (!reviews || reviews.length === 0) return;

  let dataArray = [];

  for (const review of reviews) {
    const uid = (Date.now().toString(16) + Math.random().toString(16).slice(2));
    review.classList.add('analyze');
    review.setAttribute('parsed', 'true');
    review.setAttribute('data-uid', uid);

    const context = review.querySelector(param.review_text_selector);

    dataArray.push({
      uid: uid,
      comment: param.parseFn(context)
    })
  }

  console.log('request', dataArray)

  fetchApi(dataArray);
}

if (site) {
  window.addEventListener('scroll', () => globalParser());
}

const paramSet = {
  market: {
    review_wrap_selector: '[data-auto="review-item"]',
    parseFn: (ctx) => {
      const el = ctx.querySelector('[itemprop="description"]');
      return el?.getAttribute('content')
    },
  },

  ozon: {
    review_wrap_selector: '[data-review-uuid]',
    parseFn: (ctx) => {
      const el = ctx.children[1]?.children[1];
      return el?.querySelector('span')?.textContent.trim();
    },
  },

  wildberries: {
    review_wrap_selector: '[itemprop="review"]',
    parseFn: (ctx) => {
      const el = ctx.querySelector('[itemprop="reviewBody"]');
      return el?.textContent.trim();
    },
  }
}

const siteDetect = () => {
  if (location.host.includes('market')) return 'market';
  if (location.host.includes('ozon')) return 'ozon';
  if (location.host.includes('wildberries')) return 'wildberries';
  return null;
}

const site = siteDetect();
const param = paramSet[site]

let parseCount = 0;

const placeBadge = ({analysis}) => {
  parseCount += analysis.length

  chrome.runtime.sendMessage({
    from: 'content',
    subject: 'dataset',
    info: {count: parseCount}
  }).then();


  analysis.forEach((i) => {
    const div = document.createElement('div');
    div.classList.add('badge');
    div.classList.add(i.sentiment);

    const sentimentSmile = (sent) => {
      switch (sent) {
        case 'positive': return '🤩';
        case 'negative': return '🤬';
        case 'neutral': return '🙄';
      }
    }

    let innerHtml = `<span class="smile" title="Наша оценка отзыва">${sentimentSmile(i.sentiment)}</span><span class="confidence" title="Степень достоверности нашей оценки">${i.confidence}</span>`;
    if (i.robot) innerHtml = `<span class="robot" title="Похоже отзыв написан не человеком или ради накрутки">${i.robot}</span>` + innerHtml;
    div.innerHTML = innerHtml;
    const review = document.querySelector(`[data-uid="${i.uid}"]`);
    review.appendChild(div);
  })
}

const fetchApi = (data) => {
  // fake api request
  new Promise((resolve) => {
    const sentiments = ['positive', 'negative', 'neutral'];

    setTimeout(() => {
      const res = {
        analysis: data.map((i) => {
          return {
            uid: i.uid,
            origin: i.comment,
            sentiment: sentiments[Math.floor(Math.random() * sentiments.length)],
            confidence: Math.random().toFixed(2),
            robot: Math.random() < 0.5 ? '🤖' : ''
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
  if (!reviews.length) return;

  let dataArray = [];

  for (const review of reviews) {
    const uid = (Date.now().toString(16) + Math.random().toString(16).slice(2));
    review.classList.add('analyze');
    review.setAttribute('parsed', 'true');
    review.setAttribute('data-uid', uid);

    dataArray.push({
      uid: uid,
      comment: param.parseFn(review)
    })
  }

  console.log('request', dataArray)

  fetchApi(dataArray);
}




chrome.runtime.sendMessage({
  from: 'content',
  subject: site ? 'enable' : 'disable',
}).then();


if (site) {
  chrome.runtime.sendMessage({
    from: 'content',
    subject: 'init',
  }).then();

  chrome.runtime.sendMessage({
    from: 'content',
    subject: 'dataset',
    info: { market: site }
  }).then();

  window.addEventListener('scroll', () => globalParser());
}



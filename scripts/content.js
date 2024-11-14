const paramSet = {
    market: {
        review_wrap_selector: '[data-auto="review-item"]',
        parseFn: (ctx) => {
            const el = ctx.querySelector('script');
            try {
                const json = JSON.parse(el?.textContent)
                return json.review.reviewBody;
            } catch {
                return '';
            }
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

const siteDetect = (native) => {
    if (location.host.includes('market')) return native ? 'Яндекс маркет' : 'market';
    if (location.host.includes('ozon')) return native ? 'OZON' : 'ozon';
    if (location.host.includes('wildberries')) return native ? 'Wildberries' : 'wildberries';
    return null;
}

const site = siteDetect();
const param = paramSet[site]

let countPositive = 0;
let countNegative = 0;
let countNeutral = 0;
let confidence = 0;

const sentimentPrepare = (sent) => {
    switch (sent) {
        case 'positive':
            countPositive++;
            return {title: 'Полезный отзыв', icon: '🔥'};

        case 'negative':
            countNegative++;
            return {title: 'Бесполезный отзыв', icon: '😶'};

        case 'neutral':
            countNeutral++;
            return {title: 'Нейтральный отзыв', icon: '💩'};
    }
}

const placeBadge = (i) => {
    const div = document.createElement('div');
    div.classList.add('badge');
    div.classList.add(i.sentiment);

    confidence += +i.confidence

    const sentiment = sentimentPrepare(i.sentiment);

    let innerHtml = `<span class="smile" title="${sentiment.title}">${sentiment.icon}</span><span class="confidence" title="Степень достоверности нашей оценки">${i.confidence}</span>`;
    div.innerHTML = innerHtml;
    const review = document.querySelector(`[data-uid="${i.uid}"]`);
    review.classList.add(i.sentiment);

    review.appendChild(div);


    console.log({countPositive, countNegative, countNeutral, confidence})

    chrome.runtime.sendMessage({
        from: 'content',
        subject: 'dataset',
        info: {countPositive, countNegative, countNeutral, confidence}
    }).then();
}

const fetchApi = (dataArr) => {
    dataArr.forEach(data => {
        const {uid, comment} = data;
        console.log(data)
        fetch('http://127.0.0.1:8000/analyze_review', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({'uid': uid, 'comment': comment}),
        })
            .then(res => res.json())
            .then(placeBadge)
    })
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

chrome.runtime.onMessage.addListener((msg, sender) => {
    console.log(msg, sender)
    if (msg.from === 'popup') {
        switch (msg.subject) {
            case 'toggle_visible':
                return document.querySelectorAll('.analyze .badge').forEach(el => {
                    msg.value ? el.classList.add('hide') : el.classList.remove('hide');
                });

            case 'toggle_positive':
            case 'toggle_negative':
            case 'toggle_neutral':
        }
    }
});

if (site) {
    chrome.runtime.sendMessage({
        from: 'content',
        subject: 'init',
    }).then();

    chrome.runtime.sendMessage({
        from: 'content',
        subject: 'dataset',
        info: {market: siteDetect(true)}
    }).then();

    window.addEventListener('scroll', () => globalParser());
}



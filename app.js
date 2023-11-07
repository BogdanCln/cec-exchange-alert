import { JSDOM } from 'jsdom';
import notifier from 'node-notifier';

let cachedReport = null;

async function requestWebpage() {
    const response = await fetch('https://www.cec.ro/istoric-curs-valutar?c=2&v=EUR');
    return response.text();
}

function checkReportDiff(report) {
    if (report['Data'] !== cachedReport['Data']) {
        const diff = Number(cachedReport['Vânzare']) - Number(report['Vânzare']);

        notifier.notify({
            title: 'CEC new exchange',
            message: `${ report['Data'] } diff ${ diff }`
        });

        console.log(report);
    }
}

function generateReport(html) {
    const dom = new JSDOM(html);
    const rows = dom.window.document.querySelectorAll('tr');

    const attributes = [...rows[0].querySelectorAll('th')].map(h => h.textContent);
    const latestValues = [...rows[1].querySelectorAll('td')].map(h => h.textContent);

    let report = {};

    for (const [i, attribute] of Object.entries(attributes)) {
        report[attribute] = latestValues[i];
    }

    return report;
}


const sleep = ms => new Promise(r => {
    setTimeout(r, ms)
});

async function main() {
    const html = await requestWebpage();
    const report = generateReport(html);

    if (cachedReport) {
        checkReportDiff(report);
    }

    cachedReport = report;

    await sleep(60000);

    await main();
}

notifier.notify({
    title: 'CEC exchange',
    message: `scraping...`
});

main();

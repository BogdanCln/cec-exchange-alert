import notifier from 'node-notifier';
import sleep from './sleep.js';
import job from './job.js';
import os from 'node:os';

const SCRAPING_INTERVAL_MS = 1000 * 50 * 5;

function notifyBeforeExit() {
    notifier.notify({
        title: 'CEC exchange',
        message: `process stopped`,
        timeout: 3600,
        sound: true
    });

    process.exit(os.constants.signals.SIGINT);
}

async function bootstrap() {
    process.once('SIGINT', notifyBeforeExit);
    process.once('SIGTERM', notifyBeforeExit);
    process.once('SIGTSTP', notifyBeforeExit);

    notifier.notify({
        title: 'CEC exchange',
        message: `process started`,
        timeout: 3600,
        sound: true
    });

    while (true) {
        try {
            await job();
        } catch (e) {
            notifier.notify({
                title: 'CEC exchange',
                message: 'Error, check logs',
                timeout: 3600,
                sound: true
            });

            console.error(e);
        } finally {
            await sleep(SCRAPING_INTERVAL_MS);
        }
    }
}

bootstrap();

import 'dotenv/config';
const copartCalendarUrl = 'https://www.copart.com/salesListResult';
import puppeteer, { type GoToOptions } from 'puppeteer';
import { CalendarType, createEmptyCalendarList } from '@/lib/types/calendar-type';

const pageOptions: GoToOptions = {
	waitUntil: 'networkidle0',
	timeout: 0,
};

export default async function scrapeCopartCalendar(signal?: AbortSignal) {
	const totalSteps = 4;
	console.log(`Launching Calendar scraper 1/${totalSteps}`);
	const scrapedCalendarMonth: CalendarType = createEmptyCalendarList();
	const options = {
		headless: false, // set to true in production
		args: ['--no-sandbox', '--disable-setuid-sandbox'],
	};

	const stopScraper = () => {
		void browser?.close();
	};

	if (signal?.aborted) {
		throw new Error('Scraping cancelled');
	}

	signal?.addEventListener('abort', stopScraper, { once: true });

	const browser = await puppeteer.launch(options);
	const page = await browser.newPage();

	try {
		console.log('Launching Copart calendar page:', copartCalendarUrl, `2/${totalSteps}`);
		await page.goto(copartCalendarUrl, pageOptions);
		await page.waitForSelector('[data-uname="saleslistSaletimeval"]', {
			timeout: 10000,
			visible: true,
		});

		const data = await page.$$eval('tr.odd, tr.even', (els) => {
			return els
				.map((el) => {
					return {
						saleTime: el.querySelector('[data-uname="saleslistSaletimeval"]')?.textContent?.trim() || '',
						saleName: el.querySelector('[data-uname="saleslistLocationval"]')?.textContent?.trim() ?? null,
						saleType: el.querySelector('[access-value="showSalesType"]')?.textContent?.trim() ?? null,
						currentSale: el.querySelector('[data-uname="saleslistCurrentsaleval"]')?.textContent?.trim() ?? null,
						currentSaleUrl: (el.querySelector('[data-uname="saleslistCurrentsaleval"]') as HTMLAnchorElement | null)?.href ?? null,
						nextSale: el.querySelector('[data-uname="saleslistNextsaleval"]')?.textContent?.trim() ?? null,
						nextSaleUrl: (el.querySelector('[data-uname="saleslistNextsaleval"]') as HTMLAnchorElement | null)?.href ?? null,
						numOfLots: null,
						saleId: null,
						buyItNow: null,
						scrapedAt: new Date().toISOString(),
					};
				})
				.filter((item): item is NonNullable<typeof item> => item !== null);
		});

		console.log(`Scraped ${data.length} rows. 3/${totalSteps}`);
		scrapedCalendarMonth.auctions = data;
		scrapedCalendarMonth.scrapedAt = new Date();
		scrapedCalendarMonth.totalAuctions = data.length;
		return scrapedCalendarMonth;
	} catch (e) {
		console.error('Scraping error:', e);

		return createEmptyCalendarList();
	} finally {
		signal?.removeEventListener('abort', stopScraper);
		console.log(`Closing Calendar scraper 4/${totalSteps}`);

		await browser?.close().catch(() => undefined);
	}
}

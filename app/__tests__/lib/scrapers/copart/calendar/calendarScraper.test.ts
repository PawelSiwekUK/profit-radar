import scrapeCopartCalendar from '@/lib/scrapers/copart/calendar/calendarScraper';
import puppeteer from 'puppeteer';

jest.mock('puppeteer', () => ({
	__esModule: true,
	default: {
		launch: jest.fn(),
	},
}));

describe('scrapeCopartCalendar', () => {
	it('maps Copart rows into the calendar auction schema', async () => {
		const mockPage = {
			goto: jest.fn().mockResolvedValue(undefined),
			waitForSelector: jest.fn().mockResolvedValue(undefined),
			$$eval: jest.fn().mockResolvedValue([
				{
					saleTime: '03:00 PM GMT+1',
					saleName: 'FL - Ft. Pierce',
					saleType: 'Copart US',
					currentSale: 'September 9, 2026',
					currentSaleUrl: 'https://copart.example/current',
					nextSale: 'September 16, 2026',
					nextSaleUrl: 'https://copart.example/next',
					numOfLots: null,
					saleId: null,
					buyItNow: null,
					scrapedAt: new Date().toISOString(),
				},
			]),
		};

		const mockBrowser = {
			newPage: jest.fn().mockResolvedValue(mockPage),
			close: jest.fn().mockResolvedValue(undefined),
		};

		(puppeteer.launch as jest.Mock).mockResolvedValue(mockBrowser);

		const result = await scrapeCopartCalendar();

		expect(result.totalAuctions).toBe(1);
		expect(result.auctions[0].saleName).toBe('FL - Ft. Pierce');
		expect(result.auctions[0].currentSaleUrl).toContain('copart.example/current');
		expect(result.auctions[0].nextSale).toBe('September 16, 2026');
	});
});

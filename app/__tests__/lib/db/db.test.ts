import { CalendarType } from '@/lib/types/calendar-type';
import { updateCalendar } from '@/lib/db/db';

// Tests
// Tested for saving into database new calendar object if there is non.
// Tested for not saving anything if there are no new sales.
// Tested for adding new sale list to database.
// Tested for not saving duplicates if there are in the scraped data object.

// Mock mongoose before anything else
jest.mock('mongoose', () => ({
	connect: jest.fn().mockResolvedValue({}),
	connection: { readyState: 1 }, // readyState 1 = connected, so connectDB returns early
	Types: { ObjectId: jest.fn() },
	model: jest.fn(),
	models: {},
	Schema: jest.fn().mockImplementation(() => ({})),
}));

// Mock env var required by connectDB
process.env.MONGODB_URI = 'mongodb://mock-uri';

jest.mock('@/lib/db/models', () => {
	const mockSave = jest.fn().mockResolvedValue({});
	const MockCalendarSaleModel = jest.fn().mockImplementation(() => ({ save: mockSave })) as jest.Mock & {
		find: jest.Mock;
		updateOne: jest.Mock;
	};
	MockCalendarSaleModel.find = jest.fn();
	MockCalendarSaleModel.updateOne = jest.fn();
	return {
		CalendarSaleModel: MockCalendarSaleModel,
		LotDetailsModel: jest.fn(),
	};
});

import { CalendarSaleModel } from '@/lib/db/models';

describe('updateCalendar', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	it('creates a new calendar if none exists', async () => {
		(CalendarSaleModel.find as jest.Mock).mockResolvedValueOnce([]);
		const scrapedCalendar: CalendarType = {
			auctions: [
				{
					currentSaleUrl: 'url1',
					saleTime: null,
					saleName: null,
					saleType: null,
					currentSale: null,
					nextSale: null,
					nextSaleUrl: null,
					saleId: null,
					numOfLots: null,
					buyItNow: null,
					scrapedAt: null,
				},
			],
			totalAuctions: 1,
			scrapedAt: null,
		};
		const result = await updateCalendar(scrapedCalendar);
		expect(result.message).toMatch(/Saved initial calendar with sale lists!/);
	});

	it('does nothing if there are no new sales', async () => {
		(CalendarSaleModel.find as jest.Mock).mockResolvedValueOnce([{ auctions: [{ currentSaleUrl: 'url1' }], totalAuctions: 1 }]);
		const scrapedCalendar: CalendarType = {
			auctions: [
				{
					currentSaleUrl: 'url1',
					saleTime: null,
					saleName: null,
					saleType: null,
					currentSale: null,
					nextSale: null,
					nextSaleUrl: null,
					saleId: null,
					numOfLots: null,
					buyItNow: null,
					scrapedAt: null,
				},
			],
			totalAuctions: 1,
			scrapedAt: null,
		};
		const result = await updateCalendar(scrapedCalendar);
		expect(result.message).toMatch(/There are no new sale lists to save!/i);
	});

	it('appends new sales and updates totalAuctions', async () => {
		(CalendarSaleModel.find as jest.Mock).mockResolvedValueOnce([{ _id: 'id1', auctions: [{ currentSaleUrl: 'url1' }], totalAuctions: 1 }]);
		(CalendarSaleModel.updateOne as jest.Mock).mockResolvedValueOnce({ modifiedCount: 1 });
		const scrapedCalendar: CalendarType = {
			auctions: [
				{
					currentSaleUrl: 'url1',
					saleTime: null,
					saleName: null,
					saleType: null,
					currentSale: null,
					nextSale: null,
					nextSaleUrl: null,
					saleId: null,
					numOfLots: null,
					buyItNow: null,
					scrapedAt: null,
				},
				{
					currentSaleUrl: 'url2',
					saleTime: null,
					saleName: null,
					saleType: null,
					currentSale: null,
					nextSale: null,
					nextSaleUrl: null,
					saleId: null,
					numOfLots: null,
					buyItNow: null,
					scrapedAt: null,
				},
			],
			totalAuctions: 2,
			scrapedAt: null,
		};
		const result = await updateCalendar(scrapedCalendar);
		expect(result.updatedCalendar).toBe(true);
		expect(result.databaseChanges).toBe(1);
	});

	it('checks if the duplicates are not saved and only one sale from duplicate is saved', async () => {
		(CalendarSaleModel.find as jest.Mock).mockResolvedValueOnce([{ _id: 'id1', auctions: [{ currentSaleUrl: 'url1' }], totalAuctions: 1 }]);
		const scrapedCalendar: CalendarType = {
			auctions: [
				{
					currentSaleUrl: 'url1',
					saleTime: null,
					saleName: null,
					saleType: null,
					currentSale: null,
					nextSale: null,
					nextSaleUrl: null,
					saleId: null,
					numOfLots: null,
					buyItNow: null,
					scrapedAt: null,
				},
				{
					currentSaleUrl: 'url1',
					saleTime: null,
					saleName: null,
					saleType: null,
					currentSale: null,
					nextSale: null,
					nextSaleUrl: null,
					saleId: null,
					numOfLots: null,
					buyItNow: null,
					scrapedAt: null,
				},
			],
			totalAuctions: 2,
			scrapedAt: null,
		};
		const result = await updateCalendar(scrapedCalendar);
		expect(result.updatedCalendar).toBe(false);
		expect(result.databaseChanges).toBe(0);
	});

	it('handles database errors gracefully', async () => {
		(CalendarSaleModel.find as jest.Mock).mockRejectedValueOnce(new Error('DB error'));
		const scrapedCalendar: CalendarType = { auctions: [], totalAuctions: 0, scrapedAt: null };
		await expect(updateCalendar(scrapedCalendar)).rejects.toThrow('DB error');
	});
});

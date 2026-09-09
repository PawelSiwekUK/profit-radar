import mongoose from 'mongoose';
import 'dotenv/config';
import { CalendarSaleModel, LotDetailsModel } from './models';
import { CalendarType, SaleListType } from '@/lib/types/calendar-type';
import { LotDetailsType, LotWithProfitStatusType } from '@/lib/types/lotDetails-type';

const MONGODB_URI = process.env.MONGODB_URI;

let cachedConnection: typeof mongoose | null = null;

export async function connectDB() {
	if (cachedConnection && mongoose.connection.readyState === 1) return cachedConnection;
	const uri = MONGODB_URI;
	if (!uri) {
		throw new Error('MONGODB_URI environment variable is not defined');
	}
	cachedConnection = await mongoose.connect(uri, {
		dbName: process.env.MONGODB_DB || 'profit_radar',
	});
	return cachedConnection;
}

export async function getAllSalesLists() {
	await connectDB();
	return await CalendarSaleModel.find({});
}
export async function getAllLots() {
	await connectDB();
	return await LotDetailsModel.find({});
}

export async function getOneLotById(id: string) {
	await connectDB();

	if (mongoose.Types.ObjectId.isValid(id)) {
		const lotByObjectId = await LotDetailsModel.findById(id);
		if (lotByObjectId) {
			return lotByObjectId;
		}
	}

	return await LotDetailsModel.findOne({ lotInv: id });
}

export async function updateCalendar(scrapedCalendar: CalendarType) {
	const databaseEntries = await getAllSalesLists();
	let message = '';
	let updatedCalendar = false;
	let databaseChanges = 0;
	let newScrapedSales;

	if (databaseEntries && databaseEntries.length === 0) {
		try {
			await connectDB();
			const CalendarSaleList = new CalendarSaleModel(scrapedCalendar);
			await CalendarSaleList.save();
			message = 'Saved initial calendar with sale lists!';
		} catch (error) {
			message = error instanceof Error ? error.message : String(error);
		}
	}

	if (databaseEntries && databaseEntries[0] && databaseEntries[0].auctions.length > 0) {
		const currentNumberOfSales = databaseEntries[0].totalAuctions;
		try {
			const savedAuctions = databaseEntries[0].auctions;
			newScrapedSales = scrapedCalendar.auctions.filter((scrapedSale) => {
				return !savedAuctions.some((savedSale: SaleListType) => {
					return savedSale.currentSaleUrl === scrapedSale.currentSaleUrl;
				});
			});

			if (newScrapedSales.length === 0) {
				message = 'There are no new sale lists to save!';
				return {
					message,
					updatedCalendar,
					databaseChanges,
					newScrapedSales,
				};
			}

			if (newScrapedSales && newScrapedSales.length > 0) {
				await CalendarSaleModel.updateOne(
					{
						_id: databaseEntries[0]._id,
					},
					{
						$push: {
							auctions: { $each: newScrapedSales },
						},
						$set: { totalAuctions: currentNumberOfSales + newScrapedSales.length },
					},
				);

				databaseChanges = newScrapedSales.length;
				message = databaseChanges > 0 ? `Saved ${databaseChanges} new sales list saved to database.` : `No new sales scrapped!`;
				updatedCalendar = true;
			}
		} catch (error) {
			message = error instanceof Error ? error.message : String(error);
		}
	}
	return {
		message,
		updatedCalendar,
		databaseChanges,
		newScrapedSales,
	};
}

export async function saveLots(lots: LotDetailsType[]) {
	if (!lots || lots.length === 0) {
		console.log('No lots to save');
		return { savedCount: 0 };
	}

	try {
		await connectDB();
		const result = await LotDetailsModel.insertMany(lots);
		console.log(`${result.length} lots saved to database successfully!`);
		return {
			savedCount: result.length,
			savedToDb: true,
		};
	} catch (e) {
		console.error('Error saving lots:', e);
		throw e;
	}
}

export async function saveSalesList(_id: string, SalesList: LotDetailsType[]) {
	await connectDB();
	const auctionId = new mongoose.Types.ObjectId(_id); // nested auction _id
	const parentDoc = await CalendarSaleModel.findOne({ 'auctions._id': auctionId });
	const parentId = parentDoc?._id;
	try {
		if (auctionId && SalesList) {
			await CalendarSaleModel.updateOne(
				{ _id: parentId, 'auctions._id': auctionId },
				{ $set: { 'auctions.$.lotList': SalesList, 'auctions.$.numOfLots': SalesList.length } },
			);
		} else {
			console.log('There is no sales Id or updated sales list to be saved!!');
		}
	} catch (e) {
		console.log(e);
	}

	try {
		if (auctionId && SalesList) {
			console.log('Data saved to sale list and db updated');
		} else {
			console.log('There is no sales Id or updated sales list to be saved!!');
		}
	} catch (e) {
		console.log(e);
	}

	return {
		savedToDb: true,
	};
}

export async function getOneSalesList(id: string) {
	if (!mongoose.Types.ObjectId.isValid(id)) {
		throw new Error('Invalid ObjectId');
	}
	const nestedId = new mongoose.Types.ObjectId(id);
	await connectDB();
	const parentDoc = await CalendarSaleModel.findOne({ 'auctions._id': nestedId });
	let nestedAuction = null;
	if (parentDoc && Array.isArray(parentDoc.auctions)) {
		nestedAuction = parentDoc.auctions.find((auction: SaleListType) => {
			if (auction._id) {
				return auction._id.toString() === nestedId.toString();
			}
		});
	}
	if (nestedAuction) {
		return nestedAuction;
	}
	console.log('No auction found!!');
}

export async function updateLotProfitStatus(LotDetails: LotWithProfitStatusType) {
	await connectDB();
	let message = 'No profitStatus payload to save.';
	if (LotDetails.profitStatus) {
		try {
			const filter = LotDetails._id ? { _id: LotDetails._id } : { lotInv: LotDetails.lotInv };
			const updatedLot = await LotDetailsModel.findOneAndUpdate(
				filter,
				{
					$set: {
						profitStatus: LotDetails.profitStatus,
					},
				},
				{ new: true },
			);

			if (!updatedLot) {
				message = `Lot not found for update: ${LotDetails._id ?? LotDetails.lotInv}`;
			} else {
				message = `Lot saved to database: ${updatedLot._id}`;
			}
		} catch (error) {
			if (error) {
				message = error instanceof Error ? error.message : String(error);
			}
		}
	}

	return {
		message,
	};
}

export async function getDuplicateSales() {
	await connectDB();

	return CalendarSaleModel.aggregate([
		{ $unwind: '$auctions' },
		{
			$match: {
				'auctions.currentSaleUrl': {
					$exists: true,
					$nin: [null, ''],
				},
			},
		},
		{
			$group: {
				_id: '$auctions.currentSaleUrl',
				count: { $sum: 1 },
				entries: {
					$push: {
						calendarId: '$_id',
						auctionId: '$auctions._id',
						saleName: '$auctions.saleName',
						currentSale: '$auctions.currentSale',
						currentSaleUrl: '$auctions.currentSaleUrl',
					},
				},
			},
		},
		{ $match: { count: { $gt: 1 } } },
		{ $sort: { count: -1 } },
	]);
}

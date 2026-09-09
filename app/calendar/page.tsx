'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Calendar from './calendar';
import { CalendarType, SaleListType } from '@/lib/types/calendar-type';
import { format } from 'date-fns';

const isCalendarMonthArray = (value: unknown): value is CalendarType[] => {
	if (!Array.isArray(value)) return false;
	return value.every((month) => typeof month === 'object' && month !== null && Array.isArray((month as CalendarType).auctions));
};

const unwrapCalendarMonths = (payload: unknown): CalendarType[] => {
	if (isCalendarMonthArray(payload)) return payload;

	if (payload && typeof payload === 'object' && 'data' in payload) {
		const data = (payload as { data?: unknown }).data;
		if (isCalendarMonthArray(data)) {
			return data;
		}
	}

	return [];
};

export default function CalendarPage() {
	const router = useRouter();
	const [sales, setSales] = useState<CalendarType[]>([]);
	const [isRefreshing, setIsRefreshing] = useState(false);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const getTodaysEvents = (events: SaleListType[]) => {
		const todayIso = format(new Date(), 'yyyy-MM-dd');
		return events.filter((evt) => {
			if (evt.currentSale === 'LIVE NOW' || !evt.currentSale) return false;
			return format(new Date(evt.currentSale), 'yyyy-MM-dd') === todayIso;
		});
	};

	useEffect(() => {
		const fetchSales = async () => {
			setLoading(true);
			try {
				const response = await fetch('/api/copart/db/getAllSaleLists');
				if (!response.ok) {
					throw new Error(`Failed to fetch calendar data: ${response.status}`);
				}

				const payload: unknown = await response.json();
				const months = unwrapCalendarMonths(payload);

				if (months.length > 0) {
					setSales(months);
					console.log('Calendar data fetched!!');
				} else {
					setError('No Calendar fetched from the Database');
				}
			} catch (e) {
				console.log(e);
				setError('Error fetching data');
			} finally {
				setLoading(false);
			}
		};
		fetchSales();
	}, []);

	return (
		<div className='min-h-screen bg-gray-50 py-6 px-4 sm:px-6 lg:px-8'>
			<Calendar allAuctions={sales} todaysEvents={getTodaysEvents(sales.map((month) => month.auctions).flat())} />
		</div>
	);
}

import Button from '@/app/components/common/buttons/filterCalendarButton';
import { ArrowUpAZ, ArrowUpZA } from 'lucide-react';
import { useState } from 'react';

export default function SortAndFilter() {
	const [az, setAZ] = useState(true);

	const [filters, setFilters] = useState([
		{ id: 1, href: '', label: 'Location', selected: null, open: false },
		{ id: 2, href: '', label: 'Next Sale', selected: null, open: false },
		{ id: 3, href: '', label: 'Sale Type', selected: null, open: false },
	]);

	const handleAZToggle = () => setAZ((prev) => !prev);

	const toggleFilter = (id: number) => {
		setFilters((prev) => prev.map((filter) => (filter.id === id ? { ...filter, open: !filter.open } : filter)));
	};

	return (
		<div className='w-full border-t border-gray-200'>
			<div className='flex w-[32px] w-[429px] mx-auto ml-12 my-5'>
				{az ? (
					<ArrowUpAZ size={22} strokeWidth={1.5} className='m-auto arrow' onClick={handleAZToggle} />
				) : (
					<ArrowUpZA size={22} strokeWidth={1.5} className='m-auto arrow' onClick={handleAZToggle} />
				)}

				{filters.map((b) => (
					<div key={b.id} className='mx-1.75'>
						<Button item={b} onclick={() => toggleFilter(b.id)} />
					</div>
				))}
			</div>
		</div>
	);
}

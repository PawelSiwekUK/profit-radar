import Button from '@/app/components/common/buttons/filterCalendarButton';
import { ArrowUpAZ, ArrowUpZA } from 'lucide-react';
import { useState } from 'react';
export default function SortAndFilter() {
	const [az, setAZ] = useState(true);
	const buttons = [
		{
			href: '',
			label: 'Location',
		},
		{
			href: '',
			label: 'Next Sale',
		},
		{
			href: '',
			label: 'Sale Type',
		},
	];
	function go() {
		console.log('click');
		return;
	}
	const handleToggle = () => setAZ((prev) => !prev);

	return (
		<div className='w-full border-t border-gray-200'>
			<div className='flex w-[32px]  w-[429px] mx-auto ml-12 my-5'>
				{az ? (
					<ArrowUpAZ size={22} strokeWidth={1.5} className='m-auto arrow' onClick={handleToggle} />
				) : (
					<ArrowUpZA size={22} strokeWidth={1.5} className='m-auto arrow' onClick={handleToggle} />
				)}
				{buttons.map((b, k) => (
					<div key={k} className='mx-1.75'>
						<Button onclick={go} item={b}></Button>
					</div>
				))}
			</div>
			<div className='w-[80%] border-b border-gray-200 mx-auto'></div>
		</div>
	);
}

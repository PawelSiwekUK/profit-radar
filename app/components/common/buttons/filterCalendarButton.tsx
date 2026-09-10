import Link from 'next/link';
import './buttons.css';
import { ChevronDown } from 'lucide-react';

export default function FilterButton({ item, onclick }: { item: { href: string; label: string }; onclick?: () => void }) {
	return (
		<div className='' onClick={onclick}>
			<button className='calendar-filter-button'>
				{item.label}
				<ChevronDown size={20} />
			</button>
		</div>
	);
}

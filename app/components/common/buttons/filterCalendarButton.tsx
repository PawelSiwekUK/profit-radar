import './buttons.css';
import { ChevronDown, ChevronUp } from 'lucide-react';

export default function FilterButton({ item, onclick }: { item: { href: string; label: string; open: boolean }; onclick?: () => void }) {
	return (
		<div className='' onClick={onclick}>
			<button className='calendar-filter-button'>
				{item.label}
				{item.open ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
			</button>
		</div>
	);
}

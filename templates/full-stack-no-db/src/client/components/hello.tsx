import { text } from "@/client/lib/design";

interface HelloProps {
	message: string;
	time: string;
}

export function Hello({ message, time }: HelloProps) {
	const date = new Date(time);
	const formattedDate = date.toLocaleString();

	return (
		<div>
			<div className={text.display}>{message}</div>
			<p className={text.muted}>Message from API at: {formattedDate}</p>
		</div>
	);
}

import { cn } from "@/lib/utils";

interface ExplanationProps {
	title: string;
	items: {
		title: string;
		description: string;
		color: string;
	}[];
}

export const Explanation = ({ title, items }: ExplanationProps) => {
	return (
		<div className="rounded-lg bg-gray-50 p-6">
			<h3 className="mb-4 font-medium text-gray-900">{title}</h3>
			<div className="grid gap-6 md:grid-cols-3">
				{items.map((item) => (
					<div key={item.title} className="flex gap-3">
						<div
							className={cn(
								"mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full",
								item.color,
							)}
						/>
						<div className="space-y-1">
							<div className="font-medium text-gray-800 text-sm">
								{item.title}
							</div>
							<div className="text-gray-600 text-xs leading-relaxed">
								{item.description}
							</div>
						</div>
					</div>
				))}
			</div>
		</div>
	);
};

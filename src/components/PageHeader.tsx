interface PageHeaderProps {
	title: string;
	description: React.ReactNode;
}

export function PageHeader({ title, description }: PageHeaderProps) {
	return (
		<div className="space-y-4 text-center">
			<h1 className="font-bold text-4xl text-gray-900">{title}</h1>
			<p className="text-gray-600 text-xl">{description}</p>
		</div>
	);
}

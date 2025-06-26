import { useHello } from "../hooks/use-hello";

export function HelloList() {
	const { data, isLoading, error } = useHello();

	if (isLoading) {
		return (
			<div className="flex items-center justify-center p-8">
				<div className="text-gray-500">Loading...</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="flex items-center justify-center p-8">
				<div className="text-red-500">Error loading data</div>
			</div>
		);
	}

	return (
		<div className="max-w-2xl mx-auto p-6">
			<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
				<h2 className="text-2xl font-bold text-gray-900 mb-4">
					API Response
				</h2>
				<div className="bg-gray-50 rounded-md p-4">
					<p className="text-lg text-gray-700">
						{data?.message || "No message received"}
					</p>
					<p className="text-sm text-gray-500 mt-2">
						From: <code className="bg-gray-200 px-1 rounded">/api/hello</code>
					</p>
				</div>
			</div>
		</div>
	);
}
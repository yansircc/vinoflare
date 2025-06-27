import { useState } from "react";

export function HelloDemo() {
	const [message] = useState("Hello from Vino! 🍷");

	return (
		<div className="space-y-4">
			<h2 className="text-2xl font-bold">Hello Demo</h2>
			<p className="text-gray-600">
				This is a simple demo component for projects without a database.
			</p>
			<div className="p-4 bg-blue-50 rounded-lg">
				<p className="text-blue-800">{message}</p>
			</div>
		</div>
	);
}
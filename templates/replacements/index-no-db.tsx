import { createFileRoute } from "@tanstack/react-router";
import { HelloList } from "@/client/components/hello-list";

export const Route = createFileRoute("/")({
	component: HomePage,
});

function HomePage() {
	return (
		<div className="min-h-screen bg-gray-50">
			<main className="container mx-auto py-8">
				<h1 className="text-4xl font-bold text-center mb-8">
					Welcome to Vino App
				</h1>
				<HelloList />
			</main>
		</div>
	);
}

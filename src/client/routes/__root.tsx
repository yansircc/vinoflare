import { Header } from "@client/components/layout/header";
import { queryClient } from "@client/lib/query-client";
import { QueryClientProvider } from "@tanstack/react-query";
import { createRootRoute, Outlet } from "@tanstack/react-router";
import { Toaster } from "sonner";

export const Route = createRootRoute({
	component: RootComponent,
});

function RootComponent() {
	return (
		<QueryClientProvider client={queryClient}>
			<div className="min-h-screen bg-white">
				<Header />
				<main>
					<Outlet />
				</main>
			</div>
			<Toaster
				position="top-center"
				toastOptions={{
					unstyled: true,
					classNames: {
						toast:
							"bg-white border border-gray-200 p-4 flex items-center gap-3 w-full",
						title: "text-sm",
						description: "text-sm text-gray-600",
						actionButton: "text-sm text-gray-900 hover:text-gray-700",
						cancelButton: "text-sm text-gray-600 hover:text-gray-900",
						error: "bg-red-50 border-red-200",
						success: "bg-green-50 border-green-200",
						warning: "bg-yellow-50 border-yellow-200",
						info: "bg-blue-50 border-blue-200",
					},
				}}
			/>
		</QueryClientProvider>
	);
}

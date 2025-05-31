import { QuotesList } from "@/hooks/quotes/ui/QuoteList";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/quotes/")({
	component: QuotesList,
});

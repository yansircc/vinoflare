import { QuoteDetail } from "@/hooks/quotes/ui/QuoteDetail";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/quotes/$id")({
	component: QuoteDetail,
});

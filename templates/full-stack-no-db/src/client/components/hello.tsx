import { text } from "@/client/lib/design";
import { useGetHello } from "@/generated/endpoints/greeting/greeting";

export function Hello() {
	const { data, isLoading, error } = useGetHello();

	if (isLoading) return <div className={text.muted}>Loading...</div>;
	if (error) return <div className={text.error}>Failed to load</div>;

	return <div className={text.display}>{data?.data?.message || "Hello"}</div>;
}

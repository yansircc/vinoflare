import { createFileRoute } from "@tanstack/react-router";
import { spacing } from "@/client/lib/design";
import { LoginForm } from "../components/auth/login-form";

export const Route = createFileRoute("/login")({
	component: LoginPage,
});

function LoginPage() {
	return (
		<div className={spacing.page}>
			<div className="flex min-h-[60vh] items-center justify-center">
				<LoginForm />
			</div>
		</div>
	);
}

import { LoginForm } from "@/components/auth/LoginForm";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/login")({
	component: LoginPage,
});

function LoginPage() {
	return (
		<div className="flex items-center justify-center">
			<div className="w-full max-w-md space-y-8">
				<LoginForm />
			</div>
		</div>
	);
}

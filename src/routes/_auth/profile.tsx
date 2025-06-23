import { UserProfile } from "@/ui/auth/user-profile";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_auth/profile")({
	component: ProfilePage,
});

function ProfilePage() {
	return (
		<div className="mx-auto max-w-4xl">
			<UserProfile />
		</div>
	);
}

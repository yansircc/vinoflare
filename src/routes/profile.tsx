import { createFileRoute } from "@tanstack/react-router";
import { UserProfile } from "../components/auth/UserProfile";

export const Route = createFileRoute("/profile")({
	component: ProfilePage,
});

function ProfilePage() {
	return (
		<div className="mx-auto max-w-4xl">
			<UserProfile />
		</div>
	);
}

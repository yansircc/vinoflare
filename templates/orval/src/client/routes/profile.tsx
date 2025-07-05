import { createFileRoute } from "@tanstack/react-router";
import { UserProfile } from "../components/auth/user-profile";

export const Route = createFileRoute("/profile")({
	component: ProfilePage,
});

function ProfilePage() {
	return <UserProfile />;
}

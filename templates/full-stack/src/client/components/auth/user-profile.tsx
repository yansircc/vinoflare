import { signOut, useSession } from "@client/lib/auth";
import {
	cn,
	colors,
	focus,
	interactive,
	spacing,
	text,
} from "@/client/lib/design";

export function UserProfile() {
	const { data: session } = useSession();

	const handleSignOut = async () => {
		try {
			await signOut();
			window.location.href = "/";
		} catch (error) {
			console.error("Logout error:", error);
		}
	};

	if (!session) {
		return (
			<div className={spacing.page}>
				<p className={cn(text.base, colors.text.secondary)}>
					Please sign in to view your profile.
				</p>
			</div>
		);
	}

	return (
		<div className={cn(spacing.page, "mx-auto max-w-2xl")}>
			<div className="space-y-12">
				<div>
					<h1 className={cn(text.h1, "mb-2")}>Profile</h1>
					<p className={cn(text.base, colors.text.secondary)}>
						Manage your account settings
					</p>
				</div>

				<div className="space-y-8">
					<div className="flex items-start gap-6">
						{session.user.image ? (
							<img
								src={session.user.image}
								alt={session.user.name || "User"}
								className="h-16 w-16 rounded-full"
							/>
						) : (
							<div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-900 text-2xl text-white">
								{session.user.name?.charAt(0).toUpperCase() || "U"}
							</div>
						)}

						<div className="space-y-1">
							<h2 className={cn(text.h3)}>{session.user.name}</h2>
							<p className={cn(text.base, colors.text.secondary)}>
								{session.user.email}
							</p>
							{session.user.emailVerified && (
								<p className={cn(text.small, colors.text.muted)}>
									Email verified
								</p>
							)}
						</div>
					</div>

					<div className="border-gray-100 border-t pt-8">
						<h3 className={cn(text.base, "mb-4 font-medium")}>Account ID</h3>
						<p className={cn(text.small, colors.text.muted, "font-mono")}>
							{session.user.id}
						</p>
					</div>

					<div className="border-gray-100 border-t pt-8">
						<h3 className={cn(text.base, "mb-4 font-medium")}>Danger Zone</h3>
						<button
							type="button"
							onClick={handleSignOut}
							className={cn(
								"px-6 py-2.5",
								"border border-red-200 text-red-600",
								interactive.base,
								"hover:bg-red-50",
								focus,
							)}
						>
							Sign Out
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}

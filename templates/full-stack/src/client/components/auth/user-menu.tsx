import { signOut, useSession } from "@client/lib/auth";
import { Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { cn, colors, focus, interactive, text } from "@/client/lib/design";

export function UserMenu() {
	const { data: session } = useSession();
	const [showDropdown, setShowDropdown] = useState(false);
	const dropdownRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		function handleClickOutside(event: MouseEvent) {
			if (
				dropdownRef.current &&
				!dropdownRef.current.contains(event.target as Node)
			) {
				setShowDropdown(false);
			}
		}

		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

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
			<Link
				to="/login"
				className={cn(text.base, colors.text.secondary, interactive.link)}
			>
				Sign In
			</Link>
		);
	}

	return (
		<div className="relative" ref={dropdownRef}>
			<button
				type="button"
				onClick={() => setShowDropdown(!showDropdown)}
				className={cn(
					"-m-2 flex items-center gap-2 p-2",
					interactive.base,
					focus,
				)}
			>
				{session.user.image ? (
					<img
						src={session.user.image}
						alt={session.user.name || "User"}
						className="h-8 w-8 rounded-full"
					/>
				) : (
					<div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-900 text-sm text-white">
						{session.user.name?.charAt(0).toUpperCase() || "U"}
					</div>
				)}
			</button>

			{showDropdown && (
				<div className="absolute right-0 mt-4 w-56 bg-white py-2 shadow-lg">
					<div className="px-4 pb-3">
						<p className={cn(text.base, colors.text.primary)}>
							{session.user.name}
						</p>
						<p className={cn(text.small, colors.text.secondary)}>
							{session.user.email}
						</p>
					</div>

					<div className="border-gray-100 border-t pt-2">
						<Link
							to="/profile"
							className={cn(
								"block px-4 py-2",
								text.base,
								colors.text.secondary,
								interactive.base,
								"hover:bg-gray-50",
							)}
							onClick={() => setShowDropdown(false)}
						>
							Profile
						</Link>
						<button
							type="button"
							onClick={handleSignOut}
							className={cn(
								"w-full px-4 py-2 text-left",
								text.base,
								colors.text.secondary,
								interactive.base,
								"hover:bg-gray-50",
							)}
						>
							Sign Out
						</button>
					</div>
				</div>
			)}
		</div>
	);
}

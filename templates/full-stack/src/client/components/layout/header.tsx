import { Link } from "@tanstack/react-router";
import { cn, colors, interactive, layout, text } from "@/client/lib/design";

interface NavItem {
	path: string;
	label: string;
}

interface HeaderProps {
	navItems?: NavItem[];
	children?: React.ReactNode;
}

export function Header({ navItems = [], children }: HeaderProps) {
	const defaultNavItems: NavItem[] = [
		{ path: "/", label: "Home" },
		{ path: "/routes", label: "API" },
	];

	const items = navItems.length > 0 ? navItems : defaultNavItems;

	return (
		<header className="py-8 md:py-12">
			<div className={cn(layout.container, "px-4 md:px-8")}>
				<nav className="flex items-center justify-between">
					<Link to="/" className={cn(text.h2, interactive.base)}>
						Vinoflare
					</Link>

					<div className="flex items-center gap-8">
						{items.map((item) => (
							<Link
								key={item.path}
								to={item.path}
								className={cn(
									text.base,
									colors.text.secondary,
									interactive.link,
								)}
								activeProps={{ className: colors.text.primary }}
							>
								{item.label}
							</Link>
						))}
						{children}
					</div>
				</nav>
			</div>
		</header>
	);
}

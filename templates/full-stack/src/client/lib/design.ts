// Minimalist design system utilities
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

// Typography scales - minimal set
export const text = {
	// Display
	display: "text-5xl font-light tracking-tight",

	// Headings
	h1: "text-3xl font-light",
	h2: "text-2xl font-light",
	h3: "text-xl font-light",

	// Body
	large: "text-lg",
	base: "text-base",
	small: "text-sm",
	tiny: "text-xs",

	// Utility
	muted: "text-gray-500",
	error: "text-red-600",
} as const;

// Minimal color palette
export const colors = {
	text: {
		primary: "text-gray-900",
		secondary: "text-gray-600",
		muted: "text-gray-400",
		inverse: "text-white",
	},
	bg: {
		primary: "bg-white",
		secondary: "bg-gray-50",
		hover: "bg-gray-100",
		inverse: "bg-gray-900",
	},
	border: {
		light: "border-gray-200",
		medium: "border-gray-300",
	},
} as const;

// Spacing system - use generous whitespace
export const spacing = {
	page: "px-4 md:px-8 py-12 md:py-16",
	section: "py-12 md:py-16",
	card: "p-8 md:p-12",
	compact: "p-4 md:p-6",
} as const;

// Interactive elements
export const interactive = {
	base: "transition-colors duration-200",
	link: "hover:text-gray-900 transition-colors duration-200",
	button: {
		primary:
			"bg-gray-900 text-white hover:bg-gray-800 px-6 py-2.5 transition-colors duration-200",
		secondary:
			"bg-white text-gray-900 hover:bg-gray-50 px-6 py-2.5 transition-colors duration-200",
		ghost: "hover:bg-gray-50 px-4 py-2 transition-colors duration-200",
	},
} as const;

// Layout utilities
export const layout = {
	container: "max-w-6xl mx-auto",
	narrow: "max-w-2xl mx-auto",
	stack: "flex flex-col gap-4",
	cluster: "flex flex-wrap gap-4",
} as const;

// Focus styles - minimal and clean
export const focus =
	"focus:outline-none focus:ring-1 focus:ring-gray-900 focus:ring-offset-2";

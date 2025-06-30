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
		dark: "border-gray-900",
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
		danger:
			"text-red-600 hover:text-red-700 hover:bg-red-50 px-3 py-1 transition-colors duration-200",
		minimal: "hover:bg-gray-50 transition-colors duration-200",
	},
} as const;

// Form elements - minimal and clean
export const form = {
	input: {
		base: "w-full px-0 py-3 border-0 border-b-2 border-gray-200 placeholder:text-gray-400 focus:border-gray-900 transition-colors duration-200",
		large: "text-lg",
		error: "border-red-300 focus:border-red-600",
	},
	checkbox: {
		base: "relative h-6 w-6 rounded-full border transition-all duration-200 flex items-center justify-center",
		unchecked:
			"border-gray-300 hover:border-gray-600 bg-transparent hover:bg-gray-50",
		checked: "border-gray-900 bg-gray-900 hover:bg-gray-800",
		icon: "h-3 w-3 transition-all duration-200",
		iconVisible: "opacity-100 scale-100",
		iconHidden: "opacity-0 scale-75",
	},
} as const;

// Layout utilities
export const layout = {
	container: "max-w-6xl mx-auto",
	narrow: "max-w-2xl mx-auto",
	stack: "flex flex-col gap-4",
	cluster: "flex flex-wrap gap-4",
	row: "flex items-center gap-3",
	between: "flex items-center justify-between",
} as const;

// State styles
export const states = {
	completed: "line-through text-gray-500",
	loading: "opacity-50 pointer-events-none",
	disabled: "cursor-not-allowed opacity-50",
	pending: "opacity-75",
	hidden: "opacity-0 group-hover:opacity-100",
} as const;

// Animations and transitions
export const animation = {
	transition: "transition-all duration-200",
	fadeIn: "transition-opacity duration-200",
	slideUp: "transform transition-transform duration-200",
	scale: "transition-transform duration-200",
} as const;

// Dividers and separators
export const divider = {
	light: "border-b border-gray-100",
	medium: "border-b border-gray-200",
	section: "border-t border-gray-100 pt-12",
} as const;

// Focus styles - minimal and clean
export const focus =
	"focus:outline-none focus:ring-1 focus:ring-gray-900 focus:ring-offset-2";

// Focus variants for different components
export const focusVariants = {
	default: focus,
	checkbox:
		"focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 focus:ring-opacity-50",
};

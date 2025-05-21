import { createContext, useContext, useEffect, useState } from "react";

type CustomTheme = "light" | "dark" | "system" | "pink" | "matrix" | "cyberpunk" | "nord" | "synthwave";

type ThemeProviderProps = {
	children: React.ReactNode;
	defaultTheme?: CustomTheme;
	storageKey?: string;
};

type ThemeProviderState = {
	theme: CustomTheme;
	setTheme: (theme: CustomTheme) => void;
};

const initialState: ThemeProviderState = {
	theme: "system",
	setTheme: () => null,
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

export function ThemeProvider({
	children,
	defaultTheme = "system",
	storageKey = "translatepdf-theme",
	...props
}: ThemeProviderProps) {
	const [theme, setTheme] = useState<CustomTheme>(
		() => (localStorage.getItem(storageKey) as CustomTheme) || defaultTheme,
	);

	useEffect(() => {
		const root = window.document.documentElement;

		// Remove all theme classes
		root.classList.remove("light", "dark", "pink", "matrix", "cyberpunk", "nord", "synthwave");

		if (theme === "system") {
			const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
				.matches
				? "dark"
				: "light";

			root.classList.add(systemTheme);
			return;
		}

		root.classList.add(theme);
	}, [theme]);

	const value = {
		theme,
		setTheme: (theme: CustomTheme) => {
			localStorage.setItem(storageKey, theme);
			setTheme(theme);
		},
	};

	return (
		<ThemeProviderContext.Provider {...props} value={value}>
			{children}
		</ThemeProviderContext.Provider>
	);
}

export const useTheme = () => {
	const context = useContext(ThemeProviderContext);

	if (context === undefined)
		throw new Error("useTheme must be used within a ThemeProvider");

	return context;
};

// Export the theme type
export type { CustomTheme }; 
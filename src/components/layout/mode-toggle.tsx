import { Moon, Sun, Palette, Monitor } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme, type CustomTheme } from "@/components/providers/theme-provider";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
	DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export function ModeToggle() {
	const { theme, setTheme } = useTheme();

	// Determine which icon to show in the button based on current theme
	const getThemeIcon = () => {
		switch (theme) {
			case "light":
				return <Sun className="size-4" />;
			case "dark":
				return <Moon className="size-4" />;
			case "system":
				return <Monitor className="size-4" />;
			default:
				return <Palette className="size-4" />;
		}
	};

	// Quick toggle between light and dark
	const toggleLightDark = () => {
		if (theme === "light") {
			setTheme("dark");
		} else if (theme === "dark" || theme === "system") {
			setTheme("light");
		} else {
			// If it's a custom theme, toggle to light
			setTheme("light");
		}
	};

	return (
		<TooltipProvider delayDuration={300}>
			<Tooltip>
				<TooltipTrigger asChild>
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button 
								variant="outline" 
								size="icon" 
								className="group hover:border-primary/50 hover:bg-primary/5"
								onClick={(e) => {
									// If right click or modifier key is pressed, don't toggle, just open menu
									if (e.button === 2 || e.ctrlKey || e.metaKey || e.altKey || e.shiftKey) {
										return;
									}
									
									// On normal left click, toggle light/dark and prevent opening dropdown
									e.preventDefault();
									toggleLightDark();
								}}
							>
								{getThemeIcon()}
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end">
							<DropdownMenuItem onClick={() => setTheme("light")}>
								<Sun className="size-4 mr-2" />
								<span>Light</span>
							</DropdownMenuItem>
							<DropdownMenuItem onClick={() => setTheme("dark")}>
								<Moon className="size-4 mr-2" />
								<span>Dark</span>
							</DropdownMenuItem>
							<DropdownMenuItem onClick={() => setTheme("system")}>
								<Monitor className="size-4 mr-2" />
								<span>System</span>
							</DropdownMenuItem>
							
							<DropdownMenuSeparator />
							
							<DropdownMenuItem onClick={() => setTheme("pink")}>
								<div className="size-4 mr-2 rounded-full bg-pink-400" />
								<span>Pink</span>
							</DropdownMenuItem>
							<DropdownMenuItem onClick={() => setTheme("matrix")}>
								<div className="size-4 mr-2 rounded-full bg-green-500" />
								<span>Matrix</span>
							</DropdownMenuItem>
							<DropdownMenuItem onClick={() => setTheme("cyberpunk")}>
								<div className="size-4 mr-2 rounded-full bg-yellow-400" />
								<span>Cyberpunk</span>
							</DropdownMenuItem>
							<DropdownMenuItem onClick={() => setTheme("nord")}>
								<div className="size-4 mr-2 rounded-full bg-blue-400" />
								<span>Nord</span>
							</DropdownMenuItem>
							<DropdownMenuItem onClick={() => setTheme("synthwave")}>
								<div className="size-4 mr-2 rounded-full bg-purple-500" />
								<span>Synthwave</span>
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</TooltipTrigger>
				<TooltipContent>
					<p>Change theme</p>
				</TooltipContent>
			</Tooltip>
		</TooltipProvider>
	);
} 
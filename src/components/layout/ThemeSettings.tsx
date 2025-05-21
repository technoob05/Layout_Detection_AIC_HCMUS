import { useTheme, type CustomTheme } from "@/components/providers/theme-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Monitor, Moon, Sun, Sparkles, Terminal, Zap, Snowflake, Palette } from "lucide-react";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ThemeOption {
  value: CustomTheme;
  label: string;
  icon: React.ReactNode;
  preview: React.ReactNode;
}

export function ThemeSettings() {
  const { theme, setTheme } = useTheme();

  const systemThemeOptions: ThemeOption[] = [
    {
      value: "light",
      label: "Light",
      icon: <Sun className="size-5" />,
      preview: (
        <div className={cn("w-full h-20 rounded-md", "bg-[#ffffff] border")}>
          <div className="w-full h-3 bg-[#eeeeee] border-b"></div>
          <div className="p-2">
            <div className="w-8 h-2 mb-2 bg-[#555555] rounded-full"></div>
            <div className="w-full h-2 mb-1 bg-[#dddddd] rounded-full"></div>
            <div className="w-full h-2 mb-1 bg-[#dddddd] rounded-full"></div>
          </div>
        </div>
      )
    },
    {
      value: "dark",
      label: "Dark",
      icon: <Moon className="size-5" />,
      preview: (
        <div className={cn("w-full h-20 rounded-md", "bg-[#111111]")}>
          <div className="w-full h-3 bg-[#222222]"></div>
          <div className="p-2">
            <div className="w-8 h-2 mb-2 bg-[#dddddd] rounded-full"></div>
            <div className="w-full h-2 mb-1 bg-[#333333] rounded-full"></div>
            <div className="w-full h-2 mb-1 bg-[#333333] rounded-full"></div>
          </div>
        </div>
      )
    },
    {
      value: "system",
      label: "System",
      icon: <Monitor className="size-5" />,
      preview: (
        <div className={cn("w-full h-20 rounded-md overflow-hidden flex")}>
          <div className="w-1/2 bg-[#ffffff] h-full border-r">
            <div className="w-full h-3 bg-[#eeeeee]"></div>
            <div className="p-1">
              <div className="w-4 h-1 mb-1 bg-[#555555] rounded-full"></div>
              <div className="w-full h-1 mb-1 bg-[#dddddd] rounded-full"></div>
            </div>
          </div>
          <div className="w-1/2 bg-[#111111] h-full">
            <div className="w-full h-3 bg-[#222222]"></div>
            <div className="p-1">
              <div className="w-4 h-1 mb-1 bg-[#dddddd] rounded-full"></div>
              <div className="w-full h-1 mb-1 bg-[#333333] rounded-full"></div>
            </div>
          </div>
        </div>
      )
    }
  ];

  const customThemeOptions: ThemeOption[] = [
    {
      value: "pink",
      label: "Pink",
      icon: <Sparkles className="size-5" />,
      preview: (
        <div className={cn("w-full h-20 rounded-md", "bg-[#ffebf3] border border-[#ffbddc]")}>
          <div className="w-full h-3 bg-[#ffd3e8]"></div>
          <div className="p-2">
            <div className="w-8 h-2 mb-2 bg-[#c96190] rounded-full"></div>
            <div className="w-full h-2 mb-1 bg-[#ffcbe3] rounded-full"></div>
            <div className="w-full h-2 mb-1 bg-[#ffcbe3] rounded-full"></div>
          </div>
        </div>
      )
    },
    {
      value: "matrix",
      label: "Matrix",
      icon: <Terminal className="size-5" />,
      preview: (
        <div className={cn("w-full h-20 rounded-md", "bg-[#030602] border border-[#023902]")}>
          <div className="w-full h-3 bg-[#031503]"></div>
          <div className="p-2 relative">
            <div className="w-8 h-2 mb-2 bg-[#2cff2c] rounded-full opacity-80"></div>
            <div className="w-full h-2 mb-1 bg-[#094509] rounded-full"></div>
            <div className="w-full h-2 mb-1 bg-[#094509] rounded-full"></div>
            <div className="absolute top-1 right-2 text-xs font-mono text-[#2cff2c] opacity-80">01</div>
          </div>
        </div>
      )
    },
    {
      value: "cyberpunk",
      label: "Cyberpunk",
      icon: <Zap className="size-5" />,
      preview: (
        <div className={cn("w-full h-20 rounded-md", "bg-[#0b0b23] border border-[#2a2a5a]")}>
          <div className="w-full h-3 bg-[#131341]"></div>
          <div className="p-2">
            <div className="w-8 h-2 mb-2 bg-[#ffdd00] rounded-full"></div>
            <div className="w-full h-2 mb-1 bg-[#131378] rounded-full"></div>
            <div className="w-full h-2 mb-1 bg-[#131378] rounded-full"></div>
            <div className="absolute bottom-2 right-2 w-3 h-3 rounded-full bg-[#ff3c71]"></div>
          </div>
        </div>
      )
    },
    {
      value: "nord",
      label: "Nord",
      icon: <Snowflake className="size-5" />,
      preview: (
        <div className={cn("w-full h-20 rounded-md", "bg-[#2e3440] border border-[#4c566a]")}>
          <div className="w-full h-3 bg-[#3b4252]"></div>
          <div className="p-2">
            <div className="w-8 h-2 mb-2 bg-[#88c0d0] rounded-full"></div>
            <div className="w-full h-2 mb-1 bg-[#434c5e] rounded-full"></div>
            <div className="w-full h-2 mb-1 bg-[#434c5e] rounded-full"></div>
          </div>
        </div>
      )
    },
    {
      value: "synthwave",
      label: "Synthwave",
      icon: <Palette className="size-5" />,
      preview: (
        <div className={cn("w-full h-20 rounded-md", "bg-[#241b2f] border border-[#341b45]")}>
          <div className="w-full h-3 bg-[#5c2e6c]"></div>
          <div className="p-2">
            <div className="w-8 h-2 mb-2 bg-[#f672f1] rounded-full"></div>
            <div className="w-full h-2 mb-1 bg-[#3a1e45] rounded-full"></div>
            <div className="w-full h-2 mb-1 bg-[#3a1e45] rounded-full"></div>
            <div className="absolute bottom-6 left-6 w-8 h-[1px] bg-[#f671ff]"></div>
            <div className="absolute bottom-5 left-10 w-4 h-[1px] bg-[#02d9fb]"></div>
          </div>
        </div>
      )
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Appearance</CardTitle>
        <CardDescription>
          Customize the appearance of the application
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Tabs defaultValue="system-themes">
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="system-themes">System Themes</TabsTrigger>
            <TabsTrigger value="custom-themes">Custom Themes</TabsTrigger>
          </TabsList>
          
          <TabsContent value="system-themes">
            <RadioGroup
              value={theme}
              onValueChange={(value) => setTheme(value as CustomTheme)}
              className="grid grid-cols-3 gap-4"
            >
              {systemThemeOptions.map((option) => (
                <div key={option.value}>
                  <Label
                    htmlFor={option.value}
                    className={cn(
                      "flex flex-col items-center gap-2 rounded-md border-2 p-4 cursor-pointer hover:bg-accent transition-colors",
                      theme === option.value ? "border-primary" : "border-muted"
                    )}
                  >
                    <RadioGroupItem value={option.value} id={option.value} className="sr-only" />
                    {option.icon}
                    <span>{option.label}</span>
                    {option.preview}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </TabsContent>
          
          <TabsContent value="custom-themes">
            <RadioGroup
              value={theme}
              onValueChange={(value) => setTheme(value as CustomTheme)}
              className="grid grid-cols-2 md:grid-cols-3 gap-4"
            >
              {customThemeOptions.map((option) => (
                <div key={option.value}>
                  <Label
                    htmlFor={option.value}
                    className={cn(
                      "flex flex-col items-center gap-2 rounded-md border-2 p-4 cursor-pointer hover:bg-accent transition-colors",
                      theme === option.value ? "border-primary" : "border-muted"
                    )}
                  >
                    <RadioGroupItem value={option.value} id={option.value} className="sr-only" />
                    {option.icon}
                    <span>{option.label}</span>
                    {option.preview}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </TabsContent>
        </Tabs>
        
        <div className="text-sm text-muted-foreground">
          <p>Your theme preference will be saved and applied across visits.</p>
        </div>
        
        {theme === "matrix" && (
          <div className="p-3 rounded-md bg-accent/50 text-sm">
            <p className="matrix-text font-mono">The Matrix theme applies a flickering effect to text elements.</p>
          </div>
        )}
        
        {theme === "synthwave" && (
          <div className="p-3 rounded-md bg-accent/50 text-sm">
            <p className="gradient-text">The Synthwave theme includes gradient text effects.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 
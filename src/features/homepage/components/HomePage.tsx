import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { ModeToggle } from "@/components/layout/mode-toggle";
import { ArrowRight, BarChart2, Bot, Bell, Code, FileText, Globe2, History, Languages, MessageSquare, Sparkles, Edit, PencilRuler, Camera, Mic, Youtube, Video, TrendingUp, Cog, BookOpen, FolderEdit, Globe } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import { RecentTranslationsWidget } from "@/features/translation-history/components/RecentTranslationsWidget";
import { MainLayout } from "@/components/layout/MainLayout";
import { NotificationDemo } from "@/homepage-demo";
import { Notification } from "@/components/ui/notification-toast";

interface FeatureCardProps {
	title: string;
	description: string;
	icon: React.ReactNode;
	to: string;
	className?: string;
}

function FeatureCard({ title, description, icon, to, className }: FeatureCardProps) {
	return (
		<Link 
			to={to} 
			className={cn(
				'flex p-6 flex-col rounded-xl border hover:shadow-lg transition-shadow duration-300 cursor-pointer',
				className
			)}
		>
			<div className="h-16 w-16 flex items-center justify-center rounded-full bg-blue-100 mb-4">
				{icon}
			</div>
			<h3 className="text-xl font-semibold mb-2">{title}</h3>
			<p className="text-muted-foreground">{description}</p>
		</Link>
	);
}

export function HomePage() {
	const [isHovered, setIsHovered] = useState<boolean>(false);
	
	const features = [
		{
			id: 'pdf',
			title: 'PDF Translation',
			description: 'Upload and translate PDF documents while maintaining formatting',
			icon: <FileText className="h-8 w-8 text-blue-600" />,
			to: '/translate',
		},
		{
			id: 'voice',
			title: 'Voice Translation',
			description: 'Translate your voice in real-time to different languages',
			icon: <Mic className="h-8 w-8 text-blue-600" />,
			to: '/voice-translation',
		},
		{
			id: 'video',
			title: 'Video Translation',
			description: 'Upload or link YouTube videos for translation and transcription',
			icon: <Video className="h-8 w-8 text-blue-600" />,
			to: '/video-translation',
		},
		{
			id: 'ar',
			title: 'AR Translation',
			description: 'Translate text in real-time using your camera',
			icon: <Camera className="h-8 w-8 text-blue-600" />,
			to: '/ar-translation',
		},
		{
			id: 'web',
			title: 'Web Translation',
			description: 'Translate web pages while preserving their original layout',
			icon: <Globe className="h-8 w-8 text-blue-600" />,
			to: '/web-translation',
		},
		{
			id: 'analytics',
			title: 'Translation Analytics',
			description: 'View insights and statistics about your translations',
			icon: <TrendingUp className="h-8 w-8 text-blue-600" />,
			to: '/analytics',
		},
		{
			id: 'history',
			title: 'Translation History',
			description: 'Access your previously translated documents and content',
			icon: <History className="h-8 w-8 text-blue-600" />,
			to: '/history',
		},
		{
			id: 'settings',
			title: 'User Settings',
			description: 'Configure your preferences and account settings',
			icon: <Cog className="h-8 w-8 text-blue-600" />,
			to: '/settings',
		},
		{
			id: 'learning',
			title: 'Learning Materials',
			description: 'Explore resources to help you learn languages',
			icon: <BookOpen className="h-8 w-8 text-blue-600" />,
			to: '/learning-materials',
		},
		{
			id: 'pdf-editor',
			title: 'PDF Editor',
			description: 'Edit and annotate PDF documents after translation',
			icon: <FolderEdit className="h-8 w-8 text-blue-600" />,
			to: '/pdf-editor',
		},
	];

	return (
		<MainLayout>
			{/* Hero Section */}
			<section className="container mx-auto px-4 pt-12 pb-16 text-center">
				<div className="relative mb-6 inline-block">
					<div className="relative">
						<div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse"></div>
						<Languages className="size-20 text-primary relative z-10" />
					</div>
					<div className="absolute -right-2 -top-2 z-20">
						<div className="animate-ping absolute size-4 rounded-full bg-primary/50"></div>
						<div className="relative size-4 rounded-full bg-primary"></div>
					</div>
				</div>
				
				<h1 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent animate-fade-in">
					PolyLingo Hub
				</h1>
				
				<p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto mb-8 animate-fade-in-up">
					Breakthrough AI-powered translation platform for any content, anywhere, anytime
				</p>
				
				<div className="flex flex-wrap gap-4 justify-center mb-12 animate-fade-in-up delay-100">
					<Button 
						asChild 
						size="lg" 
						className="gap-2 text-lg px-8 group relative overflow-hidden"
						onMouseEnter={() => setIsHovered(true)}
						onMouseLeave={() => setIsHovered(false)}
					>
						<Link to="/translate">
							<span className="relative z-10">Start Translating</span>
							<ArrowRight className={cn(
								"size-4 relative z-10 transition-transform duration-300",
								isHovered ? "translate-x-1" : ""
							)} />
							<span className="absolute inset-0 bg-primary/20 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300"></span>
						</Link>
					</Button>
					<Button asChild size="lg" variant="outline" className="gap-2 text-lg group">
						<Link to="/extract">
							Extract Text <FileText className="size-4 group-hover:scale-110 transition-transform" />
						</Link>
					</Button>
					<Button asChild size="lg" variant="secondary" className="gap-2 text-lg group">
						<Link to="/chat">
							Chat with PDF <MessageSquare className="size-4 group-hover:scale-110 transition-transform" />
						</Link>
					</Button>
					<Button asChild size="lg" variant="ghost" className="gap-2 text-lg group">
						<Link to="/history">
							Translation History <History className="size-4 group-hover:scale-110 transition-transform" />
						</Link>
					</Button>
				</div>

				{/* Recent Translations Section */}
				<div className="mt-12 mb-6 max-w-4xl mx-auto animate-fade-in-up delay-200">
					<RecentTranslationsWidget className="w-full" />
				</div>

				{/* Notification Demo Section */}
				<div className="mt-16 mb-8 max-w-3xl mx-auto animate-fade-in-up delay-300">
					<Card className="border-primary/20 bg-background/60 backdrop-blur-sm hover:shadow-lg hover:border-primary/40 transition-all">
						<CardHeader>
							<div className="flex items-center gap-2">
								<Bell className="size-5 text-primary" />
								<CardTitle>Smart Notifications</CardTitle>
							</div>
							<CardDescription>
								PolyLingo Hub keeps you informed with smart, contextual notifications
							</CardDescription>
						</CardHeader>
						<CardContent>
							<p className="text-sm mb-4 text-muted-foreground">
								Try our notification system that adapts to different themes and provides useful feedback:
							</p>
							<NotificationDemo />
						</CardContent>
					</Card>
				</div>
				
				{/* Features Preview */}
				<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 animate-fade-in-up delay-300">
					<Card className="border-primary/20 bg-background/60 backdrop-blur-sm hover:shadow-lg hover:border-primary/40 transition-all duration-300 group">
						<CardContent className="p-6 flex flex-col items-center text-center">
							<div className="size-16 rounded-full bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors duration-300">
								<Globe2 className="size-8 text-primary group-hover:scale-110 transition-transform duration-300" />
							</div>
							<h3 className="text-lg font-semibold mb-2">Multiple Languages</h3>
							<p className="text-muted-foreground">
								Support for many languages with high-quality translation using advanced AI models
							</p>
						</CardContent>
					</Card>
					
					<Card className="border-primary/20 bg-background/60 backdrop-blur-sm hover:shadow-lg hover:border-primary/40 transition-all duration-300 group">
						<CardContent className="p-6 flex flex-col items-center text-center">
							<div className="size-16 rounded-full bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors duration-300">
								<Bot className="size-8 text-primary group-hover:scale-110 transition-transform duration-300" />
							</div>
							<h3 className="text-lg font-semibold mb-2">PDF Chat</h3>
							<p className="text-muted-foreground">
								Chat directly with your documents using Gemini API and LangGraph for deep understanding
							</p>
						</CardContent>
					</Card>
					
					<Card className="border-primary/20 bg-background/60 backdrop-blur-sm hover:shadow-lg hover:border-primary/40 transition-all duration-300 group">
						<CardContent className="p-6 flex flex-col items-center text-center">
							<div className="size-16 rounded-full bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors duration-300">
								<History className="size-8 text-primary group-hover:scale-110 transition-transform duration-300" />
							</div>
							<h3 className="text-lg font-semibold mb-2">Translation History</h3>
							<p className="text-muted-foreground">
								Track and manage all your past translations with easy retrieval
							</p>
						</CardContent>
					</Card>
				</div>
				
				{/* New Analytics Feature Card */}
				<div className="mt-6 animate-fade-in-up delay-400">
					<Card className="border-primary/20 bg-background/60 backdrop-blur-sm hover:shadow-lg hover:border-primary/40 transition-all duration-300 group overflow-hidden">
						<Link to="/analytics" className="block p-6">
							<div className="flex items-center gap-6">
								<div className="size-16 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors duration-300">
									<BarChart2 className="size-8 text-primary group-hover:scale-110 transition-transform duration-300" />
								</div>
								<div className="text-left flex-1">
									<h3 className="text-lg font-semibold mb-1">NEW: Translation Analytics</h3>
									<p className="text-muted-foreground">
										Get insights into your translation patterns with advanced analytics and visualizations
									</p>
								</div>
								<ArrowRight className="size-5 text-primary opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300" />
							</div>
						</Link>
					</Card>
				</div>

				{/* PDF Editor Feature Card */}
				<div className="mt-6 animate-fade-in-up delay-500">
					<Card className="border-primary/20 bg-background/60 backdrop-blur-sm hover:shadow-lg hover:border-primary/40 transition-all duration-300 group overflow-hidden">
						<Link to="/pdf-editor" className="block p-6">
							<div className="flex items-center gap-6">
								<div className="size-16 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors duration-300">
									<PencilRuler className="size-8 text-primary group-hover:scale-110 transition-transform duration-300" />
								</div>
								<div className="text-left flex-1">
									<h3 className="text-lg font-semibold mb-1 flex items-center">
										NEW: Advanced PDF Editor 
										<span className="ml-2 px-2 py-0.5 text-xs bg-primary/20 text-primary rounded-full">Beta</span>
									</h3>
									<p className="text-muted-foreground">
										Annotate, edit and translate directly within your PDF documents with our integrated editor
									</p>
								</div>
								<ArrowRight className="size-5 text-primary opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300" />
							</div>
						</Link>
					</Card>
				</div>

				{/* AR Translation Feature Card */}
				<div className="mt-6 animate-fade-in-up delay-600">
					<Card className="border-primary/20 bg-background/60 backdrop-blur-sm hover:shadow-lg hover:border-primary/40 transition-all duration-300 group overflow-hidden">
						<Link to="/ar-translation" className="block p-6">
							<div className="flex items-center gap-6">
								<div className="size-16 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors duration-300">
									<Camera className="size-8 text-primary group-hover:scale-110 transition-transform duration-300" />
								</div>
								<div className="text-left flex-1">
									<h3 className="text-lg font-semibold mb-1 flex items-center">
										NEW: AR Translation 
										<span className="ml-2 px-2 py-0.5 text-xs bg-primary/20 text-primary rounded-full">Beta</span>
									</h3>
									<p className="text-muted-foreground">
										Point your camera at physical documents to see real-time translations overlaid on the original text
									</p>
								</div>
								<ArrowRight className="size-5 text-primary opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300" />
							</div>
						</Link>
					</Card>
				</div>
                
                {/* Voice Translation Feature Card */}
				<div className="mt-6 animate-fade-in-up delay-700">
					<Card className="border-primary/20 bg-background/60 backdrop-blur-sm hover:shadow-lg hover:border-primary/40 transition-all duration-300 group overflow-hidden">
						<Link to="/voice-translation" className="block p-6">
							<div className="flex items-center gap-6">
								<div className="size-16 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors duration-300">
									<Mic className="size-8 text-primary group-hover:scale-110 transition-transform duration-300" />
								</div>
								<div className="text-left flex-1">
									<h3 className="text-lg font-semibold mb-1 flex items-center">
										NEW: Voice Translation
										<span className="ml-2 px-2 py-0.5 text-xs bg-primary/20 text-primary rounded-full">New</span>
									</h3>
									<p className="text-muted-foreground">
										Speak in one language and get instant translations with text-to-speech output
									</p>
								</div>
								<ArrowRight className="size-5 text-primary opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300" />
							</div>
						</Link>
					</Card>
				</div>
                
                {/* Video Translation Feature Card */}
				<div className="mt-6 animate-fade-in-up delay-800">
					<Card className="border-primary/20 bg-background/60 backdrop-blur-sm hover:shadow-lg hover:border-primary/40 transition-all duration-300 group overflow-hidden">
						<Link to="/video-translation" className="block p-6">
							<div className="flex items-center gap-6">
								<div className="size-16 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors duration-300">
									<Youtube className="size-8 text-primary group-hover:scale-110 transition-transform duration-300" />
								</div>
								<div className="text-left flex-1">
									<h3 className="text-lg font-semibold mb-1 flex items-center">
										NEW: Video Translation
										<span className="ml-2 px-2 py-0.5 text-xs bg-primary/20 text-primary rounded-full">New</span>
									</h3>
									<p className="text-muted-foreground">
										Upload videos and get automatic translations and subtitles in your chosen language
									</p>
								</div>
								<ArrowRight className="size-5 text-primary opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300" />
							</div>
						</Link>
					</Card>
				</div>

				{/* Animation Demo Feature Card */}
				<div className="mt-6 animate-fade-in-up delay-900">
					<Card className="border-primary/20 bg-background/60 backdrop-blur-sm hover:shadow-lg hover:border-primary/40 transition-all duration-300 group overflow-hidden">
						<Link to="/animations" className="block p-6">
							<div className="flex items-center gap-6">
								<div className="size-16 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors duration-300">
									<Sparkles className="size-8 text-primary group-hover:scale-110 transition-transform duration-300" />
								</div>
								<div className="text-left flex-1">
									<h3 className="text-lg font-semibold mb-1 flex items-center">
										NEW: Animation Showcase
										<span className="ml-2 px-2 py-0.5 text-xs bg-gradient-to-r from-purple-500 to-primary rounded-full text-white">Featured</span>
									</h3>
									<p className="text-muted-foreground">
										Explore our collection of beautiful animations and micro-interactions
									</p>
								</div>
								<ArrowRight className="size-5 text-primary opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300" />
							</div>
						</Link>
					</Card>
				</div>
			</section>
			
			{/* Animated Demo Preview */}
			<section className="container mx-auto px-4 py-16 animate-fade-in-up delay-500">
				<div className="relative h-64 md:h-[28rem] rounded-xl overflow-hidden border border-primary/20 shadow-xl">
					<div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-primary/10 backdrop-blur-sm">
						{/* Animated elements */}
						<div className="absolute top-1/4 left-1/4 size-32 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
						<div className="absolute bottom-1/3 right-1/3 size-40 bg-primary/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
						
						{/* Demo content */}
						<div className="absolute inset-0 flex items-center justify-center">
							<div className="text-center max-w-2xl px-4">
								<div className="size-20 mx-auto mb-6 rounded-full bg-primary/20 flex items-center justify-center">
									<Languages className="size-10 text-primary" />
								</div>
								<h3 className="text-2xl font-medium mb-4">AI-Powered Document Tools</h3>
								<p className="text-lg text-muted-foreground max-w-md mx-auto mb-8">
									Translate, extract, and chat with your PDFs using state-of-the-art AI technology
								</p>
								
								{/* Demo features */}
								<div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
									<div className="p-3 bg-background/70 backdrop-blur-sm rounded-lg border border-primary/10 flex flex-col items-center">
										<Globe2 className="size-6 text-primary mb-2" />
										<span className="text-xs font-medium">10+ Languages</span>
									</div>
									<div className="p-3 bg-background/70 backdrop-blur-sm rounded-lg border border-primary/10 flex flex-col items-center">
										<Bot className="size-6 text-primary mb-2" />
										<span className="text-xs font-medium">Gemini AI</span>
									</div>
									<div className="p-3 bg-background/70 backdrop-blur-sm rounded-lg border border-primary/10 flex flex-col items-center">
										<MessageSquare className="size-6 text-primary mb-2" />
										<span className="text-xs font-medium">Chat with PDF</span>
									</div>
									<div className="p-3 bg-background/70 backdrop-blur-sm rounded-lg border border-primary/10 flex flex-col items-center">
										<BarChart2 className="size-6 text-primary mb-2" />
										<span className="text-xs font-medium">Analytics</span>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</section>
			
			{/* Call to Action */}
			<section className="container mx-auto px-4 py-16 text-center animate-fade-in-up delay-500">
				<div className="max-w-2xl mx-auto">
					<h2 className="text-3xl font-bold mb-4">Ready to work with your documents?</h2>
					<p className="text-muted-foreground mb-8">
						Get started now and experience the power of AI-powered document tools
					</p>
					<div className="flex flex-wrap justify-center gap-4">
						<Button 
							asChild 
							size="lg" 
							className="gap-2 text-lg"
						>
							<Link to="/translate">
								Start Translating <ArrowRight className="size-4" />
							</Link>
						</Button>
						<Button asChild size="lg" variant="outline" className="gap-2 text-lg">
							<Link to="/chat">
								Chat with PDF <MessageSquare className="size-4" />
							</Link>
						</Button>
					</div>
				</div>
			</section>

			{/* Welcome notification - only shows once */}
			<Button
				className="hidden"
				onClick={() => {
					Notification.success("Welcome to PolyLingo Hub!", {
						description: "Explore our features and start translating content easily."
					});
				}}
				ref={(node) => {
					// Auto-trigger welcome notification after page loads
					if (node && !window.localStorage.getItem("welcomed")) {
						setTimeout(() => {
							node.click();
							window.localStorage.setItem("welcomed", "true");
						}, 1000);
					}
				}}
			/>

			<section className="container mx-auto px-4 py-16">
				<div className="text-center mb-16">
					<h1 className="text-4xl font-bold mb-6">AI-Powered Translation Platform</h1>
					<p className="text-xl text-muted-foreground max-w-2xl mx-auto">
						Translate content across multiple formats with our advanced AI translation tools
					</p>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					{features.map((feature) => (
						<FeatureCard
							key={feature.id}
							title={feature.title}
							description={feature.description}
							icon={feature.icon}
							to={feature.to}
						/>
					))}
				</div>
			</section>
		</MainLayout>
	);
} 
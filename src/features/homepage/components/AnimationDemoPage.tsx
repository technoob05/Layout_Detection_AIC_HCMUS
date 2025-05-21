import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { AnimatedButton } from "@/components/ui/animated-button";
import { AnimatedCard } from "@/components/ui/animated-card";
import { AnimatedIcon } from "@/components/ui/animated-icon";
import { ScrollAnimation } from "@/components/ui/scroll-animation";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sparkles, Home, Mail, Settings, Heart, Menu, ArrowRight, ArrowLeft, User, Bell, Moon, Sun } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function AnimationDemoPage() {
  const [activeTab, setActiveTab] = useState("buttons");
  
  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-10">
          <ScrollAnimation type="slide-up">
            <div className="mb-4 inline-block">
              <AnimatedIcon 
                icon={Sparkles} 
                size={48} 
                animationEffect="pulse" 
                className="text-primary" 
              />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Animation Showcase
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Explore our collection of beautifully animated UI components
            </p>
          </ScrollAnimation>
        </div>
        
        <Tabs defaultValue="buttons" className="w-full mb-12" onValueChange={setActiveTab}>
          <div className="flex justify-center mb-8">
            <TabsList className="grid grid-cols-3 w-full max-w-lg">
              <TabsTrigger value="buttons">Buttons</TabsTrigger>
              <TabsTrigger value="cards">Cards</TabsTrigger>
              <TabsTrigger value="icons">Icons</TabsTrigger>
            </TabsList>
          </div>
          
          {/* Buttons Tab */}
          <TabsContent value="buttons" className="space-y-8">
            <ScrollAnimation type="slide-up" stagger staggerChildren={0.1}>
              <section className="p-6 bg-card rounded-lg shadow-sm border mb-10">
                <h2 className="text-2xl font-semibold mb-6">Animated Buttons</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="flex flex-col items-center space-y-4">
                    <AnimatedButton animationEffect="bounce" size="lg">
                      Bounce Effect
                    </AnimatedButton>
                    <p className="text-sm text-muted-foreground">Bounce on hover</p>
                  </div>
                  
                  <div className="flex flex-col items-center space-y-4">
                    <AnimatedButton animationEffect="pulse" variant="secondary" size="lg">
                      Pulse Effect
                    </AnimatedButton>
                    <p className="text-sm text-muted-foreground">Continuous pulse</p>
                  </div>
                  
                  <div className="flex flex-col items-center space-y-4">
                    <AnimatedButton animationEffect="ripple" variant="outline" size="lg">
                      Ripple Effect
                    </AnimatedButton>
                    <p className="text-sm text-muted-foreground">Click for ripple</p>
                  </div>
                  
                  <div className="flex flex-col items-center space-y-4">
                    <AnimatedButton animationEffect="shine" variant="destructive" size="lg">
                      Shine Effect
                    </AnimatedButton>
                    <p className="text-sm text-muted-foreground">Shine on hover</p>
                  </div>
                </div>
              </section>
              
              <section className="p-6 bg-card rounded-lg shadow-sm border">
                <h2 className="text-2xl font-semibold mb-6">Button Variations</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="flex flex-col items-center space-y-4">
                    <AnimatedButton animationEffect="bounce" variant="default" className="w-full">
                      <Mail className="mr-2" /> Email Login
                    </AnimatedButton>
                  </div>
                  
                  <div className="flex flex-col items-center space-y-4">
                    <AnimatedButton animationEffect="bounce" variant="secondary" className="w-full">
                      <User className="mr-2" /> Account
                    </AnimatedButton>
                  </div>
                  
                  <div className="flex flex-col items-center space-y-4">
                    <AnimatedButton animationEffect="bounce" variant="outline" className="w-full">
                      <Settings className="mr-2" /> Settings
                    </AnimatedButton>
                  </div>
                </div>
              </section>
            </ScrollAnimation>
          </TabsContent>
          
          {/* Cards Tab */}
          <TabsContent value="cards" className="space-y-8">
            <ScrollAnimation type="slide-up" stagger staggerChildren={0.15}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                <div>
                  <h2 className="text-2xl font-semibold mb-6">3D Hover Effect</h2>
                  <AnimatedCard animationEffect="3d" className="h-full">
                    <CardHeader>
                      <CardTitle>3D Tilt Effect</CardTitle>
                      <CardDescription>
                        Move your cursor over the card to see the 3D effect
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground">
                        This card uses mouse position to create a realistic 3D effect that follows your cursor movement.
                      </p>
                    </CardContent>
                    <CardFooter>
                      <Button>Learn More</Button>
                    </CardFooter>
                  </AnimatedCard>
                </div>
                
                <div>
                  <h2 className="text-2xl font-semibold mb-6">Floating Animation</h2>
                  <AnimatedCard animationEffect="float" className="h-full">
                    <CardHeader>
                      <CardTitle>Floating Card</CardTitle>
                      <CardDescription>
                        This card gently floats up and down
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground">
                        The floating animation creates a sense of lightness and draws attention to important content.
                      </p>
                    </CardContent>
                    <CardFooter>
                      <Button>Learn More</Button>
                    </CardFooter>
                  </AnimatedCard>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div>
                  <h2 className="text-2xl font-semibold mb-6">Tilt Effect</h2>
                  <AnimatedCard animationEffect="tilt" className="h-full">
                    <CardHeader>
                      <CardTitle>Tilt Effect</CardTitle>
                      <CardDescription>
                        Hover to see tilt
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground">
                        Simple tilt animation on hover.
                      </p>
                    </CardContent>
                  </AnimatedCard>
                </div>
                
                <div>
                  <h2 className="text-2xl font-semibold mb-6">Scale Effect</h2>
                  <AnimatedCard animationEffect="scale" className="h-full">
                    <CardHeader>
                      <CardTitle>Scale Effect</CardTitle>
                      <CardDescription>
                        Hover to see scaling
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground">
                        Subtle scale animation on hover.
                      </p>
                    </CardContent>
                  </AnimatedCard>
                </div>
                
                <div>
                  <h2 className="text-2xl font-semibold mb-6">Mixed Effects</h2>
                  <div className="relative">
                    <AnimatedCard animationEffect="scale" className="h-full z-10 relative bg-opacity-80 backdrop-blur-sm">
                      <CardHeader>
                        <CardTitle>Combined Effects</CardTitle>
                        <CardDescription>
                          Multiple layers of animation
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground">
                          Layered animations create depth.
                        </p>
                      </CardContent>
                    </AnimatedCard>
                    <div className="absolute inset-0 -z-10 transform translate-x-2 translate-y-2">
                      <AnimatedCard animationEffect="float" intensity="low" className="h-full w-full bg-primary/10" />
                    </div>
                  </div>
                </div>
              </div>
            </ScrollAnimation>
          </TabsContent>
          
          {/* Icons Tab */}
          <TabsContent value="icons" className="space-y-8">
            <ScrollAnimation type="slide-up">
              <section className="p-6 bg-card rounded-lg shadow-sm border mb-10">
                <h2 className="text-2xl font-semibold mb-6">Animated Icons</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8">
                  <div className="flex flex-col items-center space-y-4">
                    <AnimatedIcon 
                      icon={Home} 
                      size={36} 
                      animationEffect="pulse" 
                      className="text-primary" 
                    />
                    <p className="text-sm text-muted-foreground">Pulse</p>
                  </div>
                  
                  <div className="flex flex-col items-center space-y-4">
                    <AnimatedIcon 
                      icon={Mail} 
                      size={36} 
                      animationEffect="spin" 
                      className="text-primary" 
                    />
                    <p className="text-sm text-muted-foreground">Spin</p>
                  </div>
                  
                  <div className="flex flex-col items-center space-y-4">
                    <AnimatedIcon 
                      icon={Heart} 
                      size={36} 
                      animationEffect="bounce" 
                      className="text-primary" 
                    />
                    <p className="text-sm text-muted-foreground">Bounce</p>
                  </div>
                  
                  <div className="flex flex-col items-center space-y-4">
                    <AnimatedIcon 
                      icon={Bell} 
                      size={36} 
                      animationEffect="shake" 
                      className="text-primary" 
                    />
                    <p className="text-sm text-muted-foreground">Shake</p>
                  </div>
                  
                  <div className="flex flex-col items-center space-y-4">
                    <AnimatedIcon 
                      icon={Settings} 
                      size={36} 
                      animationEffect="morph" 
                      className="text-primary" 
                    />
                    <p className="text-sm text-muted-foreground">Morph</p>
                  </div>
                  
                  <div className="flex flex-col items-center space-y-4">
                    <AnimatedIcon 
                      icon={Sparkles} 
                      size={36} 
                      animationEffect="none" 
                      className="text-primary" 
                      onClick={() => alert('Clicked!')}
                    />
                    <p className="text-sm text-muted-foreground">Click Me</p>
                  </div>
                </div>
              </section>
            </ScrollAnimation>
            
            <ScrollAnimation type="slide-up" delay={0.2}>
              <section className="p-6 bg-card rounded-lg shadow-sm border">
                <h2 className="text-2xl font-semibold mb-6">Interactive Icons</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <AnimatedIcon 
                          icon={Moon} 
                          size={24} 
                          animationEffect="pulse" 
                          className="text-primary" 
                        />
                        Theme Switcher
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-center gap-8">
                        <AnimatedIcon 
                          icon={Moon} 
                          size={48} 
                          animationEffect="morph" 
                          className="text-indigo-500" 
                          onClick={() => alert('Dark Mode')}
                        />
                        <span className="text-lg">⟷</span>
                        <AnimatedIcon 
                          icon={Sun} 
                          size={48} 
                          animationEffect="pulse" 
                          className="text-amber-500" 
                          onClick={() => alert('Light Mode')}
                        />
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <AnimatedIcon 
                          icon={Menu} 
                          size={24} 
                          animationEffect="none" 
                          className="text-primary" 
                        />
                        Navigation
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex justify-between items-center">
                        <AnimatedIcon 
                          icon={ArrowLeft} 
                          size={36} 
                          animationEffect="none" 
                          className="text-muted-foreground hover:text-primary" 
                          onClick={() => alert('Previous')}
                        />
                        
                        <div className="flex gap-4">
                          {[1, 2, 3].map((i) => (
                            <AnimatedIcon 
                              key={i}
                              icon={i === 2 ? User : Bell} 
                              size={24} 
                              animationEffect={i === 2 ? "bounce" : "none"} 
                              isActive={i === 2}
                              className="text-muted-foreground hover:text-primary" 
                              onClick={() => alert(`Page ${i}`)}
                            />
                          ))}
                        </div>
                        
                        <AnimatedIcon 
                          icon={ArrowRight} 
                          size={36} 
                          animationEffect="none" 
                          className="text-muted-foreground hover:text-primary" 
                          onClick={() => alert('Next')}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </section>
            </ScrollAnimation>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
} 
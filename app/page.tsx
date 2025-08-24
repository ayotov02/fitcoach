import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MainLayout } from '@/components/layout/main-layout';

export default function HomePage() {
  return (
    <MainLayout>
      <div className="flex flex-col min-h-screen">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-primary py-24 sm:py-32">
          <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent" />
          <div className="container relative mx-auto px-4 text-center text-white">
            <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-6xl">
              AI-Powered Fitness
              <br />
              <span className="text-accent-green">Coaching Platform</span>
            </h1>
            <p className="mx-auto mb-10 max-w-2xl text-lg text-white/90 sm:text-xl">
              Empower your fitness coaching business with intelligent insights, 
              automated workout planning, and comprehensive client management tools.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Link href="/auth/signup">
                <Button size="lg" className="bg-white text-primary-600 hover:bg-white/90">
                  Start Free Trial
                </Button>
              </Link>
              <Link href="/marketplace">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                  Browse Marketplace
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-24 sm:py-32">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
                Everything you need to scale your coaching
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                From AI-powered workout generation to comprehensive analytics, 
                FitCoach provides all the tools you need to grow your business.
              </p>
            </div>
            
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              <Card className="border-none shadow-lg">
                <CardHeader>
                  <div className="h-12 w-12 rounded-lg bg-accent-green/10 flex items-center justify-center mb-4">
                    <div className="h-6 w-6 rounded bg-accent-green" />
                  </div>
                  <CardTitle>AI Workout Generation</CardTitle>
                  <CardDescription>
                    Generate personalized workouts instantly using AI based on client goals, preferences, and progress.
                  </CardDescription>
                </CardHeader>
              </Card>
              
              <Card className="border-none shadow-lg">
                <CardHeader>
                  <div className="h-12 w-12 rounded-lg bg-primary-100 flex items-center justify-center mb-4">
                    <div className="h-6 w-6 rounded bg-gradient-primary" />
                  </div>
                  <CardTitle>Client Management</CardTitle>
                  <CardDescription>
                    Comprehensive client profiles with progress tracking, goal setting, and communication tools.
                  </CardDescription>
                </CardHeader>
              </Card>
              
              <Card className="border-none shadow-lg">
                <CardHeader>
                  <div className="h-12 w-12 rounded-lg bg-secondary/50 flex items-center justify-center mb-4">
                    <div className="h-6 w-6 rounded bg-gradient-primary" />
                  </div>
                  <CardTitle>Progress Analytics</CardTitle>
                  <CardDescription>
                    Advanced analytics and reporting to track client progress and business performance.
                  </CardDescription>
                </CardHeader>
              </Card>
              
              <Card className="border-none shadow-lg">
                <CardHeader>
                  <div className="h-12 w-12 rounded-lg bg-accent-green/10 flex items-center justify-center mb-4">
                    <div className="h-6 w-6 rounded bg-accent-green" />
                  </div>
                  <CardTitle>Nutrition Planning</CardTitle>
                  <CardDescription>
                    AI-assisted meal planning and nutrition tracking to complement training programs.
                  </CardDescription>
                </CardHeader>
              </Card>
              
              <Card className="border-none shadow-lg">
                <CardHeader>
                  <div className="h-12 w-12 rounded-lg bg-primary-100 flex items-center justify-center mb-4">
                    <div className="h-6 w-6 rounded bg-gradient-primary" />
                  </div>
                  <CardTitle>Mobile App</CardTitle>
                  <CardDescription>
                    Native mobile apps for coaches and clients to stay connected and track progress on the go.
                  </CardDescription>
                </CardHeader>
              </Card>
              
              <Card className="border-none shadow-lg">
                <CardHeader>
                  <div className="h-12 w-12 rounded-lg bg-secondary/50 flex items-center justify-center mb-4">
                    <div className="h-6 w-6 rounded bg-gradient-primary" />
                  </div>
                  <CardTitle>Integration Ready</CardTitle>
                  <CardDescription>
                    Connect with popular fitness apps, wearables, and payment processors seamlessly.
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-gradient-primary-light py-24">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
              Ready to transform your coaching business?
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join thousands of fitness coaches who are already using FitCoach to grow their business and help more clients achieve their goals.
            </p>
            <Link href="/auth/signup">
              <Button size="lg" className="mr-4">
                Start Free Trial
              </Button>
            </Link>
            <Link href="/contact">
              <Button size="lg" variant="outline">
                Contact Sales
              </Button>
            </Link>
          </div>
        </section>
      </div>
    </MainLayout>
  );
}
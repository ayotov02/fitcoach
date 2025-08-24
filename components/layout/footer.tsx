import Link from 'next/link';

export function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="container py-8 md:py-12">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-4">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="h-6 w-6 rounded bg-gradient-primary" />
              <span className="font-bold">FitCoach</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Empowering fitness coaches with AI-driven insights and modern tools.
            </p>
          </div>
          
          <div className="space-y-4">
            <h4 className="text-sm font-semibold">Product</h4>
            <div className="space-y-2 text-sm">
              <Link href="/features" className="block text-muted-foreground hover:text-foreground">
                Features
              </Link>
              <Link href="/pricing" className="block text-muted-foreground hover:text-foreground">
                Pricing
              </Link>
              <Link href="/integrations" className="block text-muted-foreground hover:text-foreground">
                Integrations
              </Link>
            </div>
          </div>
          
          <div className="space-y-4">
            <h4 className="text-sm font-semibold">Resources</h4>
            <div className="space-y-2 text-sm">
              <Link href="/docs" className="block text-muted-foreground hover:text-foreground">
                Documentation
              </Link>
              <Link href="/blog" className="block text-muted-foreground hover:text-foreground">
                Blog
              </Link>
              <Link href="/support" className="block text-muted-foreground hover:text-foreground">
                Support
              </Link>
            </div>
          </div>
          
          <div className="space-y-4">
            <h4 className="text-sm font-semibold">Company</h4>
            <div className="space-y-2 text-sm">
              <Link href="/about" className="block text-muted-foreground hover:text-foreground">
                About
              </Link>
              <Link href="/privacy" className="block text-muted-foreground hover:text-foreground">
                Privacy
              </Link>
              <Link href="/terms" className="block text-muted-foreground hover:text-foreground">
                Terms
              </Link>
            </div>
          </div>
        </div>
        
        <div className="mt-8 flex flex-col items-center justify-between gap-4 border-t pt-8 sm:flex-row">
          <p className="text-sm text-muted-foreground">
            © 2024 FitCoach. All rights reserved.
          </p>
          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
            <Link href="/privacy" className="hover:text-foreground">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-foreground">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
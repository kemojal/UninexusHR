'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Building2, Users2, Shield, Sparkles, ArrowRight, Check, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
}

const features = [
  {
    icon: Users2,
    title: "Team Management",
    description: "Efficiently manage your entire workforce with powerful tools and insights"
  },
  {
    icon: Shield,
    title: "Enterprise Security",
    description: "Bank-grade security to protect your organization's sensitive data"
  },
  {
    icon: Sparkles,
    title: "Smart Automation",
    description: "Automate repetitive HR tasks and focus on what matters most"
  }
]

const testimonials = [
  {
    quote: "UninexusHR has transformed how we manage our organization. The platform is intuitive and powerful.",
    author: "Sarah Johnson",
    role: "HR Director",
    company: "TechCorp",
    avatar: "SJ"
  },
  {
    quote: "The best HR platform we've used. It has everything we need to manage our growing team.",
    author: "Michael Chen",
    role: "CEO",
    company: "InnovateTech",
    avatar: "MC"
  },
  {
    quote: "Outstanding support and constant improvements. UninexusHR keeps getting better.",
    author: "Emily Davis",
    role: "People Ops Lead",
    company: "GrowthCo",
    avatar: "ED"
  }
]

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Navigation */}
      <header className="fixed top-0 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-50">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2 text-lg font-semibold">
            <Building2 className="h-6 w-6 text-primary" />
            UninexusHR
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="#features" className="text-sm font-medium text-muted-foreground hover:text-primary">
              Features
            </Link>
            <Link href="#testimonials" className="text-sm font-medium text-muted-foreground hover:text-primary">
              Testimonials
            </Link>
            <Link href="#pricing" className="text-sm font-medium text-muted-foreground hover:text-primary">
              Pricing
            </Link>
            <Link href="/login">
              <Button variant="ghost">Sign in</Button>
            </Link>
            <Link href="/register">
              <Button>Get Started</Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <motion.section 
        className="container pt-32 pb-16 text-center lg:pt-48 lg:pb-32"
        variants={container}
        initial="hidden"
        animate="show"
      >
        <motion.h1 
          variants={item}
          className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl"
        >
          Modern HR Platform for
          <span className="text-primary"> Growing Teams</span>
        </motion.h1>
        <motion.p 
          variants={item}
          className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground"
        >
          Streamline your HR operations with our all-in-one platform. From onboarding to performance management, we've got you covered.
        </motion.p>
        <motion.div 
          variants={item}
          className="mt-10 flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Link href="/register">
            <Button size="lg" className="gap-2">
              Get Started Free
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Button size="lg" variant="outline" className="gap-2">
            Book a Demo
            <ChevronRight className="h-4 w-4" />
          </Button>
        </motion.div>
      </motion.section>

      {/* Features Section */}
      <section id="features" className="container py-16 lg:py-32">
        <motion.div
          className="grid grid-cols-1 gap-8 lg:grid-cols-3"
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
        >
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              variants={item}
              className="relative overflow-hidden rounded-lg border bg-background p-8"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <feature.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mt-4 text-xl font-semibold">{feature.title}</h3>
              <p className="mt-2 text-muted-foreground">{feature.description}</p>
              <div className="mt-4 flex flex-col gap-2">
                {[1, 2, 3].map((_, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" />
                    <span className="text-sm">Feature point {i + 1}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="border-t bg-muted/50">
        <div className="container py-16 lg:py-32">
          <motion.div
            className="text-center mb-16"
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
          >
            <motion.h2 
              variants={item}
              className="text-3xl font-bold tracking-tight"
            >
              Loved by HR Teams Worldwide
            </motion.h2>
            <motion.p 
              variants={item}
              className="mt-4 text-lg text-muted-foreground"
            >
              Don't just take our word for it. See what our customers have to say.
            </motion.p>
          </motion.div>
          <motion.div
            className="grid grid-cols-1 gap-8 lg:grid-cols-3"
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
          >
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.author}
                variants={item}
                className="relative overflow-hidden rounded-lg border bg-background p-8"
              >
                <div className="flex items-start gap-4">
                  <Avatar>
                    <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${testimonial.avatar}`} />
                    <AvatarFallback>{testimonial.avatar}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm leading-loose text-muted-foreground">
                      "{testimonial.quote}"
                    </p>
                    <div className="mt-4">
                      <p className="font-semibold">{testimonial.author}</p>
                      <p className="text-sm text-muted-foreground">
                        {testimonial.role}, {testimonial.company}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t">
        <motion.div
          className="container py-16 lg:py-32 text-center"
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
        >
          <motion.h2 
            variants={item}
            className="text-3xl font-bold tracking-tight sm:text-4xl"
          >
            Ready to transform your HR operations?
          </motion.h2>
          <motion.p 
            variants={item}
            className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground"
          >
            Join thousands of companies using UninexusHR to streamline their HR processes.
          </motion.p>
          <motion.div 
            variants={item}
            className="mt-10"
          >
            <Link href="/register">
              <Button size="lg" className="gap-2">
                Get Started Free
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t">
        <div className="container py-8">
          <div className="flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
            <div className="flex items-center gap-2 text-sm">
              <Building2 className="h-4 w-4" />
              <span> 2024 UninexusHR. All rights reserved.</span>
            </div>
            <nav className="flex items-center gap-4 text-sm">
              <Link href="/privacy" className="text-muted-foreground hover:text-foreground">
                Privacy
              </Link>
              <Link href="/terms" className="text-muted-foreground hover:text-foreground">
                Terms
              </Link>
              <a href="mailto:support@uninexushr.com" className="text-muted-foreground hover:text-foreground">
                Contact
              </a>
            </nav>
          </div>
        </div>
      </footer>
    </div>
  )
}

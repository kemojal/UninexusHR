"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import {
  Building2,
  Users2,
  Shield,
  Sparkles,
  ArrowRight,
  Check,
  ChevronRight,
  Globe,
  Zap,
  Award,
  BarChart3,
  Clock,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

const features = [
  {
    icon: Users2,
    title: "Intelligent Team Management",
    description:
      "AI-powered workforce analytics and insights to optimize team performance",
    benefits: [
      "Real-time performance tracking",
      "Predictive analytics",
      "Custom reporting dashboard",
    ],
  },
  {
    icon: Shield,
    title: "Enterprise-Grade Security",
    description:
      "Military-grade encryption with SOC 2 Type II and ISO 27001 certification",
    benefits: [
      "End-to-end encryption",
      "Multi-factor authentication",
      "Regular security audits",
    ],
  },
  {
    icon: Sparkles,
    title: "Advanced Automation",
    description: "Streamline workflows with ML-powered process automation",
    benefits: [
      "Smart document processing",
      "Automated compliance",
      "Intelligent scheduling",
    ],
  },
];

const stats = [
  { value: "99.99%", label: "Uptime" },
  { value: "50M+", label: "Employee Records" },
  { value: "10,000+", label: "Global Customers" },
  { value: "190+", label: "Countries Served" },
];

const testimonials = [
  {
    quote:
      "UninexusHR has revolutionized our entire HR infrastructure. The AI-driven insights have been game-changing for our organization's growth.",
    author: "Sarah Johnson",
    role: "Chief People Officer",
    company: "TechCorp",
    avatar: "SJ",
    rating: 5,
  },
  {
    quote:
      "The most sophisticated HR platform we've encountered. The attention to detail and powerful automation capabilities are unmatched.",
    author: "Michael Chen",
    role: "CEO",
    company: "InnovateTech",
    avatar: "MC",
    rating: 5,
  },
  {
    quote:
      "Outstanding enterprise support and continuous innovation. UninexusHR sets the gold standard in HR technology.",
    author: "Emily Davis",
    role: "Global HR Director",
    company: "GrowthCo",
    avatar: "ED",
    rating: 5,
  },
];

export default function Home() {
  const [isScrolled, setIsScrolled] = useState(false);
  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-background to-background/95">
      {/* Floating Navigation */}
      <header
        className={`fixed top-0 w-full z-50 transition-all duration-300 ${
          isScrolled
            ? "bg-background/95 backdrop-blur-lg shadow-sm"
            : "bg-transparent"
        }`}
      >
        <div className="container flex h-20 items-center justify-between">
          <div className="flex items-center gap-2 text-xl font-bold">
            <Building2 className="h-8 w-8 text-primary" />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/80">
              UninexusHR
            </span>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            {["Features", "Enterprise", "Security", "Pricing"].map((item) => (
              <Link
                key={item}
                href={`#${item.toLowerCase()}`}
                className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
              >
                {item}
              </Link>
            ))}
            <div className="flex items-center gap-4">
              <Link href="/login">
                <Button variant="ghost" className="font-medium">
                  Sign in
                </Button>
              </Link>
              <Link href="/register">
                <Button className="font-medium shadow-lg hover:shadow-xl transition-shadow">
                  Start Free Trial
                </Button>
              </Link>
            </div>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center pt-20">
        <motion.div className="absolute inset-0 z-0" style={{ opacity }}>
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-primary/10" />
          <div className="absolute bottom-0 left-0 right-0 h-96 bg-gradient-to-t from-background to-transparent" />
        </motion.div>

        <div className="container relative z-10 py-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            <Badge variant="outline" className="mb-8 py-2 px-4">
              <Globe className="mr-2 h-4 w-4" />
              Trusted by 10,000+ companies worldwide
            </Badge>

            <h1 className="text-6xl font-bold tracking-tight lg:text-7xl xl:text-8xl mb-8">
              <span className="block">The Future of</span>
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-primary/90 to-primary/80">
                HR Management
              </span>
            </h1>

            <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto">
              Transform your HR operations with AI-powered insights,
              enterprise-grade security, and seamless automation.
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link href="/register">
                <Button
                  size="lg"
                  className="h-14 px-8 text-lg shadow-lg hover:shadow-xl transition-shadow"
                >
                  Start Free Trial
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Button
                size="lg"
                variant="outline"
                className="h-14 px-8 text-lg hover:bg-primary/5"
              >
                Schedule Demo
                <ChevronRight className="ml-2 h-5 w-5" />
              </Button>
            </div>

            <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-3xl font-bold text-primary mb-2">
                    {stat.value}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-32 bg-muted/30">
        <div className="container">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-4xl font-bold mb-6">
              Enterprise Features for Modern Teams
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Powerful tools designed for scale, security, and performance.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                className="group relative overflow-hidden rounded-2xl border bg-background/50 backdrop-blur-sm p-8 hover:shadow-lg transition-all"
              >
                <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                <div className="relative">
                  <div className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
                    <feature.icon className="h-7 w-7 text-primary" />
                  </div>

                  <h3 className="text-2xl font-semibold mb-4">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    {feature.description}
                  </p>

                  <div className="space-y-3">
                    {feature.benefits.map((benefit) => (
                      <div key={benefit} className="flex items-center gap-3">
                        <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center">
                          <Check className="h-3 w-3 text-primary" />
                        </div>
                        <span className="text-sm">{benefit}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-32">
        <div className="container">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <Badge variant="outline" className="mb-6">
              <Award className="mr-2 h-4 w-4" />
              Trusted by Industry Leaders
            </Badge>
            <h2 className="text-4xl font-bold mb-6">
              What Our Enterprise Customers Say
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.author}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                className="relative rounded-2xl border bg-background p-8 hover:shadow-lg transition-all"
              >
                <div className="flex flex-col gap-6">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage
                        src={`https://api.dicebear.com/7.x/initials/svg?seed=${testimonial.avatar}`}
                      />
                      <AvatarFallback>{testimonial.avatar}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="font-semibold">{testimonial.author}</h4>
                      <p className="text-sm text-muted-foreground">
                        {testimonial.role}, {testimonial.company}
                      </p>
                    </div>
                  </div>

                  <p className="text-lg italic text-muted-foreground">
                    "{testimonial.quote}"
                  </p>

                  <div className="flex gap-1">
                    {Array.from({ length: testimonial.rating }).map((_, i) => (
                      <Sparkles key={i} className="h-5 w-5 text-primary" />
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 bg-muted/30">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="container max-w-4xl text-center"
        >
          <Badge variant="outline" className="mb-8">
            <Zap className="mr-2 h-4 w-4" />
            Get Started in Minutes
          </Badge>

          <h2 className="text-4xl font-bold mb-6">
            Ready to Transform Your HR Operations?
          </h2>

          <p className="text-xl text-muted-foreground mb-12">
            Join thousands of forward-thinking companies already using
            UninexusHR to power their HR operations.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link href="/register">
              <Button
                size="lg"
                className="h-14 px-8 text-lg shadow-lg hover:shadow-xl transition-shadow"
              >
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Button
              size="lg"
              variant="outline"
              className="h-14 px-8 text-lg hover:bg-primary/5"
            >
              View Enterprise Plan
              <ChevronRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </motion.div>
      </section>
      {/* Footer */}
      {/* Footer */}
      <footer className="border-t">
        <div className="container py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-lg font-bold">
                <Building2 className="h-6 w-6 text-primary" />
                UninexusHR
              </div>
              <p className="text-sm text-muted-foreground">
                Enterprise HR management platform trusted by leading companies
                worldwide.
              </p>
              <div className="flex gap-4">
                {["twitter", "linkedin", "github"].map((social) => (
                  <a
                    key={social}
                    href={`https://${social}.com/uninexushr`}
                    className="text-muted-foreground hover:text-primary transition-colors"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <div className="h-10 w-10 rounded-full bg-muted/50 flex items-center justify-center">
                      <Globe className="h-5 w-5" />
                    </div>
                  </a>
                ))}
              </div>
            </div>

            {["Product", "Company", "Resources", "Legal"].map((section) => (
              <div key={section} className="space-y-4">
                <h4 className="font-semibold text-primary">{section}</h4>
                <ul className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <li key={i}>
                      <Link
                        href="#"
                        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {section === "Product" &&
                          [
                            "Features",
                            "Security",
                            "Enterprise",
                            "Pricing",
                            "Integration",
                          ][i]}
                        {section === "Company" &&
                          ["About", "Careers", "Partners", "News", "Contact"][
                            i
                          ]}
                        {section === "Resources" &&
                          ["Documentation", "Guides", "API", "Status", "Blog"][
                            i
                          ]}
                        {section === "Legal" &&
                          [
                            "Privacy",
                            "Terms",
                            "Security",
                            "Compliance",
                            "Patents",
                          ][i]}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-16 pt-8 border-t">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Building2 className="h-4 w-4" />
                <span>
                  © {new Date().getFullYear()} UninexusHR. All rights reserved.
                </span>
              </div>

              <div className="flex items-center gap-8">
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-primary" />
                  <select className="bg-transparent text-sm font-medium focus:outline-none focus:ring-0">
                    <option>English (US)</option>
                    <option>Español</option>
                    <option>Français</option>
                  </select>
                </div>

                <div className="flex items-center gap-4">
                  <BarChart3 className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">
                    SOC2 Type II Certified
                  </span>
                </div>

                <div className="flex items-center gap-4">
                  <Lock className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">ISO 27001</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

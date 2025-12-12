"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Wallet, TrendingUp, PieChart, Shield, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";

const features = [
  {
    icon: Shield,
    title: "Smart 20% Savings",
    description: "Automatically save with accountability",
  },
  {
    icon: PieChart,
    title: "Visual Insights",
    description: "Beautiful charts to track progress",
  },
  {
    icon: TrendingUp,
    title: "Grow Your Wealth",
    description: "Watch your savings compound over time",
  },
];

const testimonials = [
  {
    quote: "Finally, a budgeting app that actually makes sense!",
    author: "Sarah K.",
    role: "Freelance Designer",
  },
  {
    quote: "The 20% rule changed how I think about saving.",
    author: "Michael T.",
    role: "Software Engineer",
  },
  {
    quote: "Simple, beautiful, and incredibly effective.",
    author: "Emma R.",
    role: "Marketing Manager",
  },
];

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    const timer = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-background">
      {/* Left Side - Branding & Visual */}
      <div className="relative lg:w-[45%] xl:w-[50%] bg-gradient-to-br from-primary via-primary/90 to-blue-600 overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          {/* Grid pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,#000_40%,transparent_100%)]" />

          {/* Floating orbs */}
          <motion.div
            className="absolute top-20 left-10 w-72 h-72 bg-white/10 rounded-full blur-3xl"
            animate={{
              y: [0, -30, 0],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <motion.div
            className="absolute bottom-20 right-10 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl"
            animate={{
              y: [0, 20, 0],
              x: [0, -20, 0],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <motion.div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl"
            animate={{
              scale: [1, 1.3, 1],
            }}
            transition={{
              duration: 12,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />

          {/* Floating coins/elements */}
          <motion.div
            className="absolute top-[20%] right-[20%] w-12 h-12 bg-yellow-400/80 rounded-full shadow-lg flex items-center justify-center text-yellow-900 font-bold text-xl"
            animate={{
              y: [0, -20, 0],
              rotate: [0, 10, 0],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            $
          </motion.div>
          <motion.div
            className="absolute bottom-[30%] left-[15%] w-10 h-10 bg-green-400/80 rounded-full shadow-lg flex items-center justify-center text-green-900 font-bold"
            animate={{
              y: [0, 15, 0],
              rotate: [0, -15, 0],
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1,
            }}
          >
            €
          </motion.div>
          <motion.div
            className="absolute top-[60%] right-[10%] w-8 h-8 bg-blue-300/80 rounded-full shadow-lg flex items-center justify-center text-blue-900 font-bold text-sm"
            animate={{
              y: [0, -12, 0],
              x: [0, 8, 0],
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 2,
            }}
          >
            £
          </motion.div>
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between h-full p-8 lg:p-12 text-white min-h-[300px] lg:min-h-screen">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Link href="/" className="flex items-center gap-3 group">
              <motion.div
                className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg border border-white/20"
                whileHover={{ scale: 1.05, rotate: -5 }}
                whileTap={{ scale: 0.95 }}
              >
                <Wallet className="w-6 h-6" />
              </motion.div>
              <span className="text-2xl font-bold">Budget App</span>
            </Link>
          </motion.div>

          {/* Main Message - Hidden on mobile, visible on desktop */}
          <div className="hidden lg:block">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="max-w-md"
            >
              <h1 className="text-4xl xl:text-5xl font-bold mb-6 leading-tight">
                Your financial clarity starts here
              </h1>
              <p className="text-white/80 text-lg mb-8">
                Join thousands of people taking control of their finances with
                smart budgeting and the proven 20% savings rule.
              </p>

              {/* Features */}
              <div className="space-y-4">
                {features.map((feature, i) => (
                  <motion.div
                    key={feature.title}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 + i * 0.1 }}
                    className="flex items-center gap-4"
                  >
                    <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/20">
                      <feature.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-semibold">{feature.title}</div>
                      <div className="text-white/60 text-sm">
                        {feature.description}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Testimonials - Hidden on mobile */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="hidden lg:block"
          >
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 max-w-md">
              <div className="flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-yellow-300 flex-shrink-0 mt-1" />
                <div>
                  <motion.p
                    key={currentTestimonial}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="text-white/90 italic mb-3"
                  >
                    &ldquo;{testimonials[currentTestimonial].quote}&rdquo;
                  </motion.p>
                  <motion.div
                    key={`author-${currentTestimonial}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-sm"
                  >
                    <span className="font-semibold">
                      {testimonials[currentTestimonial].author}
                    </span>
                    <span className="text-white/60">
                      {" "}
                      — {testimonials[currentTestimonial].role}
                    </span>
                  </motion.div>
                </div>
              </div>
              {/* Testimonial indicators */}
              <div className="flex gap-2 mt-4">
                {testimonials.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentTestimonial(i)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      i === currentTestimonial
                        ? "bg-white w-6"
                        : "bg-white/40 hover:bg-white/60"
                    }`}
                    aria-label={`View testimonial ${i + 1}`}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right Side - Form Area */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="w-full max-w-md"
        >
          {children}
        </motion.div>
      </div>
    </div>
  );
}

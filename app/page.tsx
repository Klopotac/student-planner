"use client";

import { motion, useScroll } from "framer-motion";
import { useState } from "react";
import Link from "next/link";
import { loadStripe } from "@stripe/stripe-js";
import { 
  SparklesIcon, 
  ClockIcon, 
  CpuChipIcon, 
  CloudArrowUpIcon,
  CheckCircleIcon,
  ChartBarIcon,
  UserGroupIcon,
  StarIcon
} from "@heroicons/react/24/outline";

// Initialize Stripe with your public key
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY || "");

const testimonials = [
  {
    name: "Sarah Johnson",
    role: "Medical Student",
    content: "This planner helped me organize my study schedule for USMLE. The AI suggestions were spot-on!",
    rating: 5
  },
  {
    name: "Marcus Chen",
    role: "Computer Science Major",
    content: "The focus mode is a game-changer. My productivity has increased by 40% since using this app.",
    rating: 5
  },
  {
    name: "Emma Davis",
    role: "Law Student",
    content: "Perfect for managing complex study materials. The cloud sync feature lets me study anywhere.",
    rating: 4
  }
];

const stats = [
  { label: "Active Users", value: "10,000+" },
  { label: "Study Hours Tracked", value: "1M+" },
  { label: "Average Grade Improvement", value: "15%" },
  { label: "Student Satisfaction", value: "98%" }
];

const pricingTiers = [
  {
    name: "Basic",
    price: "Free",
    features: ["Basic AI scheduling", "Focus timer", "Progress tracking"],
    cta: "Start Free"
  },
  {
    name: "Pro",
    price: "€2/month",
    features: ["Advanced AI scheduling", "Cloud sync", "Focus mode", "Priority support"],
    cta: "Get Pro",
    highlighted: true
  }
];

export default function Home() {
  const [loading, setLoading] = useState(false);
  const { scrollYProgress } = useScroll();

  const features = [
    {
      title: "AI Scheduling",
      desc: "Our advanced AI analyzes your study patterns and optimizes your schedule for maximum retention and efficiency.",
      icon: ClockIcon,
    },
    {
      title: "Focus Mode",
      desc: "Block distractions, track study sessions, and maintain your concentration with our intelligent focus tools.",
      icon: CpuChipIcon,
    },
    {
      title: "Cloud Sync",
      desc: "Seamlessly sync your study plans across all devices. Never lose your progress.",
      icon: CloudArrowUpIcon,
    }
  ];

  const fadeInUpVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  // Stripe checkout function (same functionality as before)
  const handleBuyNow = async () => {
    setLoading(true);
    try {
      const stripe = await stripePromise;
      if (!stripe) {
        alert("Stripe failed to load. Check your API key.");
        setLoading(false);
        return;
      }

      const res = await fetch("/api/stripe/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) {
        const errorData = await res.json();
        alert("Error: " + (errorData.error || "Unknown error"));
        setLoading(false);
        return;
      }

      const data = await res.json();
      if (data.url) {
        window.location.href = data.url; // Redirect to Stripe Checkout
      } else {
        alert("No checkout session URL returned.");
      }
    } catch (error) {
      console.error("Checkout Error:", error);
      alert("Checkout failed. Please try again.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Progress Bar */}
      <motion.div 
        className="fixed top-0 left-0 right-0 h-1 bg-blue-600 origin-left z-50"
        style={{ scaleX: scrollYProgress }}
      />

      {/* Hero Section */}
      <section className="relative px-6 pt-16 pb-20 lg:px-8 lg:pt-24">
        <motion.div 
          className="mx-auto max-w-7xl"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          <div className="text-center">
            <motion.div
              className="absolute inset-0 -z-10"
              animate={{
                background: [
                  "radial-gradient(circle, rgba(59,130,246,0.1) 0%, rgba(255,255,255,0) 70%)",
                  "radial-gradient(circle, rgba(59,130,246,0.2) 0%, rgba(255,255,255,0) 70%)"
                ]
              }}
              transition={{ duration: 4, repeat: Infinity, repeatType: "reverse" }}
            />
            <motion.h1 
              variants={fadeInUpVariants}
              className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl"
            >
              Optimize Your Study Time
            </motion.h1>
            <motion.p
              variants={fadeInUpVariants}
              className="mt-6 text-lg leading-8 text-gray-600 max-w-2xl mx-auto"
            >
              The ultimate AI-powered study planner to help you focus and succeed.
              Transform your learning experience with personalized schedules and intelligent tracking.
            </motion.p>
            <motion.div
              variants={fadeInUpVariants}
              className="mt-10 flex gap-4 justify-center"
            >
              <Link
                href="#pricing"
                className="rounded-full bg-blue-600 px-8 py-4 text-lg font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 transition-all duration-200 hover:scale-105"
              >
                Get Started
              </Link>
              <Link
                href="#demo"
                className="rounded-full bg-gray-100 px-8 py-4 text-lg font-semibold text-gray-900 shadow-sm hover:bg-gray-200 transition-all duration-200 hover:scale-105"
              >
                Watch Demo
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-blue-600">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <motion.div 
            className="grid grid-cols-2 gap-8 md:grid-cols-4"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
          >
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                variants={fadeInUpVariants}
                className="text-center"
              >
                <motion.div 
                  className="text-4xl font-bold text-white mb-2"
                  initial={{ scale: 0.5 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ type: "spring", duration: 1, delay: i * 0.1 }}
                >
                  {stat.value}
                </motion.div>
                <div className="text-blue-100">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white" id="features">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <motion.div 
            className="text-center"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Why Choose Our Planner?
            </h2>
          </motion.div>
          <motion.div 
            className="mt-20 grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-3"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                variants={fadeInUpVariants}
                whileHover={{ scale: 1.05 }}
                className="relative rounded-2xl border border-gray-200 p-8 shadow-sm hover:shadow-lg transition-all duration-300"
              >
                <motion.div 
                  className="mb-6"
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.5 }}
                >
                  <feature.icon className="h-12 w-12 text-blue-600" />
                </motion.div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  {feature.title}
                </h3>
                <p className="text-gray-600">{feature.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-gray-50">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 text-center mb-16">
            What Our Users Say
          </h2>
          <motion.div 
            className="grid grid-cols-1 gap-8 md:grid-cols-3"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {testimonials.map((testimonial, i) => (
              <motion.div
                key={testimonial.name}
                variants={fadeInUpVariants}
                whileHover={{ y: -10 }}
                className="bg-white p-6 rounded-xl shadow-md"
              >
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <StarIcon key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 mb-4">{testimonial.content}</p>
                <div className="font-semibold">{testimonial.name}</div>
                <div className="text-sm text-gray-500">{testimonial.role}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-24 bg-white" id="pricing">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 text-center mb-16">
            Simple, Transparent Pricing
          </h2>
          <motion.div 
            className="grid grid-cols-1 gap-8 md:grid-cols-2 max-w-4xl mx-auto"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {pricingTiers.map((tier) => (
              <motion.div
                key={tier.name}
                variants={fadeInUpVariants}
                whileHover={{ scale: 1.05 }}
                className={`rounded-2xl p-8 ${
                  tier.highlighted 
                    ? 'border-2 border-blue-600 shadow-xl' 
                    : 'border border-gray-200 shadow-sm'
                }`}
              >
                <h3 className="text-2xl font-semibold mb-4">{tier.name}</h3>
                <div className="text-4xl font-bold mb-6">{tier.price}</div>
                <ul className="space-y-4 mb-8">
                  {tier.features.map(feature => (
                    <li key={feature} className="flex items-center">
                      <CheckCircleIcon className="h-5 w-5 text-blue-600 mr-2" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <button 
                  onClick={tier.name === "Pro" ? handleBuyNow : undefined}
                  disabled={tier.name === "Pro" && loading}
                  className={`w-full py-3 px-6 rounded-full font-semibold ${
                    tier.highlighted
                      ? 'bg-blue-600 text-white hover:bg-blue-500'
                      : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                  } transition-colors duration-200`}
                >
                  {tier.name === "Pro" && loading ? "Processing..." : tier.cta}
                </button>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-blue-600">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <motion.div 
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold text-white mb-6">
              Ready to Transform Your Study Habits?
            </h2>
            <p className="text-blue-100 mb-8 max-w-2xl mx-auto">
              Join thousands of successful students who have already optimized their learning with our AI-powered study planner.
            </p>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="bg-white text-blue-600 px-8 py-4 rounded-full font-semibold hover:bg-blue-50 transition-colors duration-200"
            >
              Get Started Now
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2">
                <li>Features</li>
                <li>Pricing</li>
                <li>FAQ</li>
                <li>Support</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2">
                <li>About</li>
                <li>Blog</li>
                <li>Careers</li>
                <li>Contact</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2">
                <li>Privacy</li>
                <li>Terms</li>
                <li>Security</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Connect</h4>
              <ul className="space-y-2">
                <li>Twitter</li>
                <li>LinkedIn</li>
                <li>Facebook</li>
                <li>Instagram</li>
              </ul>
            </div>
          </div>
          <div className="mt-8 border-t border-gray-700 pt-8 text-center">
            <p className="text-sm text-gray-500">
              &copy; 2025 Study Planner. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

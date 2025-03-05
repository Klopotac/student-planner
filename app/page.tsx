"use client";

import { motion, useScroll } from "framer-motion";
import { useState } from "react";
import Link from "next/link";
import { loadStripe } from "@stripe/stripe-js";
import { 
  SparklesIcon, 
  CpuChipIcon, 
  CloudArrowUpIcon,
  CheckCircleIcon,
  ChartBarIcon,
  UserGroupIcon,
  StarIcon
} from "@heroicons/react/24/outline";
import { signIn, signOut, useSession } from "next-auth/react";

// Initialize Stripe with your public key
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY || "");

const testimonials = [
  {
    name: "Alex Turner",
    role: "Beta Tester",
    content: "Bee Swarm Geo Guesser is a refreshing twist on location-based games. I love the immersive experience!",
    rating: 5
  },
  {
    name: "Jordan Lee",
    role: "Early Adopter",
    content: "The combination of bee swarm simulation and geo guessing is both unique and engaging.",
    rating: 5
  },
  {
    name: "Casey Morgan",
    role: "Enthusiast",
    content: "The game offers an innovative challenge that keeps me coming back for more adventures.",
    rating: 4
  }
];

const features = [
  {
    title: "100+ Locations",
    desc: "Explore a wide range of locations on the map, each with unique difficulty.",
    
    icon: UserGroupIcon,
  },
  {
    title: "Geo Guessing Challenge",
    desc: "Put your game skills to the test as you identify locations from unique screenshots.",
    icon: ChartBarIcon,
  },
  {
    title: "Free Demo",
    desc: "Try the game for free with limited access and preview gameplay.",
    icon: SparklesIcon,
  }
];

const pricingTiers = [
  {
    name: "Demo",
    price: "Free",
    features: ["Limited access preview", "Demo gameplay", "Early feedback"],
    cta: "Try Demo",
    demo: true
  },
  {
    name: "Pro",
    price: "€2/month",
    features: ["Full access", "Exclusive features", "Priority support"],
    cta: "Get Pro",
    highlighted: true
  }
];

const AuthButton = () => {
  const { data: session } = useSession();
  
  return (
    <>
      {session ? (
        <div className="flex items-center gap-2">
          <span className="text-sm">Hi, {session.user?.name}</span>
          <Link
            href="/app"
            className="rounded-full bg-blue-600 px-6 py-3 text-white hover:bg-blue-500 transition-all"
          >
            Go to Game
          </Link>
          <button 
            onClick={() => signOut()}
            className="rounded-full bg-gray-100 px-6 py-3 text-gray-900 hover:bg-gray-200 transition-all"
          >
            Sign Out
          </button>
        </div>
      ) : (
        <button
          onClick={() => signIn("google")}
          className="rounded-full bg-white text-gray-900 border border-gray-300 px-6 py-3 hover:bg-gray-50 transition-all flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Sign in with Google
        </button>
      )}
    </>
  );
};

export default function Home() {
  const [loading, setLoading] = useState(false);
  const { scrollYProgress } = useScroll();
  const { data: session } = useSession();

  // Stripe checkout function for Pro plan
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
        window.location.href = data.url;
      } else {
        alert("No checkout session URL returned.");
      }
    } catch (error) {
      console.error("Checkout Error:", error);
      alert("Checkout failed. Please try again.");
    }
    setLoading(false);
  };

  // Placeholder function for Demo plan
  const handleDemo = () => {
    alert("Demo mode coming soon!");
  };

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
              Experience the Buzz: Discover Bee Swarm Geo Guesser
            </motion.h1>
            <motion.p
              variants={fadeInUpVariants}
              className="mt-6 text-lg leading-8 text-gray-600 max-w-2xl mx-auto"
            >
              Step into a world where nature meets navigation. Challenge your geo skills and dive into immersive bee swarm simulations across stunning landscapes.
            </motion.p>
            <motion.div
              variants={fadeInUpVariants}
              className="mt-10 flex gap-4 justify-center"
            >
              <AuthButton />
              {!session && (
                <>
                  <Link
                    href="#features"
                    className="rounded-full bg-blue-600 px-8 py-4 text-lg font-semibold text-white shadow-sm hover:bg-blue-500 transition-all duration-200 hover:scale-105"
                  >
                    Play Now
                  </Link>
                  <Link
                    href="#trailer"
                    className="rounded-full bg-gray-100 px-8 py-4 text-lg font-semibold text-gray-900 shadow-sm hover:bg-gray-200 transition-all duration-200 hover:scale-105"
                  >
                    Watch Trailer
                  </Link>
                </>
              )}
            </motion.div>
          </div>
        </motion.div>
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
              Why Play Bee Swarm Geo Guesser?
            </h2>
          </motion.div>
          <motion.div 
            className="mt-20 grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-3"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {features.map((feature) => (
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

      {/* Testimonials Section */}
      <section className="py-24 bg-gray-50">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 text-center mb-16">
            What Early Players Say
          </h2>
          <motion.div 
            className="grid grid-cols-1 gap-8 md:grid-cols-3"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {testimonials.map((testimonial) => (
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
            Choose Your Plan
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
                  onClick={tier.demo ? handleDemo : handleBuyNow}
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

      {/* Call-to-Action Section */}
      <section className="py-24 bg-blue-600">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <motion.div 
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold text-white mb-6">
              Ready to Join the Swarm?
            </h2>
            <p className="text-blue-100 mb-8 max-w-2xl mx-auto">
              Immerse yourself in a unique blend of nature and navigation. Whether you’re trying the demo or going all in with Pro, your adventure awaits.
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
              &copy; 2025 Bee Swarm Geo Guesser. All rights reserved.
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Need help? Email us at <a href="mailto:help@yourdomain.com" className="underline">help@yourdomain.com</a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

"use client";

import { motion, useScroll } from "framer-motion";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { loadStripe } from "@stripe/stripe-js";
import { 
  MapPinIcon, 
  BoltIcon, 
  GlobeAltIcon,
  CheckCircleIcon,
  MapIcon,
  UsersIcon,
  StarIcon
} from "@heroicons/react/24/outline";
import { signIn, signOut, useSession } from "next-auth/react";

// Define Bee interface for type safety
interface Bee {
  initialX: number;
  initialY: number;
  opacity: number;
  animateX: number[];
  animateY: number[];
  duration: number;
}

// Initialize Stripe with your public key
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY || "");

const testimonials = [
  {
    name: "Maya Johnson",
    role: "Bee Enthusiast",
    content: "The bee swarm mechanics are so realistic! I love flying around and discovering new locations.",
    rating: 5
  },
  {
    name: "Tyler Wilson",
    role: "Geography Buff",
    content: "Finally a geo-guessing game with a unique twist. The bee perspective makes everything feel fresh!",
    rating: 5
  },
  {
    name: "Olivia Chen",
    role: "Casual Gamer",
    content: "I never thought I'd learn so much about bees and geography in one game. Addictively fun!",
    rating: 4
  }
];

const features = [
  {
    title: "Immersive Bee Physics",
    desc: "Experience realistic swarm behavior as you navigate through diverse environments with your hive.",
    icon: BoltIcon,
  },
  {
    title: "Global Locations",
    desc: "Test your geography skills across 100+ unique locations from meadows to mountains.",
    icon: GlobeAltIcon,
  },
  {
    title: "Hive Mind Challenge",
    desc: "Compete with friends to see who can identify locations fastest and build the largest swarm.",
    icon: MapIcon,
  }
];

const pricingTiers = [
  {
    name: "Worker Bee",
    price: "Free",
    features: ["3 starter locations", "Basic swarm mechanics", "Daily challenges"],
    cta: "Start Buzzing",
    demo: true
  },
  {
    name: "Queen Bee",
    price: "€2/month",
    features: ["Unlimited locations", "Advanced swarm customization", "Global leaderboards", "Exclusive seasonal events"],
    cta: "Upgrade Hive",
    highlighted: true
  }
];

const AuthButton = () => {
  const { data: session } = useSession();
  
  return (
    <>
      {session ? (
        <div className="flex items-center gap-2">
          <span className="text-sm">Buzz, {session.user?.name}!</span>
          <Link
            href="/lobby"
            className="rounded-full bg-amber-500 px-6 py-3 text-white hover:bg-amber-400 transition-all"
          >
            Play
          </Link>
          <button 
            onClick={() => signOut()}
            className="rounded-full bg-amber-100 px-6 py-3 text-amber-800 hover:bg-amber-200 transition-all"
          >
            Fly Away
          </button>
        </div>
      ) : (
        <button
          onClick={() => signIn("google")}
          className="rounded-full bg-white text-amber-800 border border-amber-300 px-6 py-3 hover:bg-amber-50 transition-all flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Join the Hive
        </button>
      )}
    </>
  );
};

export default function Home() {
  const [loading, setLoading] = useState(false);
  const { scrollYProgress } = useScroll();
  const { data: session } = useSession();
  const router = useRouter();
  const [bees, setBees] = useState<Bee[]>([]);

  // Generate bees on client-side only to avoid hydration issues
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const generateBees = (): Bee[] => {
        return Array.from({ length: 10 }, () => ({
          initialX: Math.random() * window.innerWidth,
          initialY: Math.random() * window.innerHeight,
          opacity: 0.6 + Math.random() * 0.4,
          animateX: [
            Math.random() * window.innerWidth,
            Math.random() * window.innerWidth,
            Math.random() * window.innerWidth
          ],
          animateY: [
            Math.random() * window.innerHeight,
            Math.random() * window.innerHeight,
            Math.random() * window.innerHeight
          ],
          duration: 15 + Math.random() * 20
        }));
      };
      
      setBees(generateBees());
    }
  }, []);

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

  // Updated function for Demo plan
  const handleDemo = () => {
    router.push('/demo');
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

  const floatingBee = {
    animate: {
      y: [0, -10, 0],
      x: [0, 5, 0],
      transition: {
        duration: 3,
        repeat: Infinity,
        repeatType: "mirror"
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white overflow-hidden">
      {/* Progress Bar */}
      <motion.div 
        className="fixed top-0 left-0 right-0 h-1 bg-amber-500 origin-left z-50"
        style={{ scaleX: scrollYProgress }}
      />

      {/* Floating Bees Animation */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {bees.map((bee, i) => (
          <motion.div 
            key={i}
            className="absolute w-4 h-4 rounded-full bg-amber-400"
            initial={{ 
              x: bee.initialX, 
              y: bee.initialY,
              opacity: bee.opacity
            }}
            animate={{
              x: bee.animateX,
              y: bee.animateY
            }}
            transition={{
              duration: bee.duration,
              repeat: Infinity,
              repeatType: "reverse"
            }}
          />
        ))}
      </div>

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
                  "radial-gradient(circle, rgba(245,158,11,0.1) 0%, rgba(255,255,255,0) 70%)",
                  "radial-gradient(circle, rgba(245,158,11,0.2) 0%, rgba(255,255,255,0) 70%)"
                ]
              }}
              transition={{ duration: 4, repeat: Infinity, repeatType: "reverse" }}
            />
            
            <div className="flex justify-center mb-8">
              <motion.div 
               animate={{ y: [0, -10, 0], x: [0, 5, 0] }}
               transition={{ duration: 3, repeat: Infinity, repeatType: "mirror" }}
               className="relative"
              >
                <div className="w-20 h-20 bg-amber-400 rounded-full flex items-center justify-center">
                  <div className="w-16 h-16 bg-amber-500 rounded-full flex items-center justify-center">
                    <div className="w-12 h-12 bg-amber-600 rounded-full flex items-center justify-center">
                      <div className="w-8 h-8 bg-amber-700 rounded-full flex items-center justify-center">
                        <div className="w-4 h-4 bg-amber-800 rounded-full"></div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-24 h-8 bg-amber-300 rounded-full -z-10 opacity-30"></div>
              </motion.div>
            </div>
            
            <motion.h1 
              variants={fadeInUpVariants}
              className="text-4xl font-bold tracking-tight text-amber-900 sm:text-6xl"
            >
              Bee Swarm Geo Guesser
            </motion.h1>
            <motion.p
              variants={fadeInUpVariants}
              className="mt-6 text-lg leading-8 text-amber-800 max-w-2xl mx-auto"
            >
              Navigate the world from a bee's perspective! Buzz through unique locations, guess where you are, and build your colony in this immersive geo-guessing adventure.
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
                    className="rounded-full bg-amber-500 px-8 py-4 text-lg font-semibold text-white shadow-sm hover:bg-amber-400 transition-all duration-200 hover:scale-105"
                  >
                    Start Buzzing
                  </Link>
                  <Link
                    href="#trailer"
                    className="rounded-full bg-amber-100 px-8 py-4 text-lg font-semibold text-amber-800 shadow-sm hover:bg-amber-200 transition-all duration-200 hover:scale-105"
                  >
                    Watch Bees in Action
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
            <h2 className="text-3xl font-bold tracking-tight text-amber-900 sm:text-4xl">
              Explore the Hive Features
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
                className="relative rounded-2xl border border-amber-200 p-8 shadow-sm hover:shadow-lg transition-all duration-300 bg-amber-50"
              >
                <motion.div 
                  className="mb-6"
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.5 }}
                >
                  <feature.icon className="h-12 w-12 text-amber-500" />
                </motion.div>
                <h3 className="text-xl font-semibold text-amber-900 mb-4">
                  {feature.title}
                </h3>
                <p className="text-amber-700">{feature.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How to Play Section */}
      <section className="py-24 bg-amber-100">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold tracking-tight text-amber-900 sm:text-4xl">
              How to Play
            </h2>
          </motion.div>
          
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <motion.div 
              variants={fadeInUpVariants}
              className="bg-white rounded-xl p-8 shadow-md text-center"
            >
              <div className="w-16 h-16 bg-amber-200 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-amber-800 text-2xl font-bold">1</span>
              </div>
              <h3 className="text-xl font-semibold text-amber-900 mb-4">Take Flight</h3>
              <p className="text-amber-700">Join a bee swarm and fly around mysterious locations from a unique bee perspective.</p>
            </motion.div>
            
            <motion.div 
              variants={fadeInUpVariants}
              className="bg-white rounded-xl p-8 shadow-md text-center"
            >
              <div className="w-16 h-16 bg-amber-300 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-amber-800 text-2xl font-bold">2</span>
              </div>
              <h3 className="text-xl font-semibold text-amber-900 mb-4">Explore & Observe</h3>
              <p className="text-amber-700">Observe landmarks, flora, and environment clues to determine your location.</p>
            </motion.div>
            
            <motion.div 
              variants={fadeInUpVariants}
              className="bg-white rounded-xl p-8 shadow-md text-center"
            >
              <div className="w-16 h-16 bg-amber-400 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-amber-800 text-2xl font-bold">3</span>
              </div>
              <h3 className="text-xl font-semibold text-amber-900 mb-4">Guess & Grow</h3>
              <p className="text-amber-700">Make your guess on the map! Accurate guesses help your hive grow stronger and unlock new areas.</p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 bg-white">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <h2 className="text-3xl font-bold tracking-tight text-amber-900 text-center mb-16">
            Buzz from Our Players
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
                className="bg-amber-50 p-6 rounded-xl shadow-md border border-amber-200"
              >
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <StarIcon key={i} className="h-5 w-5 text-amber-500 fill-current" />
                  ))}
                </div>
                <p className="text-amber-800 mb-4 italic">{testimonial.content}</p>
                <div className="font-semibold text-amber-900">{testimonial.name}</div>
                <div className="text-sm text-amber-700">{testimonial.role}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-24 bg-gradient-to-b from-amber-50 to-white" id="pricing">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <h2 className="text-3xl font-bold tracking-tight text-amber-900 text-center mb-16">
            Choose Your Hive
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
                    ? 'border-2 border-amber-500 shadow-xl bg-amber-50' 
                    : 'border border-amber-200 shadow-sm bg-white'
                }`}
              >
                <div className="flex justify-between items-start mb-6">
                  <h3 className="text-2xl font-semibold text-amber-900">{tier.name}</h3>
                  {tier.highlighted && (
                    <span className="px-3 py-1 bg-amber-500 text-white text-xs font-medium rounded-full">
                      PREMIUM
                    </span>
                  )}
                </div>
                <div className="text-4xl font-bold mb-6 text-amber-800">{tier.price}</div>
                <ul className="space-y-4 mb-8">
                  {tier.features.map(feature => (
                    <li key={feature} className="flex items-center">
                      <CheckCircleIcon className="h-5 w-5 text-amber-500 mr-2" />
                      <span className="text-amber-700">{feature}</span>
                    </li>
                  ))}
                </ul>
                <button 
                  onClick={tier.demo ? handleDemo : handleBuyNow}
                  disabled={!tier.demo && loading}
                  className={`w-full py-3 px-6 rounded-full font-semibold ${
                    tier.highlighted
                      ? 'bg-amber-500 text-white hover:bg-amber-400'
                      : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                  } transition-colors duration-200`}
                >
                  {!tier.demo && loading ? "Processing..." : tier.cta}
                </button>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Screenshot Gallery */}
      <section className="py-24 bg-amber-900 text-white">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Glimpse Into the Hive
            </h2>
            <p className="mt-4 text-amber-200 max-w-2xl mx-auto">
              See the world through a bee's eyes and challenge your geographical knowledge
            </p>
          </motion.div>
          
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <motion.div 
                key={item}
                variants={fadeInUpVariants}
                whileHover={{ y: -5 }}
                className="bg-amber-800 rounded-lg overflow-hidden"
              >
                <div className="aspect-video bg-amber-700 flex items-center justify-center">
                  <div className="text-amber-500 font-semibold">Gameplay Screenshot {item}</div>
                </div>
                <div className="p-4">
                  <h3 className="font-medium text-amber-100">Location Example {item}</h3>
                  <p className="text-amber-300 text-sm mt-1">Can you guess where your swarm is?</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Call-to-Action Section */}
      <section className="py-24 bg-amber-500">
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
            <p className="text-amber-100 mb-8 max-w-2xl mx-auto">
              Explore the world from a whole new perspective. Test your geography skills, 
              build your hive, and compete with friends in Bee Swarm Geo Guesser!
            </p>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="bg-white text-amber-600 px-8 py-4 rounded-full font-semibold hover:bg-amber-50 transition-colors duration-200"
              onClick={handleDemo}
            >
              Start Your Adventure
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-amber-900 text-white py-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <h4 className="font-semibold mb-4">Hive Basics</h4>
              <ul className="space-y-2 text-amber-200">
                <li>How to Play</li>
                <li>Game Features</li>
                <li>FAQ</li>
                <li>Support</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Bee Community</h4>
              <ul className="space-y-2 text-amber-200">
                <li>About Us</li>
                <li>Bee Blog</li>
                <li>Leaderboards</li>
                <li>Contact</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Honey Rules</h4>
              <ul className="space-y-2 text-amber-200">
                <li>Privacy</li>
                <li>Terms</li>
                <li>Security</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Buzz With Us</h4>
              <ul className="space-y-2 text-amber-200">  
                <li>Twitter</li>
                <li>Discord</li>
                <li>Facebook</li>
                <li>Instagram</li>
              </ul>
            </div>
          </div>
          <div className="mt-8 border-t border-amber-800 pt-8 text-center">
            <p className="text-sm text-amber-400">
              &copy; 2025 Bee Swarm Geo Guesser. All rights reserved.
            </p>
            <p className="text-sm text-amber-400 mt-2">
              Need help? Email us at <a href="mailto:buzz@beeswarmgeo.com" className="underline">buzz@beeswarmgeo.com</a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
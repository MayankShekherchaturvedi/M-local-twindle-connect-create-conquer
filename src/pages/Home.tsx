import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Users, Sparkles, BookOpen, Group } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const Home = () => {
  const swipeCards = [
    {
      title: "Find Projects & Startups",
      description: "Join projects or discover startup roles suited to your skills.",
      cta: "Explore Connect",
      link: "/connect",
    },
    {
      title: "Join Your Tribe",
      description: "Auto-join your branch community or explore more.",
      cta: "Open Community",
      link: "/community",
    },
    {
      title: "Smart Personalized Feed",
      description: "Know what students like you are learning & achieving.",
      cta: "Open AI Feed",
      link: "/feed",
    },
    {
      title: "Free Courses & Tools",
      description: "Unlock content using earned coins & reputation.",
      cta: "See Resources",
      link: "/resources",
    },
  ];

  const features = [
    {
      icon: Users,
      title: "Collaborate Instantly",
      description: "Connect with students worldwide.",
    },
    {
      icon: Group,
      title: "Communities That Matter",
      description: "Join based on your branch & interests.",
    },
    {
      icon: Sparkles,
      title: "AI-Powered Guidance",
      description: "See trending skills & opportunities.",
    },
    {
      icon: BookOpen,
      title: "Unlock Resources",
      description: "Earn coins through upvotes.",
    },
  ];

  const faqs = [
    {
      q: "What is Twindle?",
      a: "A student ecosystem for collaboration, community & growth.",
    },
    {
      q: "Is Twindle free?",
      a: "Yes, all core features are free.",
    },
    {
      q: "Do I need to login?",
      a: "You can browse freely but login is required for community, AI feed & collaboration.",
    },
    {
      q: "How does the AI feed work?",
      a: "It analyzes community activity, trending skills & global tech updates.",
    },
    {
      q: "How do I earn coins?",
      a: "By receiving upvotes for helping others.",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="relative py-24 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-hero-from to-hero-to opacity-60" />
        <div className="container mx-auto text-center relative z-10">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-5xl md:text-6xl font-bold text-primary mb-6"
          >
            Twindle – Where Students Build, Learn & Grow Together
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl text-muted-foreground mb-10 max-w-3xl mx-auto"
          >
            Join communities. Collaborate on projects. Discover opportunities. Stay inspired.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex items-center justify-center gap-4"
          >
            <Link to="/auth/signup">
              <Button size="lg" className="rounded-full px-8">
                Get Started
              </Button>
            </Link>
            <Link to="/connect">
              <Button variant="outline" size="lg" className="rounded-full px-8">
                Explore Connect
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Swipe Cards Section */}
      <section className="py-16 px-6">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {swipeCards.map((card, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="p-8 h-full flex flex-col justify-between hover:shadow-2xl transition-all duration-300 hover:scale-105">
                  <div>
                    <h3 className="text-2xl font-bold text-primary mb-4">{card.title}</h3>
                    <p className="text-muted-foreground mb-6">{card.description}</p>
                  </div>
                  <Link to={card.link}>
                    <Button variant="secondary" className="w-full rounded-full">
                      {card.cta}
                    </Button>
                  </Link>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Four Feature Blocks */}
      <section className="py-16 px-6 bg-muted/30">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {features.map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.03 }}
              >
                <Card className="p-10 text-center h-full">
                  <feature.icon className="h-16 w-16 mx-auto mb-6 text-primary" />
                  <h3 className="text-2xl font-bold text-primary mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Explore Projects */}
      <section className="py-16 px-6">
        <div className="container mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-4xl font-bold text-primary mb-2">Explore Projects</h2>
              <p className="text-muted-foreground">Find projects matching your skills & interests.</p>
            </div>
            <Link to="/connect/projects">
              <Button variant="outline" className="rounded-full">
                See All Projects
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="p-6 hover:shadow-lg transition-shadow">
                <h3 className="text-xl font-semibold text-primary mb-2">Project {i}</h3>
                <p className="text-sm text-muted-foreground mb-4">React, Node.js, MongoDB</p>
                <p className="text-muted-foreground mb-4">Posted by @user{i}</p>
                <Button variant="secondary" className="w-full rounded-full">
                  View Project
                </Button>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Explore Startups */}
      <section className="py-16 px-6 bg-muted/30">
        <div className="container mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-4xl font-bold text-primary mb-2">Explore Startups</h2>
              <p className="text-muted-foreground">Collaborate with student-led startups.</p>
            </div>
            <Link to="/connect/startups">
              <Button variant="outline" className="rounded-full">
                See All Startups
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="p-6 hover:shadow-lg transition-shadow">
                <h3 className="text-xl font-semibold text-primary mb-2">Startup {i}</h3>
                <p className="text-sm text-muted-foreground mb-4">Looking for: UI/UX Designer</p>
                <p className="text-muted-foreground mb-4">Founded by @founder{i}</p>
                <Button variant="secondary" className="w-full rounded-full">
                  View Startup
                </Button>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 px-6">
        <div className="container mx-auto max-w-3xl">
          <h2 className="text-4xl font-bold text-primary mb-8 text-center">Frequently Asked Questions</h2>
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, idx) => (
              <AccordionItem key={idx} value={`item-${idx}`} className="border border-border rounded-3xl px-6">
                <AccordionTrigger className="text-lg font-semibold text-primary hover:no-underline">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">{faq.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;

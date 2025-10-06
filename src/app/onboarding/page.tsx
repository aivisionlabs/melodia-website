"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Music, Heart, Zap, Users } from "lucide-react";

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isCreatingUser, setIsCreatingUser] = useState(false);
  const carouselRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const onboardingSteps = [
    {
      icon: Heart,
      title: "The Most Personal Gift",
      description:
        "Turn your unique stories and inside jokes into an unforgettable, studio-quality song they'll cherish forever. Finally, a gift that truly expresses how you feel.",
      bgColor: "bg-melodia-coral",
      iconColor: "text-white",
    },
    {
      icon: Zap,
      title: "A Hit Song in Minutes",
      description:
        "Go from a simple idea to a finished, shareable song in under 5 minutes. The perfect, high-impact gift for when you're short on time.",
      bgColor: "bg-melodia-coral",
      iconColor: "text-white",
    },
    {
      icon: Users,
      title: "For Friends & Family",
      description:
        "Create a fun, personalized song for birthdays and special moments. Perfect for celebrating the people you love.",
      bgColor: "bg-melodia-yellow",
      iconColor: "text-melodia-teal",
    },
  ];

  // Auto-advance carousel
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev + 1) % onboardingSteps.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [onboardingSteps.length]);

  // Scroll carousel to current step
  useEffect(() => {
    if (carouselRef.current) {
      const scrollLeft =
        currentStep *
        (carouselRef.current.scrollWidth / onboardingSteps.length);
      carouselRef.current.scrollTo({
        left: scrollLeft,
        behavior: "smooth",
      });
    }
  }, [currentStep, onboardingSteps.length]);

  // Handle CTA button click
  const handleStartCreating = async () => {
    setIsCreatingUser(true);
    try {
      // Create anonymous user
      const response = await fetch("/api/users/anonymous", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to create anonymous user");
      }

      const data = await response.json();

      if (data.success && data.anonymous_user_id) {
        // Store anonymous user ID in localStorage
        localStorage.setItem("anonymous_user_id", data.anonymous_user_id);

        // Mark onboarding as complete
        localStorage.setItem("onboarding_complete", "true");

        // Redirect to create-song-v2
        router.push("/");
      } else {
        throw new Error("Failed to create anonymous user");
      }
    } catch (error) {
      console.error("Error creating anonymous user:", error);
      // Still redirect to create-song-v2 even if anonymous user creation fails
      localStorage.setItem("onboarding_complete", "true");
      router.push("/");
    } finally {
      setIsCreatingUser(false);
    }
  };

  return (
    <div className="min-h-screen bg-melodia-cream relative overflow-hidden font-body">
      {/* Background Decorative Circles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Top-left yellow circle */}
        <div className="absolute -top-32 -left-32 w-64 h-64 bg-melodia-yellow/20 rounded-full"></div>

        {/* Mid-right yellow circle */}
        <div className="absolute top-1/4 -right-24 w-48 h-48 bg-melodia-yellow/15 rounded-full"></div>

        {/* Mid-left coral circle */}
        <div className="absolute top-1/2 -left-20 w-56 h-56 bg-melodia-coral/15 rounded-full"></div>

        {/* Bottom-right coral circle */}
        <div className="absolute -bottom-32 -right-32 w-64 h-64 bg-melodia-coral/20 rounded-full"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center justify-between min-h-screen px-6 py-8">
        {/* Header Section */}
        <div className="text-center mt-8">
          <div className="flex justify-center mb-4">
            <Music className="w-12 h-12 text-melodia-teal" strokeWidth={1.5} />
          </div>
          <h1 className="text-5xl font-heading font-bold text-melodia-teal mb-2">
            Melodia
          </h1>
          <p className="text-lg font-body text-melodia-teal/80 max-w-md mx-auto leading-relaxed">
            Turn Your Stories Into
            <br />
            Studio-Quality Songs
          </p>
        </div>

        {/* Carousel Container */}
        <div className="flex-1 flex items-center justify-center w-full max-w-md">
          <div
            ref={carouselRef}
            className="flex w-full space-x-4 overflow-x-auto scrollbar-hide snap-x snap-mandatory"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {onboardingSteps.map((step, index) => (
              <div key={index} className="flex-shrink-0 w-full snap-center">
                <div className="bg-white/60 backdrop-blur-md rounded-3xl p-8 shadow-xl border border-white/40 w-full">
                  {/* Icon */}
                  <div className="flex justify-center mb-6">
                    <div
                      className={`w-20 h-20 ${step.bgColor} rounded-full flex items-center justify-center shadow-coral-glow`}
                    >
                      <step.icon
                        className={`w-10 h-10 ${step.iconColor}`}
                        strokeWidth={1.5}
                      />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="text-center">
                    <h2 className="text-2xl font-heading font-bold text-melodia-teal mb-4">
                      {step.title}
                    </h2>
                    <p className="text-base font-body text-melodia-teal/80 leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Carousel Indicators */}
        <div className="flex justify-center space-x-2 mb-8">
          {onboardingSteps.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentStep(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentStep
                  ? "bg-melodia-coral shadow-coral-glow"
                  : "bg-melodia-teal/30 hover:bg-melodia-teal/50"
              }`}
              aria-label={`Go to step ${index + 1}`}
            />
          ))}
        </div>

        {/* Footer Section */}
        <div className="w-full max-w-md space-y-4">
          {/* CTA Button */}
          <Button
            onClick={handleStartCreating}
            disabled={isCreatingUser}
            className="w-full h-14 text-lg font-body font-semibold bg-melodia-coral hover:bg-melodia-coral/90 text-white rounded-full shadow-coral-glow hover:shadow-coral-glow transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {isCreatingUser
              ? "Creating Account..."
              : "Start Creating Your Song"}
          </Button>

          {/* Privacy Text */}
          <p className="text-center text-sm font-body text-melodia-teal/60">
            Your privacy is our priority.
          </p>
        </div>
      </div>
    </div>
  );
}

import { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";
import { Music } from "lucide-react";

export const metadata: Metadata = {
  title: "All Occasions for Personalized Songs | Melodia",
  description:
    "Explore all occasions for a custom song. From weddings and birthdays to anniversaries and corporate events, create a unique musical gift for any celebration.",
  keywords:
    "personalized songs, custom music, song occasions, wedding songs, birthday songs, anniversary songs, corporate event songs, farewell songs, romantic songs",
};

const occasions = [
  {
    name: "Weddings",
    href: "/occasions/weddings",
    description:
      "Create the perfect song for your Mahila Sangeet, Haldi, or ring ceremony.",
  },
  {
    name: "Birthday",
    href: "/occasions/birthday",
    description:
      "Surprise them with a heartfelt, personalized birthday anthem.",
  },
  {
    name: "Anniversary",
    href: "/occasions/anniversary",
    description:
      "Relive your favorite moments with a song that tells your unique love story.",
  },
  {
    name: "Romantic",
    href: "/occasions/romantic",
    description:
      "Express your deepest feelings with a custom song for proposals or romantic moments.",
  },
  {
    name: "Party",
    href: "/occasions/party",
    description:
      "Get the party started with custom songs that capture the energy of your celebration.",
  },
  {
    name: "Kids",
    href: "/occasions/kids",
    description:
      "Create magical songs for children that spark their imagination and celebrate their achievements.",
  },
  {
    name: "Friendship",
    href: "/occasions/friendship",
    description:
      "Celebrate your friendship with a custom song that captures your shared memories and bond.",
  },
  {
    name: "Apology",
    href: "/occasions/apology",
    description:
      "Express your sincere apologies through music with a heartfelt song that conveys your regret.",
  },
  {
    name: "Corporate Events",
    href: "/occasions/corporate-events",
    description:
      "Elevate your corporate events with custom songs that celebrate achievements and team spirit.",
  },
  {
    name: "Farewell",
    href: "/occasions/farewell",
    description:
      "Say goodbye in style with a custom farewell song that honors memories and celebrates the journey.",
  },
  {
    name: "Lullaby",
    href: "/occasions/lullaby",
    description:
      "Create soothing personalized lullabies that help babies and children drift off to sleep.",
  },
  {
    name: "Siblings",
    href: "/occasions/siblings",
    description:
      "Celebrate the special bond between siblings with songs that capture shared childhood adventures.",
  },
  {
    name: "Congratulations",
    href: "/occasions/congratulations",
    description:
      "Celebrate achievements and milestones with custom songs that honor success and inspire greatness.",
  },
  {
    name: "Thank You",
    href: "/occasions/thank-you",
    description:
      "Express heartfelt gratitude with custom songs that convey appreciation and recognition.",
  },
  {
    name: "Motivational",
    href: "/occasions/motivational",
    description:
      "Boost motivation and inspire greatness with custom songs that energize and encourage success.",
  },
  {
    name: "Devotional/Spiritual",
    href: "/occasions/devotional-spiritual",
    description:
      "Create meaningful devotional songs that connect with faith, spirituality, and divine love.",
  },
  {
    name: "Festive/Holiday",
    href: "/occasions/festive-holiday",
    description:
      "Celebrate holidays and festivals with custom songs that capture the joy and spirit of special occasions.",
  },
  {
    name: "Parents",
    href: "/occasions/parents",
    description:
      "Honor your parents with custom songs that celebrate their love, sacrifice, and guidance.",
  },
];

export default function AllOccasionsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary-cream via-primary-yellow/5 to-accent-coral/5 flex flex-col">
      <Header />
      <main className="flex-1 py-12 sm:py-16 md:py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-text-teal text-center font-heading mb-8 sm:mb-12">
            <span className="inline-flex items-center gap-2">
              <Music className="w-8 h-8 text-accent-coral" />
              A Song for Every Story
              <Music className="w-8 h-8 text-accent-coral" />
            </span>
          </h1>
          <p className="text-text-teal/80 text-center text-base sm:text-lg max-w-2xl mx-auto mb-8 sm:mb-12">
            Discover the perfect occasion for your personalized song. From
            celebrations to heartfelt moments, we create music that tells your
            unique story.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {occasions.map((occasion) => (
              <Link href={occasion.href} key={occasion.name} className="block">
                <div className="bg-white p-6 rounded-lg shadow-lg text-center hover:scale-105 transition-transform duration-300 cursor-pointer">
                  <h3 className="text-xl font-bold text-text-teal font-heading mb-2">
                    {occasion.name}
                  </h3>
                  <p className="text-text-teal/80 text-sm">
                    {occasion.description}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

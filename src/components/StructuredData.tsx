import { PublicSong } from "@/types";

interface StructuredDataProps {
  song?: PublicSong;
  type: "website" | "song" | "organization";
}

export function StructuredData({ type }: StructuredDataProps) {
  const getStructuredData = () => {
    switch (type) {
      case "website":
        return {
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: "Melodia",
          description: "Create Personalized Songs for loved ones",
          url: "https://melodia-songs.com",
          // potentialAction: {
          //   "@type": "SearchAction",
          //   target:
          //     "https://melodia-songs.com/library?search={search_term_string}",
          //   "query-input": "required name=search_term_string",
          // },
        };
      case "organization":
        return {
          "@context": "https://schema.org",
          "@type": "Organization",
          name: "Melodia",
          description: "Create Personalized Songs for loved ones",
          url: "https://melodia-songs.com",
          logo: "https://melodia-songs.com/images/melodia-logo-transparent.png",
          sameAs: [
            "https://twitter.com/melodia",
            // Add other social media URLs here
          ],
        };

      default:
        return null;
    }
  };

  const data = getStructuredData();
  if (!data) return null;

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

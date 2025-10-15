import Image from "next/image";

// Simple logo component for header (small size)
export const HeaderLogo: React.FC<{ className?: string; alt?: string }> = ({
  className = "",
  alt = "Melodia Logo",
}) => {
  return (
    <Image
      src="/images/melodia-logo-transparent.png"
      alt={alt}
      width={1080}
      height={608}
      className={`w-16 sm:w-20 md:w-24 lg:w-28 h-auto object-contain ${className}`}
      priority={true}
    />
  );
};

// Large logo component for center section
export const CenterLogo: React.FC<{ className?: string; alt?: string }> = ({
  className = "",
  alt = "Melodia Logo",
}) => {
  return (
    <Image
      src="/images/melodia-logo-transparent.png"
      alt={alt}
      width={300}
      height={300}
      className={`w-48 sm:w-40 md:w-48 lg:w-56 h-auto object-contain ${className}`}
      priority={true}
    />
  );
};

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
      width={80}
      height={80}
      className={`w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 lg:w-28 lg:h-28 object-contain ${className}`}
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
      className={`w-48 h-48 sm:w-40 sm:h-40 md:w-48 md:h-48 lg:w-56 lg:h-56 object-contain ${className}`}
      priority={true}
    />
  );
};

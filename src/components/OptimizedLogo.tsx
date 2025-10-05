import Image from "next/image";

// Simple logo component for header (small size)
export const HeaderLogo: React.FC<{ className?: string; alt?: string }> = ({
  className = "",
  alt = "Melodia Logo",
}) => {
  return (
    <Image
      src="/images/optimized/logo-large.png"
      alt={alt}
      width={120}
      height={120}
      className={`w-14 h-14 sm:w-16 sm:h-16 ${className}`}
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
      src="/images/optimized/logo-large.png"
      alt={alt}
      width={320}
      height={320}
      className={`w-48 h-48 sm:w-64 sm:h-64 md:w-80 md:h-80 lg:w-80 lg:h-80 ${className}`}
      priority={true}
    />
  );
};

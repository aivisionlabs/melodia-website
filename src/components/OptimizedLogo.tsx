import Image from "next/image";

// Simple logo component for header (small size)
export const HeaderLogo: React.FC<{ className?: string; alt?: string }> = ({
  className = "",
  alt = "Melodia Logo",
}) => {
  return (
    <Image
      src="/images/optimized/logo-medium.png"
      alt={alt}
      width={64}
      height={64}
      className={className}
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
      className={className}
      priority={true}
    />
  );
};

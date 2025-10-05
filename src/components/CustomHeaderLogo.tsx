import Image from "next/image";

// Custom header logo with better sizing control
export const CustomHeaderLogo: React.FC<{
  className?: string;
  alt?: string;
}> = ({ className = "", alt = "Melodia Logo" }) => {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Musical note icon */}
      <div className="relative">
        <Image
          src="/images/optimized/logo-large.png"
          alt=""
          width={40}
          height={40}
          className="w-8 h-8 sm:w-10 sm:h-10"
          priority={true}
        />
      </div>

      {/* Melodia text */}
      <span className="text-xl sm:text-2xl font-bold text-melodia-teal font-heading">
        Melodia
      </span>
    </div>
  );
};



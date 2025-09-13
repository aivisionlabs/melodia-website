import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { trackPageView } from '@/lib/analytics';

export const usePageTracking = () => {
  const pathname = usePathname();

  useEffect(() => {
    if (pathname && typeof window !== 'undefined') {
      const pageTitle = getPageTitle(pathname);
      const pageUrl = `${window.location.origin}${pathname}`;
      trackPageView(pageTitle, pageUrl);
    }
  }, [pathname]);
};

const getPageTitle = (pathname: string): string => {
  switch (pathname) {
    case '/':
      return 'Melodia - Create Personalized Songs for loved ones';
    case '/library':
      return 'Melodia - Song Library';
    default:
      if (pathname.startsWith('/library/')) {
        return 'Melodia - Song Player';
      }
      return 'Melodia';
  }
};
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
    case '/best-songs':
      return 'Melodia - Best Songs';
    default:
      return 'Melodia';
  }
};
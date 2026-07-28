import createMiddleware from 'next-intl/middleware';
import { defaultLocale, locales } from './src/i18n/request';

export default createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'never',
  localeDetection: true,
  localeCookie: {
    name: 'NEXT_LOCALE'
  }
});

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
};

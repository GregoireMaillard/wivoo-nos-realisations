import { defineMiddleware } from 'astro:middleware';
import { authEnabled, verifyToken, SESSION_COOKIE } from './lib/auth';

export const onRequest = defineMiddleware((context, next) => {
  const { pathname } = context.url;

  if (pathname.startsWith('/admin') && authEnabled()) {
    const isAuthRoute = pathname === '/admin/login' || pathname === '/admin/logout';
    if (!isAuthRoute && !verifyToken(context.cookies.get(SESSION_COOKIE)?.value)) {
      return context.redirect('/admin/login');
    }
  }

  return next();
});

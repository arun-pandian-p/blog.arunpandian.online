/**
 * Utility functions to handle domain and subdomain routing
 */

export const isBlogSubdomain = (): boolean => {
  if (typeof window === 'undefined') return false;
  const hostname = window.location.hostname.toLowerCase();
  
  // Support dev testing via query param: e.g. http://localhost:5173/?subdomain=blog
  const searchParams = new URLSearchParams(window.location.search);
  if (searchParams.get('subdomain') === 'blog') return true;

  return (
    hostname.startsWith('blog.') ||
    hostname === 'blog.localhost' ||
    hostname.includes('blog-')
  );
};

export const getMainDomainUrl = (): string => {
  if (typeof window === 'undefined') return 'https://arunpandian.online';
  const { protocol, hostname, port } = window.location;
  
  if (hostname.includes('localhost') || hostname === '127.0.0.1') {
    return `${protocol}//localhost${port ? `:${port}` : ''}`;
  }
  return 'https://arunpandian.online';
};

export const getBlogDomainUrl = (): string => {
  if (typeof window === 'undefined') return 'https://blog.arunpandian.online';
  const { protocol, hostname, port } = window.location;
  
  if (hostname.includes('localhost') || hostname === '127.0.0.1') {
    return `${protocol}//blog.localhost${port ? `:${port}` : ''}`;
  }
  return 'https://blog.arunpandian.online';
};

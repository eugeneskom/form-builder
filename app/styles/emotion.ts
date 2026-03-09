import createCache from '@emotion/cache';

export function createEmotionCache() {
  return createCache({ key: 'css' });
}

// Re-export for server use
export { ServerStyleContext } from './ServerStyleContext';

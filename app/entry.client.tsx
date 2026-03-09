import { RemixBrowser } from '@remix-run/react';
import { startTransition, StrictMode } from 'react';
import { hydrateRoot } from 'react-dom/client';
import { CacheProvider } from '@emotion/react';
import { createEmotionCache } from '~/styles/emotion';

function hydrate() {
  const cache = createEmotionCache();
  startTransition(() => {
    hydrateRoot(
      document,
      <StrictMode>
        <CacheProvider value={cache}>
          <RemixBrowser />
        </CacheProvider>
      </StrictMode>,
    );
  });
}

if (window.requestIdleCallback) {
  window.requestIdleCallback(hydrate);
} else {
  window.setTimeout(hydrate, 1);
}

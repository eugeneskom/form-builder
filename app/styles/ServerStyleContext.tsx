import React from 'react';

interface StyleContextData {
  key: string;
  ids: string[];
  css: string;
}

const ServerStyleContext = React.createContext<StyleContextData[] | null>(null);

export { ServerStyleContext };

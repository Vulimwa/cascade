import 'react';

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      [elemName: `calcite-${string}`]: any;
    }
  }
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      [elemName: `calcite-${string}`]: any;
    }
  }
}

export {};

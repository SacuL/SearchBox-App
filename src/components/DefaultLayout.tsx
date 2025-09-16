import Head from 'next/head';
import type { ReactNode } from 'react';

type DefaultLayoutProps = { children: ReactNode };

export const DefaultLayout = ({ children }: DefaultLayoutProps) => {
  return (
    <>
      <Head>
        <title>SearchBox - File Management made easy</title>
        <link rel="icon" href="/favicon.png" type="image/png" />
      </Head>

      <main className="h-screen">{children}</main>
    </>
  );
};

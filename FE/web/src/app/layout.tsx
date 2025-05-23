import type { Metadata } from 'next';
import localFont from 'next/font/local';
import './globals.css';
import CustomQueryClientProvider from '@/shared/reactQuery/CustomQueryClientProvider';
import { Suspense } from 'react';

if (process.env.NEXT_RUNTIME === 'nodejs' && process.env.NODE_ENV !== 'production') {
  const { server } = require('@/shared/msw/mock/http');
  server.listen();
}
// Jalnan2TTF 폰트 추가
const jalnanFont = localFont({
  src: '../../public/Jalnan2TTF.ttf',
  variable: '--font-jalnan',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Create Next App',
  description: 'Generated by create next app',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en'>
      <body className={`${jalnanFont.variable} jalnan antialiased w-dvw `}>
        <CustomQueryClientProvider>
          {/* <MSWProvider> */}
          <Suspense fallback={<div>Loading...</div>}>{children}</Suspense>
          {/* </MSWProvider> */}
        </CustomQueryClientProvider>
      </body>
    </html>
  );
}

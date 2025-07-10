"use client";

import { usePathname } from 'next/navigation';
import React from 'react';

export default function MainWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = pathname === '/auth/login' || pathname === '/auth/signup';
  const isHomePage = pathname === '/';

  if (isAuthPage) {
    return <main>{children}</main>;
  }

  if (isHomePage) {
    return (
      <main className="flex flex-col items-center justify-center mt-24 px-4 w-full" style={{ minHeight: 'calc(100vh - 8rem)' }}>{children}</main>
    );
  }

  // For all other pages, add top padding to offset header+nav, fill viewport
  return (
    <main className="w-full min-h-screen flex flex-col pt-32 px-0">{children}</main>
  );
} 
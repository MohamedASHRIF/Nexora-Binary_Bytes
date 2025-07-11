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
      <main className="flex flex-col justify-center items-center w-full min-h-screen bg-gray-100 dark:bg-slate-900">
        {children}
      </main>
    );
  }

  // For all other pages, add top padding to offset header+nav, fill viewport
  return (
    <main className="w-full min-h-screen flex flex-col pt-32 px-0">{children}</main>
  );
} 
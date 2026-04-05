import React from 'react';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col justify-center items-center py-4 px-4 min-h-[90vh]">
      {children}
    </div>
  );
}

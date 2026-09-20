import type { Metadata } from 'next';
import './globals.css';
import { AppShell } from '@/components/layout/AppShell';

export const metadata: Metadata = {
  title: 'HomeCare AI — Customer Support & Service Resolution',
  description:
    'AI-powered inbound voice customer-support and service-resolution platform for home-appliance companies across India. Understand every customer call. Resolve issues faster. Automate service actions.',
  keywords: [
    'HomeCare AI',
    'Voice AI',
    'Customer Support',
    'Home Appliances',
    'Air Conditioner',
    'Washing Machine',
    'Refrigerator',
    'Water Purifier',
    'Service Resolution',
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full bg-slate-50 antialiased">
      <body className="h-full flex flex-col font-sans text-slate-900 selection:bg-blue-100 selection:text-blue-900">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}

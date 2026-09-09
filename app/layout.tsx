import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AgentForge',
  description: 'The AI Agency That Runs Itself',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

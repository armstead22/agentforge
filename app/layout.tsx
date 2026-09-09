export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <title>AgentForge</title>
        <meta name="description" content="The AI Agency That Runs Itself" />
      </head>
      <body style={{
        margin: 0,
        padding: 0,
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        backgroundColor: '#0a0a0a',
        color: '#ffffff'
      }}>
        {children}
      </body>
    </html>
  )
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <title>ZOMBIE APOCALYPSE: LAST STAND</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Rajdhani:wght@300;400;600;700&display=swap" rel="stylesheet" />
      </head>
      <body style={{ margin: 0, overflow: 'hidden', backgroundColor: 'black', fontFamily: "'Rajdhani', sans-serif", userSelect: 'none', WebkitUserSelect: 'none', touchAction: 'none' }}>
        {children}
      </body>
    </html>
  )
}
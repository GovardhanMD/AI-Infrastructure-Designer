import './globals.css'
import SmoothScroll from '../components/SmoothScroll'
import CustomCursor from '../components/CustomCursor'
import Background3D from '../components/Background3D'

export const metadata = {
  title: 'AI Infrastructure Designer',
  description: 'AI-Powered Infrastructure Design Generator',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-background text-foreground selection:bg-accent-purple selection:text-white">
        <SmoothScroll>
          <Background3D />
          <CustomCursor />
          {children}
        </SmoothScroll>
      </body>
    </html>
  )
}

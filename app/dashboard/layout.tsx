import { Navbar } from '@/src/components/Navbar'
import { Footer } from "@/src/components/Footer"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="bg-background min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
      <Footer />
    </div>
  )
}

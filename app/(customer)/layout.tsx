import Navbar, { MobileNav } from '@/components/ui/Navbar'

export default function CustomerLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main className="pt-20 pb-24 md:pb-8 min-h-screen">
        {children}
      </main>
      <MobileNav />
    </>
  )
}

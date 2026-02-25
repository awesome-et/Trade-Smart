import Sidebar from '@/components/sidebar';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex">
      <Sidebar />
      <div className="ml-64 w-full min-h-screen">
        {children}
      </div>
    </div>
  );
}

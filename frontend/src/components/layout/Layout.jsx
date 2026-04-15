import { Navbar } from './Navbar';

export function Layout({ children }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="mx-auto max-w-screen-xl px-4 py-8">{children}</main>
    </div>
  );
}

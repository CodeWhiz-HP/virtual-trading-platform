import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center text-center p-8">
      <h1 className="text-5xl font-bold mb-4">404</h1>
      <p className="mb-6 text-gray-600 dark:text-gray-400">Page not found.</p>
      <Link to="/" className="text-blue-600 hover:underline font-medium">Return to landing page</Link>
    </main>
  );
}
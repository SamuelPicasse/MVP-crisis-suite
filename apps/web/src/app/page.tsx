import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-primary mb-6">Crisis Suite MVP</h1>
        <p className="text-lg text-gray-600 mb-8">Crisis Management Platform</p>
        <Link 
          href="/login"
          className="inline-block px-6 py-3 bg-primary text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          Login to Dashboard
        </Link>
      </div>
    </div>
  );
}
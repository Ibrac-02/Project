export default function Footer() {
  return (
    <footer className="border-t mt-12">
      <div className="mx-auto max-w-6xl px-4 py-6 text-sm text-gray-600 flex items-center justify-between">
        <p>© {new Date().getFullYear()} Ibrac-02. All rights reserved.</p>
        <div className="flex gap-4">
          <a href="https://github.com/Ibrac-02" target="_blank" className="hover:text-gray-900">GitHub</a>
          <a href="/admin" className="hover:text-gray-900">Admin</a>
        </div>
      </div>
    </footer>
  );
}

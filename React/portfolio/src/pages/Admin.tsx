export default function Admin() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
      <p className="text-gray-600 mb-6">Simple admin area. Next step: protect with Firebase Auth.</p>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-lg border p-4 bg-white">
          <h2 className="font-semibold mb-2">Blog Posts</h2>
          <p className="text-sm text-gray-600 mb-3">Create, edit, delete posts (placeholder)</p>
          <button className="px-3 py-2 rounded-md bg-blue-600 text-white">Add Post</button>
        </div>
        <div className="rounded-lg border p-4 bg-white">
          <h2 className="font-semibold mb-2">Projects</h2>
          <p className="text-sm text-gray-600 mb-3">Create, edit, delete projects (placeholder)</p>
          <button className="px-3 py-2 rounded-md bg-blue-600 text-white">Add Project</button>
        </div>
        <div className="rounded-lg border p-4 bg-white md:col-span-2">
          <h2 className="font-semibold mb-2">Messages</h2>
          <p className="text-sm text-gray-600">View visitor messages (placeholder)</p>
        </div>
      </section>
    </div>
  );
}

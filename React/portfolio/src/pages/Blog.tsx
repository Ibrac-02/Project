import BlogCard from '../components/BlogCard';

export default function Blog() {
  const posts = [
    { title: 'Welcome to my blog', excerpt: 'I write about web and mobile dev…', date: '2025-01-01', href: '#' },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Blog</h1>
      <div className="grid grid-cols-1 gap-4">
        {posts.map((p)=> (
          <BlogCard key={p.title} {...p} />
        ))}
      </div>
    </div>
  );
}

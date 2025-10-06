type Props = {
  title: string;
  excerpt: string;
  date?: string;
  href?: string;
};

export default function BlogCard({ title, excerpt, date, href }: Props) {
  return (
    <article className="rounded-lg border p-4 hover:shadow-md transition bg-white">
      <h3 className="text-lg font-semibold mb-1">{title}</h3>
      {date && <p className="text-xs text-gray-400 mb-2">{date}</p>}
      <p className="text-gray-600 text-sm mb-3">{excerpt}</p>
      {href && (
        <a href={href} className="text-blue-600 hover:underline">
          Read more →
        </a>
      )}
    </article>
  );
}

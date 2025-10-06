type Props = {
  title: string;
  description: string;
  link?: string;
};

export default function ProjectCard({ title, description, link }: Props) {
  return (
    <article className="rounded-lg border p-4 hover:shadow-md transition bg-white">
      <h3 className="text-lg font-semibold mb-1">{title}</h3>
      <p className="text-gray-600 text-sm mb-3">{description}</p>
      {link && (
        <a href={link} target="_blank" className="text-blue-600 hover:underline">
          View project ↗
        </a>
      )}
    </article>
  );
}

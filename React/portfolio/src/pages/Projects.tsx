import ProjectCard from '../components/ProjectCard';

export default function Projects() {
  const items = [
    { title: 'Project One', description: 'Short description of a project', link: '#' },
    { title: 'Project Two', description: 'Another cool project', link: '#' },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Projects</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {items.map((p)=> (
          <ProjectCard key={p.title} {...p} />
        ))}
      </div>
    </div>
  );
}

import MessageForm from '../components/MessageForm';

export default function Home() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="flex flex-col md:flex-row gap-8 items-center">
        <img src="/profile.jpg" alt="Profile" className="w-32 h-32 rounded-full object-cover border" onError={(e)=>{(e.currentTarget as HTMLImageElement).style.display='none'}} />
        <div>
          <h1 className="text-3xl font-bold mb-2">Hi, I'm Ibrac-02</h1>
          <p className="text-gray-600">Full‑stack developer. I build web and mobile apps.</p>
        </div>
      </div>

      <section className="mt-10">
        <h2 className="text-xl font-semibold mb-3">Contact Me</h2>
        <MessageForm />
      </section>
    </div>
  );
}

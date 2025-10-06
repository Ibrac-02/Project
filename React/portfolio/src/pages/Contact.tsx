import MessageForm from '../components/MessageForm';

export default function Contact() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Contact</h1>
      <p className="text-gray-600 mb-6">Have a question or opportunity? Send me a message.</p>
      <MessageForm />
    </div>
  );
}

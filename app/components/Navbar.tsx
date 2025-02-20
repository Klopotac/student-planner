import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="bg-gray-800 p-4 text-white flex gap-4">
      <Link href="/" className="hover:underline">
        Home
      </Link>
      <Link href="/todo" className="hover:underline">
        To-Do List
      </Link>
    </nav>
  );
}

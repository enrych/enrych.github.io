import Link from "next/link";
export default function Home() {
  return (
    <>
      <main className="flex items-center justify-center">
        <Link href="https://github.com/enrych">
          <h1 className="text-6xl font-bold font-leixo shadow-md">ENRYCH</h1>
        </Link>
      </main>

      <footer>
        <div className="flex justify-center items-center text-center gap-6 mt-20 lg:m-2">
          <Link
            className="text-sm font-medium"
            href="https://github.com/enrych"
            rel="noopener noreferrer"
            target="_blank"
          >
            Github
          </Link>
        </div>
      </footer>
    </>
  );
}

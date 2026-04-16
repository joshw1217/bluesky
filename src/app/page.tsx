import Image from "next/image";
import Navbar from "@/components/navbar";
import SearchBar from "@/components/searchBar";

export default function Home() {
  return (
    <div className="flex min-h-dvh flex-col">
      <Navbar />
      <div className="font-sans grid min-h-0 flex-1 grid-rows-[20px_1fr_20px] items-center justify-items-center p-8 pb-20 gap-16 sm:p-20 bg-[url('/background.jpg')] bg-cover bg-center">
        <SearchBar />
        <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
          <h1 className="text-4xl font-bold">
            Blue Sky Pet Supply
          </h1>
          <ol className="font-mono list-inside list-decimal text-sm/6 text-center sm:text-left">
            <li className="mb-2 tracking-[-.01em]">
              The placeholder for BS' next website.
            </li>
            <li className="tracking-[-.01em]">
              Iterations will be made and tested here, updates to follow.
            </li>
          </ol>
        </main>
      </div>
    </div>
  );
}

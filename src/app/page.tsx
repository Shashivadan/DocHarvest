import LinkData from "@/components/LinkData";
import Image from "next/image";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24 bg-black  text-white">
      <LinkData />
    </main>
  );
}

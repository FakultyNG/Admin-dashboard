import { Login } from "@/screens";

export const runtime = "edge";


export default function Home() {
  return (
    <main className="min-h-dvh w-full">
      <Login />
    </main>
  );
}

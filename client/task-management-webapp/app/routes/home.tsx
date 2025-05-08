import type { Route } from "./+types/home";
import Dashboard from "../pages/Dashboard";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Tickway – Task Manager" },
    { name: "description", content: "Organize and prioritize your tasks with Tickway." },
  ];
}

export default function Home() {
  return <Dashboard />;
}

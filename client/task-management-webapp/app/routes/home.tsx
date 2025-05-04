
export function meta() {
  return [{ title: "New React Router App" }, { name: "description", content: "Welcome to React Router!" }]
}

import { Welcome } from "../welcome/welcome"

export default function Home() {
  return <Welcome />
}

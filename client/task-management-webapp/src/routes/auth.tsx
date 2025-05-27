import Auth from "../pages/Auth"

export function meta() {
  return [
    { title: "Tickway – Login or Register" },
    { name: "description", content: "Login or create an account for Tickway Task Manager." },
  ]
}

export default function AuthRoute() {
  return <Auth />
}

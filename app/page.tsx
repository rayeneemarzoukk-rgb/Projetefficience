import { redirect } from "next/navigation";

// Redirection automatique vers la page de connexion
export default function HomePage() {
  redirect("/login");
}

import { redirect } from "next/navigation";

// Old bookmarks stay valid without maintaining a second Build catalogue.
export default function BuildPage() {
  redirect("/real-quests");
}

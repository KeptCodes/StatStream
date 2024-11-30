import { cookies } from "next/headers";
import Dashboard from "@/components/dashboard";
import AuthSplash from "@/components/splash";
import Footer from "@/components/footer";

export default async function Home() {
  const cookieStore = await cookies();
  const serverURL = cookieStore.get("server_url");
  const studioKey = cookieStore.get("studio_key");

  // Check if the cookies are set
  if (!serverURL || !studioKey) {
    return <AuthSplash />;
  }

  return (
    <>
      <Dashboard />
      <Footer />
    </>
  );
}

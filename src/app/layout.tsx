

import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import "./globals.css";
import { Sidebar, Header } from "@/components";
import ProviderContainer from "@/components/Provider";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import 'video.js/dist/video-js.css';
import AdminPageIntro from "@/components/AdminPageIntro";



const appFont = Manrope({
  subsets: ["latin"],
  variable: "--font-app",
  display: "swap",
});

export const metadata: Metadata = {
  title: "REEPLAY",
  description: "Admin dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${appFont.className} app-body`}>
        <ProviderContainer>
          <Sidebar />
          <div className="app-main">
            <Header />
            <main className="app-content">
              <AdminPageIntro />
              {children}
            </main>
          </div>
          <ToastContainer
            autoClose={5000}
            position="bottom-right"
            theme="dark"
            hideProgressBar
            toastClassName="!rounded-xl !border !border-white/10 !bg-[#171b24] !text-sm"
          />
        </ProviderContainer>
      </body>
    </html>
  );
}

import "./globals.css";
import Navbar from "./components/Navbar";
import Providers from "./components/Providers"; // Import the new Providers component

export const metadata = {
  title: "Student Planner",
  description: "A tool to organize your study schedule",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <Navbar />
          {children}
        </Providers>
      </body>
    </html>
  );
}

import Banner from "./banner";
import Navigation from "./navigation";

export default function Header() {
  return (
    <header className="border-grid sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex flex-col">
        <Banner />
        <Navigation />
      </div>
    </header>
  );
}

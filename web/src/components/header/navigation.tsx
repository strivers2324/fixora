import { Button } from "../ui/button";

export default function Navigation() {
  return (
    <div className="px-8 h-14">
      <div className="flex flex-row justify-between items-center h-full">
        <div className="flex flex-row gap-x-10 items-center">
          <a className="font-bold text-3xl" href="/">
            CartNest
          </a>
          <div className="flex flex-row gap-x-5">
            <a
              className="transition-colors hover:text-foreground/80 text-foreground/80"
              href="/docs"
            >
              Docs
            </a>
            <a
              className="transition-colors hover:text-foreground/80 text-foreground"
              href="/docs/components"
            >
              Components
            </a>
            <a
              className="transition-colors hover:text-foreground/80 text-foreground/80"
              href="/blocks"
            >
              Blocks
            </a>
            <a
              className="transition-colors hover:text-foreground/80 text-foreground/80"
              href="/charts"
            >
              Charts
            </a>
          </div>
        </div>
        <div className="flex flex-row gap-x-5 items-center">
          <Button className="bg-red-500 text-white hover:text-red-500">Login</Button>
        </div>
      </div>
    </div>
  );
}

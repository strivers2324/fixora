import { SignUpRolePopup } from "../signup/SignUpPopUp";
import { Button } from "../ui/button";

export default function Navigation() {
  return (
    <div className="px-8 h-14 bg-teal-900">
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
          <Button className="ml-3  text-white font-bold rounded-md hover:bg-teal-400 transition-colors">Login</Button>
          <SignUpRolePopup />
        </div>
      </div>
    </div>
  );
}

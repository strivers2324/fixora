import Navbar from "../home/sections/Navbar";

export default function Header() {
    return (
        <div className="w-full flex flex-col sticky top-0 z-50">
            <Navbar />
        </div>
    );
}
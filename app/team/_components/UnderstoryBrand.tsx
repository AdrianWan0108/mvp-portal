import Image from "next/image";
import understoryLogo from "../../../public/under story logo-purple.png";

export function UnderstoryBrand() {
  return (
    <div className="flex items-center gap-3">
      <span className="relative shrink-0">
        <Image
          src={understoryLogo}
          alt="Understory"
          className="size-10 rounded-xl"
          priority
        />
        <span className="absolute -right-1 -top-1 size-2.5 rounded-full border-2 border-white bg-[#F4CE45]" />
      </span>
      <span>
        <span className="block text-sm font-semibold tracking-wide text-[#341F60]">
          Team workspace
        </span>
        <span className="block text-[9px] uppercase tracking-[0.25em] text-[#7D4698]">
          Client projects
        </span>
      </span>
    </div>
  );
}

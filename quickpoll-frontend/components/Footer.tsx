import Link from "next/link";
import { Github, Linkedin, Mail } from "lucide-react";

export function Footer({ transparent = false }: { transparent?: boolean }) {
  return (
    <footer
      className={`border-t border-[#323232] mt-auto ${
        transparent ? "bg-transparent" : "bg-black"
      }`}
    >
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-[#A4A4A4] font-mono">
            Built by Arjun R •{" "}
            <Link
              href="https://arjunrajaiah.dev/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#34CC41] hover:text-[#2AB037] transition-colors font-medium"
            >
              https://arjunrajaiah.dev/
            </Link>
          </p>

          <div className="flex items-center gap-6">
            <Link
              href="https://www.linkedin.com/in/arjun-rajaiah"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#A4A4A4] hover:text-[#34CC41] transition-colors"
              aria-label="LinkedIn"
            >
              <Linkedin className="h-5 w-5" />
            </Link>
            <Link
              href="https://github.com/arjun-vegeta"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#A4A4A4] hover:text-[#34CC41] transition-colors"
              aria-label="GitHub"
            >
              <Github className="h-5 w-5" />
            </Link>
            <Link
              href="mailto:arjunvegeta04@gmail.com"
              className="text-[#A4A4A4] hover:text-[#34CC41] transition-colors"
              aria-label="Email"
            >
              <Mail className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

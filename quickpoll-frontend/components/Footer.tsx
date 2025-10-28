import Link from "next/link";
import { Github, Linkedin, Mail } from "lucide-react";

export function Footer({ transparent = false }: { transparent?: boolean }) {
  return (
    <footer
      className={`mt-auto ${
        transparent ? "bg-transparent" : "bg-black border-t border-[#323232]"
      }`}
    >
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <p className={`text-sm font-mono ${transparent ? "text-white/90" : "text-[#A4A4A4]"}`}>
            Built by Arjun R •{" "}
            <Link
              href="https://arjunrajaiah.dev/"
              target="_blank"
              rel="noopener noreferrer"
              className={`transition-colors font-medium ${
                transparent
                  ? "text-[#3ff34e] hover:text-[#2AB037]"
                  : "text-[#34CC41] hover:text-[#2AB037]"
              }`}
            >
              https://arjunrajaiah.dev/
            </Link>
          </p>

          <div className="flex items-center gap-6">
            <Link
              href="https://www.linkedin.com/in/arjun-rajaiah"
              target="_blank"
              rel="noopener noreferrer"
              className={`transition-colors ${
                transparent
                  ? "text-white/90 hover:text-white"
                  : "text-[#A4A4A4] hover:text-[#34CC41]"
              }`}
              aria-label="LinkedIn"
            >
              <Linkedin className="h-5 w-5" />
            </Link>
            <Link
              href="https://github.com/arjun-vegeta"
              target="_blank"
              rel="noopener noreferrer"
              className={`transition-colors ${
                transparent
                  ? "text-white/90 hover:text-white"
                  : "text-[#A4A4A4] hover:text-[#34CC41]"
              }`}
              aria-label="GitHub"
            >
              <Github className="h-5 w-5" />
            </Link>
            <Link
              href="mailto:arjunvegeta04@gmail.com"
              className={`transition-colors ${
                transparent
                  ? "text-white/90 hover:text-white"
                  : "text-[#A4A4A4] hover:text-[#34CC41]"
              }`}
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

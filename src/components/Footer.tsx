import Image from "next/image";
import Link from "next/link";
import { Heart, Mail, User } from "lucide-react";
import favicon from "@/app/favicon.png";

const GithubIcon = ({ size = 20, className = "" }: { size?: number, className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.02c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A4.8 4.8 0 0 0 9 18v4"></path>
  </svg>
);

const TwitterIcon = ({ size = 20, className = "" }: { size?: number, className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
  </svg>
);

const LinkedinIcon = ({ size = 20, className = "" }: { size?: number, className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
    <rect width="4" height="12" x="2" y="9"></rect>
    <circle cx="4" cy="4" r="2"></circle>
  </svg>
);

const InstagramIcon = ({ size = 20, className = "" }: { size?: number, className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5"></rect>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"></line>
  </svg>
);

export function Footer() {
  return (
    <footer className="w-full border-t border-white/10 bg-emerald-900/90 text-white py-8">
      <div className="container mx-auto px-6 md:px-12 lg:px-24">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Logo & Description */}
          <div className="flex flex-col space-y-4">
            <div className="flex items-center space-x-2">
              <Image
                src={favicon}
                alt="Finance Me Logo"
                width={32}
                height={32}
                className="rounded-md shrink-0"
              />
              <span className="text-xl font-bold">Finance Me</span>
            </div>
            <p className="text-sm opacity-80 max-w-xs">
              A modern micro-finance member management system designed to simplify operations and enhance member experience.
            </p>
          </div>

          {/* Quick Links */}
          <div className="flex flex-col space-y-4">
            <h3 className="text-lg font-semibold">Quick Links</h3>
            <div className="flex flex-col space-y-2 text-sm opacity-90">
              <Link href="/dashboard" className="hover:opacity-70 transition-opacity">Dashboard</Link>
              <Link href="/members" className="hover:opacity-70 transition-opacity">Members</Link>
            </div>
          </div>

          {/* Contact Developer */}
          <div className="flex flex-col space-y-4">
            <h3 className="text-lg font-semibold">Contact Developer</h3>
            <div className="flex flex-col space-y-2 text-sm opacity-90">
              <a
                href="#"
                target="_blank"
                rel="noreferrer"
                className="font-medium flex items-center gap-2 hover:opacity-70 transition-opacity"
              >
                <User size={16} /> Visit Portfolio
              </a>
              <a
                href="mailto:singlaharshit1103@outlook.com"
                className="hover:opacity-70 transition-opacity flex items-center gap-2"
              >
                <Mail size={16} />Email
              </a>
            </div>
          </div>

          {/* Social Links */}
          <div className="flex flex-col space-y-4">
            <h3 className="text-lg font-semibold">Social Media</h3>
            <div className="flex space-x-4">
              <a
                href="https://github.com/harshitsinghal11"
                target="_blank"
                rel="noreferrer"
                className="opacity-70 hover:opacity-100 transition-opacity"
              >
                <GithubIcon size={20} />
                <span className="sr-only">GitHub</span>
              </a>
              <a
                href="https://twitter.com/harshitsinghal11"
                target="_blank"
                rel="noreferrer"
                className="opacity-70 hover:opacity-100 transition-opacity"
              >
                <TwitterIcon size={20} />
                <span className="sr-only">Twitter</span>
              </a>
              <a
                href="https://linkedin.com/in/harshitsinghal11"
                target="_blank"
                rel="noreferrer"
                className="opacity-70 hover:opacity-100 transition-opacity"
              >
                <LinkedinIcon size={20} />
                <span className="sr-only">LinkedIn</span>
              </a>
              <a
                href="https://instagram.com/harshitsinghal11"
                target="_blank"
                rel="noreferrer"
                className="opacity-70 hover:opacity-100 transition-opacity"
              >
                <InstagramIcon size={20} />
                <span className="sr-only">Instagram</span>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row justify-between items-center pt-4 mt-8 space-y-4 md:space-y-0 border-t border-white/40">
          <div className="flex items-center space-x-2 text-sm">
            <span>Made with Love by</span>
            <Heart size={16} className="text-red-500 fill-current" />
            <span> Harshit Singhal</span>
          </div>
          <span className="text-sm text-center md:text-left text-white/80">
            &copy; {new Date().getFullYear()} Finance Me. All rights reserved.
          </span>
        </div>

      </div>
    </footer >
  );
}

"use client";

import Link from "next/link";
import { FileText, BarChart3 } from "lucide-react";

export function Navbar() {
  return (
    <nav className="border-b bg-white sticky top-0 z-40">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl font-bold text-gray-900">
            BPX Claims Processing
          </span>
        </div>
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition">
            <FileText className="h-4 w-4" />
            Claims
          </Link>
          <Link href="/dashboard" className="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition">
            <BarChart3 className="h-4 w-4" />
            Dashboard
          </Link>
        </div>
      </div>
    </nav>
  );
}

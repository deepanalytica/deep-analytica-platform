import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "PRAXIOS OS — Control & Decision Room",
  description: "Execution, assurance, evidence and human authority for governed AI work.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function PraxiosLayout({ children }: { children: React.ReactNode }) {
  return children;
}

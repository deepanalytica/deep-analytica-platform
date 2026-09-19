import MiningWorkspace from "./MiningWorkspace";
import { demoProject } from "@/lib/mining/demo";

export const metadata = {
  title: "Deep Mining Intelligence",
  description: "Investor intelligence workspace powered by Praxios OS and Meta-Harness.",
};

export default function MiningPage() {
  return <MiningWorkspace project={demoProject} />;
}

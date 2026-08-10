import { JobsContent } from "@/components/JobsContent";
import { holeJobsFuerAnzeige } from "@/lib/jobImport/holeJobsFuerAnzeige";

export const dynamic = "force-dynamic";

export default async function JobsPage() {
  const { jobs, hinweis } = await holeJobsFuerAnzeige();
  return <JobsContent jobs={jobs} hinweis={hinweis} />;
}

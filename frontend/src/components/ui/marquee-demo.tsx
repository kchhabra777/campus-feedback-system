import { Marquee } from "@/components/ui/marquee";

export default function Demo() {
  return (
    <div className="flex items-center justify-center min-h-[400px] w-full bg-slate-950 text-white p-8">
      <div className="w-full max-w-4xl space-y-6">
        <h3 className="text-xl font-bold text-center text-slate-200">Verified Campus Feedback Highlights</h3>
        <Marquee pauseOnHover={true} duration={25}>
          <span className="mx-6 px-4 py-2 rounded-full border border-red-500/30 bg-red-500/10 text-red-400 text-sm font-medium">#FairGrader</span>
          <span className="mx-6 px-4 py-2 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-400 text-sm font-medium">#PracticalLabs</span>
          <span className="mx-6 px-4 py-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-sm font-medium">#ClearConcepts</span>
          <span className="mx-6 px-4 py-2 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-400 text-sm font-medium">#ProjectHeavy</span>
          <span className="mx-6 px-4 py-2 rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-400 text-sm font-medium">#ApproachableFaculty</span>
          <span className="mx-6 px-4 py-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 text-cyan-400 text-sm font-medium">#EngagingLectures</span>
        </Marquee>
      </div>
    </div>
  );
}

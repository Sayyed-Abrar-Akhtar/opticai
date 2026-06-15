import { getDb } from "@/lib/mongodb";
import FrameCard from "@/components/frames/FrameCard";
import { Frame } from "@/lib/types";
import { Eye } from "lucide-react";

async function getAllFrames(): Promise<Frame[]> {
  try {
    const db = await getDb();
    const frames = await db
      .collection("frames")
      .find({})
      .sort({ trendScore: -1 })
      .toArray();
    return frames.map((f) => ({ ...f, _id: f._id.toString() })) as Frame[];
  } catch {
    return [];
  }
}

export default async function CataloguePage() {
  const frames = await getAllFrames();

  const styles = Array.from(new Set(frames.map((f) => f.style))).filter(
    Boolean,
  );

  return (
    <div className="relative">
      <div className="fixed inset-0 bg-bg-primary grid-bg opacity-30 pointer-events-none" />
      <div className="relative z-10 max-w-2xl mx-auto px-4 pt-4">
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-1">
            <Eye className="w-5 h-5 text-accent-violet" />
            <h1 className="font-display font-black text-2xl gradient-text">
              Frame Catalogue
            </h1>
          </div>
          <p className="text-text-muted text-sm">
            {frames.length} frame{frames.length !== 1 ? "s" : ""} available
          </p>
        </div>

        {/* Style filter chips */}
        {styles.length > 0 && (
          <div className="flex gap-2 flex-wrap mb-6">
            {styles.map((style) => (
              <span
                key={style}
                className="px-3 py-1 rounded-full glass border border-white/10 text-xs font-mono text-text-secondary capitalize"
              >
                {style}
              </span>
            ))}
          </div>
        )}

        {frames.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {frames.map((frame) => (
              <FrameCard key={String(frame._id)} frame={frame} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <Eye className="w-12 h-12 text-text-muted mx-auto mb-4 opacity-30" />
            <p className="text-text-muted font-mono text-sm">
              No frames added yet
            </p>
            <p className="text-text-muted/60 text-xs mt-1">
              Visit Admin → Frames to upload inventory
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

import { cn } from "@/lib/utils";

export function RfidCard({ className }: { className?: string }) {
  return (
    <div className={cn("relative aspect-[1.58/1] overflow-hidden rounded-3xl bg-primary p-7 text-primary-foreground shadow-2xl", className)}>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(255,255,255,0.25),transparent_35%),linear-gradient(135deg,rgba(31,138,121,0.9),transparent)]" />
      <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/10 to-transparent" />
      <div className="animate-scan-line absolute left-0 top-0 h-full w-full bg-gradient-to-b from-transparent via-accent/70 to-transparent" />

      <div className="relative z-10 flex h-full flex-col justify-between">
        <div className="flex items-start justify-between">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-primary-foreground/70">Identiva</p>
            <h3 className="mt-2 font-display text-3xl font-semibold">Kartu Subsidi</h3>
          </div>
          <div className="grid size-14 place-items-center rounded-xl bg-accent text-accent-foreground shadow-inner">
            <div className="size-8 rounded-md border-2 border-accent-foreground/50" />
          </div>
        </div>

        <div className="flex items-end justify-between">
          <div>
            <p className="text-sm text-primary-foreground/70">UID RFID</p>
            <p className="font-mono text-xl font-semibold tracking-widest">A1B2 C3D4</p>
          </div>
          <div className="flex items-center gap-1">
            <span className="block size-8 rounded-full border-2 border-primary-foreground/50" />
            <span className="block size-12 rounded-full border-2 border-primary-foreground/35" />
            <span className="block size-16 rounded-full border-2 border-primary-foreground/20" />
          </div>
        </div>
      </div>
    </div>
  );
}

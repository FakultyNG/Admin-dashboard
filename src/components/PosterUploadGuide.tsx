type PosterUploadGuideProps = {
  orientation: "portrait" | "landscape";
  className?: string;
};

export default function PosterUploadGuide({
  orientation,
  className = "",
}: PosterUploadGuideProps) {
  const portrait = orientation === "portrait";

  return (
    <div className={`mt-1 text-[11px] leading-4 text-slate-400 ${className}`}>
      <p>
        Recommended: {portrait ? "1200 × 1600 px (3:4)" : "1920 × 1080 px (16:9)"}.
      </p>
      <p>
        Keep faces, titles and logos inside the central 80% safe area. JPG, PNG or WebP; uploads are automatically optimized to WebP.
      </p>
    </div>
  );
}

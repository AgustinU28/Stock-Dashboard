const TAGS = [
  { top: "6%", left: "-6%", size: 180, rotate: -12, opacity: 0.08 },
  { top: "22%", left: "68%", size: 130, rotate: 10, opacity: 0.06 },
  { top: "46%", left: "-10%", size: 220, rotate: -6, opacity: 0.07 },
  { top: "64%", left: "58%", size: 160, rotate: 14, opacity: 0.06 },
  { top: "86%", left: "6%", size: 140, rotate: -18, opacity: 0.05 },
];

/**
 * Scattered, oversized outlines of the PriceTag signature shape — decorative
 * texture for the login panel that ties back to the stock-status chip
 * instead of a generic gradient/blob background.
 */
export function PriceTagPattern() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {TAGS.map((tag, i) => (
        <span
          key={i}
          className="absolute border border-primary-foreground"
          style={{
            top: tag.top,
            left: tag.left,
            width: tag.size,
            height: tag.size * 0.56,
            opacity: tag.opacity,
            transform: `rotate(${tag.rotate}deg)`,
            clipPath: "polygon(18% 0, 100% 0, 100% 100%, 18% 100%, 0 50%)",
          }}
        />
      ))}
    </div>
  );
}

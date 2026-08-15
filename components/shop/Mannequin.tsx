import type { OutfitSlot } from "@/lib/data/products";

export type MannequinOutfit = Partial<Record<OutfitSlot, string>>;

const STAND_COLOR = "#3a4a43";

/**
 * Renders a stylized, abstract dress-form mannequin — deliberately not a
 * photographic garment render and not a human figure (no face, skin tone,
 * or body representation), per the explicit requirement not to fake a
 * virtual try-on. Each occupied outfit slot fills its region with the
 * selected product's swatch colour so the composition is genuinely
 * reflective of what's selected, without claiming to be garment-accurate.
 * A real photographic/AI try-on is future Phase 5+ work; this component's
 * `outfit` prop shape is designed to stay stable if that's added later —
 * only the rendering internals would change.
 */
export function Mannequin({
  outfit,
  size = "md",
}: {
  outfit: MannequinOutfit;
  size?: "sm" | "md" | "lg";
}) {
  const width = size === "lg" ? 280 : size === "sm" ? 140 : 220;

  return (
    <div className="mx-auto" style={{ width, maxWidth: "100%" }}>
      <svg
        viewBox="0 0 200 280"
        width="100%"
        height="auto"
        role="img"
        aria-label="Stylized outfit preview mannequin — an illustrative colour composition, not garment-accurate photography"
      >
        <circle cx="100" cy="26" r="14" fill={STAND_COLOR} opacity="0.85" />
        <rect x="96" y="38" width="8" height="18" fill={STAND_COLOR} opacity="0.85" />

        <path
          d="M68 62 Q100 54 132 62 L140 240 Q100 256 60 240 Z"
          fill="none"
          stroke={STAND_COLOR}
          strokeWidth="1.5"
          strokeDasharray="3 4"
          opacity="0.5"
        />

        {outfit.outerwear && (
          <path
            d="M52 68 Q100 52 148 68 L158 172 Q100 190 42 172 Z"
            fill={outfit.outerwear}
            opacity="0.92"
          />
        )}

        {outfit.dress ? (
          <path d="M70 62 Q100 55 130 62 L140 240 Q100 256 60 240 Z" fill={outfit.dress} />
        ) : (
          <>
            {outfit.top && (
              <path d="M70 62 Q100 55 130 62 L134 158 Q100 170 66 158 Z" fill={outfit.top} />
            )}
            {outfit.bottom && (
              <path d="M67 158 Q100 170 133 158 L140 240 Q100 256 60 240 Z" fill={outfit.bottom} />
            )}
          </>
        )}

        {outfit.shoes && (
          <>
            <ellipse cx="78" cy="250" rx="15" ry="7" fill={outfit.shoes} />
            <ellipse cx="122" cy="250" rx="15" ry="7" fill={outfit.shoes} />
          </>
        )}

        {outfit.bag && <rect x="152" y="150" width="24" height="20" rx="4" fill={outfit.bag} />}

        {outfit.accessory && <circle cx="100" cy="50" r="6" fill={outfit.accessory} />}
      </svg>
      <p className="mt-2 text-center text-[11px] text-foreground-muted">
        Stylized preview — colours only, not garment-accurate photography.
      </p>
    </div>
  );
}

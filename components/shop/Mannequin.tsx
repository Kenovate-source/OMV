import type { OutfitSlot } from "@/lib/data/products";

export type MannequinOutfit = Partial<Record<OutfitSlot, string>>;

const STAND_COLOR = "#3a4a43";
const LAPEL_SHADE = "rgba(58,74,67,0.35)";

/**
 * Renders a stylized outfit visualization — an abstract dress-form
 * mannequin (no face, skin tone, or body representation) with a distinct
 * SILHOUETTE per garment category, not just a colour swap on one generic
 * shape. Selecting a dress produces a fitted-bodice/flared-skirt shape;
 * a jacket produces a wider, open-lapel layer over whatever's underneath;
 * trousers split into two legs; a skirt flares from the waist; headwear
 * wraps the head knob; a bag sits beside the torso with a handle. Changing
 * which product occupies a slot changes both colour AND shape.
 *
 * This is explicitly NOT garment-accurate photography, virtual try-on, or
 * true size-based fit rendering (the `outfit` prop carries colour only —
 * size is tracked separately in outfit/cart state, not visually here) —
 * see the caption below and IMPLEMENTATION_LOG.md. The prop shape is
 * designed to stay stable if a real photographic/AI try-on is added later.
 */
export function Mannequin({
  outfit,
  size = "md",
}: {
  outfit: MannequinOutfit;
  size?: "sm" | "md" | "lg";
}) {
  const width = size === "lg" ? 280 : size === "sm" ? 140 : 220;

  const hasFullLength = outfit.traditionalWear || outfit.dress;
  const showTop = !hasFullLength && (outfit.top || outfit.shirt);
  const topColor = outfit.top ?? outfit.shirt;
  const showBottom = !hasFullLength && (outfit.trousers || outfit.skirt);

  return (
    <div className="mx-auto" style={{ width, maxWidth: "100%" }}>
      <svg
        viewBox="0 0 200 300"
        width="100%"
        height="auto"
        role="img"
        aria-label="Stylized outfit visualization — an illustrative garment composition, not photography or virtual try-on"
      >
        {/* Dress-form stand: neck knob + post, evokes a boutique mannequin */}
        <circle cx="100" cy="24" r="13" fill={STAND_COLOR} opacity="0.85" />
        <rect x="96" y="36" width="8" height="16" fill={STAND_COLOR} opacity="0.85" />

        {/* Faint reference silhouette so empty slots still read as a mannequin */}
        <path
          d="M70 58 Q100 50 130 58 L138 268 Q100 286 62 268 Z"
          fill="none"
          stroke={STAND_COLOR}
          strokeWidth="1.5"
          strokeDasharray="3 4"
          opacity="0.4"
        />

        {/* --- Full-length garments (mutually exclusive with top+bottom) --- */}
        {outfit.traditionalWear && (
          <path
            d="M50 60 Q100 44 150 60 L168 270 Q100 292 32 270 Z"
            fill={outfit.traditionalWear}
            opacity="0.95"
          />
        )}

        {!outfit.traditionalWear && outfit.dress && (
          <>
            <path d="M72 60 Q100 52 128 60 L124 152 Q100 160 76 152 Z" fill={outfit.dress} />
            <path d="M76 152 Q100 160 124 152 L146 266 Q100 286 54 266 Z" fill={outfit.dress} />
          </>
        )}

        {/* --- Top half: top/shirt with simple sleeves --- */}
        {showTop && (
          <>
            <rect
              x="55" y="62" width="15" height="48" rx="7"
              fill={topColor} transform="rotate(10 62.5 86)"
            />
            <rect
              x="130" y="62" width="15" height="48" rx="7"
              fill={topColor} transform="rotate(-10 137.5 86)"
            />
            <path d="M72 60 Q100 52 128 60 L124 158 Q100 166 76 158 Z" fill={topColor} />
          </>
        )}

        {/* --- Bottom half: trousers (two legs) or skirt (single flare) --- */}
        {!hasFullLength && outfit.trousers && (
          <>
            <path d="M77 158 L70 268 L92 268 L96 164 Z" fill={outfit.trousers} />
            <path d="M123 158 L130 268 L108 268 L104 164 Z" fill={outfit.trousers} />
          </>
        )}
        {!hasFullLength && !outfit.trousers && outfit.skirt && (
          <path d="M76 158 Q100 166 124 158 L138 218 Q100 234 62 218 Z" fill={outfit.skirt} />
        )}

        {/* --- Jacket: layered over everything on the torso, wider, with a lapel notch --- */}
        {outfit.jacket && (
          <>
            <rect
              x="46" y="58" width="17" height="58" rx="8"
              fill={outfit.jacket} opacity="0.93" transform="rotate(12 54.5 87)"
            />
            <rect
              x="137" y="58" width="17" height="58" rx="8"
              fill={outfit.jacket} opacity="0.93" transform="rotate(-12 145.5 87)"
            />
            <path d="M60 56 Q100 46 140 56 L134 168 Q100 178 66 168 Z" fill={outfit.jacket} opacity="0.93" />
            <path d="M86 57 L100 80 L94 57 Z" fill={LAPEL_SHADE} />
            <path d="M114 57 L100 80 L106 57 Z" fill={LAPEL_SHADE} />
          </>
        )}

        {/* --- Shoes --- */}
        {outfit.shoes && (
          <>
            <ellipse cx="78" cy="280" rx="15" ry="7" fill={outfit.shoes} />
            <ellipse cx="122" cy="280" rx="15" ry="7" fill={outfit.shoes} />
          </>
        )}

        {/* --- Headwear: wraps the stand's head knob --- */}
        {outfit.headwear && (
          <>
            <path
              d="M78 22 Q100 -2 122 22 Q124 34 100 36 Q76 34 78 22 Z"
              fill={outfit.headwear}
            />
            <path
              d="M117 18 Q132 10 129 26 Q122 29 116 23 Z"
              fill={outfit.headwear}
              opacity="0.85"
            />
          </>
        )}

        {/* --- Bag: beside the torso with a handle --- */}
        {outfit.bag && (
          <>
            <path d="M156 168 L180 168 L176 194 L160 194 Z" fill={outfit.bag} />
            <path
              d="M161 168 Q168 152 175 168"
              fill="none"
              stroke={outfit.bag}
              strokeWidth="3"
            />
          </>
        )}

        {/* --- Accessory: small badge at the neckline --- */}
        {outfit.accessory && <circle cx="100" cy="62" r="5" fill={outfit.accessory} />}
      </svg>
      <p className="mt-2 text-center text-[11px] text-foreground-muted">
        Stylized outfit visualization — not photography or virtual try-on.
      </p>
    </div>
  );
}

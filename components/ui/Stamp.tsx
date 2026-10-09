// Rubber ink stamp. The shared roughness filter (<StampFilterDefs/>) is rendered once in the root layout.

export function StampFilterDefs() {
  return (
    <svg aria-hidden="true" width="0" height="0" className="absolute">
      <filter id="vcc-stamp-rough" x="-10%" y="-10%" width="120%" height="120%">
        {/* wobble the edges */}
        <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="2" seed="4" result="warp" />
        <feDisplacementMap in="SourceGraphic" in2="warp" scale="5" xChannelSelector="R" yChannelSelector="G" result="warped" />
        {/* knock out speckles where the ink didn't take */}
        <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="9" result="speck" />
        <feColorMatrix in="speck" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  -4.5 0 0 0 3.45" result="mask" />
        <feComposite in="warped" in2="mask" operator="in" />
      </filter>
    </svg>
  );
}

type Props = {
  label: string;
  sub: string;
  tone?: "turmeric" | "ember";
  shape?: "round" | "rect";
  className?: string;
};

export function Stamp({ label, sub, tone = "turmeric", shape = "round", className = "" }: Props) {
  const color = tone === "ember" ? "var(--ember)" : "#C87410";
  const long = label.length > 5;
  const arcId = `stamp-arc-${label.replace(/\W/g, "")}`;
  return (
    <svg viewBox="0 0 220 220" className={className} aria-hidden="true">
      <g filter="url(#vcc-stamp-rough)" fill="none" stroke={color} opacity={0.92}>
        {shape === "round" ? (
          <>
            <circle cx="110" cy="110" r="100" strokeWidth="7" />
            <circle cx="110" cy="110" r="86" strokeWidth="2.5" />
            <path id={arcId} d="M40 110 A70 70 0 0 1 180 110" stroke="none" />
            <text fill={color} stroke="none" style={{ fontFamily: "var(--font-manrope)" }} fontWeight="800" fontSize="15" letterSpacing="5">
              <textPath href={`#${arcId}`} startOffset="50%" textAnchor="middle">
                {sub}
              </textPath>
            </text>
            <text x="110" y="168" fill={color} stroke="none" textAnchor="middle" fontSize="16" letterSpacing="6">
              ★ ★ ★
            </text>
          </>
        ) : (
          <>
            <rect x="12" y="46" width="196" height="128" rx="10" strokeWidth="7" />
            <rect x="24" y="58" width="172" height="104" rx="4" strokeWidth="2.5" />
            <text x="110" y="150" fill={color} stroke="none" textAnchor="middle" style={{ fontFamily: "var(--font-manrope)" }} fontWeight="800" fontSize="13" letterSpacing="5">
              {sub}
            </text>
          </>
        )}
        <text
          x="110"
          y={shape === "round" ? 126 : 118}
          fill={color}
          stroke="none"
          textAnchor="middle"
          style={{ fontFamily: "var(--font-bricolage)" }}
          fontWeight="800"
          fontSize={long ? 30 : 46}
          letterSpacing="-1"
        >
          {label}
        </text>
      </g>
    </svg>
  );
}

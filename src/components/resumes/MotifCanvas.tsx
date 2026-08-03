import type { DesignDna } from "@/lib/design-dna";

/** Procedural SVG motif — unique per Design DNA seed; hard to recreate by hand. */
export function MotifCanvas({
  dna,
  accent,
  muted,
}: {
  dna: DesignDna;
  accent: string;
  muted: string;
}) {
  const w = 820;
  const h = 220;
  const nodes = Array.from({ length: dna.density * 3 }, (_, i) => {
    const x = ((dna.seed * (i + 3)) % 97) / 97;
    const y = ((dna.seed * (i + 7)) % 89) / 89;
    return { x: 40 + x * (w - 80), y: 20 + y * (h - 40), r: 2 + (i % 3) };
  });

  if (dna.motif === "orbit") {
    return (
      <svg className="dna-motif" viewBox={`0 0 ${w} ${h}`} aria-hidden>
        {Array.from({ length: dna.orbitCount }, (_, i) => (
          <ellipse
            key={i}
            cx={160}
            cy={110}
            rx={50 + i * 28}
            ry={28 + i * 14}
            fill="none"
            stroke={accent}
            strokeOpacity={0.35 - i * 0.06}
            strokeWidth={1.2}
            transform={`rotate(${dna.angle + i * 12} 160 110)`}
          />
        ))}
        <circle cx={160} cy={110} r={8} fill={accent} fillOpacity={0.85} />
        {nodes.slice(0, 8).map((n, i) => (
          <circle key={i} cx={n.x} cy={n.y} r={n.r} fill={accent} fillOpacity={0.25} />
        ))}
      </svg>
    );
  }

  if (dna.motif === "lattice") {
    return (
      <svg className="dna-motif" viewBox={`0 0 ${w} ${h}`} aria-hidden>
        {Array.from({ length: 7 }, (_, row) =>
          Array.from({ length: 14 }, (_, col) => {
            const x = 30 + col * 55 + (row % 2) * 20;
            const y = 25 + row * 28;
            return (
              <path
                key={`${row}-${col}`}
                d={`M${x} ${y} l14 8 l-14 8 l-14 -8 z`}
                fill="none"
                stroke={accent}
                strokeOpacity={0.18 + ((col + row + dna.glyphIndex) % 3) * 0.08}
                strokeWidth={1}
                transform={`skewX(${dna.latticeSkew})`}
              />
            );
          }),
        )}
      </svg>
    );
  }

  if (dna.motif === "spectrum") {
    return (
      <svg className="dna-motif" viewBox={`0 0 ${w} ${h}`} aria-hidden>
        {Array.from({ length: 6 }, (_, i) => (
          <path
            key={i}
            d={`M0 ${30 + i * 28 + dna.bandOffset * 0.3} Q ${200 + i * 40} ${10 + i * 18}, ${w} ${40 + i * 24}`}
            fill="none"
            stroke={accent}
            strokeOpacity={0.2 + i * 0.06}
            strokeWidth={2.5 - i * 0.25}
          />
        ))}
      </svg>
    );
  }

  if (dna.motif === "synapse") {
    return (
      <svg className="dna-motif" viewBox={`0 0 ${w} ${h}`} aria-hidden>
        {nodes.map((n, i) => {
          const next = nodes[(i + 3) % nodes.length];
          return (
            <g key={i}>
              <line
                x1={n.x}
                y1={n.y}
                x2={next.x}
                y2={next.y}
                stroke={accent}
                strokeOpacity={0.18}
                strokeWidth={1}
              />
              <circle cx={n.x} cy={n.y} r={n.r + 1} fill={accent} fillOpacity={0.45} />
            </g>
          );
        })}
      </svg>
    );
  }

  // folio / platform default
  return (
    <svg className="dna-motif" viewBox={`0 0 ${w} ${h}`} aria-hidden>
      {Array.from({ length: 18 }, (_, i) => (
        <line
          key={i}
          x1={20 + i * 44}
          y1={0}
          x2={0 + i * 44}
          y2={h}
          stroke={muted}
          strokeOpacity={0.2}
          strokeWidth={1}
        />
      ))}
      <rect
        x={40}
        y={40}
        width={120}
        height={120}
        fill="none"
        stroke={accent}
        strokeOpacity={0.4}
        strokeWidth={1.5}
        transform={`rotate(${dna.angle} 100 100)`}
      />
    </svg>
  );
}

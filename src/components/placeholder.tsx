export function Placeholder({ area, title }: { area: string; title: string }) {
  return (
    <article className="placeholder">
      <p>{area} placeholder</p>
      <h1>{title}</h1>
      <p>Phase 1 routing boundary. Final content is intentionally deferred.</p>
    </article>
  );
}

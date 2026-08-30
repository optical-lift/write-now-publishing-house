const stages = [
  'Discovery',
  'Corpus',
  'Identity',
  'Source',
  'Rights',
  'Recovery Gap',
  'Reconstruction',
  'Exceptions',
  'Edition',
  'Audio',
  'Metadata',
  'Library Ready',
  'Published'
];

export default function StudioPage() {
  return (
    <main className="studio">
      <div className="studio-inner">
        <div className="eyebrow">Internal application surface</div>
        <h1>Publishing Studio</h1>
        <p className="studio-intro">
          This route is the future operating surface for the publishing house. It will expose governed WNPH objects and actions rather than becoming a separate CMS or a second source of book truth.
        </p>

        <div className="studio-flow">
          {stages.map((stage, index) => (
            <div className="studio-step" key={stage}>
              <span>{String(index + 1).padStart(2, '0')}</span>
              <strong>{stage}</strong>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

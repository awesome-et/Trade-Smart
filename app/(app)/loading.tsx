export default function Loading() {
  return (
    <div className="flex-1 p-6 flex items-center justify-center min-h-screen">
      <div className="text-center space-y-4">
        <div className="inline-block animate-spin">
          <div className="text-4xl">📊</div>
        </div>
        <h2 className="text-lg font-semibold">Loading Trading Engine...</h2>
        <p className="text-muted-foreground text-sm">Initializing your dashboard</p>
      </div>
    </div>
  );
}

export default function ProductsLoading() {
  return (
    <div className="container mx-auto px-4 sm:px-6 py-8">
      <div className="h-8 w-48 bg-muted/60 rounded-xl mb-6 animate-pulse" />
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="h-96 rounded-3xl bg-muted/40 animate-pulse hidden lg:block" />
        <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div
              key={n}
              className="h-80 rounded-2xl bg-muted/40 animate-pulse"
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function ProductDetailLoading() {
  return (
    <div className="container mx-auto px-4 sm:px-6 py-8 md:py-12">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-6 aspect-square rounded-3xl bg-muted/40 animate-pulse" />
        <div className="lg:col-span-6 space-y-6">
          <div className="h-6 w-32 bg-muted/40 rounded-full animate-pulse" />
          <div className="h-10 w-3/4 bg-muted/50 rounded-2xl animate-pulse" />
          <div className="h-8 w-40 bg-muted/40 rounded-xl animate-pulse" />
          <div className="h-24 w-full bg-muted/30 rounded-2xl animate-pulse" />
          <div className="h-12 w-full bg-muted/50 rounded-2xl animate-pulse" />
        </div>
      </div>
    </div>
  );
}

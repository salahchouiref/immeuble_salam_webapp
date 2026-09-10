export function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center h-full min-h-[16rem]">
      <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary-100 border-t-primary-600"></div>
    </div>
  );
}

export function FullPageLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary-100 border-t-primary-600"></div>
    </div>
  );
}
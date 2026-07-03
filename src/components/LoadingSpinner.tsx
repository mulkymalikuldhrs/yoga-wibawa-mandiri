const LoadingSpinner = () => {
  return (
    <div className="flex items-center justify-center min-h-screen" role="status" aria-label="Loading content">
      <div className="relative" aria-hidden="true">
        <div className="w-16 h-16 border-4 border-gray-200 rounded-full"></div>
        <div className="w-16 h-16 border-4 border-ywm-red border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
      </div>
      <span className="sr-only">Memuat...</span>
    </div>
  );
};

export default LoadingSpinner;

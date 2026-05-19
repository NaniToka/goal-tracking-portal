export default function LoadingSpinner({ size = 'md', className = '' }) {
  const sizes = { sm: 'h-5 w-5', md: 'h-8 w-8', lg: 'h-12 w-12' };
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div
        className={`${sizes[size]} animate-spin rounded-full border-2 border-brand-200 border-t-brand-600`}
      />
    </div>
  );
}

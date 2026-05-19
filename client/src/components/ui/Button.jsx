import { forwardRef } from 'react';
import PropTypes from 'prop-types';

const Button = forwardRef(
  ({ 
    children, 
    variant = 'primary', 
    size = 'md', 
    className = '', 
    disabled = false,
    loading = false,
    ...props 
  }, ref) => {
    const variants = {
      primary: 'bg-brand-600 text-white hover:bg-brand-700 focus:ring-brand-500',
      secondary: 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 focus:ring-brand-500',
      danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
      ghost: 'bg-transparent text-slate-700 hover:bg-slate-100 focus:ring-slate-500',
      success: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500',
    };

    const sizes = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-sm',
      lg: 'px-6 py-3 text-base',
      xl: 'px-8 py-4 text-lg',
    };

    const baseClasses = 'inline-flex items-center justify-center rounded-lg font-medium shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
        {...props}
      >
        {loading && (
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

Button.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf(['primary', 'secondary', 'danger', 'ghost', 'success']),
  size: PropTypes.oneOf(['sm', 'md', 'lg', 'xl']),
  className: PropTypes.string,
  disabled: PropTypes.bool,
  loading: PropTypes.bool,
};

export default Button;

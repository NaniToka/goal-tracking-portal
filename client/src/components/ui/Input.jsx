import { forwardRef } from 'react';
import PropTypes from 'prop-types';

const Input = forwardRef(
  (
    {
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      className = '',
      ...props
    },
    ref
  ) => {
    return (
      <div className="w-full">
        {label && (
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            className={`block w-full rounded-lg border px-3 py-2 text-sm shadow-sm placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 disabled:opacity-50 disabled:cursor-not-allowed ${
              error
                ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                : 'border-slate-300'
            } ${leftIcon ? 'pl-10' : ''} ${rightIcon ? 'pr-10' : ''} ${className}`}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
              {rightIcon}
            </div>
          )}
        </div>
        {error && (
          <p className="mt-1 text-xs text-red-600">{error}</p>
        )}
        {helperText && !error && (
          <p className="mt-1 text-xs text-slate-500">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

Input.propTypes = {
  label: PropTypes.string,
  error: PropTypes.string,
  helperText: PropTypes.string,
  leftIcon: PropTypes.node,
  rightIcon: PropTypes.node,
  className: PropTypes.string,
};

export default Input;

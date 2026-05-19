import { forwardRef } from 'react';
import PropTypes from 'prop-types';

const Textarea = forwardRef(
  (
    {
      label,
      error,
      helperText,
      className = '',
      rows = 4,
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
        <textarea
          ref={ref}
          rows={rows}
          className={`block w-full rounded-lg border px-3 py-2 text-sm shadow-sm placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 disabled:opacity-50 disabled:cursor-not-allowed resize-y ${
            error
              ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
              : 'border-slate-300'
          } ${className}`}
          {...props}
        />
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

Textarea.displayName = 'Textarea';

Textarea.propTypes = {
  label: PropTypes.string,
  error: PropTypes.string,
  helperText: PropTypes.string,
  className: PropTypes.string,
  rows: PropTypes.number,
};

export default Textarea;

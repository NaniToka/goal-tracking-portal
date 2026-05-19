import { forwardRef } from 'react';
import PropTypes from 'prop-types';

const Select = forwardRef(
  (
    {
      label,
      error,
      helperText,
      options,
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
        <select
          ref={ref}
          className={`block w-full rounded-lg border px-3 py-2 text-sm shadow-sm placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 disabled:opacity-50 disabled:cursor-not-500 ${
            error
              ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
              : 'border-slate-300'
          } ${className}`}
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
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

Select.displayName = 'Select';

Select.propTypes = {
  label: PropTypes.string,
  error: PropTypes.string,
  helperText: PropTypes.string,
  options: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      label: PropTypes.string.isRequired,
    })
  ).isRequired,
  className: PropTypes.string,
};

export default Select;

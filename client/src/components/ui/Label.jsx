import PropTypes from 'prop-types';

export default function Label({ children, htmlFor, className = '', required = false }) {
  return (
    <label 
      htmlFor={htmlFor} 
      className={`mb-1.5 block text-sm font-medium text-slate-700 ${className}`}
    >
      {children}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
  );
}

Label.propTypes = {
  children: PropTypes.node.isRequired,
  htmlFor: PropTypes.string,
  className: PropTypes.string,
  required: PropTypes.bool,
};

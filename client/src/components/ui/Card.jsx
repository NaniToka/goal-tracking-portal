import PropTypes from 'prop-types';

export default function Card({ 
  children, 
  className = '', 
  padding = 'md',
  hover = false,
  ...props 
}) {
  const paddings = {
    none: 'p-0',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  return (
    <div
      className={`rounded-xl border border-slate-200 bg-white shadow-sm ${paddings[padding]} ${
        hover ? 'transition-shadow hover:shadow-md' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

Card.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  padding: PropTypes.oneOf(['none', 'sm', 'md', 'lg']),
  hover: PropTypes.bool,
};

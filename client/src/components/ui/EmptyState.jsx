import PropTypes from 'prop-types';

export default function EmptyState({ 
  icon, 
  title, 
  description, 
  actionText, 
  onAction,
  size = 'md'
}) {
  const sizeClasses = {
    sm: 'py-8',
    md: 'py-12',
    lg: 'py-16',
  };

  const iconSizes = {
    sm: 'text-3xl',
    md: 'text-5xl',
    lg: 'text-6xl',
  };

  return (
    <div className={`text-center ${sizeClasses[size]}`}>
      {icon && <div className={`${iconSizes[size]} mb-4 opacity-50`}>{icon}</div>}
      {title && <h3 className="text-lg font-semibold text-slate-700 mb-2">{title}</h3>}
      {description && <p className="text-slate-500 mb-4 max-w-md mx-auto">{description}</p>}
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="btn-primary"
        >
          {actionText}
        </button>
      )}
    </div>
  );
}

EmptyState.propTypes = {
  icon: PropTypes.node,
  title: PropTypes.string,
  description: PropTypes.string,
  actionText: PropTypes.string,
  onAction: PropTypes.func,
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
};

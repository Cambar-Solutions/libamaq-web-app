import React from 'react';
import PropTypes from 'prop-types';

const Star = ({ filled, onClick, onMouseEnter, onMouseLeave, readOnly }) => (
  <span
    role={readOnly ? 'img' : 'button'}
    aria-label={filled ? 'Estrella llena' : 'Estrella vacía'}
    tabIndex={readOnly ? -1 : 0}
    onClick={readOnly ? undefined : onClick}
    onMouseEnter={readOnly ? undefined : onMouseEnter}
    onMouseLeave={readOnly ? undefined : onMouseLeave}
    style={{
      cursor: readOnly ? 'default' : 'pointer',
      color: filled ? '#facc15' : '#e5e7eb',
      fontSize: 24,
      transition: 'color 0.2s',
      outline: 'none',
      userSelect: 'none',
      marginRight: 2
    }}
  >
    ★
  </span>
);

Star.propTypes = {
  filled: PropTypes.bool,
  onClick: PropTypes.func,
  onMouseEnter: PropTypes.func,
  onMouseLeave: PropTypes.func,
  readOnly: PropTypes.bool
};

const StarRating = ({ value = 0, onChange, readOnly = false, size = 24 }) => {
  const [hovered, setHovered] = React.useState(null);
  const displayValue = hovered !== null ? hovered : value || 0;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          filled={star <= displayValue}
          onClick={() => !readOnly && onChange && onChange(star)}
          onMouseEnter={() => !readOnly && setHovered(star)}
          onMouseLeave={() => !readOnly && setHovered(null)}
          readOnly={readOnly}
        />
      ))}
      <span style={{ marginLeft: 6, fontSize: 14, color: '#64748b' }}>{displayValue}/5</span>
    </div>
  );
};

StarRating.propTypes = {
  value: PropTypes.number,
  onChange: PropTypes.func,
  readOnly: PropTypes.bool,
  size: PropTypes.number
};

export default StarRating; 
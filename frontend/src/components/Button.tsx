import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
  loading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  loading = false,
  disabled,
  className = '',
  children,
  ...rest
}) => {
  const classes = ['btn', `btn-${variant}`, className]
    .filter(Boolean)
    .join(' ');
  return (
    <button className={classes} disabled={loading || disabled} {...rest}>
      {loading ? <span className="spinner" /> : children}
    </button>
  );
};

export default Button;

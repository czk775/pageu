import { Link } from 'react-router-dom';

export function PrimaryButton({ children, className = '', icon: Icon, to, type = 'button', ...props }) {
  const content = (
    <>
      {children}
      {Icon ? <Icon size={21} aria-hidden="true" /> : null}
    </>
  );
  const buttonClassName = `generate-action ${className}`.trim();

  if (to) {
    return (
      <Link className={buttonClassName} to={to} {...props}>
        {content}
      </Link>
    );
  }

  return (
    <button className={buttonClassName} type={type} {...props}>
      {content}
    </button>
  );
}

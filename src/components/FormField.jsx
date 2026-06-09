export function FormField({ id, label, children }) {
  return (
    <div className="create-field">
      <label htmlFor={id}>{label}</label>
      {children}
    </div>
  );
}

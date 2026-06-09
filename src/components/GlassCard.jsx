export function GlassCard({ as: Surface = 'section', children, className = '', ...props }) {
  return (
    <Surface className={className} {...props}>
      {children}
    </Surface>
  );
}

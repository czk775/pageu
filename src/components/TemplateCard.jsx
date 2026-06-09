export function TemplateCard({ checked, onChange, template }) {
  return (
    <label className="template-card">
      <input
        aria-label={template.name}
        checked={checked}
        name="template"
        onChange={onChange}
        type="radio"
        value={template.id}
      />
      <span>{template.name}</span>
      <small>{template.tone}</small>
    </label>
  );
}

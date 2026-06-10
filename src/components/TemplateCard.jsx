export function TemplateCard({ checked, onChange, template }) {
  return (
    <label className={`template-card template-card-${template.id}`}>
      <input
        aria-label={template.name}
        checked={checked}
        name="template"
        onChange={onChange}
        type="radio"
        value={template.id}
      />
      <span className="template-preview" aria-hidden="true">
        <i />
        <i />
        <i />
      </span>
      <span>{template.name}</span>
      <small>{template.tone}</small>
    </label>
  );
}

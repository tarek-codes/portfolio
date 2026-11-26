import type {Field} from '../schema';

type Obj = Record<string, unknown>;

/** A form for one object, built from the schema's field list. Calls onChange with the whole updated object. */
export function FieldsForm({fields, value, onChange}: {fields: Field[]; value: Obj; onChange: (v: Obj) => void}) {
  const set = (key: string, v: unknown) => onChange({...value, [key]: v});
  return (
    <div className="adm-fields">
      {fields.map((f) => (
        <FieldInput key={f.key} field={f} value={value[f.key]} onChange={(v) => set(f.key, v)} />
      ))}
    </div>
  );
}

function FieldInput({field, value, onChange}: {field: Field; value: unknown; onChange: (v: unknown) => void}) {
  const id = `f-${field.key}-${Math.random().toString(36).slice(2, 7)}`;
  const label = (
    <label htmlFor={id} className="adm-label">
      {field.label}{field.required && <span aria-hidden="true"> *</span>}
    </label>
  );

  if (field.type === 'list') {
    const items = (Array.isArray(value) ? value : []) as Obj[];
    const sub = field.fields || [];
    const blank = () => Object.fromEntries(sub.map((s) => [s.key, s.type === 'strings' || s.type === 'list' ? [] : '']));
    const move = (i: number, d: number) => {
      const j = i + d;
      if (j < 0 || j >= items.length) return;
      const next = [...items];
      [next[i], next[j]] = [next[j], next[i]];
      onChange(next);
    };
    return (
      <fieldset className="adm-group">
        <legend className="adm-label">{field.label}</legend>
        {items.map((it, i) => (
          <div className="adm-sub" key={i}>
            <div className="adm-sub-head">
              <span>{String(it[field.itemLabel || sub[0]?.key] || `Item ${i + 1}`)}</span>
              <span className="adm-row-actions">
                <button type="button" className="adm-mini" aria-label="Move up" onClick={() => move(i, -1)} disabled={i === 0}>↑</button>
                <button type="button" className="adm-mini" aria-label="Move down" onClick={() => move(i, 1)} disabled={i === items.length - 1}>↓</button>
                <button type="button" className="adm-mini adm-danger" onClick={() => onChange(items.filter((_, k) => k !== i))}>Remove</button>
              </span>
            </div>
            <FieldsForm fields={sub} value={it} onChange={(v) => onChange(items.map((x, k) => (k === i ? v : x)))} />
          </div>
        ))}
        <button type="button" className="adm-btn adm-secondary" onClick={() => onChange([...items, blank()])}>+ Add {field.label.toLowerCase().replace(/s$/, '')}</button>
      </fieldset>
    );
  }

  if (field.type === 'strings') {
    const text = (Array.isArray(value) ? (value as string[]) : []).join('\n');
    return (
      <div className="adm-field">
        {label}
        <textarea id={id} className="adm-input" rows={field.multiline ? 8 : 4} value={text} onChange={(e) => onChange(e.target.value.split('\n'))} />
        <span className="adm-help">One per line.</span>
      </div>
    );
  }

  if (field.type === 'textarea') {
    return (
      <div className="adm-field">
        {label}
        <textarea id={id} className="adm-input" rows={4} value={String(value ?? '')} onChange={(e) => onChange(e.target.value)} />
      </div>
    );
  }

  if (field.type === 'select') {
    return (
      <div className="adm-field">
        {label}
        <select id={id} className="adm-input" value={String(value ?? '')} onChange={(e) => onChange(e.target.value)}>
          <option value="">Choose…</option>
          {(field.options || []).map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
      </div>
    );
  }

  if (field.type === 'number') {
    return (
      <div className="adm-field">
        {label}
        <input id={id} className="adm-input" type="number" step={field.step ?? 'any'} min={field.min} max={field.max}
          value={value === undefined || value === null ? '' : String(value)} onChange={(e) => onChange(e.target.value === '' ? '' : Number(e.target.value))} />
      </div>
    );
  }

  return (
    <div className="adm-field">
      {label}
      <input id={id} className="adm-input" type="text" value={String(value ?? '')} onChange={(e) => onChange(e.target.value)}
        placeholder={field.type === 'url' || field.type === 'embed' ? 'https://' : undefined} />
    </div>
  );
}

import raw from '../shared/schema.json';

export type FieldType = 'text' | 'textarea' | 'url' | 'embed' | 'number' | 'select' | 'strings' | 'list';
export type Field = {
  key: string; label: string; type: FieldType; required?: boolean; options?: string[];
  fields?: Field[]; itemLabel?: string; min?: number; max?: number; step?: number; multiline?: boolean;
};
export type CollectionDef = {label: string; kind: 'object' | 'list'; titleKey?: string; subtitleKey?: string; fields: Field[]};

/** The one description of the site's editable content, shared with the server (shared/schema.json). */
export const COLLECTIONS = raw.collections as unknown as Record<string, CollectionDef>;
export const COLLECTION_NAMES = Object.keys(COLLECTIONS);

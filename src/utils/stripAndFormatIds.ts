import { Schema } from 'mongoose';

/**
 * Includes `.id` field in `.toJSON()` calls whilst hiding the `._id` field.
 * @param schema to apply transformation to
 */
export function stripAndFormatIds(schema: Schema) {
    schema.set('toJSON', {
    virtuals: true,
    transform: function (_doc, ret) {
      delete ret._id;
    },
  });
}
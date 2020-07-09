export const hideSchemaProperty = (properties: string[]) => (
  _: Record<string, unknown>,
  ret: Record<string, unknown>
): Record<string, unknown> => {
  for (const property of properties) delete ret[property];
  return ret;
};

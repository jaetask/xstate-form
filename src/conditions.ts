export const condFieldName = (name: string): any => (_: any, e: any) => e.fieldName === name;

export const condIsEnabled = (name: string): any => (_: any, e: any, m: any) =>
  e.fieldName === name && m.state.matches(`form.${name}.enable.enabled`);

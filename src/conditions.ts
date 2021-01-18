export const condFieldName = (name: string): any => (_: any, e: any) => e.fieldName === name;

export const condIsEnabled = (name: string): any => (_c: any, _e: any, m: any) =>
  m.state.matches(`form.${name}.enable.enabled`);

export const condIsVisible = (name: string): any => (_c: any, _e: any, m: any) =>
  m.state.matches(`form.${name}.visible.visible`);

// export const condIsTouched = (name: string): any => (c: any, _e: any, _m: any) => c.touched[name] === true;

/**
 * Tests that a value is a true boolean
 * @param x
 */
const isTrue = (x: boolean): boolean => x === true;

/**
 * Allows to pass an array of conditons that must all must be true
 * @param conditions
 */
export const conditionsAll = (conditions: any[]): any => (c: any, e: any, m: any) =>
  conditions.map(condition => condition(c, e, m)).every(isTrue);

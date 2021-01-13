import { Machine } from 'xstate';
// import * as Yup from 'yup';
import { buildMachine } from './machines/form.machine';

// define action creators
const focus = (name: string) => ({ type: 'FOCUS', fieldName: name });
const blur = (name: string) => ({ type: 'BLUR', fieldName: name });
const disable = (name: string) => ({ type: 'DISABLE', fieldName: name });
const enable = (name: string) => ({ type: 'ENABLE', fieldName: name });
const change = (name: string, value: string | number | boolean) => ({ type: 'CHANGE', fieldName: name, value });

// test utils
const transitions = (machine: any, events: any[], initialState: any) =>
  events.reduce((current, event) => machine.transition(current, event), initialState);

describe('xstate-form', () => {
  it('textField ignores changes when unfocused', () => {
    const machineConfig = buildMachine();
    const machine = Machine(machineConfig);
    const { username } = machineConfig.context.values;
    const state = machine.transition(machine.initialState, change('username', '123'));
    expect(state.context.values.username).toEqual(username);
  });

  it('textField accepts changes when focused', () => {
    const machineConfig = buildMachine();
    const machine = Machine(machineConfig);
    const result = transitions(machine, [focus('username'), change('username', '3333')], machine.initialState);
    console.log('result.value', result.value);

    expect(result.context.values.username).toEqual('3333');
  });

  it('textField ignores changes after blur', () => {
    const machineConfig = buildMachine();
    const machine = Machine(machineConfig);
    const { username } = machineConfig.context.values;
    const result = transitions(
      machine,
      [focus('username'), blur('username'), change('username', '999999')],
      machine.initialState
    );
    expect(result.context.values.username).toEqual(username);
  });

  it('textField is touched on change', () => {
    const machineConfig = buildMachine();
    const machine = Machine(machineConfig);
    let state = machine.transition(machine.initialState, focus('username'));
    expect(state.context.touched).not.toHaveProperty('username');
    state = machine.transition(state, change('username', 'uygfsduygs'));
    expect(state.context.touched).toHaveProperty('username');
    expect(state.context.touched.username).toBeTruthy();
  });

  it('textField ignores changes when disabled', () => {
    const machineConfig = buildMachine();
    const machine = Machine(machineConfig);
    const { username } = machineConfig.context.values;
    const result = transitions(
      machine,
      [focus('username'), disable('username'), change('username', '123')],
      machine.initialState
    );
    expect(result.context.values.username).toEqual(username);
  });

  it('textField allows changes after enabled and when focused', () => {
    const machineConfig = buildMachine();
    const machine = Machine(machineConfig);
    const result = transitions(
      machine,
      [disable('username'), enable('username'), focus('username'), change('username', '909090')],
      machine.initialState
    );
    expect(result.context.values.username).toEqual('909090');
  });

  it('textField loses focus when disabled', () => {
    const machineConfig = buildMachine();
    const machine = Machine(machineConfig);
    let result = transitions(machine, [focus('username')], machine.initialState);
    expect(result.matches('form.username.focus.focused')).toBeTruthy();
    result = transitions(machine, [disable('username')], result);
    expect(result.matches('form.username.focus.unfocused')).toBeTruthy();
  });

  // RESETs happen at the field level, each field can react however it wants.
});

// scratch pad - all in one file

// credit to Formik for this function, add to docs
// this might not match what I want, test and see..
// function yupToFormErrors(validated: any, touched: any) {
//   let errors: { [key: string]: any } | null = {};
//   if (Array.isArray(validated.inner) && validated.inner.length) {
//     validated.inner.forEach((validationError: any) => {
//       const field = validationError.path;
//       if (touched[field]) {
//         errors![field] = validationError?.errors[0] || '';
//       } else if (errors![field]) {
//         delete errors![field];
//       }
//     });
//   } else if (Array.isArray(validated.errors) && validated.errors.length) {
//     // console.log('validated', validated);
//     const { message = '', path: field } = validated;
//     if (touched[field]) {
//       errors![field] = message;
//     }
//   }

//   return errors;
// }

// const schema = Yup.object({
//   query: Yup.string()
//     .min(2)
//     .required(),
// });

// const form = (machineConfig: any, machineOptions: any, schema: any) => {
//   let state = null;
//   let errors: { [key: string]: string } = {};
//   const machine = Machine(machineConfig, machineOptions);
//   const service = interpret(machine);

//   service.onTransition(currentState => {
//     if (currentState.changed) {
//       state = currentState;
//       try {
//         schema.validateSync(state.context);
//         errors = {};
//       } catch (formErrors) {
//         errors = yupToFormErrors(formErrors, touched);
//         console.log('fomr->errors', errors);
//       }
//     }
//   });

//   service.start();

//   const touched: { [key: string]: boolean } = {};
//   const hasError = (fieldPath: string): boolean =>
//     errors[fieldPath] === undefined ? false : true;
//   const isTouched = (fieldPath: string): boolean =>
//     touched[fieldPath] !== undefined;
//   const isInvalid = (fieldPath: string): boolean =>
//     hasError(fieldPath) && isTouched(fieldPath);
//   const error = (fieldPath: string): string | undefined =>
//     errors[fieldPath] === undefined ? undefined : errors[fieldPath];
//   const touch = (fieldPath: string): void => {
//     touched[fieldPath] = true;
//   };

//   const validator = {
//     errors,
//     error,
//     hasError,
//     isInvalid,
//     isTouched,
//     touch,
//   };

//   return { state, send: service.send, service, validator };
// };

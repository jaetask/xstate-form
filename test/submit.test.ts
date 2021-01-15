import { Machine } from 'xstate';
// import * as Yup from 'yup';
import { buildMachine } from './machines/form.machine';
import { click, disable, focus } from '../src/actions';
import { transitions } from './test-utils';

describe('submit', () => {
  it('raises SUBMIT on click', () => {
    const machineConfig = buildMachine();
    const machine = Machine(machineConfig);
    let result = transitions(machine, [focus('submitForm'), click('submitForm')], machine.initialState);
    expect(result.matches('submitting')).toBeTruthy();
  });
  it('ignores click when unfocused', () => {
    const machineConfig = buildMachine();
    const machine = Machine(machineConfig);
    let result = transitions(machine, [click('submitForm')], machine.initialState);
    expect(result.matches('form')).toBeTruthy();
  });
  it('ignores click when disabled', () => {
    const machineConfig = buildMachine();
    const machine = Machine(machineConfig);
    let result = transitions(
      machine,
      [focus('submitForm'), disable('submitForm'), click('submitForm')],
      machine.initialState
    );
    expect(result.matches('form')).toBeTruthy();
  });
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

import { Machine } from 'xstate';
// import * as Yup from 'yup';
import { buildMachine } from './machines/form.machine';

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

// describe.skip('form', () => {
//   it('can exist', () => {
//     const machine = {
//       id: 'toggle',
//       initial: 'idle',
//       context: {
//         query: '',
//       },
//       states: {
//         idle: {
//           on: {
//             FORM_QUERY: {
//               actions: assign({ query: (_c: any, e: any): any => e.value }),
//             },
//           },
//         },
//       },
//     };

//     // i would like the validator to be passed out here,
//     // but also updated on every state change, so that validator.hasError() can be called
//     // and be truthful to the state
//     // the thing is.. touched/errors etc ARE states,
//     // should they be a machine?
//     const { send, service, validator } = form(machine, {}, schema);

//     service.onTransition((current: any) => {
//       if (current.changed) {
//         // console.log(current);
//         console.log('validator', validator.errors);
//       }
//     });

//     send('FORM_QUERY', { value: '1' }); // nothing happens

//     // now touch the item
//     validator.touch('query');
//     send('FORM_QUERY', { value: '3' });
//     console.log('validator', validator);

//     // there's some conflict here between a programmatic interface and
//     // a MSG based interface.
//     // Could all of this be represented by a machine?
//     // could the actual form just send messages to the form machine?
//     // is there a generic way to do this?
//   });
// });

const focus = (name: string) => ({ type: 'FOCUS', fieldName: name });
const blur = (name: string) => ({ type: 'BLUR', fieldName: name });
const disable = (name: string) => ({ type: 'DISABLE', fieldName: name });
const enable = (name: string) => ({ type: 'ENABLE', fieldName: name });
const change = (name: string, value: string | number | boolean) => ({ type: 'CHANGE', fieldName: name, value });

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
    expect(result.value.username.focus).toEqual('focused');
    result = transitions(machine, [disable('username')], result);
    expect(result.value.username.focus).toEqual('unfocused');
  });

  // it.skip('does stuff', () => {
  //   const machineConfig = buildMachine();
  //   // console.log('username', machine.states.username);
  //   // console.log('password', machine.states.password);

  //   const machine = Machine(machineConfig);
  //   const service = interpret(machine);

  //   service.start();
  //   const send = service.send;

  //   service.onTransition((current: any) => {
  //     console.log(current.event.type);
  //     console.log(current.value);
  //     console.log(current.context);
  //     if (
  //       current.event.type === 'CHANGE' &&
  //       current.history.event.type === 'DISABLE'
  //     ) {
  //       //expect(current.context.values.username).toEqual('123');
  //     }
  //   });

  //   // lets focus and send some values to the username filed
  //   send('FOCUS', { fieldName: 'username' });
  //   send('CHANGE', { fieldName: 'username', value: '123' });

  //   // disable the field and send update
  //   send('DISABLE', { fieldName: 'username' });
  //   send('CHANGE', { fieldName: 'username', value: 'shouldnotbeset' });
  //   send('ENABLE', { fieldName: 'username' });
  //   send('CHANGE', { fieldName: 'username', value: 'shouldbeset' });

  //   // send('RESET');
  //   send('SUBMIT');
  // });
});

import { assign } from 'xstate';

export const value = (name: string): any =>
  assign({
    values: ({ values }: any, e: any) => {
      values[name] = e.value;
      return values;
    },
  });

// const removeValue = (name: string): any =>
//   assign({
//     values: ({ values }: any) => {
//       if (values[name]) {
//         // todo: set back to default value (if there is one)...
//         delete values[name];
//       }
//       return values;
//     },
//   });

export const currentFocus = (name: string): any => assign({ focused: name });
export const clearCurrentFocus = () => assign({ focused: null });

export const resetValue = (name: string): any =>
  assign({
    values: (context: any) => {
      if (context.values[name]) {
        // todo: set back to default value (if there is one)...
        context.values[name] = context?.initialValues[name] || undefined;
      }
      return context.values;
    },
  });

export const touch = (name: string): any =>
  assign({
    touched: ({ touched }: any) => {
      touched[name] = true;
      return touched;
    },
  });

export const untouch = (name: string): any =>
  assign({
    touched: ({ touched }: any) => {
      if (touched[name]) {
        delete touched[name];
      }
      return touched;
    },
  });

export const validate = (name: string) =>
  assign({
    errors: (c: any, e: any, m: any) => {
      // if we have a validate function, call it and we're good to go
      if (typeof c?.validate === 'function') {
        return c.validate(c.values, e, m, name);
      }
      return {};
    },
  });

export const resettingState = () => ({
  after: {
    250: 'form.hist',
  },
});

export const submittingState = () => ({
  after: {
    1000: 'submitted',
  },
});

// who knows how the project will want to handle this?
// some may want a single submit, some may want RETRY capability..
export const submittedState = () => ({
  after: {
    2500: 'form.hist',
  },
});

/**
 * Composable forms:
 * ----------------
 * Forms are generally either being filled in, resetting, submitting or submitted. There
 * may be other states such as recalculating, but this is a user specific case.
 *
 * By providing this default machine, users are free to roll thier own and just use
 * parts that they need.
 *
 * Each state should be overridable, allowing maximum flexibility, such as async submitting via an
 * invoke service (or whatever). All forms will need initialValues, touched, errors, values and
 * schema context items.
 */
export const form = ({
  fields = {},
  id = 'xstateForm',
  initialValues = {},
  additionalStates = {}, // enable users to expand the states for things like RETRY!
  resetting = resettingState(),
  submitting = submittingState(),
  submitted = submittedState(),
  validate = undefined,
}): any => {
  return {
    id,
    initial: 'form',
    context: {
      errors: {},
      focused: null,
      initialValues,
      touched: {},
      validate,
      values: { ...initialValues },
    },
    states: {
      // todo: Does this support nesting? tabbed forms etc? Can fields be grouped? i.e. radios?
      // considering all fields in a mutli page form are still in one form, we just choose to
      // show/hide parts of the form per page.
      //
      // Each field is a parallel state and has it's own states enabled/focused/selected etc
      form: {
        type: 'parallel',
        states: {
          hist: {
            type: 'history',
            history: 'deep',
          },
          ...fields,
        },
        on: {
          SUBMIT: 'submitting',
          RESET: 'resetting',
        },
      },
      // does having this state affect the form fields RESET ability?
      resetting,
      submitting,
      submitted,
      ...additionalStates,
    },
  };
};

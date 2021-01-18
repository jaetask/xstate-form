import { assign } from 'xstate';
import { raise } from 'xstate/lib/actions';
import { invalid, valid } from './actions';

export const value = (name: string): any =>
  assign({
    values: ({ values }: any, e: any) => {
      values[name] = e.value;
      return values;
    },
  });

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

export const updateValidity = (name: string): any => {
  // checks the previous invalid items
  // if the current field is invalid and no longer in the
  return (context: any, _e: any, meta: any): any => {
    // move this to a condition!
    const wasFieldInInvalidState = meta?.state?.value?.form[name]?.valid === 'invalid';
    const doesFieldHaveError = context?.errors[name] === true;

    console.log('updateValidity', name);
    console.log('wasFieldInInvalidState', name, wasFieldInInvalidState);
    console.log('doesFieldHaveError', doesFieldHaveError);

    // if field was invalid but no longer is, raise('VALID')
    if (wasFieldInInvalidState && !doesFieldHaveError) {
      return raise(valid(name));
    }

    // if field was valid but no longer is, raise ('INVALID')
    if (!wasFieldInInvalidState && doesFieldHaveError) {
      return raise(invalid(name));
    }
    // console.log('c,e,m', context, e, meta);

    // if field did have an still has an error, do nothing
    return undefined;
  };
};

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

// Thisis actually an XSateNode

interface LooseObject {
  [id: string]: any;
}

export interface FormParams {
  id: string;
  fields: LooseObject[];
  initialValues?: LooseObject;
  additionalStates?: {};
  resetting?: {};
  submitting?: {};
  submitted?: {};
  validate?: undefined;
}

export const form = ({
  id,
  initialValues,
  resetting = resettingState(),
  submitting = submittingState(),
  submitted = submittingState(),
  additionalStates,
  fields,
}: FormParams): any => {
  var obj: LooseObject = {};
  return {
    id,
    initial: 'form',
    context: {
      errors: {},
      focused: null,
      initialValues,
      // touched: {},
      validate,
      values: { ...initialValues },
    },
    states: {
      // does having this state affect the form fields RESET ability?
      resetting,
      submitting,
      submitted,
      ...additionalStates,
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
          // convert field map into keyed:object
          ...fields.reduce((c, e: LooseObject): any => {
            c[e.id] = e;
            return c;
          }, obj),
        },
        on: {
          SUBMIT: 'submitting',
          RESET: 'resetting',
        },
      },
    },
  };
};

import { condFieldName, condIsEnabled, condIsVisible, conditionsAll } from '../conditions';
import { clearCurrentFocus, currentFocus, resetValue, validate, value } from '../form';

// todo, change to an object of params for labels, initialValue etc
const text = (name: string) => ({
  id: name,
  type: 'parallel',
  // let's not get into field level context yet, but we will once moving to the actos model in full
  // the fileds will be self sustaining machines with their own private context and requests will be made for them
  // to validate, get values etc.
  context: {
    somePrivateTextFieldContext: 'value',
  },
  states: {
    enable: {
      initial: 'enabled',
      states: {
        enabled: {
          on: {
            DISABLE: {
              target: ['disabled', `#${name}.focus.unfocused`],
              cond: condFieldName(name),
            },
          },
        },
        disabled: {
          on: {
            ENABLE: {
              target: 'enabled',
              cond: condFieldName(name),
            },
          },
        },
      },
    },
    focus: {
      initial: 'unfocused',
      states: {
        focused: {
          on: {
            BLUR: {
              target: ['unfocused', `#${name}.touch.touched`],
              actions: [validate(name), clearCurrentFocus()],
              cond: condFieldName(name),
            },
            CHANGE: {
              actions: [value(name), validate(name)],
              cond: conditionsAll([condFieldName(name), condIsEnabled(name)]),
            },
            FOCUS: {
              target: 'unfocused',
              actions: currentFocus(name),
              cond: !condFieldName(name),
            },
          },
        },
        unfocused: {
          on: {
            FOCUS: {
              target: 'focused',
              actions: currentFocus(name),
              cond: conditionsAll([condFieldName(name), condIsEnabled(name), condIsVisible(name)]),
            },
          },
        },
      },
      on: {
        RESET: {
          target: ['focus.unfocused', `#${name}.touch.untouched`],
          actions: [resetValue(name), validate(name), clearCurrentFocus()],
        },
      },
    },
    pristine: {
      initial: 'pristine',
      states: {
        pristine: {
          on: {
            CHANGE: {
              target: 'dirty',
              cond: condFieldName(name),
            },
          },
        },
        dirty: {
          on: {
            RESET: {
              target: 'pristine',
            },
          },
        },
      },
    },
    touch: {
      initial: 'untouched',
      states: {
        untouched: {
          on: {
            BLUR: {
              target: 'touched',
              cond: condFieldName(name),
            },
          },
        },
        touched: {
          on: {
            RESET: {
              target: 'untouched',
            },
          },
        },
      },
    },
    valid: {
      initial: 'valid',
      states: {
        valid: {
          on: {
            INVALID: {
              target: 'invalid',
              cond: conditionsAll([condFieldName(name)]),
            },
          },
        },
        invalid: {
          on: {
            VALID: {
              target: 'valid',
              cond: condFieldName(name),
            },
          },
        },
      },
      on: {
        RESET: {
          target: 'valid.valid',
          actions: [],
        },
      },
    },
    visible: {
      initial: 'visible',
      states: {
        visible: {
          on: {
            INVISIBLE: {
              target: ['invisible', `#${name}.focus.unfocused`],
              cond: condFieldName(name),
            },
          },
        },
        invisible: {
          on: {
            VISIBLE: {
              target: 'visible',
              cond: condFieldName(name),
            },
          },
        },
      },
    },
  },
  meta: {
    field: {
      type: 'text',
      // todo: fill this from the forms intiial values, is used to detect pristine/dirty
      initialValue: '',
    },
  },
});

export default text;

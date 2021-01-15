import { condFieldName, condIsEnabled, condIsVisible, conditionsAll } from '../conditions';
import { resetValue, touch, value, untouch } from '../form';

const text = (name: string) => ({
  id: name,
  type: 'parallel',
  states: {
    focus: {
      initial: 'unfocused',
      states: {
        focused: {
          on: {
            BLUR: {
              target: 'unfocused',
              cond: condFieldName(name),
            },
            CHANGE: {
              actions: [value(name), touch(name)],
              cond: conditionsAll([condFieldName(name), condIsEnabled(name)]),
            },
            FOCUS: {
              target: 'unfocused',
              cond: !condFieldName(name),
            },
          },
        },
        unfocused: {
          on: {
            FOCUS: {
              target: 'focused',
              cond: conditionsAll([condFieldName(name), condIsEnabled(name), condIsVisible(name)]),
            },
          },
        },
      },
      on: {
        RESET: {
          target: 'focus.unfocused',
          actions: [resetValue(name), untouch(name)],
        },
      },
    },
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
});

export default text;

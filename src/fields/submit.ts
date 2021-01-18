import { condFieldName, condIsEnabled } from '../conditions';
import { raise } from 'xstate/lib/actions';

// submit is a particular type of button
const submit = ({ name = '' }) => ({
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
            // todo: some browsers force a button to be foxced when clicked, others do not.
            // some also act differently depending on the OS build.
            // possibly send a focus(name) event when clicked
            CLICK: {
              actions: [raise('SUBMIT')],
              cond: condIsEnabled(name),
            },
          },
        },
        unfocused: {
          on: {
            FOCUS: {
              target: 'focused',
              cond: condIsEnabled(name),
            },
          },
        },
      },
      on: {
        RESET: {
          target: 'focus.unfocused',
          actions: [],
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
  },
});

export default submit;

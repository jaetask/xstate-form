import { Machine, interpret } from 'xstate';

describe('xstate', () => {
  it('can interpret', () => {
    const machine = Machine({
      id: 'toggle',
      initial: 'inactive',
      states: {
        inactive: {
          on: { TOGGLE: 'active' },
        },
        active: {
          on: { TOGGLE: 'inactive' },
        },
      },
    });

    // Interpret the machine, and add a listener for whenever a transition occurs.
    const service = interpret(machine);

    service.onTransition(state => {
      if (state.changed) {
        expect(state.event).toHaveProperty('type');
        expect(state.event).toMatchObject({ type: 'TOGGLE' });
      }
    });

    // Start the service
    service.start();

    // Send events
    service.send('TOGGLE');

    // Stop the service when you are no longer using it.
    service.stop();
  });
});

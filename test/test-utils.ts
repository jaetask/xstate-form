// test utils
export const transitions = (machine: any, events: any[], initialState: any) =>
  events.reduce((current, event) => machine.transition(current, event), initialState);

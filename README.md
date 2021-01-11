# xstate-form

## Reason

Multiple attempts to get `xstate` and `Formik` to play nicely have resulted in a roll your own scenario. There are things I really like about Formik, it's Yup integration, FieldError, Validation and the likes. There are things I really dislike about Formik such as complex field dependant calculations are hard to implement, the black box approach hides logic and it's hard to know what changed and when.

This is where `xstate` comes in.

The plan here is to create a `Formik` style `xstate` form handler, with validation, `FieldError` and the likes. I doubt it will implement _all_ of Formiks features, and I suspect there will be some _additional_ features.

Most importantly, this is going to be a `functional` solution, it will work independantly of `React`, there will be a `React` handler, a `Vue` handler etc. The idea is to use `xstate` and `xstate-forms` to solve form issues independantly of your renderer.

Forms driven by `xstate` can be single form or multi tab wizards, it's down to you to design your state machine to allow that.

So, here goes.

# Model Provider Contract v0.2

## Principle

Models are replaceable reasoning components inside PRAXIOS.

A provider implements:

    generate({model, system, input, metadata, signal}) -> text

## Planner contract

Planner returns JSON containing an acyclic tasks array.

Each task contains:

- id;
- title;
- role;
- input;
- dependsOn;
- workerSlot.

PRAXIOS validates the DAG before registration.

## Worker contract

Worker returns:

- summary;
- evidence[];
- claims[];
- proposedActions[].

Worker claims are assigned to the worker actor by PRAXIOS. The worker cannot mark them verified.

## Verifier contract

Verifier receives registered evidence and claims and returns:

- summary;
- reviews[];
- proposedActions[].

The verifier cannot create new claims in the verification stage.

## Privacy

Provider keys remain server-side.

Ledger records provider/model metadata plus hashes and sizes of model-call inputs and outputs, rather than hidden reasoning traces.

## Cancellation

Provider adapters accept AbortSignal. PRAXIOS enforces a provider timeout.

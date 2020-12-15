import {
    takeEvery,
    takeLeading,
    takeLatest,
    call,
    put,
} from "redux-saga/effects";

//Types
import {TypeConstant} from "typesafe-actions";
import {
    PromiseActionSet,
    PromiseAction,
    rejectPromiseAction,
    resolvePromiseAction,
} from "./";

type EffectCreator = typeof takeEvery | typeof takeLeading | typeof takeLatest;

type Worker<RequestType extends TypeConstant, X, Y> = (
    action: PromiseAction<RequestType, X, Y>
) => any;

function* promiseActionWrapper<
    RequestType extends TypeConstant,
    SuccessType extends TypeConstant,
    FailureType extends TypeConstant,
    X,
    Y,
    Z
>(
    promiseAction: PromiseActionSet<
        RequestType,
        SuccessType,
        FailureType,
        X,
        Y,
        Z
    >,
    action: PromiseAction<RequestType, X, Y>,
    worker: Worker<RequestType, X, Y>
) {
    try {
        const payload = yield call(worker, action);
        yield resolvePromiseAction(action, payload);
        yield put(promiseAction.success(payload));
    } catch (err) {
        yield rejectPromiseAction(action, err);
        yield put(promiseAction.failure(err));
    }
}

function effectCreatorFactory<
    E extends EffectCreator,
    RequestType extends TypeConstant,
    SuccessType extends TypeConstant,
    FailureType extends TypeConstant,
    X,
    Y,
    Z
>(
    effectCreator: E,
    promiseAction: PromiseActionSet<
        RequestType,
        SuccessType,
        FailureType,
        X,
        Y,
        Z
    >,
    worker: Worker<RequestType, X, Y>
) {
    return effectCreator(
        promiseAction.request,
        (action: PromiseAction<RequestType, X, Y>) =>
            promiseActionWrapper(promiseAction, action, worker)
    );
}

/**
 * Spawns a saga on each particular promise action dispatched to the store. If saga succeeds action is resolved with return value as payload. Otherwise it gets rejected.
 * @param {PromiseActionSet<RequestType, SuccessType, FailureType, X, Y, Z>} action Promise action to watch
 * @param worker A generator function
 */
export function takeEveryPromiseAction<
    RequestType extends TypeConstant,
    SuccessType extends TypeConstant,
    FailureType extends TypeConstant,
    X,
    Y,
    Z
>(
    action: PromiseActionSet<RequestType, SuccessType, FailureType, X, Y, Z>,
    worker: Worker<RequestType, X, Y>
) {
    return effectCreatorFactory(takeEvery, action, worker);
}

/**
 * Spawns a saga on each particular promise action dispatched to the store. Automatically cancels any previous sagas started previously if it's still running. If saga succeeds action is resolved with return value as payload. Otherwise it gets rejected.
 * @param {PromiseActionSet<RequestType, SuccessType, FailureType, X, Y, Z>} action Promise action to watch
 * @param worker A generator function
 */
export function takeLeadingPromiseAction<
    RequestType extends TypeConstant,
    SuccessType extends TypeConstant,
    FailureType extends TypeConstant,
    X,
    Y,
    Z
>(
    action: PromiseActionSet<RequestType, SuccessType, FailureType, X, Y, Z>,
    worker: Worker<RequestType, X, Y>
) {
    return effectCreatorFactory(takeLeading, action, worker);
}

/**
 * Spawns a saga on each particular promise action dispatched to the store. After spawning a task once, it blocks until spawned saga completes and then starts to listen for an action again. If saga succeeds action is resolved with return value as payload. Otherwise it gets rejected.
 * @param {PromiseActionSet<RequestType, SuccessType, FailureType, X, Y, Z>} action Promise action to watch
 * @param worker A generator function
 */
export function takeLatestPromiseAction<
    RequestType extends TypeConstant,
    SuccessType extends TypeConstant,
    FailureType extends TypeConstant,
    X,
    Y,
    Z
>(
    action: PromiseActionSet<RequestType, SuccessType, FailureType, X, Y, Z>,
    worker: Worker<RequestType, X, Y>
) {
    return effectCreatorFactory(takeLatest, action, worker);
}

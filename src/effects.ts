import {
    takeEvery,
    takeLeading,
    takeLatest,
    call,
    put,
} from "redux-saga/effects";

//Types
import {PromiseActionSet, rejectPromiseAction, resolvePromiseAction} from "./";

type EffectCreator = typeof takeEvery | typeof takeLeading | typeof takeLatest;

type Worker<A extends PromiseActionSet<any, any, any, any, any, any>> = (action: ReturnType<A["request"]>) => any;

function* promiseActionWrapper<
    A extends PromiseActionSet<any, any, any, any, any, any>
>(promiseAction: A, action: ReturnType<A['request']>, worker: Worker<A>) {
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
    A extends PromiseActionSet<any, any, any, any, any, any>
>(effectCreator: E, promiseAction: A, worker: Worker<A>) {
    return effectCreator(promiseAction.request, (action: ReturnType<A['request']>) => promiseActionWrapper(promiseAction, action, worker)
    );
}

/**
 * Spawns a saga on each particular promise action dispatched to the store. If saga succeeds action is resolved with return value as payload. Otherwise it gets rejected.
 * @param {A} action Promise action to watch
 * @param worker A generator function
 */
export function takeEveryPromiseAction<
    A extends PromiseActionSet<any, any, any, any, any, any>
>(action: A, worker: Worker<A>) {
    return effectCreatorFactory(takeEvery, action, worker);
}

/**
 * Spawns a saga on each particular promise action dispatched to the store. Automatically cancels any previous sagas started previously if it's still running. If saga succeeds action is resolved with return value as payload. Otherwise it gets rejected.
 * @param {A} action Promise action to watch
 * @param worker A generator function
 */
export function takeLeadingPromiseAction<
    A extends PromiseActionSet<any, any, any, any, any, any>
>(action: A, worker: Worker<A>) {
    return effectCreatorFactory(takeLeading, action, worker);
}

/**
 * Spawns a saga on each particular promise action dispatched to the store. After spawning a task once, it blocks until spawned saga completes and then starts to listen for an action again. If saga succeeds action is resolved with return value as payload. Otherwise it gets rejected.
 * @param {A} action Promise action to watch
 * @param worker A generator function
 */
export function takeLatestPromiseAction<
    A extends PromiseActionSet<any, any, any, any, any, any>
>(action: A, worker: Worker<A>) {
    return effectCreatorFactory(takeLatest, action, worker);
}

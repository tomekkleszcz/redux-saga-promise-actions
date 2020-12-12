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

export function takeEveryPromiseAction<
    A extends PromiseActionSet<any, any, any, any, any, any>
>(pattern: A, worker: Worker<A>) {
    return effectCreatorFactory(takeEvery, pattern, worker);
}

export function takeLeadingPromiseAction<
    A extends PromiseActionSet<any, any, any, any, any, any>
>(pattern: A, worker: Worker<A>) {
    return effectCreatorFactory(takeLeading, pattern, worker);
}

export function takeLatestPromiseAction<
    A extends PromiseActionSet<any, any, any, any, any, any>
>(pattern: A, worker: Worker<A>) {
    return effectCreatorFactory(takeLatest, pattern, worker);
}

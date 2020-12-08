import {takeEvery, takeLeading, takeLatest, call} from "redux-saga/effects";

//Types
import {ActionPattern} from "redux-saga/effects";
import {PromiseAction, rejectPromiseAction, resolvePromiseAction} from "./";

type EffectCreator = typeof takeEvery | typeof takeLeading | typeof takeLatest;

function* promiseActionWrapper<A extends PromiseAction<any, any>>(action: A, worker: (action: A) => any) {
    try {
        const payload = yield call(worker, action);
        yield resolvePromiseAction(action, payload);
    } catch(err) {
        yield rejectPromiseAction(action, err);
    }
}

function effectCreatorFactory<
    E extends EffectCreator,
    A extends PromiseAction<any, any>
>(effectCreator: E, pattern: ActionPattern<A>, worker: (action: A) => any) {
    return effectCreator(pattern, (action: A) => promiseActionWrapper(action, worker));
}

export function takeEveryPromiseAction<A extends PromiseAction<any, any>>(
    pattern: ActionPattern<A>,
    worker: (action: A) => any
) {
    return effectCreatorFactory(takeEvery, pattern, worker);
}

export function takeLeadingPromiseAction<A extends PromiseAction<any, any>>(
    pattern: ActionPattern<A>,
    worker: (action: A) => any
) {
    return effectCreatorFactory(takeLeading, pattern, worker);
}

export function takeLatestPromiseAction<A extends PromiseAction<any, any>>(
    pattern: ActionPattern<A>,
    worker: (action: A) => any
) {
    return effectCreatorFactory(takeLatest, pattern, worker);
}
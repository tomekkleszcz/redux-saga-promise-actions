import {Middleware} from 'redux';

//Redux saga effects
import {put, putResolve} from 'redux-saga/effects';

//Utils
import _ from 'lodash';
import {createAction, createCustomAction} from 'typesafe-actions';

//Types
import {Action, AnyAction} from 'redux';
import {TypeConstant, ActionCreatorBuilder} from 'typesafe-actions';

export type PromiseActionSet<
    RequestType extends TypeConstant,
    SuccessType extends TypeConstant,
    FailureType extends TypeConstant,
    X,
    Y,
    Z
> = {
    request: PromiseActionCreatorBuilder<RequestType, X, Y>;
    success: ActionCreatorBuilder<SuccessType, Y>;
    failure: ActionCreatorBuilder<FailureType, Z>;
};

type PromiseActionCreatorBuilder<RequestType extends TypeConstant, X, Y> = (
    ...payload: X extends undefined ? [] : [X]
) => PromiseAction<RequestType, X, Y>;

export interface PromiseAction<RequestType extends TypeConstant, TPayload, TResolveType>
    extends Action<RequestType> {
    payload: TPayload;
    meta: {
        promiseAction: boolean;
        promise: {
            resolve?: (payload: TResolveType) => void;
            reject?: (payload: any) => void;
        };
    };
}

/**
 * Create an object containging three action-creators.
 * @param {string} type Base action type
 * @param {X} X Request action payload
 * @param {Y} Y Success action payload
 * @param {Z} Z Failure action payload
 */
export function createPromiseAction<Type extends TypeConstant, X, Y, Z>(
    type: Type
): <X, Y, Z>() => PromiseActionSet<
    `${Type}_REQUEST`,
    `${Type}_SUCCESS`,
    `${Type}_FAILURE`,
    X,
    Y,
    Z
>;

/**
 * Create an object containing three action-creators.
 * @param {string} requestType Request action type
 * @param {string} successType Success action type
 * @param {string} failureType Failure action type
 * @param {X} X Request action payload
 * @param {Y} Y Success action payload
 * @param {Z} Z Failure action payload
 */
export function createPromiseAction<
    RequestType extends TypeConstant,
    SuccessType extends TypeConstant,
    FailureType extends TypeConstant,
    X,
    Y,
    Z
>(
    requestType: RequestType,
    successType: SuccessType,
    failureType: FailureType
): <X, Y, Z>() => PromiseActionSet<RequestType, SuccessType, FailureType, X, Y, Z>;

export function createPromiseAction<
    RequestType extends TypeConstant,
    SuccessType extends TypeConstant,
    FailureType extends TypeConstant
>(requestType: RequestType, successType?: SuccessType, failureType?: FailureType) {
    return function <X, Y, Z>(): PromiseActionSet<
        RequestType,
        SuccessType,
        FailureType,
        X,
        Y,
        Z
    > {
        const request: PromiseActionCreatorBuilder<RequestType, X, Y> = createCustomAction(
            successType && failureType ? requestType : <RequestType>`${requestType}_REQUEST`,
            (...payload) => ({
                payload: payload[0],
                meta: {
                    promiseAction: true,
                    promise: {}
                }
            })
        );
        const success = createAction(successType ?? <SuccessType>`${requestType}_SUCCESS`)<Y>();
        const failure = createAction(failureType ?? <FailureType>`${requestType}_FAILURE`)<Z>();

        return {
            request,
            success,
            failure
        };
    };
}

interface PromiseDispatch<TBasicAction extends Action> {
    <RequestType extends TypeConstant, TPromise, TReturnType>(
        promiseAction: PromiseAction<RequestType, TPromise, TReturnType>
    ): Promise<TReturnType>;
    <A extends TBasicAction>(action: A): A;
    <RequestType extends TypeConstant, TPromise, TResolveType, TAction extends TBasicAction>(
        action: TAction | PromiseAction<RequestType, TPromise, TResolveType>
    ): TAction | Promise<TResolveType>;
}

export type PromiseMiddleware<
    TState = unknown,
    TBasicAction extends Action = AnyAction
> = Middleware<PromiseDispatch<TBasicAction>, TState, PromiseDispatch<TBasicAction>>;

export const promiseMiddleware: PromiseMiddleware = () => next => action => {
    if (!action.meta?.promiseAction) {
        next(action);
        return;
    }

    return new Promise((resolve, reject) => {
        next(
            _.merge(action, {
                meta: {
                    promise: {
                        resolve,
                        reject
                    }
                }
            })
        );
    });
};

/**
 * Resolve promise action.
 * @param {PromiseAction<RequestType, X, Y>} action Action to resolve
 * @param {Y} payload Payload to resolve action with
 */
export function resolvePromiseAction<RequestType extends TypeConstant, X, Y>(
    action: PromiseAction<RequestType, X, Y>,
    payload?: Y
) {
    action.meta.promise.resolve(payload);
}

/**
 * Reject promise action.
 * @param {A} action Action to reject
 * @param {TResolvePayload} payload Payload to reject action with
 */
export function rejectPromiseAction<RequestType extends TypeConstant, X, Y, Z>(
    action: PromiseAction<RequestType, X, Y>,
    payload?: Z
) {
    action.meta.promise.reject(payload);
}

/**
 * Dispatch action to redux store. If the action is promise action wait until it is resolved.
 * @param {A} action Action to dispatch
 */
export function dispatch<A extends Action<any> | PromiseAction<TypeConstant, any, any>>(
    action: A
) {
    return (action as PromiseAction<TypeConstant, any, any>).meta?.promiseAction
        ? putResolve(action)
        : put(action);
}

declare module 'redux' {
    export interface Dispatch<A extends Action = AnyAction> {
        <RequestType extends TypeConstant, TPayloadType = any, TReturnType = any>(
            promiseAction: PromiseAction<RequestType, TPayloadType, TReturnType>
        ): Promise<TReturnType>;
    }
}

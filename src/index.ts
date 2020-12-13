import {Middleware} from "redux";

//Redux saga effects
import {put, putResolve} from "redux-saga/effects";

//Utils
import _ from "lodash";
import {createAction, createCustomAction} from "typesafe-actions";

//Types
import {Action, AnyAction} from "redux";
import {TypeConstant, ActionCreatorBuilder} from "typesafe-actions";

export type PromiseActionSet<
    RequestType extends TypeConstant,
    X,
    SuccessType extends TypeConstant,
    Y,
    FailureType extends TypeConstant,
    Z
> = {
    request: PromiseActionCreatorBuilder<RequestType, X, Y>;
    success: ActionCreatorBuilder<SuccessType, Y>;
    failure: ActionCreatorBuilder<FailureType, Z>;
};

type PromiseActionCreatorBuilder<RequestType extends TypeConstant, X, Y> = (
    ...payload: X extends undefined ? [] : [X]
) => PromiseAction<RequestType, X, Y>;

export interface PromiseAction<
    RequestType extends TypeConstant,
    TPayload,
    TResolveType
> extends Action<RequestType> {
    payload: TPayload;
    meta: {
        promiseAction: boolean;
        promise: {
            resolve?: (payload: TResolveType) => {};
            reject?: (payload: any) => {};
        };
    };
}

/**
 * Create an object containing three action-creators. 
 * @param {string} requestArg Request action type
 * @param {string} successArg Success action type
 * @param {string} failureArg Failure action type
 * @param {X} X Request action payload
 * @param {Y} Y Success action payload
 * @param {Z} Z Failure action payload
 */
export function createPromiseAction<
    RequestType extends TypeConstant,
    SuccessType extends TypeConstant,
    FailureType extends TypeConstant
>(requestArg: RequestType, successArg: SuccessType, failureArg: FailureType) {
    return function <X, Y, Z>(): PromiseActionSet<
        RequestType,
        X,
        SuccessType,
        Y,
        FailureType,
        Z
    > {
        const request = createCustomAction(
            requestArg,
            (...payload: X extends undefined ? [] : [X]) =>
                ({
                    payload: payload[0],
                    meta: {
                        promiseAction: true,
                        promise: {},
                    },
                })
        );
        const success = createAction(successArg)<Y>();
        const failure = createAction(failureArg)<Z>();

        return {
            request,
            success,
            failure,
        };
    };
}

interface PromiseDispatch<TState, TBasicAction extends Action> {
    <RequestType extends TypeConstant, TPromise, TReturnType>(
        promiseAction: PromiseAction<RequestType, TPromise, TReturnType>
    ): Promise<TReturnType>;
    <A extends TBasicAction>(action: A): A;
    <
        RequestType extends TypeConstant,
        TPromise,
        TResolveType,
        TAction extends TBasicAction
    >(
        action: TAction | PromiseAction<RequestType, TPromise, TResolveType>
    ): TAction | Promise<TResolveType>;
}

export type PromiseMiddleware<
    TState = {},
    TBasicAction extends Action = AnyAction
> = Middleware<
    PromiseDispatch<TState, TBasicAction>,
    TState,
    PromiseDispatch<TState, TBasicAction>
>;

export const promiseMiddleware: PromiseMiddleware = () => (next) => (
    action
) => {
    if (!action.meta?.promiseAction) {
        next(action);
        return new Promise(() => {});
    }

    return new Promise((resolve, reject) => {
        next(
            _.merge(action, {
                meta: {
                    promise: {
                        resolve,
                        reject,
                    },
                },
            })
        );
    });
};

/**
 * Resolve promise action.
 * @param {A} action Action to resolve
 * @param {TResolvePayload} payload Payload to resolve action with
 */
export function resolvePromiseAction<
    A extends PromiseAction<TypeConstant, any, any>,
    TResolvePayload
>(action: A, payload?: TResolvePayload) {
    action.meta?.promise?.resolve?.(payload);
}

/**
 * Reject promise action.
 * @param {A} action Action to reject
 * @param {TResolvePayload} payload Payload to reject action with
 */
export function rejectPromiseAction<
    A extends PromiseAction<TypeConstant, any, any>,
    TRejectPayload = any
>(action: A, payload: any) {
    action.meta?.promise?.reject?.(payload);
}

/**
 * Dispatch action to redux store. If the action is promise action wait until it is resolved.
 * @param {A} action Action to dispatch
 */
export function dispatch<
    A extends Action<any> | PromiseAction<TypeConstant, any, any>
>(action: A) {
    return (action as PromiseAction<TypeConstant, any, any>).meta?.promiseAction
        ? putResolve(action)
        : put(action);
}

declare module "redux" {
    export interface Dispatch<A extends Action = AnyAction> {
        <
            RequestType extends TypeConstant,
            TPayloadType = any,
            TReturnType = any
        >(
            promiseAction: PromiseAction<RequestType, TPayloadType, TReturnType>
        ): Promise<TReturnType>;
    }
}

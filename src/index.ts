import {Middleware} from "redux";

//Redux saga effects
import {put, putResolve} from 'redux-saga/effects';

//Utils
import _ from "lodash";
import {createAction, createCustomAction} from "typesafe-actions";

//Types
import {Action, AnyAction} from "redux";
import {TypeConstant} from "typesafe-actions";

export function createPromiseAction<
    RequestType extends TypeConstant,
    SuccessType extends TypeConstant,
    FailureType extends TypeConstant
>(requestArg: RequestType, successArg: SuccessType, failureArg: FailureType) {
    return function <X, Y, Z>() {
        const request = createCustomAction(
            requestArg,
            (...payload: X extends undefined ? [] : [X]) =>
                ({
                    payload: payload[0],
                    meta: {
                        promiseAction: true,
                        promise: {},
                    },
                } as PromiseAction<X, Y>)
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
    <TPromise, TReturnType>(
        promiseAction: PromiseAction<TPromise, TReturnType>
    ): Promise<TReturnType>;
    <A extends TBasicAction>(action: A): A;
    <TPromise, TResolveType, TAction extends TBasicAction>(
        action: TAction | PromiseAction<TPromise, TResolveType>
    ): TAction | Promise<TResolveType>;
}

export interface PromiseAction<TPayload, TResolveType> extends Action<TypeConstant> {
    payload: TPayload;
    meta: {
        promiseAction: true;
        promise: {
            resolve?: (payload: TResolveType) => {};
            reject?: (payload: any) => {};
        };
    };
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

export function resolvePromiseAction<
    A extends PromiseAction<any, any>,
    TResolvePayload
>(action: A, payload?: TResolvePayload) {
    action.meta?.promise?.resolve?.(payload);
}

export function rejectPromiseAction<
    A extends PromiseAction<any, any>,
    TRejectPayload = any
>(action: A, payload: any) {
    action.meta?.promise?.reject?.(payload);
}

export function dispatch<A extends Action<any> | PromiseAction<any, any>>(action: A) {
    return (action as PromiseAction<any, any>).meta?.promiseAction ? putResolve(action) : put(action);
}

declare module "redux" {
    export interface Dispatch<A extends Action = AnyAction> {
        <TPayloadType = any, TReturnType = any>(
            promiseAction: PromiseAction<TPayloadType, TReturnType>
        ): Promise<TReturnType>;
    }
}

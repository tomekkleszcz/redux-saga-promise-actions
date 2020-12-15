//Action creators
import {createPromiseAction} from '../../../dist'; //Replace with redux-saga-promise-actions

//Types
import {Credentials, TokenPair} from '../types/auth';

/**
 * signIn promise action declaration
 * If you want payload to be empty in any stage declare it as undefined.
 * @type {PromiseActionSet<'SIGN_IN_REQUEST', 'SIGN_IN_SUCCESS', 'SIGN_IN_FAILURE', Credentials, TokenPair, undefined>}
 */
export const signIn = createPromiseAction(
    'SIGN_IN_REQUEST',
    'SIGN_IN_SUCCESS',
    'SIGN_IN_FAILURE'
)<Credentials, TokenPair, undefined>();

/**
 * signOut promise action declaration
 * @type {PromiseActionSet<'SIGN_OUT_REQUEST', 'SIGN_OUT_SUCCESS', 'SIGN_OUT_FAILURE', undefined, undefined, undefined>}
 */
export const signOut = createPromiseAction(
    'SIGN_OUT_REQUEST',
    'SIGN_OUT_SUCCESS',
    'SIGN_OUT_FAILURE'
)<undefined, undefined, undefined>();

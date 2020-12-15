//Effect creators
import {takeLeading, select, put} from 'redux-saga/effects';
import {takeEveryPromiseAction} from '../../../effects'; //Replace with redux-saga-promise-actions/effects

//Actions
import * as actions from '../actions/auth';

//Promise action utils
import {resolvePromiseAction} from '../../../'; //Replace with redux-saga-promise-actions

//Services
import axios from 'axios';

//Types
import {RootState} from '../';
import {TokenPair} from '../types/auth';

/**
 * Saga worker which takes every signIn promise action and automatically resolves it with the request response.
 * @param {PromiseAction<'SIGN_IN_REQUEST', Credentials, TokenTyoe>} action signIn request action
 */
function* signIn({payload}: ReturnType<typeof actions.signIn.request>) {
    return yield axios.post<TokenPair>('/auth/sign-in', payload, {
        headers: {
            'Content-Type': 'application/json'
        }
    });
}

/**
 * Saga worker which takes leading signOut promise action, makes a request, and resolve despite if the request has succeeded.
 * @param {PromiseAction<'SIGN_OUT_REQUEST', undefined, undefined>} action signOut request action
 */
function* signOut(action: ReturnType<typeof actions.signOut.request>) {
    try {
        const tokenPair = yield select<(state: RootState) => TokenPair>(state => state.auth);

        yield axios.post('/auth/sign-out', null, {
            headers: {
                Authorization: `${tokenPair.tokenType} ${tokenPair.accessToken}`
            }
        });
    } catch(err) {
        console.error(err);
    }

    yield put(actions.signOut.request());
    yield resolvePromiseAction(action);
}

export const authSaga = [
    takeEveryPromiseAction(actions.signIn, signIn),
    takeLeading(actions.signOut.request, signOut)
]
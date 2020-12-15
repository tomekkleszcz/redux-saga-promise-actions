//Redux saga
import {all} from 'redux-saga/effects';

//Sagas
import {authSaga} from './auth';

export function* saga() {
    yield all([
        ...authSaga
    ]);
}
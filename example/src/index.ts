//Redux
import {combineReducers, createStore, applyMiddleware} from 'redux';

//Middlewares
import createSagaMiddleware from 'redux-saga';
import {promiseMiddleware} from '../../'; //Replace with redux-saga-promise-actions

//Reducers
import authReducer from './reducers/auth';

//Sagas
import {saga} from './sagas';

const reducer = combineReducers({
    auth: authReducer
});

const sagaMiddleware = createSagaMiddleware();

export const store = createStore(
    reducer,
    {},
    applyMiddleware(promiseMiddleware, sagaMiddleware) //Add promiseMiddleware before sagaMiddleware in the chain
);

sagaMiddleware.run(saga);

export type RootState = ReturnType<typeof reducer>;
# 🛠️ redux-saga-promise-actions 📦

[![npm](https://img.shields.io/npm/v/redux-saga-promise-actions)](https://www.npmjs.com/package/redux-saga-promise-actions)
![npm](https://img.shields.io/npm/dm/redux-saga-promise-actions) 
![GitHub Workflow Status](https://img.shields.io/github/workflow/status/tomekkleszcz/redux-saga-promise-actions/Publish)
![GitHub Workflow Status](https://img.shields.io/github/workflow/status/tomekkleszcz/redux-saga-promise-actions/Tests?label=tests)
[![Coverage Status](https://coveralls.io/repos/github/tomekkleszcz/redux-saga-promise-actions/badge.svg?branch=master)](https://coveralls.io/github/tomekkleszcz/redux-saga-promise-actions?branch=master)

Simple to use library which allows to return promise after an action is dispatched.

## 📥 Installation

`npm install redux-saga-promise-actions`

or 

`yarn add redux-saga-promise-actions`

## 🤔 Why this library does even exists?

In most of my projects I use [Formik](https://github.com/formium/formik) for handling the forms
and [Redux saga](https://github.com/redux-saga/redux-saga/) for handling async tasks. Unfortunately
it is not possible to control Formik state from saga, so there is a need to return the information
if the async task was handled successfully or not to the component.

One of the possible solutions is to store the information if the form is submitting and its errors in Redux store.
However it is [not recommended to store the UI state in Redux store](https://redux.js.org/faq/organizing-state#should-i-put-form-state-or-other-ui-state-in-my-store).
If I would store the submitting and errors in the Redux store why would I use Formik?

The second possible solution is to pass the Formik helpers (i.e. setSubmitting or setErrors) as an action props.
Or... You can use this library instead. 🙂

## 💈 Example

Please check out `example` directory.

## 🧰 Usage

### Include promise middleware

First of all, you have to add the promise middleware to your Redux store middleware chain.

🚨 The promise middleware should be before the saga middleware in the chain.

```typescript
//Redux store
import {createStore, applyMiddleware} from 'redux';

//Middlewares
import {promiseMiddleware} from 'redux-saga-promise-actions';
import createSagaMiddleware from 'redux-saga';

const sagaMiddleware = createSagaMiddleware();

const store = createStore(rootReducer, {}, applyMiddleware(promiseMiddleware, sagaMiddleware));
```

### Declare promise actions

Then, you can declare the promise action. The library uses [typesafe-actions](https://github.com/piotrwitek/typesafe-actions)
under the hood so declaring actions is easy as it can be.

#### Javascript
```javascript
//Action creators
import {createPromiseAction} from 'redux-saga-promise-actions';

const signUp = createPromiseAction('SIGN_UP')();
```

#### Typescript
```typescript
//Action creators
import {createPromiseAction} from 'redux-saga-promise-actions';

const signUp = createPromiseAction('SIGN_UP')<
    {email: string, password: string},
    {accessToken: string, refreshToken: string},
    {email: string | null, password: string | null}
>();
```

When `createPromiseAction` is called, three actions are created under the hood (in this case: `SIGN_UP_REQUEST`, `SIGN_UP_SUCCESS`, and `SIGN_UP_FAILURE`). If you do not like this action type naming convention, there is an escape catch and you can name the action types as you want.

```typescript
//Action creators
import {createPromiseAction} from 'redux-saga-promise-actions';

const signUp = createPromiseAction(
    'SIGN_UP_REQUEST',
    'SIGN_UP_SUCCESS',
    'SIGN_UP_FAILURE'
)<
    {email: string, password: string},
    {accessToken: string, refreshToken: string},
    {email: string | null, password: string | null}
>();
```

*These two examples have identical promise action, but in the second one you have full control over how the action types are named.*

### Handle actions

Finally, you can handle promise actions in your code.

#### Component
```javascript
dispatch(signUp.request({email: 'example@example.org', password: 'TestPassword'}))
    .then(() => alert('Success!'))
    .catch(err => console.error(err));
```

#### Saga

There are two ways to handle promise actions in your sagas.

```javascript
//Promise actions
import {takeEveryPromiseAction} from 'redux-saga-promise-actions/effects';

function* signUp(action) {
    return yield axios.request(...);
}

export authSaga = [
    takeEveryPromiseAction(actions.signUp, signUp)
];
```

The `takeEveryPromiseAction` works just like `takeEvery` effect creator from `redux-saga`, but it wraps the saga in try catch. It accepts the promise action as the first argument and the saga as a second one. After the saga is completed it resolves promise action and dispatch the success action with saga return value. If any error occur (eg. the requests fails) the promise action is rejected and failure action is dispatched with an error as the payload.

For now there are three effect creators you can use:
* `takeEveryPromiseAction`
* `takeLeadingPromiseAction`
* `takeLatestPromiseAction`

If you would like to have more control over your saga you can manually resolve and dispatch individual actions.

```javascript
//Promise actions
function* signUp(action) {
    try {
        const response = yield axios.request(...);

        yield put(actions.signUp.success(response));
        resolvePromiseAction(action, response);
    } catch(err) {
        yield put(actions.signUp.failed(err));
        rejectPromiseAction(action, err);
    }
}

export authSaga = [
    takeEvery(actions.signUp.request, signUp)
];
```

Depending on the result the returned promise from `dispatch(...)` will either resolve or reject.

### `dispatch` helper

Dispatch helper is used to dispatch the action and if it is a promise action it will wait until the action is resolved. It uses `put` and `putResolve` under the hood and returns appropriate effect depending whether the action is a promise action. 

```typescript
//Action creators
import {createPromiseAction} from 'redux-saga-promise-actions';
import {createAction} from 'typesafe-actions';

const getProfile = createPromiseAction(
    'GET_PROFILE_REQUEST', 
    'GET_PROFILE_SUCCESS', 
    'GET_PROFILE_FAILURE'
)<
    undefined,
    {email: string; name: string},
    undefined
>();

export const completeLoading = createAction('COMPLETE_LOADING')();
```

```typescript
//Dispatch helper
import {dispatch} from 'redux-saga-promise-actions';

function* signUp() {
    // getProfile is a promise action, it will wait until it gets resolved
    yield dispatch(actions.getProfile.request());

    // completeLoading is not a promise action, the action will be dispatched and it won't block the saga
    yield dispatch(actions.completeLoading());
}
```
//Redux store
import configureStore, {MockStore} from 'redux-mock-store';
import createSagaMiddleware, { SagaMiddleware } from 'redux-saga';
import {promiseMiddleware} from '../src';

//Actions
import * as actions from './actions';

//Effect creators
import {takeEveryPromiseAction, takeLeadingPromiseAction, takeLatestPromiseAction} from '../src/effects';

//Utils
import faker from 'faker';

//Types
import {TestPayload} from './actions';

describe('effect creators', () => {
    let store: MockStore,
        sagaMiddleware: SagaMiddleware,
        requestPayload: TestPayload,
        successPayload: TestPayload,
        failurePayload: TestPayload;
    beforeEach(() => {
        sagaMiddleware = createSagaMiddleware();
        const mockStore = configureStore([promiseMiddleware, sagaMiddleware]);
        store = mockStore();

        requestPayload = {
            value: faker.random.number()
        };
        successPayload = {
            value: faker.random.number()
        };
        failurePayload = {
            value: faker.random.number()
        };
    });

    describe('takeEveryPromiseAction', () => {
        describe('should resolve promise action', () => {
            it('with payload', async () => {
                sagaMiddleware.run(function* () {
                    yield takeEveryPromiseAction(actions.payloadAction, function* () {
                        return successPayload;
                    })
                });

                expect(
                    store.dispatch(actions.payloadAction.request(requestPayload))
                ).resolves.toEqual(successPayload);
                expect(store.getActions()).toContainEqual(
                    actions.payloadAction.success(successPayload)
                );
                expect(store.getActions()).not.toContainEqual(
                    actions.payloadAction.failure(failurePayload)
                );
            });

            it('without payload', async () => {
                sagaMiddleware.run(function* () {
                    yield takeEveryPromiseAction(actions.action, function* () {
                        return;
                    })
                });

                expect(store.dispatch(actions.action.request())).resolves.toBeUndefined();
                expect(store.getActions()).toContainEqual(actions.action.success());
                expect(store.getActions()).not.toContainEqual(actions.action.failure());
            });
        });

        describe('should reject promise action', () => {
            it('with payload', async () => {
                sagaMiddleware.run(function* () {
                    yield takeEveryPromiseAction(actions.payloadAction, function* () {
                        throw failurePayload;
                    })
                });

                expect(
                    store.dispatch(actions.payloadAction.request(requestPayload))
                ).rejects.toEqual(failurePayload);
                expect(store.getActions()).not.toContainEqual(
                    actions.payloadAction.success(successPayload)
                );
                expect(store.getActions()).toContainEqual(
                    actions.payloadAction.failure(failurePayload)
                );
            });

            it('without payload', async () => {
                sagaMiddleware.run(function* () {
                    yield takeEveryPromiseAction(actions.action, function* () {
                        throw undefined;
                    })
                });

                expect(store.dispatch(actions.action.request())).rejects.toBeUndefined();
                expect(store.getActions()).not.toContainEqual(actions.action.success());
                expect(store.getActions()).toContainEqual(actions.action.failure());
            });
        });
    });

    describe('takeLeadingPromiseActions', () => {
        describe('should resolve promise action', () => {
            it('with payload', async () => {
                sagaMiddleware.run(function* () {
                    yield takeLeadingPromiseAction(actions.payloadAction, function* () {
                        return successPayload;
                    })
                });

                expect(
                    store.dispatch(actions.payloadAction.request(requestPayload))
                ).resolves.toEqual(successPayload);
                expect(store.getActions()).toContainEqual(
                    actions.payloadAction.success(successPayload)
                );
                expect(store.getActions()).not.toContainEqual(
                    actions.payloadAction.failure(failurePayload)
                );
            });

            it('without payload', async () => {
                sagaMiddleware.run(function* () {
                    yield takeLeadingPromiseAction(actions.action, function* () {
                        return;
                    })
                });

                expect(store.dispatch(actions.action.request())).resolves.toBeUndefined();
                expect(store.getActions()).toContainEqual(actions.action.success());
                expect(store.getActions()).not.toContainEqual(actions.action.failure());
            });
        });

        describe('should reject promise action', () => {
            it('with payload', async () => {
                sagaMiddleware.run(function* () {
                    yield takeLeadingPromiseAction(actions.payloadAction, function* () {
                        throw failurePayload;
                    })
                });

                expect(
                    store.dispatch(actions.payloadAction.request(requestPayload))
                ).rejects.toEqual(failurePayload);
                expect(store.getActions()).not.toContainEqual(
                    actions.payloadAction.success(successPayload)
                );
                expect(store.getActions()).toContainEqual(
                    actions.payloadAction.failure(failurePayload)
                );
            });

            it('without payload', async () => {
                sagaMiddleware.run(function* () {
                    yield takeLeadingPromiseAction(actions.action, function* () {
                        throw undefined;
                    })
                });

                expect(store.dispatch(actions.action.request())).rejects.toBeUndefined();
                expect(store.getActions()).not.toContainEqual(actions.action.success());
                expect(store.getActions()).toContainEqual(actions.action.failure());
            });
        });
    });

    describe('takeLatestPromiseActions', () => {
        describe('should resolve promise action', () => {
            it('with payload', async () => {
                sagaMiddleware.run(function* () {
                    yield takeLatestPromiseAction(actions.payloadAction, function* () {
                        return successPayload;
                    })
                });

                expect(
                    store.dispatch(actions.payloadAction.request(requestPayload))
                ).resolves.toEqual(successPayload);
                expect(store.getActions()).toContainEqual(
                    actions.payloadAction.success(successPayload)
                );
                expect(store.getActions()).not.toContainEqual(
                    actions.payloadAction.failure(failurePayload)
                );
            });

            it('without payload', async () => {
                sagaMiddleware.run(function* () {
                    yield takeLatestPromiseAction(actions.action, function* () {
                        return;
                    })
                });

                expect(store.dispatch(actions.action.request())).resolves.toBeUndefined();
                expect(store.getActions()).toContainEqual(actions.action.success());
                expect(store.getActions()).not.toContainEqual(actions.action.failure());
            });
        });

        describe('should reject promise action', () => {
            it('with payload', async () => {
                sagaMiddleware.run(function* () {
                    yield takeLatestPromiseAction(actions.payloadAction, function* () {
                        throw failurePayload;
                    })
                });

                expect(
                    store.dispatch(actions.payloadAction.request(requestPayload))
                ).rejects.toEqual(failurePayload);
                expect(store.getActions()).not.toContainEqual(
                    actions.payloadAction.success(successPayload)
                );
                expect(store.getActions()).toContainEqual(
                    actions.payloadAction.failure(failurePayload)
                );
            });

            it('without payload', async () => {
                sagaMiddleware.run(function* () {
                    yield takeLatestPromiseAction(actions.action, function* () {
                        throw undefined;
                    })
                });

                expect(store.dispatch(actions.action.request())).rejects.toBeUndefined();
                expect(store.getActions()).not.toContainEqual(actions.action.success());
                expect(store.getActions()).toContainEqual(actions.action.failure());
            });
        });
    });
});

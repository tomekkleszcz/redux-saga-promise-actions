//Action creators
import {createPromiseAction} from '../src';

//Helpers
import {dispatch} from '../src';

//Actions
import * as actions from './actions';

describe('action creators', () => {
    describe('simple', () => {
        const action = createPromiseAction('TEST_ACTION')<undefined, undefined, undefined>();

        it('should have correct request action type', () => {
            expect(action.request().type).toEqual('TEST_ACTION_REQUEST');
        });

        it('should have correct success action type', () => {
            expect(action.success().type).toEqual('TEST_ACTION_SUCCESS');
        });

        it('should have correct failure action type', () => {
            expect(action.failure().type).toEqual('TEST_ACTION_FAILURE');
        });
    });

    describe('advanced', () => {
        const action = createPromiseAction(
            'TEST_ACTION_REQUEST',
            'TEST_ACTION_SUCCESS',
            'TEST_ACTION_FAILURE'
        )<undefined, undefined, undefined>();

        it('should have correct request action type', () => {
            expect(action.request().type).toEqual('TEST_ACTION_REQUEST');
        });

        it('should have correct success action type', () => {
            expect(action.success().type).toEqual('TEST_ACTION_SUCCESS');
        });

        it('should have correct failure action type', () => {
            expect(action.failure().type).toEqual('TEST_ACTION_FAILURE');
        });
    });
});

describe('dispatch helper', () => {
    it('should return putResolve if the action is a promise action', () => {
        expect(dispatch(actions.action.request()).payload.resolve).toEqual(true);
    });

    it('should return putResolve if the action is not a promise action', () => {
        expect(dispatch({type: 'TEST_ACTION'}).payload.resolve).toEqual(undefined);
    });
});

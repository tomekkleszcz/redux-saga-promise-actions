//Action creators
import {createPromiseAction} from '../src';

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

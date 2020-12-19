//Helpers
import {dispatch} from '../src';

//Actions
import * as actions from './actions';

describe('dispatch helper', () => {
    it('should return putResolve if the action is a promise action', () => {
        expect(dispatch(actions.action.request()).payload.resolve).toEqual(true);
    });

    it('should return putResolve if the action is not a promise action', () => {
        expect(dispatch({type: 'TEST_ACTION'}).payload.resolve).toEqual(undefined);
    });
});
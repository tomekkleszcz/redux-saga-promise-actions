//Action creators
import {createPromiseAction} from '../src';

export type TestPayload = {
    value: number;
};

export const action = createPromiseAction(
    'TEST_ACTION_REQUEST',
    'TEST_ACTION_SUCCESS',
    'TEST_ACTION_FAILURE'
)<undefined, undefined, undefined>();

export const payloadAction = createPromiseAction(
    'TEST_PAYLOAD_ACTION_REQUEST',
    'TEST_PAYLOAD_ACTION_SUCCESS',
    'TEST_PAYLOAD_ACTION_FAILURE'
)<TestPayload, TestPayload, TestPayload>();

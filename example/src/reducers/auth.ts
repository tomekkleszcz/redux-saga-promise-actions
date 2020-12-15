//Reducer
import {action, createReducer} from "typesafe-actions";

//Actions
import * as actions from "../actions/auth";

//Types
import {ActionType} from "typesafe-actions";
import {TokenPair, Nullable} from "../types/auth";

export type AuthAction = ActionType<typeof actions>;

export type State = Readonly<Nullable<TokenPair>>;

export const initialState: State = {
    accessToken: null,
    tokenType: null,
    refreshToken: null,
};

export default createReducer<State, AuthAction>(initialState)
    .handleAction(actions.signIn.success, (state, action) => ({
        ...state,
        ...action.payload,
    }))
    .handleAction(actions.signOut.success, (state) => ({
        ...state,
        accessToken: null,
        tokenType: null,
        refreshToken: null,
    }));

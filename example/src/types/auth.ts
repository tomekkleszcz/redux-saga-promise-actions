export type Credentials = {
    email: string;
    password: string;
}

export type TokenPair = {
    accessToken: string;
    tokenType: string;
    refreshToken: string;
}

export type Nullable<T> = {
    [P in keyof T]: T[P] | null;
};
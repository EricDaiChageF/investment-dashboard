export interface User {
    id: number;
    username: string;
    password_hash: string;
    created_at: string;
}
export declare const hashPassword: (password: string) => Promise<string>;
export declare const comparePassword: (password: string, hash: string) => Promise<boolean>;
export declare const generateToken: (userId: number, username: string) => string;
export declare const verifyToken: (token: string) => {
    userId: number;
    username: string;
};
export declare const createUser: (username: string, password: string) => Promise<number>;
export declare const findUserByUsername: (username: string) => Promise<User | null>;
//# sourceMappingURL=auth.d.ts.map
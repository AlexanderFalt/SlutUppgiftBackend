export interface IJwtPayload {
    userId: string;
    username: string;
    role: 'User' | 'Admin' | 'Owner';
}
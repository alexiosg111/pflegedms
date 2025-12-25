import jwt from 'jsonwebtoken';

const SECRET_KEY = 'pflegedms-secret-key';
const TOKEN_EXPIRY = '8h';

export function generateToken(user: { id: number; username: string; email: string }): string {
    return jwt.sign(
        { 
            userId: user.id, 
            username: user.username, 
            email: user.email 
        },
        SECRET_KEY,
        { expiresIn: TOKEN_EXPIRY }
    );
}

export function verifyToken(token: string): any {
    try {
        return jwt.verify(token, SECRET_KEY);
    } catch (error) {
        console.error('Token verification failed:', error);
        return null;
    }
}

export function decodeToken(token: string): any {
    try {
        return jwt.decode(token);
    } catch (error) {
        console.error('Token decoding failed:', error);
        return null;
    }
}

export function getTokenExpiry(token: string): Date | null {
    try {
        const decoded = jwt.decode(token) as any;
        if (decoded && decoded.exp) {
            return new Date(decoded.exp * 1000);
        }
        return null;
    } catch (error) {
        console.error('Failed to get token expiry:', error);
        return null;
    }
}

export function isTokenExpired(token: string): boolean {
    const expiry = getTokenExpiry(token);
    if (!expiry) return true;
    return expiry < new Date();
}
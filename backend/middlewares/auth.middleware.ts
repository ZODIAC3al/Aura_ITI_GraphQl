import jwt from "jsonwebtoken";
import cookie from 'cookie';

export async function checkAuth(req: any) {
    try {
        let token = '';

        // 1. Check Authorization header
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            token = authHeader.substring(7);
        }

        // 2. Check cookies
        if (!token) {
            const cookies = cookie.parse(req.headers.cookie || "");
            token = cookies.token || '';
        }

        if (!token) {
            return {};
        }

        const decoded = jwt.verify(
            token,
            process.env.SECRET || ''
        );
        return decoded;
    } catch (err) {
        return {};
    }
}

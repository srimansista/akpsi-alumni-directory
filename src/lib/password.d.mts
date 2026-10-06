export function hashPassword(password: string): Promise<string>;
export function verifyPassword(password: string, stored: string | null | undefined): Promise<boolean>;

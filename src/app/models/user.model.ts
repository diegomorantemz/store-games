export interface User {
  id: number;
  name: string;
  phone: string;
  email: string;
  password: string;
  registeredAt: string;
}

// Función auxiliar para validar email
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
}

// Función auxiliar para validar contraseña
export function isValidPassword(password: string): boolean {
  return password.length >= 6;
}

// Función auxiliar para crear usuario (omitir datos sensibles)
export function sanitizeUser(user: User): Omit<User, 'password'> {
  const { password, ...sanitized } = user;
  return sanitized;
}
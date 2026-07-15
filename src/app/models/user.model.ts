export interface User {
  id: string;
  name: string;
  phone: string;
  email: string;
  password: string;
  registeredAt: string;
}

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
}

export function isValidPassword(password: string): boolean {
  return password.length >= 6;
}

export function isValidPhone(phone: string): boolean {

  const cleanPhone = phone.replace(/\s/g, '').replace(/-/g, '');
  return /^[0-9]{9}$/.test(cleanPhone);
}

export function sanitizeUser(user: User): Omit<User, 'password'> {
  const { password, ...sanitized } = user;
  return sanitized;
}

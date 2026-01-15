
import { sha256 } from './crypto';

const CHINESE_SURNAMES = ['陳', '林', '李', '張', '王', '吳', '劉', '蔡', '楊', '許', '鄭', '謝', '洪', '郭', '邱'];
const CHINESE_GIVEN_NAMES = ['大文', '小明', '雅婷', '志強', '美玲', '家豪', '淑芬', '俊傑', '欣怡', '建宏', '佩君', '昱廷'];

export function generateRandomConsent(): string {
  return Math.random() > 0.5 ? 'Y' : 'N';
}

export function generateRandomPhone(prefixes: string[] = ['09', '02'], exclude: string[] = []): string {
  let phone = '';
  do {
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const digits = Math.floor(Math.random() * 100000000).toString().padStart(8, '0');
    phone = prefix + digits;
  } while (exclude.includes(phone));
  return phone;
}

export function generateRandomID(): string {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const firstLetter = letters.charAt(Math.floor(Math.random() * letters.length));
  const numbers = Math.floor(Math.random() * 1000000000).toString().padStart(9, '0');
  return firstLetter + numbers;
}

export function generateRandomName(): string {
  const surname = CHINESE_SURNAMES[Math.floor(Math.random() * CHINESE_SURNAMES.length)];
  const given = CHINESE_GIVEN_NAMES[Math.floor(Math.random() * CHINESE_GIVEN_NAMES.length)];
  return surname + given;
}

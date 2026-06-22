import { en } from './en';
import { sw } from './sw';

export type Language = 'en' | 'sw';

export const translations: Record<Language, Record<string, string>> = {
  en,
  sw,
};

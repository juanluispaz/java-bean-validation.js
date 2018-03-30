import { formatMessage as fm } from './en';
export function formatMessage(template: string, attributes: any, invalidValue: any, locale: string = 'en-GB'): string {
    return fm(template, attributes, invalidValue, locale);
}
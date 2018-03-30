import { formatMessage as fm } from './es';
export function formatMessage(template: string, attributes: any, invalidValue: any, locale: string = 'es-ES'): string {
    return fm(template, attributes, invalidValue, locale);
}
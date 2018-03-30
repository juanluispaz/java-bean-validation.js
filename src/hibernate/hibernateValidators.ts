import { VALIDATORS, Validator } from "../core/core";

// Based in: org.hibernate:hibernate-validator:5.4.0.Final

const MAX_INTEGER_VALUE = 2147483647;
const MAX_LONG_VALUE = 9223372036854775807;
let validator: Validator;

/*
VALIDATORS['Currency'] = function CurrencyValidator(_value: any, _attributes: { value: string[] }): boolean {
    // org.hibernate.validator.constraints.Currency
    // TODO: Implement org.hibernate.validator.constraints.Currency
    console.error('Validator not implemented: org.hibernate.validator.constraints.Currency');
    return true;
}
*/

VALIDATORS['Email'] = function EmailValidator(value: any) {
    // org.hibernate.validator.constraints.Email
    if (value === null || value === undefined) {
        return true;
    }
    if (typeof value === 'number') {
        value = value + '';
    }
    if (value instanceof Date) {
        value = value + '';
    }
    if (typeof value !== 'string') {
        return true; // wrong data type
    }

    const emailregex = /^[a-z0-9!#$%&'*+\/=?^_`{|}~.-]+@[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)*$/i;
    return emailregex.test(value);
};

validator = function LengthValidator(value: any, attributes: { min: number, max: number }): boolean {
    // org.hibernate.validator.constraints.Length
    if (value === null || value === undefined) {
        return true;
    }
    if (typeof value === 'number') {
        value = value + '';
    }
    if (value instanceof Date) {
        value = value + '';
    }
    if (typeof value !== 'string') {
        return true; // wrong data type
    }
    let min = attributes.min;
    let max = attributes.max;
    const length = value.length;
    return +min <= length && +max >= length;
};
validator.defaultValues = { min: 0, max: MAX_INTEGER_VALUE };
VALIDATORS['Length'] = validator;

validator = function NotBlankValidator(value: any): boolean {
    // org.hibernate.validator.constraints.NotBlank
    if (value === null || value === undefined) {
        return false;
    }
    if (typeof value === 'string') {
        value = value.trim();
        return value.length > 0;
    }
    if (typeof value === 'number') {
        return true;
    }
    if (value instanceof Date) {
        return true;
    }
    return true; // wrong data type
};
validator.isHtmlRequiredValidator = true;
VALIDATORS['NotBlank'] = validator;

VALIDATORS['NotEmpty'] = function NotEmptyValidator(_value: any): boolean {
    // org.hibernate.validator.constraints.NotEmpty
    // No implementation required
    return true;
}

/*
VALIDATORS['ParameterScriptAssert'] = function ParameterScriptAssertValidator(_value: any, _attributes: { lang: string, script: string }): boolean {
    // org.hibernate.validator.constraints.ParameterScriptAssert
    // TODO: Implement org.hibernate.validator.constraints.ParameterScriptAssert
    c_onsole.error('Validator not implemented: org.hibernate.validator.constraints.ParameterScriptAssert');
    return true;
}
*/

validator = function RangeValidator(_value: any, _attributes: { min: number, max: number }): boolean {
    // org.hibernate.validator.constraints.Range
    // No implementation required
    return true;
};
validator.defaultValues = { min: 0, max: MAX_LONG_VALUE };
VALIDATORS['Range'] = validator;

/*
validator = function SafeHtmlValidator(value: any, _attributes: { whitelistType: number | string, additionalTags: string[], additionalTagsWithAttributes: { name: string, attributes: string[] }[] }): boolean {
    // org.hibernate.validator.constraints.SafeHtml
    // TODO: Implement: org.hibernate.validator.constraints.SafeHtml
    if (value === null || value === undefined) {
        return true;
    }
    if (typeof value === 'number') {
        value = value + '';
    }
    if (value instanceof Date) {
        value = value + '';
    }
    if (typeof value !== 'string') {
        return true; // wrong data type
    }
    console.error('Validator not implemented: org.hibernate.validator.constraints.SafeHtml');
    return true;
};
validator.defaultValues = { whitelistType: 'RELAXED', additionalTags: [], additionalTagsWithAttributes: [] };
VALIDATORS['SafeHtml'] = validator;
*/

/*
validator = function ScriptAssertValidator(_value: any, _attributes: { lang: string, script: string, alias: string, reportOn: string }): boolean {
    // org.hibernate.validator.constraints.ScriptAssert
    // TODO: Implement org.hibernate.validator.constraints.ScriptAssert
    console.error('Validator not implemented: org.hibernate.validator.constraints.ScriptAssert');
    return true;
};
validator.defaultValues = { alias: '_this', reportOn: '' };
VALIDATORS['ScriptAssert'] = validator;
*/

validator = function URLValidator(value: any, attributes: { protocol: string, host: string, port: number }): boolean {
    // org.hibernate.validator.constraints.URL
    if (value === null || value === undefined) {
        return true;
    }
    if (typeof value === 'number') {
        value = value + '';
    }
    if (value instanceof Date) {
        value = value + '';
    }
    if (typeof value !== 'string') {
        return true; // wrong data type
    }

    let protocol = attributes.protocol;
    if (protocol === '') {
        protocol = (URLValidator as any).defaultValues.protocol;
    }
    let host = attributes.host;
    if (host === '') {
        host = '(\\w+?:{0,1}\\w*?@)?(\\S+?)';
    }
    let port: string;
    if (attributes.port === -1) {
        port = '(:[0-9]+?)?';
    } else {
        port = ':' + attributes.port + '';
        if (port === ':-1') {
            port = '(:[0-9]+?)?';
        }
    }

    // TODO: better url regex
    // const urlregex = '^(' + protocol + '):\\/\\/' + host + port + '(\\/|\\/([\\w#!:.?+=&%@!\\-\\/]))?$';
    const urlregex = '^(' + protocol + '):\\/\\/' + host + port + '([\\w#!:.?+=&%@!\\-\\/])*$';
    const regex = new RegExp(urlregex);
    return regex.test(value);
};
validator.defaultValues = { protocol: 'ftp|http|https', host: '', port: -1 };
VALIDATORS['URL'] = validator;
export function formatMessage(template: string, attributes: any, invalidValue: any, locale: string = 'en'): string {
    switch (template) {
        // Type validators
        case '{Object}':
            return 'This must be an object';
        case '{Enum}':
            return 'This must be a value between ' + attributes.value.toLocaleString(locale);
        case '{IntegerNumber}':
            return 'This must be an integer number';
        case '{FloatNumber}':
            return 'This must be a number';
        case '{String}':
            return 'This must be a character string';
        case '{Boolean}':
            return 'This must be true or false';
        case '{Date}':
            return 'This must be a date';
        case '{Time}':
            return 'This must be a time';
        case '{Timestamp}':
            return 'This must be a date with time';
        case '{List}':
            return 'This is not a list';
        case '{Map}':
            return 'This is not a dictionary with key and value';
        // Other useful validators
        case '{InvalidNumberGenenricArguments}':
            return 'Wrong number of generic arguments';
        case '{TypeNotFound}':
            return 'Not found the definition of the class of type "' + attributes.typeName + '"';
        case '{PropertyNotFound}':
            return 'Not found the property definition of "' + attributes.propertyName + '"';
        case '{ValidatorNotFound}':
            return 'Not found validator of type "' + attributes.constraintName + '"';
        case '{InvalidConstraintAttributeValue}':
            return 'Invalid constraint value in the property "' + attributes.attributeName + '": ' + attributes.description;
        // Java Bean validators
        case '{AssertFalse}':
            return 'This must be false';
        case '{AssertTrue}':
            return 'This must be true'
        case '{DecimalMax}': {
            let inclusive = attributes.inclusive;
            if (inclusive === null || inclusive === undefined) {
                inclusive = true;
            }
            if (inclusive) {
                return 'This must be less than or equal to ' + attributes.value.toLocaleString(locale);
            }
            return 'This must be a number less than ' + attributes.value.toLocaleString(locale);
        }
        case '{DecimalMin}': {
            let inclusive = attributes.inclusive;
            if (inclusive === null || inclusive === undefined) {
                inclusive = true;
            }
            if (inclusive) {
                return 'This must be a number greater than or equal to ' + attributes.value.toLocaleString(locale);
            }
            return 'This must be a number greater than ' + attributes.value.toLocaleString(locale);
        }
        case '{Digits}': {
            const integer = attributes.integer;
            const fraction = attributes.fraction;
            if (fraction > 0) {
                if (fraction == 1) {
                    if (integer == 1) {
                        return 'This must be a number of ' + integer.toLocaleString(locale) + ' place before and ' + fraction.toLocaleString(locale) + ' place after the decimal point';
                    } else {
                        return 'This must be a number of ' + integer.toLocaleString(locale) + ' places before and ' + fraction.toLocaleString(locale) + ' place after the decimal point';
                    }
                } else {
                    if (integer == 1) {
                        return 'This must be a number of ' + integer.toLocaleString(locale) + ' place before and ' + fraction.toLocaleString(locale) + ' places after the decimal point';
                    } else {
                        return 'This must be a number of ' + integer.toLocaleString(locale) + ' places before and ' + fraction.toLocaleString(locale) + ' places after the decimal point';
                    }
                }
            }
            if (integer == 1) {
                return 'This must be a number of ' + integer.toLocaleString(locale) + ' place before the decimal point';
            } else {
                return 'This must be a number of ' + integer.toLocaleString(locale) + ' places before the decimal point';
            }
        }
        case '{Future}':
            return 'This must be a date in the future';
        case '{Max}':
            return 'This must be less than or equal to ' + attributes.value.toLocaleString(locale);
        case '{Min}':
            return 'This must be a number greater than or equal to ' + attributes.value.toLocaleString(locale);
        case '{NotNull}':
            return 'This is required';
        case '{Null}':
            return 'This must not have value';
        case '{Past}':
            return 'This must be a date in the past';
        case '{Pattern}':
            return 'This must match the regular expression "' + attributes.regexp + '"';
        case '{Size}': {
            let min = attributes.min;
            let max = attributes.max;
            if (min === null || min === undefined) {
                min = 0;
            }
            if (max === null || max === undefined) {
                max = 2147483647;
            }
            if (invalidValue < min) {
                return 'This must be a number greater than or equal to ' + min.toLocaleString(locale);
            }
            return 'This must be less than or equal to ' + max.toLocaleString(locale);
        }
        // Hibernate validators
        case '{CreditCardNumber}':
            return 'This must be a valid card number';
        case '{Currency}':
            return 'This must be a valid amount of a valid currency';
        case '{Email}':
            return 'This must be a valid email address';
        case '{Length}': {
            let min = attributes.min;
            let max = attributes.max;
            if (min === null || min === undefined) {
                min = 0;
            }
            if (max === null || max === undefined) {
                max = 2147483647;
            }
            if (invalidValue < min) {
                if (min == 1) {
                    return 'The length must be greater than or equal to ' + min.toLocaleString(locale) + ' character';
                } else {
                    return 'The length must be greater than or equal to ' + min.toLocaleString(locale) + ' characters';
                }
            }

            if (max == 1) {
                return 'The length must be less than or equal to ' + max.toLocaleString(locale) + ' character';
            } else {
                return 'The length must be less than or equal to ' + max.toLocaleString(locale) + ' characters';
            }
        }
        case '{NotBlank}':
            return 'This is required';
        case '{NotEmpty}':
            return 'This can not be empty';
        case '{ParameterScriptAssert}':
            return 'Parameter script expression "' + attributes.script + '"  didn\'t evaluate to true';
        case '{Range}': {
            let min = attributes.min;
            let max = attributes.max;
            if (min === null || min === undefined) {
                min = 0;
            }
            if (max === null || max === undefined) {
                max = 9223372036854775807;
            }
            if (invalidValue < min) {
                return 'This must be a number greater than or equal to ' + min.toLocaleString(locale);
            }
            return 'This must be less than or equal to ' + max.toLocaleString(locale);
        }
        case '{SafeHtml}':
            return 'This must only contain safe HTML content';
        case '{ScriptAssert}':
            return 'Script expression "' + attributes.script + '"  didn\'t evaluate to true';
        case '{URL}':
            return 'This must be a valid URL';
        // Hibernate modCheck validators
        case '{EAN}': {
            const type = attributes.type;
            if (type == 0) {
                return 'This must be a bar code of type "EAN13"';
            } else if (type == 1) {
                return 'This must be a bar code of type "EAN8"';
            }
            return 'This must be a bar code of type "' + type + '"';
        }
        case '{LuhnCheck}':
            return 'This must approve the Luhn validation';
        case '{Mod10Check}':
            return 'This must approve the module 10 validation';
        case '{Mod11Check}':
            return 'This must approve the module 11 validation';
        case '{ModCheck}': {
            const type = attributes.type;
            if (type == 0 || type === 'MOD10') {
                return 'This must approve the module 10 validation';
            } else if (type == 1 || type === 'MOD11') {
                return 'This must approve the module 10 validation';
            }
            return 'This must approve the ' + type + ' validation';
        }
        default: {
            // Allow use full name of the message template: "{javax.validation.constraints.Size.message}" as alias of "{Size}"
            const matches = /^\{(:?.*\.)+(.*)\.message\}*$/.exec(template);
            if (!matches) {
                return template;
            } else {
                return formatMessage('{' + matches[2] + '}', attributes, invalidValue, locale);
            }
        }
    }
}
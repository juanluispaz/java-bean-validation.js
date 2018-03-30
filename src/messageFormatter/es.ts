export function formatMessage(template: string, attributes: any, invalidValue: any, locale: string = 'es'): string {
    switch (template) {
        // Type validators
        case '{Object}':
            return 'debe ser un objeto';
        case '{Enum}':
            return 'debe ser un valor de entre ' + attributes.value.toLocaleString(locale);
        case '{IntegerNumber}':
            return 'debe ser un número entero';
        case '{FloatNumber}':
            return 'debe ser un número';
        case '{String}':
            return 'debe ser una cadena de caracteres';
        case '{Boolean}':
            return 'debe ser cierto o falso';
        case '{Date}':
            return 'debe ser una fecha';
        case '{Time}':
            return 'debe ser una hora';
        case '{Timestamp}':
            return 'debe ser una fecha con hora';
        case '{List}':
            return 'no es un listado';
        case '{Map}':
            return 'no es un diccionario de clave y valor';
        // Other useful validators
        case '{InvalidNumberGenenricArguments}':
            return 'número de argumentos genéticos inválido';
        case '{TypeNotFound}':
            return 'no se ha encontrado la definición de la clase de tipo "' + attributes.typeName + '"';
        case '{PropertyNotFound}':
            return 'no se ha encontrado la definición de la propiedad "' + attributes.propertyName + '"';
        case '{ValidatorNotFound}':
            return 'no se ha encontrado el validador de tipo "' + attributes.constraintName + '"';
        case '{InvalidConstraintAttributeValue}':
            return 'valor inválido en la restricción de la propiedad "' + attributes.attributeName + '": ' + attributes.description;
        // Java Bean validators
        case '{AssertFalse}':
            return 'debe ser falso';
        case '{AssertTrue}':
            return 'debe ser verdadero'
        case '{DecimalMax}': {
            let inclusive = attributes.inclusive;
            if (inclusive === null || inclusive === undefined) {
                inclusive = true;
            }
            if (inclusive) {
                return 'debe ser un número menor o igual que ' + attributes.value.toLocaleString(locale);
            }
            return 'debe ser un número menor que ' + attributes.value.toLocaleString(locale);
        }
        case '{DecimalMin}': {
            let inclusive = attributes.inclusive;
            if (inclusive === null || inclusive === undefined) {
                inclusive = true;
            }
            if (inclusive) {
                return 'debe ser un número mayor o igual que ' + attributes.value.toLocaleString(locale);
            }
            return 'debe ser un número mayor que ' + attributes.value.toLocaleString(locale);
        }
        case '{Digits}': {
            const integer = attributes.integer;
            const fraction = attributes.fraction;
            if (fraction > 0) {
                if (fraction == 1) {
                    if (integer == 1) {
                        return 'debe ser un número de ' + integer.toLocaleString(locale) + ' cifra entera y ' + fraction.toLocaleString(locale) + ' decimal';
                    } else {
                        return 'debe ser un número de ' + integer.toLocaleString(locale) + ' cifras enteras y ' + fraction.toLocaleString(locale) + ' decimal';
                    }
                } else {
                    if (integer == 1) {
                        return 'debe ser un número de ' + integer.toLocaleString(locale) + ' cifra entera y ' + fraction.toLocaleString(locale) + ' decimales';
                    } else {
                        return 'debe ser un número de ' + integer.toLocaleString(locale) + ' cifras enteras y ' + fraction.toLocaleString(locale) + ' decimales';
                    }
                }
            }
            if (integer == 1) {
                return 'debe ser un número de ' + integer.toLocaleString(locale) + ' cifra entera';
            } else {
                return 'debe ser un número de ' + integer.toLocaleString(locale) + ' cifras enteras';
            }
        }
        case '{Future}':
            return 'debe ser una fecha del futuro';
        case '{Max}':
            return 'debe ser un número menor o igual que ' + attributes.value.toLocaleString(locale);
        case '{Min}':
            return 'debe ser un número mayor o igual que ' + attributes.value.toLocaleString(locale);
        case '{NotNull}':
            return 'es obligatorio';
        case '{Null}':
            return 'no debe tener valor';
        case '{Past}':
            return 'debe ser una fecha del pasado';
        case '{Pattern}':
            return 'debe cumplir a la expresión regular "' + attributes.regexp + '"';
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
                return 'debe ser un número mayor o igual que ' + min.toLocaleString(locale);
            }
            return 'debe ser un número menor o igual que ' + max.toLocaleString(locale);
        }
        // Hibernate validators
        case '{CreditCardNumber}':
            return 'debe ser un número de tarjeta válido';
        case '{Currency}':
            return 'debe ser un monto valido de una moneda válida';
        case '{Email}':
            return 'debe ser una dirección de correo electrónico válida';
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
                    return 'la longitud debe ser mayor o igual que ' + min.toLocaleString(locale) + ' caracter';
                } else {
                    return 'la longitud debe ser mayor o igual que ' + min.toLocaleString(locale) + ' caracteres';
                }
            }

            if (max == 1) {
                return 'la longitud debe ser menor o igual que ' + max.toLocaleString(locale) + ' caracter';
            } else {
                return 'la longitud debe ser menor o igual que ' + max.toLocaleString(locale) + ' caracteres';
            }
        }
        case '{NotBlank}':
            return 'es obligatorio';
        case '{NotEmpty}':
            return 'no puede estar vacío';
        case '{ParameterScriptAssert}':
            return 'la expresión de parámetro "' + attributes.script + '" no se ha evaluado a cierto';
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
                return 'debe ser un número mayor o igual que ' + min.toLocaleString(locale);
            }
            return 'debe ser un número menor o igual que ' + max.toLocaleString(locale);
        }
        case '{SafeHtml}':
            return 'debe contener únicamente HTML seguro';
        case '{ScriptAssert}':
            return 'la expresión "' + attributes.script + '" no se ha evaluado a cierto';
        case '{URL}':
            return 'debe ser una dirección URL válida';
        // Hibernate modCheck validators
        case '{EAN}': {
            const type = attributes.type;
            if (type == 0) {
                return 'deber ser un código de barra de tipo "EAN13"';
            } else if (type == 1) {
                return 'deber ser un código de barra de tipo "EAN8"';
            }
            return 'deber ser un código de barra de tipo "' + type + '"';
        }
        case '{LuhnCheck}':
            return 'debe aprobar la validación Luhn';
        case '{Mod10Check}':
            return 'debe aprobar la validación módulo 10';
        case '{Mod11Check}':
            return 'debe aprobar la validación módulo 11';
        case '{ModCheck}': {
            const type = attributes.type;
            if (type == 0 || type === 'MOD10') {
                return 'debe aprobar la validación módulo 10';
            } else if (type == 1 || type === 'MOD11') {
                return 'debe aprobar la validación módulo 11';
            }
            return 'debe aprobar la validación ' + type;
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
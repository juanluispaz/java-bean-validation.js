import { VALIDATORS, Validator, addViolation, ConstraintValidationsDescriptor, Violation } from "./core";

// Based in: javax.validation:validation-api:1.1.0.Final

const MAX_INTEGER_VALUE = 2147483647;
let validator: Validator;

VALIDATORS['AssertFalse'] = function AssertFalseValidator(value: any): boolean {
    // javax.validation.constraints.AssertFalse
    if (value === null || value === undefined) {
        return true;
    }
    if (!(value === true || value === false)) {
        return true; // wrong data type
    }
    return value === false;
};

VALIDATORS['AssertTrue'] = function AssertTrueValidator(value: any): boolean {
    // javax.validation.constraints.AssertTrue
    if (value === null || value === undefined) {
        return true;
    }
    if (!(value === true || value === false)) {
        return true; // wrong data type
    }
    return value === true;
};

validator = function DecimalMaxValidator(value: any, attributes: { value: number, inclusive: boolean }): boolean {
    // javax.validation.constraints.DecimalMax
    if (value === null || value === undefined) {
        return true;
    }
    if (typeof value === 'string') {
        if (value === 'NaN') {
            value = +value;
        } else {
            value = +value;
            if (isNaN(value)) {
                return true; // wrong data type
            }
        }
    }
    if (typeof value !== 'number') {
        return true; // wrong data type
    }
    let inclusive = attributes.inclusive;
    if (inclusive) {
        return value <= +attributes.value;
    } else {
        return value < +attributes.value;
    }
};
validator.defaultValues = { inclusive: true };
VALIDATORS['DecimalMax'] = validator;

validator = function DecimalMinValidator(value: any, attributes: { value: number, inclusive: boolean }): boolean {
    // javax.validation.constraints.DecimalMin
    if (value === null || value === undefined) {
        return true;
    }
    if (typeof value === 'string') {
        if (value === 'NaN') {
            value = +value;
        } else {
            value = +value;
            if (isNaN(value)) {
                return true; // wrong data type
            }
        }
    }
    if (typeof value !== 'number') {
        return true; // wrong data type
    }
    let inclusive = attributes.inclusive;
    if (inclusive) {
        return value >= +attributes.value;
    } else {
        return value > +attributes.value;
    }
};
validator.defaultValues = { inclusive: true };
VALIDATORS['DecimalMin'] = validator;

VALIDATORS['Digits'] = function DigitsValidator(value: any, attributes: { integer: number, fraction: number }): boolean {
    // javax.validation.constraints.Digits
    if (value === null || value === undefined) {
        return true;
    }
    if (typeof value === 'string') {
        if (value === 'NaN') {
            value = +value;
        } else {
            value = +value;
            if (isNaN(value)) {
                return true; // wrong data type
            }
        }
    }
    if (typeof value !== 'number') {
        return true; // wrong data type
    }
    if (isNaN(value)) {
        return false;
    }
    const split = (value + '').split('.', 2);
    if (split[0].length > +attributes.integer) {
        return false;
    }
    if (split[1] && split[1].length > +attributes.fraction) {
        return false;
    }
    return true;
};

VALIDATORS['Future'] = function FutureValidator(value: any): boolean {
    // javax.validation.constraints.Future
    if (value === null || value === undefined) {
        return true;
    }
    if (typeof value === 'string') {
        value = new Date(value);
    }
    if (!(value instanceof Date)) {
        return true; // wrong data type
    }
    return value.getTime() > new Date().getTime();
};

VALIDATORS['Max'] = function MaxValidator(value: any, attributes: { value: number }): boolean {
    // javax.validation.constraints.Max
    if (value === null || value === undefined) {
        return true;
    }
    if (typeof value === 'string') {
        value = +value;
        if (isNaN(value)) {
            return true; // wrong data type
        }
    }
    if (typeof value !== 'number') {
        return true; // wrong data type
    }
    if (isNaN(value)) {
        return true; // wrong data type
    }
    return value <= +attributes.value;
};

VALIDATORS['Min'] = function MinValidator(value: any, attributes: { value: number }): boolean {
    // javax.validation.constraints.Mix
    if (value === null || value === undefined) {
        return true;
    }
    if (typeof value === 'string') {
        value = +value;
        if (isNaN(value)) {
            return true; // wrong data type
        }
    }
    if (typeof value !== 'number') {
        return true; // wrong data type
    }
    if (isNaN(value)) {
        return true; // wrong data type
    }
    return value >= +attributes.value;
};

validator = function NotNullValidator(value: any): boolean {
    // javax.validation.constraints.NotNull
    return value !== null && value !== undefined;
};
validator.isHtmlRequiredValidator = true;
VALIDATORS['NotNull'] = validator;

VALIDATORS['Null'] = function NullValidator(value: any): boolean {
    // javax.validation.constraints.Null
    return value === null || value === undefined;
};

VALIDATORS['Past'] = function PastValidator(value: any): boolean {
    // javax.validation.constraints.Past
    if (value === null || value === undefined) {
        return true;
    }
    if (typeof value === 'string') {
        value = new Date(value);
    }
    if (!(value instanceof Date)) {
        return false;
    }
    return value.getTime() < new Date().getTime();
};

validator = function PatternValidator(value: any, attributes: { regexp: string, flags: (number | string)[] }, constraint: ConstraintValidationsDescriptor, path: string, globalViolations: Violation[]): boolean {
    // javax.validation.constraints.Pattern
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
    let flags = '';

    const attributesFlags = attributes.flags;
    for (let i = 0, length = attributesFlags.length; i < length; i++) {
        const flag = attributesFlags[i];
        if (flag === 'UNIX_LINES' || flag === 0) {
            const violatedConstraint: ConstraintValidationsDescriptor = { constraintName: 'InvalidConstraintAttributeValue', attributes: { constraintName: constraint.constraintName, attributeName: 'flags', attributeValue: flag, description: 'Pattert Validator: Unix lines flag not supported' } };
            addViolation(violatedConstraint, value, path, globalViolations);
            return false;
        } if (flag === 'CASE_INSENSITIVE' || flag === 1) {
            flags = flags + 'i';
        } if (flag === 'COMMENTS' || flag === 2) {
            const violatedConstraint: ConstraintValidationsDescriptor = { constraintName: 'InvalidConstraintAttributeValue', attributes: { constraintName: constraint.constraintName, attributeName: 'flags', attributeValue: flag, description: 'Pattert Validator: Comments flag not supported' } };
            addViolation(violatedConstraint, value, path, globalViolations);
            return false;
        } if (flag === 'MULTILINE' || flag === 3) {
            flags = flags + 'm';
        } if (flag === 'DOTALL' || flag === 4) {
            const violatedConstraint: ConstraintValidationsDescriptor = { constraintName: 'InvalidConstraintAttributeValue', attributes: { constraintName: constraint.constraintName, attributeName: 'flags', attributeValue: flag, description: 'Pattert Validator: Dot all flag not supported' } };
            addViolation(violatedConstraint, value, path, globalViolations);
            return false;
        } if (flag === 'UNICODE_CASE' || flag === 5) {
            const violatedConstraint: ConstraintValidationsDescriptor = { constraintName: 'InvalidConstraintAttributeValue', attributes: { constraintName: constraint.constraintName, attributeName: 'flags', attributeValue: flag, description: 'Pattert Validator: Unicode case flag not supported' } };
            addViolation(violatedConstraint, value, path, globalViolations);
            return false;
        } if (flag === 'CANON_EQ' || flag === 6) {
            const violatedConstraint: ConstraintValidationsDescriptor = { constraintName: 'InvalidConstraintAttributeValue', attributes: { constraintName: constraint.constraintName, attributeName: 'flags', attributeValue: flag, description: 'Pattert Validator: CanonEq flag not supported' } };
            addViolation(violatedConstraint, value, path, globalViolations);
            return false;
        } else {
            const violatedConstraint: ConstraintValidationsDescriptor = { constraintName: 'InvalidConstraintAttributeValue', attributes: { constraintName: constraint.constraintName, attributeName: 'flags', attributeValue: flag, description: 'Pattern Validator: Invalid Flag type' } };
            addViolation(violatedConstraint, value, path, globalViolations);
            return false;
        }
    }
    const regex = new RegExp(attributes.regexp, flags);
    return value.search(regex) >= 0;
};
validator.defaultValues = { flags: [] };
VALIDATORS['Pattern'] = validator;

validator = function SizeValidator(value: any, attributes: { min: number, max: number }): boolean {
    // javax.validation.constraints.Size
    if (value === null || value === undefined) {
        return true;
    }
    let min = attributes.min;
    let max = attributes.max;
    let length = -1;
    if (Array.isArray(value)) {
        length = value.length;
    } else if (typeof value === 'object') {
        length = 0;
        let key;
        for (key in value) {
            if (value.hasOwnProperty(key) && key[0] !== '$') {
                length++;
            }
        }
    } else if (typeof value === 'string') {
        length = value.length;
    } else if (typeof value === 'number') {
        length = (value + '').length;
    } else if (value instanceof Date) {
        length = (value + '').length;
    } else {
        return true; // wrong data type
    }
    return +min <= length && +max >= length;
};
validator.defaultValues = { min: 0, max: MAX_INTEGER_VALUE };
VALIDATORS['Size'] = validator;

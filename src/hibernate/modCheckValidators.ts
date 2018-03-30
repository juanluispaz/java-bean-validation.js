import { VALIDATORS, Validator, addViolation, ConstraintValidationsDescriptor, Violation } from "../core/core";

// Based in: org.hibernate:hibernate-validator:5.4.0.Final

const MAX_INTEGER_VALUE = 2147483647;
let validator: Validator;

interface ModCheckBaseAttributtes {
    startIndex: number,
    endIndex: number,
    ignoreNonDigitCharacters: boolean
}

type IsCheckDigitValidFn<A> = (digits: number[], checkDigit: string, attributes: A, value: string, constraint: ConstraintValidationsDescriptor, path: string, globalViolations: Violation[]) => boolean;

// Based in hibernate implementation in: org.hibernate.validator.internal.constraintvalidators.hv.ModCheckBase

function modCheckBase<A extends ModCheckBaseAttributtes>(value: string, attributes: A, isCheckDigitValid: IsCheckDigitValidFn<A>, checkDigitIndex: number, constraint: ConstraintValidationsDescriptor, path: string, globalViolations: Violation[]): boolean {
    let startIndex = attributes.startIndex;
    let endIndex = attributes.endIndex;
    let ignoreNonDigitCharacters = attributes.ignoreNonDigitCharacters;

    // extractVerificationString
    let digitsAsString: string;
    if (endIndex === MAX_INTEGER_VALUE) {
        digitsAsString = value.substring(0, value.length - 1);
    }
    else if (checkDigitIndex === -1) {
        digitsAsString = value.substring(startIndex, endIndex);
    }
    else {
        digitsAsString = value.substring(startIndex, endIndex + 1);
    }
    if (digitsAsString.length <= 0) {
        return false;
    }

    // extractCheckDigit
    let checkDigit: string;
    if (checkDigitIndex === -1) {
        if (endIndex === MAX_INTEGER_VALUE) {
            checkDigit = value.charAt(value.length - 1);
        }
        else {
            checkDigit = value.charAt(endIndex);
        }
    }
    else {
        checkDigit = value.charAt(checkDigitIndex);
    }
    if (checkDigit.length <= 0) {
        return false;
    }

    // stripNonDigitsIfRequired
    if (ignoreNonDigitCharacters) {
        digitsAsString = digitsAsString.replace(/[^0-9]+/g, '');
    }

    // extractDigits
    const digits: number[] = [];
    for (let i = 0, length = digitsAsString.length; i < length; i++) {
        let digit = +digitsAsString.charAt(i); // TODO: Java implementation support not latin numbers
        if (isNaN(digit)) {
            return false;
        }
        digits.push(digit);
    }

    return isCheckDigitValid(digits, checkDigit, attributes, value, constraint, path, globalViolations);
}

// Based in hibernate implementation in: org.hibernate.validator.internal.constraintvalidators.hv.LuhnCheckValidator
function luhnCheckValidator(digits: number[], checkDigit: string): boolean {
    const modResult: number = calculateLuhnMod10Check(digits);

    const checkValue = +checkDigit; // TODO: Java implementation support not latin numbers
    if (!isNaN(checkValue)) {
        return false;
    }

    return checkValue === modResult;
}

// Based in hibernate implementation in: org.hibernate.validator.internal.constraintvalidators.hv.Mod10CheckValidator
function mod10CheckValidator(digits: number[], checkDigit: string, attributes: { multiplier: number, weight: number }): boolean {
    let multiplier = attributes.multiplier;
    let weight = attributes.weight;
    const modResult: number = calculateMod10Check(digits, multiplier, weight);

    const checkValue = +checkDigit; // TODO: Java implementation support not latin numbers
    if (!isNaN(checkValue)) {
        return false;
    }

    return checkValue === modResult;
}

// Based in hibernate implementation in: org.hibernate.validator.internal.constraintvalidators.hv.Mod11CheckValidator
function mod11CheckValidator(digits: number[], checkDigit: string, attributes: { processingDirection: number | string, threshold: number, treatCheck10As: string, treatCheck11As: string }, value: string, constraint: ConstraintValidationsDescriptor, path: string, globalViolations: Violation[], customWeights: number[] = []): boolean {
    let processingDirection = attributes.processingDirection;
    let threshold = attributes.threshold;
    let treatCheck10As = attributes.treatCheck10As;
    let treatCheck11As = attributes.treatCheck11As;

    let reverseOrder: boolean;
    if (processingDirection === 'LEFT_TO_RIGHT' || processingDirection === 1) {
        reverseOrder = true;
    } else if (processingDirection === 'RIGHT_TO_LEFT' || processingDirection === 0) {
        reverseOrder = false;
    } else {
        const violatedConstraint: ConstraintValidationsDescriptor = { constraintName: 'InvalidConstraintAttributeValue', attributes: { constraintName: constraint.constraintName, attributeName: 'processingDirection', attributeValue: processingDirection, description: 'Mod11Check Validator: Invalid processingDirection type' } };
        addViolation(violatedConstraint, value, path, globalViolations);
        return false;
    }

    if (reverseOrder) {
        digits.reverse();
    }

    const modResult: number = calculateModXCheckWithWeights(digits, 11, threshold, ...customWeights);
    switch (modResult) {
        case 10:
            return checkDigit === treatCheck10As;
        case 11:
            return checkDigit === treatCheck11As;
        default: {
            const checkValue = +checkDigit; // TODO: Java implementation support not latin numbers
            if (!isNaN(checkValue)) {
                return false;
            }

            return checkValue === modResult;
        }
    }
}

// Based in hibernate implementation in: org.hibernate.validator.internal.constraintvalidators.hv.ModCheckValidator
function modCheckValidator(digits: number[], checkDigit: string, attributes: { modType: number | string, multiplier: number }, value: string, constraint: ConstraintValidationsDescriptor, path: string, globalViolations: Violation[]): boolean {
    let modType = attributes.modType;
    let multiplier = attributes.multiplier;

    let modResult: number = -1;

    if (modType === 'MOD11' || modType === 1) {
        modResult = calculateMod11Check(digits, multiplier);

        if (modResult === 10 || modResult === 11) {
            modResult = 0;
        }
    } else if (modType === 'MOD10' || modType === 0) {
        modResult = calculateLuhnMod10Check(digits);
    } else {
        const violatedConstraint: ConstraintValidationsDescriptor = { constraintName: 'InvalidConstraintAttributeValue', attributes: { constraintName: constraint.constraintName, attributeName: 'modType', attributeValue: modType, description: 'ModCheck Validator: Invalid modType type' } };
        addViolation(violatedConstraint, value, path, globalViolations);
        return false;
    }

    const checkValue = +checkDigit; // TODO: Java implementation support not latin numbers
    if (!isNaN(checkValue)) {
        return false;
    }
    return checkValue === modResult;
}

// Based in hibernate implementation in: org.hibernate.validator.internal.util.ModUtil

function calculateLuhnMod10Check(digits: number[]): number {
    let sum: number = 0;
    let even: boolean = true;
    for (let index = digits.length - 1; index >= 0; index--) {
        let digit = digits[index];

        if (even) {
            digit <<= 1;
        }
        if (digit > 9) {
            digit -= 9;
        }
        sum += digit;
        even = !even;
    }
    return (10 - (sum % 10)) % 10;
}

function calculateMod10Check(digits: number[], multiplier: number, weight: number): number {
    let sum: number = 0;
    let even: boolean = true;
    for (let index = digits.length - 1; index >= 0; index--) {
        let digit = digits[index];

        if (even) {
            digit *= multiplier;
        }
        else {
            digit *= weight;
        }

        sum += digit;
        even = !even;
    }
    return (10 - (sum % 10)) % 10;
}

function calculateMod11Check(digits: number[], threshold: number = MAX_INTEGER_VALUE): number {
    let sum: number = 0;
    let multiplier: number = 2;

    for (let index = digits.length - 1; index >= 0; index--) {
        sum += digits[index] * multiplier++;
        if (multiplier > threshold) {
            multiplier = 2;
        }
    }
    return 11 - (sum % 11);
}

function calculateModXCheckWithWeights(digits: number[], moduloParam: number, threshold: number, ...weights: number[]): number {
    let sum: number = 0;
    let multiplier: number = 1;

    for (let index = digits.length - 1; index >= 0; index--) {
        if (weights.length != 0) {
            multiplier = weights[weights.length - index % weights.length - 1];
        }
        else {
            multiplier++;
            if (multiplier > threshold) {
                multiplier = 2;
            }
        }
        sum += digits[index] * multiplier;
    }
    return moduloParam - (sum % moduloParam);
}

/* ********************************************************************************************
 * Validators
 */

VALIDATORS['CreditCardNumber'] = function CreditCardNumberValidator(_value: any): boolean {
    // org.hibernate.validator.constraints.CreditCardNumber
    // No implementation required
    return true;
}

validator = function EANValidator(value: any, attributes: { type: number | string }, constraint: ConstraintValidationsDescriptor, path: string, globalViolations: Violation[]): boolean {
    // org.hibernate.validator.constraints.EAN
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
    const type = attributes.type;
    if (type === 'EAN13' || type === 0) {
        return value.length === 13;
    } else if (type === 'EAN8' || type === 1) {
        return value.length === 8;
    } else {
        const violatedConstraint: ConstraintValidationsDescriptor = { constraintName: 'InvalidConstraintAttributeValue', attributes: { constraintName: constraint.constraintName, attributeName: 'type', attributeValue: type, description: 'EAN Validator: Invalid EAN type' } };
        addViolation(violatedConstraint, value, path, globalViolations);
        return false;
    }
};
validator.defaultValues = { type: 'EAN13' };
VALIDATORS['EAN'] = validator;

validator = function LuhnCheckValidator(value: any, attributes: { startIndex: number, endIndex: number, checkDigitIndex: number, ignoreNonDigitCharacters: boolean }, constraint: ConstraintValidationsDescriptor, path: string, globalViolations: Violation[]): boolean {
    // org.hibernate.validator.constraints.EAN
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
    let checkDigitIndex = attributes.checkDigitIndex;
    return modCheckBase(value, attributes, luhnCheckValidator, checkDigitIndex, constraint, path, globalViolations);
};
validator.defaultValues = { startIndex: 0, endIndex: MAX_INTEGER_VALUE, checkDigitIndex: -1, ignoreNonDigitCharacters: true };
VALIDATORS['LuhnCheck'] = validator;

validator = function Mod10CheckValidator(value: any, attributes: { multiplier: number, weight: number, startIndex: number, endIndex: number, checkDigitIndex: number, ignoreNonDigitCharacters: boolean }, constraint: ConstraintValidationsDescriptor, path: string, globalViolations: Violation[]): boolean {
    // org.hibernate.validator.constraints.EAN
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
    let checkDigitIndex = attributes.checkDigitIndex;
    return modCheckBase<typeof attributes>(value, attributes, mod10CheckValidator, checkDigitIndex, constraint, path, globalViolations);
};
validator.defaultValues = { multiplier: 3, weight: 1, startIndex: 0, endIndex: MAX_INTEGER_VALUE, checkDigitIndex: -1, ignoreNonDigitCharacters: true };
VALIDATORS['Mod10Check'] = validator;

validator = function Mod11CheckValidator(value: any, attributes: { threshold: number, startIndex: number, endIndex: number, checkDigitIndex: number, ignoreNonDigitCharacters: boolean, treatCheck10As: string, treatCheck11As: string, processingDirection: number | string }, constraint: ConstraintValidationsDescriptor, path: string, globalViolations: Violation[]): boolean {
    // org.hibernate.validator.constraints.EAN
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
    let checkDigitIndex = attributes.checkDigitIndex;
    return modCheckBase<typeof attributes>(value, attributes, mod11CheckValidator, checkDigitIndex, constraint, path, globalViolations);
};
validator.defaultValues = { threshold: MAX_INTEGER_VALUE, startIndex: 0, endIndex: MAX_INTEGER_VALUE, checkDigitIndex: -1, ignoreNonDigitCharacters: false, treatCheck10As: 'X', treatCheck11As: '0', processingDirection: 'RIGHT_TO_LEFT' };
VALIDATORS['Mod11Check'] = validator;

validator = function ModCheckValidator(value: any, attributes: { modType: number | string, multiplier: number, startIndex: number, endIndex: number, checkDigitPosition: number, ignoreNonDigitCharacters: boolean }, constraint: ConstraintValidationsDescriptor, path: string, globalViolations: Violation[]): boolean {
    // org.hibernate.validator.constraints.EAN
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
    let checkDigitPosition = attributes.checkDigitPosition;
    if (checkDigitPosition === undefined) {
        checkDigitPosition = -1;
    }
    return modCheckBase<typeof attributes>(value, attributes, modCheckValidator, checkDigitPosition, constraint, path, globalViolations);
};
validator.defaultValues = { startIndex: 0, endIndex: MAX_INTEGER_VALUE, checkDigitPosition: -1, ignoreNonDigitCharacters: true };
VALIDATORS['ModCheck'] = validator;
import { TypeName, DEFAULT_GROUPS, Violation, TypeValidationsDescriptor, PropertyValidationsDescriptor } from '../core/core'
import { visitPropertyDescriptor, Visitor } from '../core/visit'
import { lookupPropertyDescriptor } from './lookup'

// Standard HTML Input type
/*
export type HTMLInputTypeValue =
    'button'
    | 'checkbox'
    | 'color'
    | 'date'
    | 'datetime-local'
    | 'email'
    | 'file'
    | 'hidden'
    | 'image'
    | 'month'
    | 'number'
    | 'password'
    | 'radio'
    | 'range'
    | 'reset'
    | 'search'
    | 'submit'
    | 'tel'
    | 'text'
    | 'time'
    | 'url'
    | 'week';
*/

/**
 * Type of input requered by a value
 * 
 * The possible values are:
 * - text:     When the type is a string
 * - checkbox: When the type is a boolean
 * - number:   When the type is a number without decimals, like int (In HTML this input allow decimals, but not here)
 * - float:    When the type is a number with decimals, like double (It is a not a standard input type)
 * - date:     When the type is a date without time, like SqlDate, by conveniency Date is also a a date whithout time
 * - time:     When the type is a time without date, like SqlTime
 * - datetime: When the value is a date with time, like SqlTimestamp (It is a not a standard input type, but it is 
 *             similar to datetime-local)
 * - email:    When the value must be a email, because it have the @Email constraint
 * - url:      When the value must be an URL, because it have the @URL constraint
 * - textarea: When the value is a text that allow have multiple lines, in order to indicate it must have a 
 *             custom constraint called "Multiline" (It is a not a standard input type, it represents the textarea 
 *             element)
 * - password: When the value is a text that represents a password, in order to indicate it must have a 
 *             custom constraint called "Password"
 * - tel:      When the value is a text that represents a phone number, in order to indicate it must have a 
 *             custom constraint called "PhoneNumber"
 * - money:    When the value is a number that represents an amount of money without currency name, just the amount, 
 *             in order to indicate it must have a custom constraint called "Money"
 */
export type InputType =
    'text'
    | 'checkbox'
    | 'number'
    | 'float' // not standard
    | 'date'
    | 'time'
    | 'datetime' // not standard
    | 'email'
    | 'url'
    | 'textarea' // not standard
    | 'password'
    | 'tel'
    | 'money';

declare module '../core/core' {
    interface PropertyValidationsDescriptor {
        /**
         * Extra property added to the property descriptor to keep in cache the input type
         * previously extracted.
         */
        htmlInputType?: InputType | null;
    }
}

/**
 * Infer the HTML input type of a property according to the rules specified in the property descriptor
 * provided by argument.
 * 
 * @param propertyOrTypeOrTypeName Property descriptor, ot type descriptor with the property, or type name that 
 *                                 constains the property, with the rules to be used to extract the property 
 *                                 HTML validation rules
 * @param propertyName             Name of the property to be extracted the input type
 * @param groups                   List of validation groups to be to be used to extract the validations rules
 * @param violations               List where is going to be appended the violations found
 * @returns                        Input type infered, null if the property was not found, or if there are not a 
 *                                 proper input type available
 * 
 * @see {@link InputType} for more information about the input type available
 * @see {@link TYPE_DESCRIPTORS} for mor information about the type descriptor map
 * @see {@link TypeValidationsDescriptor} for more information about type descriptors
 * @see {@link PropertyValidationsDescriptor} for more information about property descriptors
 * @see {@link getTypeDescriptor} for more information how the type defition is getted from the type name
 * @see {@link getPropertyDescriptor} for more information how the property defition is getted from a type definition
 * @see {@link Violation} for more information about violations
 */
export function getHtmlInputType(propertyOrTypeOrTypeName: PropertyValidationsDescriptor | TypeValidationsDescriptor | TypeName, propertyName: string | number, groups: string[] = DEFAULT_GROUPS, violations: Violation[] = []): InputType | null {
    const property = lookupPropertyDescriptor(propertyOrTypeOrTypeName, propertyName, undefined, '', violations);
    if (!property) {
        return null;
    }
    let htmlInputType = property.htmlInputType;
    if (htmlInputType !== undefined) {
        return htmlInputType;
    }

    let inputType: InputType | null = null;
    const visitor: Visitor = {
        startConstraintVisitor: (constraint) => {
            switch (constraint.constraintName) {
                case 'String':
                    if (!inputType) {
                        inputType = 'text';
                    }
                    break;
                case 'Boolean':
                    inputType = 'checkbox';
                    break;
                case 'IntegerNumber':
                    inputType = 'number';
                    break;
                case 'FloatNumber':
                    inputType = 'float';
                    break;
                case 'Date':
                    inputType = 'date';
                    break;
                case 'Time':
                    inputType = 'time';
                    break;
                case 'Timestamp':
                    inputType = 'datetime';
                    break;
                case 'Email':
                    inputType = 'email';
                    break;
                case 'URL':
                    inputType = 'url';
                    break;
                case 'Multiline': // Custom validator
                    inputType = 'textarea';
                    break;
                case 'Password': // Custorm validator
                    inputType = 'password';
                    break;
                case 'PhoneNumber': // Custom validator
                    inputType = 'tel';
                    break;
                case 'Money': // Custom validator
                    inputType = 'money';
                    break;
            }
            return true;
        },
        ignoreValue: true
    }
    visitPropertyDescriptor(property, propertyName, undefined, '', groups, violations, violations, visitor);
    property.htmlInputType = inputType;
    return inputType;
}

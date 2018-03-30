import { TypeName, DEFAULT_GROUPS, Violation, TypeValidationsDescriptor, PropertyValidationsDescriptor } from '../core/core'
import { visitPropertyDescriptor, Visitor } from '../core/visit'
import { lookupPropertyDescriptor } from './lookup'

const MAX_INTEGER_VALUE = 2147483647;

/**
 * HTML validations rulest that can be extracted from the validations rules
 */
export interface HtmlValidationRules {
    /**
     * Indicate if a value is requiered, under this rule null, undefined or empty string are no allowed.
     */
    required?: boolean,
    /**
     * Indicate the maximun number of characters allowed in a input
     */
    maxLength?: number
}

declare module '../core/core' {
    interface PropertyValidationsDescriptor {
        /**
         * Extra property added to the property descriptor to keep in cache the HTML validations rules
         * previously extracted.
         */
        htmlValidationRules?: HtmlValidationRules
    }
}

/**
 * Extract the HTML validations rules of a property according to the rules specified in the property descriptor
 * provided by argument.
 * 
 * @param propertyOrTypeOrTypeName Property descriptor, ot type descriptor with the property, or type name that 
 *                                 constains the property, with the rules to be used to extract the property 
 *                                 HTML validation rules
 * @param propertyName             Name of the property to be extracted the validation rules
 * @param groups                   List of validation groups to be to be used to extract the validations rules
 * @param violations               List where is going to be appended the violations found
 * @returns                        HTML validations rules found, null if the property was not found
 * 
 * @see {@link HtmlValidationRules} for more information about the HTML validations rules that can be extracted
 *                                  from the validation's rules
 * @see {@link TYPE_DESCRIPTORS} for mor information about the type descriptor map
 * @see {@link TypeValidationsDescriptor} for more information about type descriptors
 * @see {@link PropertyValidationsDescriptor} for more information about property descriptors
 * @see {@link getTypeDescriptor} for more information how the type defition is getted from the type name
 * @see {@link getPropertyDescriptor} for more information how the property defition is getted from a type definition
 * @see {@link Violation} for more information about violations
 */
export function getHtmlValidationRules(propertyOrTypeOrTypeName: PropertyValidationsDescriptor | TypeValidationsDescriptor | TypeName, propertyName: string | number, groups: string[] = DEFAULT_GROUPS, violations: Violation[] = []): HtmlValidationRules | null {
    const property = lookupPropertyDescriptor(propertyOrTypeOrTypeName, propertyName, undefined, '', violations);
    if (!property) {
        return null;
    }
    const htmlValidationRules = property.htmlValidationRules;
    if (htmlValidationRules) {
        return htmlValidationRules;
    }

    const rules: HtmlValidationRules = {};
    const visitor: Visitor = {
        startValidatorVisitor: (validatorName, validator, _value, attributes) => {
            if (!validator) {
                return true;
            }
            if (validator.isHtmlRequiredValidator) {
                rules.required = true;
            }
            switch (validatorName) {
                case 'Length':
                case 'Size': {
                    const min = +attributes.min || 0;
                    const max = +attributes.max || MAX_INTEGER_VALUE;
                    const maxLength = min > max ? min : max;
                    if (rules.maxLength === null || rules.maxLength === undefined || rules.maxLength > maxLength) {
                        rules.maxLength = maxLength;
                    }
                    break;
                }
                case 'Digits': {
                    let maxLength = attributes.integer + 1/* symbol - */;
                    if (attributes.fraction) {
                        maxLength = maxLength + 1 /* symbol . */ + attributes.fraction;
                    }
                    if (rules.maxLength === null || rules.maxLength === undefined || rules.maxLength > maxLength) {
                        rules.maxLength = maxLength;
                    }
                    break;
                }
                case 'Min':
                case 'Max':
                case 'DecimalMin':
                case 'DecimalMax': {
                    const maxLength = ((+attributes.value || 0) + '').length;
                    if (rules.maxLength === null || rules.maxLength === undefined || rules.maxLength > maxLength) {
                        rules.maxLength = maxLength;
                    }
                    break;
                }
            }
            return true;
        },
        ignoreValue: true
    }
    visitPropertyDescriptor(property, propertyName, undefined, '', groups, violations, violations, visitor);
    property.htmlValidationRules = rules;
    return rules;
}

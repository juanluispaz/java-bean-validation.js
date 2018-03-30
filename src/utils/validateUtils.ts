import { TypeName, DEFAULT_GROUPS, Violation, TypeValidationsDescriptor, PropertyValidationsDescriptor } from '../core/core'
import { validateTypeDescriptor, validatePropertyDescriptor } from '../core/validate'
import { lookupTypeDescriptor, lookupPropertyDescriptor } from './lookup'

/**
 * Validate a value according to the rules specified in the type provided by argument.
 * 
 * @param typeOrTypeName Type descriptor or type name, with the rules to be used to validate the value
 * @param value          Value to be validated
 * @param groups         List of validation groups to be used to validate the value
 * @returns              List with the violations found
 * 
 * @see {@link TYPE_DESCRIPTORS} for mor information about the type descriptor map
 * @see {@link TypeValidationsDescriptor} for more information about type descriptors
 * @see {@link getTypeDescriptor} for more information how the type defition is getted from the type name
 * @see {@link Violation} for more information about violations
 */
export function validateObject(typeOrTypeName: TypeValidationsDescriptor | TypeName, value: any, groups: string[] = DEFAULT_GROUPS): Violation[] {
    const violations: Violation[] = [];
    const type = lookupTypeDescriptor(typeOrTypeName, value, '', violations);
    if (!type) {
        return violations;
    }
    validateTypeDescriptor(type, value, '', groups, violations, violations);
    return violations;
}

/**
 * Validate a property of a value according to the rules specified in the property descriptor provided by argument.
 * 
 * @param propertyOrTypeOrTypeName Property descriptor, ot type descriptor with the property, or type name that 
 *                                 constains the property, with the rules to be used to validate the property 
 *                                 of the value specified by argument
 * @param propertyName             Name of the property to be validated in the value specified by argument
 * @param objectWithProperty       Value with the property to be validated
 * @param groups                   List of validation groups to be used to validate the value
 * @returns                        List with the violations found
 * 
 * @see {@link TYPE_DESCRIPTORS} for mor information about the type descriptor map
 * @see {@link TypeValidationsDescriptor} for more information about type descriptors
 * @see {@link PropertyValidationsDescriptor} for more information about property descriptors
 * @see {@link getTypeDescriptor} for more information how the type defition is getted from the type name
 * @see {@link getPropertyDescriptor} for more information how the property defition is getted from a type definition
 * @see {@link Violation} for more information about violations
 */
export function validateProperty(propertyOrTypeOrTypeName: PropertyValidationsDescriptor | TypeValidationsDescriptor | TypeName, propertyName: string | number, objectWithProperty: any, groups: string[] = DEFAULT_GROUPS): Violation[] {
    const violations: Violation[] = [];
    const property = lookupPropertyDescriptor(propertyOrTypeOrTypeName, propertyName, objectWithProperty, '', violations);
    if (!property) {
        return violations;
    }
    if (objectWithProperty === null || objectWithProperty === undefined || typeof objectWithProperty !== 'object') {
        return violations;
    }
    validatePropertyDescriptor(property, propertyName, objectWithProperty, '', groups, violations, violations);
    return violations;
}

/**
 * Validate a value according to the rules specified in a property descriptor provided by argument.
 * 
 * @param propertyOrTypeOrTypeName Property descriptor, ot type descriptor with the property, or type name that 
 *                                 constains the property, with the rules to be used to validate the property 
 *                                 of the value specified by argument
 * @param propertyName             Name of the property to be validated in the value specified by argument
 * @param porpertyValue            Value of the property to be validated
 * @param groups                   List of validation groups to be used to validate the value
 * @returns                        List with the violations found
 * 
 * @see {@link TYPE_DESCRIPTORS} for mor information about the type descriptor map
 * @see {@link TypeValidationsDescriptor} for more information about type descriptors
 * @see {@link PropertyValidationsDescriptor} for more information about property descriptors
 * @see {@link getTypeDescriptor} for more information how the type defition is getted from the type name
 * @see {@link getPropertyDescriptor} for more information how the property defition is getted from a type definition
 * @see {@link Violation} for more information about violations
 */
export function validateValueOfProperty(propertyOrTypeOrTypeName: PropertyValidationsDescriptor | TypeValidationsDescriptor | TypeName, propertyName: string | number, propertyValue: any, groups: string[] = DEFAULT_GROUPS): Violation[] {
    const value: any = {};
    value[propertyName] = propertyValue;

    const violations: Violation[] = [];
    const property = lookupPropertyDescriptor(propertyOrTypeOrTypeName, propertyName, value, '', violations);
    if (!property) {
        return violations;
    }
    validatePropertyDescriptor(property, propertyName, value, '', groups, violations, violations);
    return violations;
}
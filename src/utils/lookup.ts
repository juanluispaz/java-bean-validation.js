import { getTypeDescriptor, getPropertyDescriptor, TypeName, TypeValidationsDescriptor, PropertyValidationsDescriptor, Violation } from '../core/core'

/**
 * Rerurns a type definitions given its name. If a type definition was provied it is returned. 
 * 
 * @param typeOrTypeName   Type name to be found, or type descriptor to be retorned
 * @param value            Value to be validated
 * @param path             Path to be used in the violation reports
 * @param groups           List of validation groups to be used to validate the value
 * @param globalViolations List where is going to be appended the violations not caused by a specific validator
 * @returns                The type descriptor, if it was found, otherwise null
 * 
 * @see {@link TYPE_DESCRIPTORS} for mor information about the type descriptor map
 * @see {@link TypeValidationsDescriptor} for more information about type descriptors
 * @see {@link getTypeDescriptor} for more information how the type defition is getted from the type name
 * @see {@link Violation} for more information about violations
 */
export function lookupTypeDescriptor(typeOrTypeName: TypeValidationsDescriptor | TypeName, value: any, path: string, globalViolations: Violation[]): TypeValidationsDescriptor | null {
    if ((typeOrTypeName as TypeValidationsDescriptor).typeName) {
        return typeOrTypeName as TypeValidationsDescriptor;
    } else {
        return getTypeDescriptor(typeOrTypeName as TypeName, value, path, globalViolations);
    }
}

/**
 * Rerurns a property definitions given its name and the container typeIf a property definition was provied it is 
 * returned. If a type definition or a type name is provided, the property definition is going to be taken from the
 * associated type definition.
 * 
 * @param propertyOrTypeOrTypeName Type name or type descriptor that contains the property to be found, or the
 *                                 property descriptor to be retorned
 * @param propertyName             Name of the property which descriptor is required
 * @param objectWithProperty       Value with the property to be used in the violation messages as the current value
 *                                 to be validated
 * @param path                     Path of the value with the property to be used in the violation reports
 * @param groups                   List of validation groups to be used to validate the value
 * @param globalViolations         List where is going to be appended the violations not caused by a specific validator
 * @returns                        The property descriptor, if it was found, otherwise null
 * 
 * @see {@link TYPE_DESCRIPTORS} for mor information about the type descriptor map
 * @see {@link TypeValidationsDescriptor} for more information about type descriptors
 * @see {@link PropertyValidationsDescriptor} for more information about property descriptors
 * @see {@link getTypeDescriptor} for more information how the type defition is getted from the type name
 * @see {@link getPropertyDescriptor} for more information how the property defition is getted from a type definition
 * @see {@link Violation} for more information about violations
 */
export function lookupPropertyDescriptor(propertyOrTypeOrTypeName: PropertyValidationsDescriptor | TypeValidationsDescriptor | TypeName, propertyName: string | number, objectWithProperty: any, path: string, globalViolations: Violation[]): PropertyValidationsDescriptor | null {
    if ((propertyOrTypeOrTypeName as PropertyValidationsDescriptor).porpertyTypeName) {
        return propertyOrTypeOrTypeName as PropertyValidationsDescriptor;
    } else if ((propertyOrTypeOrTypeName as TypeValidationsDescriptor).typeName) {
        return getPropertyDescriptor(propertyOrTypeOrTypeName as TypeValidationsDescriptor, objectWithProperty, propertyName, path, globalViolations);
    } else {
        let type = getTypeDescriptor(propertyOrTypeOrTypeName as TypeName, objectWithProperty, path, globalViolations);
        if (!type) {
            return null;
        }
        return getPropertyDescriptor(type, objectWithProperty, propertyName, path, globalViolations);
    }
}


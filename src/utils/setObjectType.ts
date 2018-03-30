import { TypeName, DEFAULT_GROUPS, Violation, TypeValidationsDescriptor } from '../core/core'
import { visitTypeDescriptor, Visitor } from '../core/visit'
import { lookupTypeDescriptor } from './lookup'

/**
 * Create a property with the object's type.
 * 
 * @param typeOrTypeName            Type descriptor or type name, with the rules to be used to set the object type
 * @param value                     Value to be setted the object type
 * @param typePropertyName          Name of the property with the object's type
 * @param enumerable                Indicate if the property must be created as enumerable
 * @param recursively               Set the object's type the properties recursively
 * @param recursivelyEvenNotCascade Set the object's type the properties recursively even if that property have no
 *                                  a cascade validation rule
 * @returns                         List with the violations found
 * 
 * @see {@link TYPE_DESCRIPTORS} for mor information about the type descriptor map
 * @see {@link TypeValidationsDescriptor} for more information about type descriptors
 * @see {@link getTypeDescriptor} for more information how the type defition is getted from the type name
 * @see {@link Violation} for more information about violations
 */
export function setObjectType(typeOrTypeName: TypeValidationsDescriptor | TypeName, value: any, typePropertyName: string, enumerable: boolean = false, recursively: boolean = false, recursivelyEvenNotCascade: boolean = true): Violation[] {
    const violations: Violation[] = [];
    const type = lookupTypeDescriptor(typeOrTypeName, value, '', violations);
    if (!type) {
        return violations;
    }
    if (value === null || value === undefined || typeof value !== 'object') {
        return violations;
    }

    const visitor: Visitor = {
        startTypeVisitor: (type, value) => {
            if (value === null || value === undefined || typeof value !== 'object') {
                return false;
            }
            Object.defineProperty(value, typePropertyName, { enumerable, value: type.typeName, writable: false });
            return true;
        },
        recursively,
        recursivelyEvenNotCascade
    }
    visitTypeDescriptor(type, value, '', DEFAULT_GROUPS, violations, violations, visitor);
    return violations;
}
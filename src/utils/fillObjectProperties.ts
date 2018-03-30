import { TypeName, DEFAULT_GROUPS, Violation, TypeValidationsDescriptor } from '../core/core'
import { visitTypeDescriptor, Visitor } from '../core/visit'
import { lookupTypeDescriptor } from './lookup'

/**
 * Ensure that all properties defined in the type definition are present in the value object, even if the 
 * property's value is undefined.
 * 
 * @param typeOrTypeName            Type descriptor or type name, with the rules to be used to fill the object
 * @param value                     Value to be filled
 * @param recursively               Fill the properties recursively
 * @param recursivelyEvenNotCascade Fill the properties recursively even if that property have no a cascade 
 *                                  validation rule
 * @returns                         List with the violations found
 * 
 * @see {@link TYPE_DESCRIPTORS} for mor information about the type descriptor map
 * @see {@link TypeValidationsDescriptor} for more information about type descriptors
 * @see {@link getTypeDescriptor} for more information how the type defition is getted from the type name
 * @see {@link Violation} for more information about violations
 */
export function fillObjectProperties(typeOrTypeName: TypeValidationsDescriptor | TypeName, value: any, recursively: boolean = false, recursivelyEvenNotCascade: boolean = true): Violation[] {
    const violations: Violation[] = [];
    const type = lookupTypeDescriptor(typeOrTypeName, value, '', violations);
    if (!type) {
        return violations;
    }
    if (value === null || value === undefined || typeof value !== 'object') {
        return violations;
    }

    const visitor: Visitor = {
        startPropertyVisitor: (_property, porpertyName, objectWithProperty) => {
            objectWithProperty[porpertyName] = objectWithProperty[porpertyName];
            return true;
        },
        recursively,
        recursivelyEvenNotCascade
    }
    visitTypeDescriptor(type, value, '', DEFAULT_GROUPS, violations, violations, visitor);
    return violations;
}

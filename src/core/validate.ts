import { TypeValidationsDescriptor, Violation, DEFAULT_GROUPS, PropertyValidationsDescriptor, getTypeDescriptor, convertGroups, ConstraintValidationsDescriptor, groupAllowed, VALIDATORS, addViolation, loadDefaultConstraintValues } from './core'

/**
 * Validate a value according to the rules specified in the type descriptor provided by argument.
 * 
 * @param type             Type descriptor, with the rules to be used to validate the value
 * @param value            Value to be validated
 * @param path             Path to be used in the violation reports
 * @param groups           List of validation groups to be used to validate the value
 * @param violations       List where is going to be appended the violations found
 * @param globalViolations List where is going to be appended the violations not caused by a specific validator
 * 
 * @see {@link TypeValidationsDescriptor} for more information about type descriptors
 * @see {@link Violation} for more information about violations
 */
export function validateTypeDescriptor(type: TypeValidationsDescriptor, value: any, path: string, groups: string[], violations: Violation[], globalViolations: Violation[]): void {
    if (type.isBasicType) {
        violations = globalViolations;
        groups = DEFAULT_GROUPS;
    }

    const constraints = type.constraints;
    if (constraints) {
        for (let i = 0, length = constraints.length; i < length; i++) {
            const constraint = constraints[i];
            validateConstraintDescriptor(constraint, value, path, groups, violations, globalViolations);
        }
    }

    if (value === null || value === undefined) {
        return;
    }

    if (!type.isBasicType) {
        validateConstraintDescriptor({ constraintName: 'Object' }, value, path, DEFAULT_GROUPS, violations, globalViolations);
    }

    const properties = type.properties;
    if (properties) {
        for (const propertyName in properties) {
            const property = properties[propertyName];
            validatePropertyDescriptor(property, propertyName, value, path, groups, violations, globalViolations);
        }
    }

    if (!type.isCollection) {
        return;
    }

    const valueDescriptor = type.valueDescriptor;
    if (!valueDescriptor) {
        return;
    }

    if (Array.isArray(value)) {
        for (let index = 0, length = value.length; index < length; index++) {
            validatePropertyDescriptor(valueDescriptor, index, value, path, groups, violations, globalViolations);
        }
    } else {
        for (const key in value) {
            validatePropertyDescriptor(valueDescriptor, key, value, path, groups, violations, globalViolations);
        }
    }
}

/**
 * Validate a property of a value according to the rules specified in the property descriptor provided by argument.
 * 
 * @param property           Property descriptor, with the rules to be used to validate the property of the value 
 *                           specified by argument
 * @param propertyName       Name of the property to be validated in the value specified by argument
 * @param objectWithProperty Value with the property to be validated
 * @param path               Path to be used in the violation reports
 * @param groups             List of validation groups to be used to validate the value
 * @param violations         List where is going to be appended the violations found
 * @param globalViolations   List where is going to be appended the violations not caused by a specific validator
 * 
 * @see {@link PropertyValidationsDescriptor} for more information about property descriptors
 * @see {@link Violation} for more information about violations
 */
export function validatePropertyDescriptor(property: PropertyValidationsDescriptor, propertyName: string | number, objectWithProperty: any, path: string, groups: string[], violations: Violation[], globalViolations: Violation[]): void {
    let value;
    if (objectWithProperty) {
        value = objectWithProperty[propertyName];
    }
    let propertyPath = path + '.' + propertyName;

    const type = getTypeDescriptor(property.porpertyTypeName, value, propertyPath, globalViolations)
    if (!type) {
        return;
    }

    if (type.isBasicType || property.cascade) {
        const cascadeGroups = convertGroups(groups, property.groupConversions);
        validateTypeDescriptor(type, value, propertyPath, cascadeGroups, violations, globalViolations);
    }

    const constraints = property.constraints;
    if (constraints) {
        for (let i = 0, length = constraints.length; i < length; i++) {
            const constraint = constraints[i];
            validateConstraintDescriptor(constraint, value, propertyPath, groups, violations, globalViolations);
        }
    }
}

/**
 * Validate a value according to the rules specified in the constraint descriptor provided by argument.
 * 
 * @param constraint       Constraint descriptor, with the rules to be used to validate the value
 * @param value            Value to be validated
 * @param path             Path to be used in the violation reports
 * @param groups           List of validation groups to be used to validate the value
 * @param violations       List where is going to be appended the violations found
 * @param globalViolations List where is going to be appended the violations not caused by a specific validator
 * 
 * @see {@link ConstraintValidationsDescriptor} for more information about constraints
 * @see {@link Violation} for more information about violations
 */
export function validateConstraintDescriptor(constraint: ConstraintValidationsDescriptor, value: any, path: string, groups: string[], violations: Violation[], globalViolations: Violation[]): boolean {
    let validator = VALIDATORS[constraint.constraintName];
    if (validator) {
        if (validator.isGlobalValidator) {
            violations = globalViolations;
        }
        if (!constraint.defaultValuesLoaded) {
            loadDefaultConstraintValues(constraint, validator);
        }
    } else {
        if (!constraint.hasNoValidator) {
            const violatedConstraint: ConstraintValidationsDescriptor = { constraintName: 'ValidatorNotFound', attributes: { constraintName: constraint.constraintName } };
            addViolation(violatedConstraint, value, path, globalViolations);
        }
        validator = noopValidator;
    }

    const attributes = constraint.attributes || {};
    if (!groupAllowed(groups, attributes.groups)) {
        return true;
    }

    let composingValid = true;
    const composingConstraints = constraint.composingConstraints;
    const reportAsSingle = constraint.reportAsSingle;
    if (composingConstraints) {
        let innerViolations = violations;
        if (reportAsSingle) {
            innerViolations = [];
        }
        for (let i = 0, length = composingConstraints.length; i < length; i++) {
            const composedConstraint = composingConstraints[i];
            composingValid = validateConstraintDescriptor(composedConstraint, value, path, groups, innerViolations, globalViolations) && composingValid;
        }
    }

    const constraintValid = validator(value, attributes, constraint, path, globalViolations, violations);
    if (constraintValid && composingValid) {
        return true;
    }

    addViolation(constraint, value, path, violations);
    return false;
}

/**
 * Valitador functions that always return the value is valid
 * 
 * @private
 */
function noopValidator() : boolean {
    return true;
}
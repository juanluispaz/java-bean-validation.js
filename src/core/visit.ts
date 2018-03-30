import { TypeValidationsDescriptor, Violation, DEFAULT_GROUPS, PropertyValidationsDescriptor, getTypeDescriptor, convertGroups, ConstraintValidationsDescriptor, groupAllowed, VALIDATORS, addViolation, loadDefaultConstraintValues, Validator } from './core'

/**
 * Vistor function executed when start visiting each type descriptor requeried durind a validation process.
 * 
 * @param type             Type descriptor, with the rules to be used to validate the value
 * @param value            Value to be validated
 * @param path             Path to be used in the violation reports
 * @param groups           List of validation groups to be used to validate the value
 * @param violations       List where is going to be appended the violations found
 * @param globalViolations List where is going to be appended the violations not caused by a specific validator
 * @param visitor          Visitor object used to walk around the validation process
 * @returns                true if the type must be visited, if it returns false the type descriptor must be skiped
 * 
 * @see {@link TypeValidationsDescriptor} for more information about type descriptors
 * @see {@link Violation} for more information about violations
 * @see {@link Visitor} for more infomation about the visitor object
 */
export type StartTypeVisitor = (type: TypeValidationsDescriptor, value: any, path: string, groups: string[], violations: Violation[], globalViolations: Violation[], visitor: Visitor) => boolean;

/**
 * Vistor function executed when end visiting each type descriptor requeried durind a validation process.
 * 
 * Note:
 * If the start function skip this element this function is never executed
 * 
 * @param type             Type descriptor, with the rules to be used to validate the value
 * @param value            Value to be validated
 * @param path             Path to be used in the violation reports
 * @param groups           List of validation groups to be used to validate the value
 * @param violations       List where is going to be appended the violations found
 * @param globalViolations List where is going to be appended the violations not caused by a specific validator
 * @param visitor          Visitor object used to walk around the validation process
 * 
 * @see {@link TypeValidationsDescriptor} for more information about type descriptors
 * @see {@link Violation} for more information about violations
 * @see {@link Visitor} for more infomation about the visitor object
 */
export type EndTypeVisitor = (type: TypeValidationsDescriptor, value: any, path: string, groups: string[], violations: Violation[], globalViolations: Violation[], visitor: Visitor) => void;

/**
 * Visitor function executed when start each property descriptor requeried during a validation process.
 * 
 * @param type               Property descriptor, with the rules to be used to validate the property of the value 
 *                           specified by argument
 * @param propertyName       Name of the property to be validated in the value specified by argument
 * @param objectWithProperty Value with the property to be validated
 * @param path               Path to be used in the violation reports
 * @param groups             List of validation groups to be used to validate the value
 * @param violations         List where is going to be appended the violations found
 * @param globalViolations   List where is going to be appended the violations not caused by a specific validator
 * @param visitor            Visitor object used to walk around the validation process
 * @returns                  true if the type must be visited, if it returns false the property descriptor must be skiped
 * 
 * @see {@link PropertyValidationsDescriptor} for more information about property descriptors
 * @see {@link Violation} for more information about violations
 * @see {@link Visitor} for more infomation about the visitor object
 */
export type StartPropertyVisitor = (property: PropertyValidationsDescriptor, porpertyName: string | number, objectWithProperty: any, path: string, groups: string[], violations: Violation[], globalViolations: Violation[], visitor: Visitor) => boolean;

/**
 * Visitor function executed when end each property descriptor requeried during a validation process.
 * 
 * Note:
 * If the start function skip this element this function is never executed
 * 
 * @param type               Property descriptor, with the rules to be used to validate the property of the value 
 *                           specified by argument
 * @param propertyName       Name of the property to be validated in the value specified by argument
 * @param objectWithProperty Value with the property to be validated
 * @param path               Path to be used in the violation reports
 * @param groups             List of validation groups to be used to validate the value
 * @param violations         List where is going to be appended the violations found
 * @param globalViolations   List where is going to be appended the violations not caused by a specific validator
 * @param visitor            Visitor object used to walk around the validation process
 * 
 * @see {@link PropertyValidationsDescriptor} for more information about property descriptors
 * @see {@link Violation} for more information about violations
 * @see {@link Visitor} for more infomation about the visitor object
 */
export type EndPropertyVisitor = (property: PropertyValidationsDescriptor, porpertyName: string | number, objectWithProperty: any, path: string, groups: string[], violations: Violation[], globalViolations: Violation[], visitor: Visitor) => void;

/**
 * Visitor function executed when start each constraint descriptor requeried during a validation process.
 * 
 * @param constraint       Constraint descriptor, with the rules to be used to validate the value
 * @param value            Value to be validated
 * @param path             Path to be used in the violation reports
 * @param groups           List of validation groups to be used to validate the value
 * @param violations       List where is going to be appended the violations found
 * @param globalViolations List where is going to be appended the violations not caused by a specific validator
 * @param visitor          Visitor object used to walk around the validation process
 * @returns                true if the type must be visited, if it returns false the constraint descriptor must be skiped
 * 
 * @see {@link ConstraintValidationsDescriptor} for more information about constraints
 * @see {@link Violation} for more information about violations
 * @see {@link Visitor} for more infomation about the visitor object
 */
export type StartConstraintVisitor = (constraint: ConstraintValidationsDescriptor, value: any, path: string, groups: string[], violations: Violation[], globalViolations: Violation[], visitor: Visitor) => boolean;

/**
 * Visitor function executed when end each constraint descriptor requeried during a validation process.
 * 
 * Note:
 * If the start function skip this element this function is never executed
 * 
 * @param constraint       Constraint descriptor, with the rules to be used to validate the value
 * @param value            Value to be validated
 * @param path             Path to be used in the violation reports
 * @param groups           List of validation groups to be used to validate the value
 * @param violations       List where is going to be appended the violations found
 * @param globalViolations List where is going to be appended the violations not caused by a specific validator
 * @param visitor          Visitor object used to walk around the validation process
 * 
 * @see {@link ConstraintValidationsDescriptor} for more information about constraints
 * @see {@link Violation} for more information about violations
 * @see {@link Visitor} for more infomation about the visitor object
 */
export type EndConstraintVisitor = (constraint: ConstraintValidationsDescriptor, value: any, path: string, groups: string[], violations: Violation[], globalViolations: Violation[], visitor: Visitor) => void;

/**
 * Visitor function executed when start each vaidator requeried during a validation process.
 * 
 * @param validatorName    Name of the constraint rule to apply, which corresponds to the validator function name
 * @param validator        Validator function (if it exists) in charged of evalutate if a value is valid according 
 *                         to the constraint restriction
 * @param value            Value to be validated according to the constraint rules
 * @param attributes       Constraint attributes values used to test the validity of the tested value
 * @param path             Path to be used in the violation reports
 * @param groups           List of validation groups to be used to validate the value
 * @param violations       List where is going to be appended the violations found
 * @param globalViolations List where is going to be appended the violations not caused by a specific validator
 * @param visitor          Visitor object used to walk around the validation process
 * @returns                true if the type must be visited, if it returns false the constraint descriptor must be skiped
 * 
 * @see {@link Validator} for more informaton about the validator function of a constraint
 * @see {@link Violation} for more information about violations
 * @see {@link Visitor} for more infomation about the visitor object
 */
export type StartValidatorVisitor = (validatorName: string, validator: Validator | null | undefined, value: any, attributes: any, path: string, groups: string[], violations: Violation[], globalViolations: Violation[], visitor: Visitor) => boolean;

/**
 * Visitor function executed when end each vaidator requeried during a validation process.
 * 
 * Note:
 * If the start function skip this element this function is never executed
 * 
 * @param validatorName    Name of the constraint rule to apply, which corresponds to the validator function name
 * @param validator        Validator function (if it exists) in charged of evalutate if a value is valid according 
 *                         to the constraint restriction
 * @param value            Value to be validated according to the constraint rules
 * @param attributes       Constraint attributes values used to test the validity of the tested value
 * @param path             Path to be used in the violation reports
 * @param groups           List of validation groups to be used to validate the value
 * @param violations       List where is going to be appended the violations found
 * @param globalViolations List where is going to be appended the violations not caused by a specific validator
 * @param visitor          Visitor object used to walk around the validation process
 * 
 * @see {@link Validator} for more informaton about the validator function of a constraint
 * @see {@link Violation} for more information about violations
 * @see {@link Visitor} for more infomation about the visitor object
 */
export type EndValidatorVisitor = (validatorName: string, validator: Validator | null | undefined, value: any, attributes: any, path: string, groups: string[], violations: Violation[], globalViolations: Violation[], visitor: Visitor) => void;

/**
 * Visitor definition used to walk around the validation process.
 * 
 * The visitor allow to walk inside the validation process in order to inspect and extract information of it.
 */
export interface Visitor {
    /**
     * Vistor function executed when start each type descriptor requeried durind a validation process.
     * 
     * @see {@link TypeVisitor} for more information about this function
     */
    startTypeVisitor?: StartTypeVisitor,
    /**
     * Vistor function executed when end each type descriptor requeried durind a validation process.
     * 
     * @see {@link TypeVisitor} for more information about this function
     */
    endTypeVisitor?: EndTypeVisitor,
    /**
     * Vistor function executed when start each property descriptor requeried durind a validation process.
     * 
     * @see {@link TypeVisitor} for more information about this function
     */
    startPropertyVisitor?: StartPropertyVisitor,
    /**
     * Vistor function executed when end each property descriptor requeried durind a validation process.
     * 
     * @see {@link TypeVisitor} for more information about this function
     */
    endPropertyVisitor?: EndPropertyVisitor,
    /**
     * Vistor function executed when start each constraint descriptor requeried durind a validation process.
     * 
     * @see {@link TypeVisitor} for more information about this function
     */
    startConstraintVisitor?: StartConstraintVisitor,
    /**
     * Vistor function executed when end each constraint descriptor requeried durind a validation process.
     * 
     * @see {@link TypeVisitor} for more information about this function
     */
    endConstraintVisitor?: EndConstraintVisitor,
    /**
     * Vistor function executed when start each validator requeried durind a validation process.
     * 
     * @see {@link TypeVisitor} for more information about this function
     */
    startValidatorVisitor?: StartValidatorVisitor,
    /**
     * Vistor function executed when end each validator requeried durind a validation process.
     * 
     * @see {@link TypeVisitor} for more information about this function
     */
    endValidatorVisitor?: EndValidatorVisitor,
    /**
     * Indicate if the validation process must attend to the casacade rules.
     */
    recursively?: boolean,
    /**
     * Indicate if the validation process must be made in casacade, even if the property have no defined the 
     * casade rule.
     * 
     * Note:
     * This property has effect only if the property recursively was set to true.
     */
    recursivelyEvenNotCascade?: boolean,
    /**
     * Indicate if the value must be ignored in order to determinate if is required to continue the validation process.
     * Thi flag affect the type valdation rules, by default, wen a value is null or undefined, its properties are not
     * validated, if you set this flag to true, the object's properties are going to be validated even if the object
     * has no value.
     */
    ignoreValue?: boolean,
    /**
     * Indicate if the validation's gruups rules are ignored during the validation process. In consecuense, every
     * property is included in the validation process even the group rules express that property must be excluded.
     */
    ignoreGroups?: boolean
}

/**
 * Execute the visit process in the same way that happen with the validation process of a value according to the 
 * rules specified in the type descriptor provided by argument.
 * 
 * @param type             Type descriptor, with the rules to be used to validate the value
 * @param value            Value to be validated
 * @param path             Path to be used in the violation reports
 * @param groups           List of validation groups to be used to validate the value
 * @param violations       List where is going to be appended the violations found
 * @param globalViolations List where is going to be appended the violations not caused by a specific validator
 * @param visitor          Visitor object used to walk around the validation process
 * 
 * @see {@link TypeValidationsDescriptor} for more information about type descriptors
 * @see {@link Violation} for more information about violations
 * @see {@link Visitor} for more infomation about the visitor object
 */
export function visitTypeDescriptor(type: TypeValidationsDescriptor, value: any, path: string, groups: string[], violations: Violation[], globalViolations: Violation[], visitor: Visitor): void {
    if (type.isBasicType) {
        violations = globalViolations;
        groups = DEFAULT_GROUPS;
    }

    if (visitor.startTypeVisitor) {
        const visit = visitor.startTypeVisitor(type, value, path, groups, violations, globalViolations, visitor);
        if (!visit) {
            return;
        }
    }

    const hasConstraintOrValidatorVisitor = visitor.startConstraintVisitor || visitor.endConstraintVisitor || visitor.startValidatorVisitor || visitor.endValidatorVisitor;
    if (hasConstraintOrValidatorVisitor) {
        const constraints = type.constraints;
        if (constraints) {
            for (let i = 0, length = constraints.length; i < length; i++) {
                const constraint = constraints[i];
                visitConstraintDescriptor(constraint, value, path, groups, violations, globalViolations, visitor);
            }
        }
    }

    if (!visitor.ignoreValue && (value === null || value === undefined)) {
        if (visitor.endTypeVisitor) {
            visitor.endTypeVisitor(type, value, path, groups, violations, globalViolations, visitor);
        }
        return;
    }

    if (!type.isBasicType && hasConstraintOrValidatorVisitor) {
        visitConstraintDescriptor({ constraintName: 'Object' }, value, path, DEFAULT_GROUPS, violations, globalViolations, visitor);
    }

    const properties = type.properties;
    if (properties) {
        for (const propertyName in properties) {
            const property = properties[propertyName];
            visitPropertyDescriptor(property, propertyName, value, path, groups, violations, globalViolations, visitor);
        }
    }

    if (!type.isCollection) {
        if (visitor.endTypeVisitor) {
            visitor.endTypeVisitor(type, value, path, groups, violations, globalViolations, visitor);
        }
        return;
    }

    const valueDescriptor = type.valueDescriptor;
    if (!valueDescriptor) {
        if (visitor.endTypeVisitor) {
            visitor.endTypeVisitor(type, value, path, groups, violations, globalViolations, visitor);
        }
        return;
    }

    if (Array.isArray(value)) {
        for (let index = 0, length = value.length; index < length; index++) {
            visitPropertyDescriptor(valueDescriptor, index, value, path, groups, violations, globalViolations, visitor);
        }
    } else {
        for (const key in value) {
            visitPropertyDescriptor(valueDescriptor, key, value, path, groups, violations, globalViolations, visitor);
        }
    }

    if (visitor.endTypeVisitor) {
        visitor.endTypeVisitor(type, value, path, groups, violations, globalViolations, visitor);
    }
}

/**
 * Execute the visit process in the same way that happen with the validation process of a property of a value
 * according to the rules specified in the property descriptor provided by argument.
 * 
 * @param property           Property descriptor, with the rules to be used to validate the property of the value 
 *                           specified by argument
 * @param propertyName       Name of the property to be validated in the value specified by argument
 * @param objectWithProperty Value with the property to be validated
 * @param path               Path to be used in the violation reports
 * @param groups             List of validation groups to be used to validate the value
 * @param violations         List where is going to be appended the violations found
 * @param globalViolations   List where is going to be appended the violations not caused by a specific validator
 * @param visitor            Visitor object used to walk around the validation process
 * 
 * @see {@link PropertyValidationsDescriptor} for more information about property descriptors
 * @see {@link Violation} for more information about violations
 * @see {@link Visitor} for more infomation about the visitor object
 */
export function visitPropertyDescriptor(property: PropertyValidationsDescriptor, propertyName: string | number, objectWithProperty: any, path: string, groups: string[], violations: Violation[], globalViolations: Violation[], visitor: Visitor): void {
    if (visitor.startPropertyVisitor) {
        const visit = visitor.startPropertyVisitor(property, propertyName, objectWithProperty, path, groups, violations, globalViolations, visitor);
        if (!visit) {
            return;
        }
    }

    let value;
    if (objectWithProperty) {
        value = objectWithProperty[propertyName];
    }
    let propertyPath = path + '.' + propertyName;

    const type = getTypeDescriptor(property.porpertyTypeName, value, propertyPath, globalViolations);
    if (!type) {
        if (visitor.endPropertyVisitor) {
            visitor.endPropertyVisitor(property, propertyName, objectWithProperty, path, groups, violations, globalViolations, visitor);
        }
        return;
    }
    
    if (type.isBasicType || (visitor.recursively && (visitor.recursivelyEvenNotCascade || property.cascade))) {
        const cascadeGroups = convertGroups(groups, property.groupConversions);
        visitTypeDescriptor(type, value, propertyPath, cascadeGroups, violations, globalViolations, visitor);
    }

    if (visitor.startConstraintVisitor || visitor.endConstraintVisitor || visitor.startValidatorVisitor || visitor.endValidatorVisitor) {
        const constraints = property.constraints;
        if (constraints) {
            for (let i = 0, length = constraints.length; i < length; i++) {
                const constraint = constraints[i];
                visitConstraintDescriptor(constraint, value, propertyPath, groups, violations, globalViolations, visitor);
            }
        }
    }

    if (visitor.endPropertyVisitor) {
        visitor.endPropertyVisitor(property, propertyName, objectWithProperty, path, groups, violations, globalViolations, visitor);
    }
}

/**
 * Execute the visit process in the same way that happen with the validation process of a value according to the 
 * rules specified in the constraint descriptor provided by argument.
 * 
 * @param constraint       Constraint descriptor, with the rules to be used to validate the value
 * @param value            Value to be validated
 * @param path             Path to be used in the violation reports
 * @param groups           List of validation groups to be used to validate the value
 * @param violations       List where is going to be appended the violations found
 * @param globalViolations List where is going to be appended the violations not caused by a specific validator
 * @param visitor          Visitor object used to walk around the validation process
 * 
 * @see {@link ConstraintValidationsDescriptor} for more information about constraints
 * @see {@link Violation} for more information about violations
 * @see {@link Visitor} for more infomation about the visitor object
 */
export function visitConstraintDescriptor(constraint: ConstraintValidationsDescriptor, value: any, path: string, groups: string[], violations: Violation[], globalViolations: Violation[], visitor: Visitor): void {
    if (visitor.startConstraintVisitor) {
        const visit = visitor.startConstraintVisitor(constraint, value, path, groups, violations, globalViolations, visitor);
        if (!visit) {
            return;
        }
    }

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
    }

    const attributes = constraint.attributes || {};
    if (!(groupAllowed(groups, attributes.groups) || visitor.ignoreGroups)) {
        if (visitor.endConstraintVisitor) {
            visitor.endConstraintVisitor(constraint, value, path, groups, violations, globalViolations, visitor);
        }
        return;
    }

    const composingConstraints = constraint.composingConstraints;
    const reportAsSingle = constraint.reportAsSingle;
    if (composingConstraints) {
        let innerViolations = violations;
        if (reportAsSingle) {
            innerViolations = [];
        }
        for (let i = 0, length = composingConstraints.length; i < length; i++) {
            const composedConstraint = composingConstraints[i];
            visitConstraintDescriptor(composedConstraint, value, path, groups, innerViolations, globalViolations, visitor);
        }
    }

    if (visitor.startValidatorVisitor) {
        const visit = visitor.startValidatorVisitor(constraint.constraintName, validator, value, attributes, path, groups, violations, globalViolations, visitor);
        if (!visit) {
            if (visitor.endConstraintVisitor) {
                visitor.endConstraintVisitor(constraint, value, path, groups, violations, globalViolations, visitor);
            }
            return;
        }
    }
    if (visitor.endValidatorVisitor) {
        visitor.endValidatorVisitor(constraint.constraintName, validator, value, attributes, path, groups, violations, globalViolations, visitor);
    }
    
    if (visitor.endConstraintVisitor) {
        visitor.endConstraintVisitor(constraint, value, path, groups, violations, globalViolations, visitor);
    }
}

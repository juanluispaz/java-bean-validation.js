/**
 * Desriptor of a type (or class in Java), which have the information about a type, it's properties, 
 * validation contraints, etc.
 */
export interface TypeValidationsDescriptor {
    /**
     * Name of the type
     * 
     * @see {@link TypeName} for more information about how the type names are represented.
     */
    typeName: TypeName
    /**
     * Validation contraints that apply over the type. It contains all constraints applied ovew a class in Java.
     * 
     * @see {@link ConstraintValidationsDescriptor} for more information about constraints
     */
    constraints?: ConstraintValidationsDescriptor[]
    /**
     * Map with the properties of the type, the key of the map is the property name, and the value is the 
     * property descriptor.
     * 
     * @see {@link PropertyValidationsDescriptor} for more information about property descriptors
     * @see {@link TypeValidationsPropertyDescriptorMap} for more information about the map with the property descriptors
     */
    properties?: TypeValidationsPropertyDescriptorMap
    /**
     * Indicate if the type is a fundamentar data type. A basic or fundamental type is one thar have no properties,
     * the contained value must be considered as one indivisible unit, like an int, or a date.
     * 
     * The basic type constraints must be validated in all situations, without care about groups rules or cascade.
     * 
     * Note: 
     * This property is only used by the fundamental preregisted types.
     */
    isBasicType?: boolean
    /**
     * Indicate if the type is a collection. A collection is a List or a Map.
     * 
     * Notes: 
     * - Types with generic arguments must have a factory which transform it to a concrete type.
     * - This property is used by the preregisted Java collections types factories.
     * 
     * @see {@link TypeName} for more information about how the type names and generics are represented
     * @see {@link TypeValidationsDescriptorFactory} for more information about type descriptor factories
     */
    isCollection?: boolean
    /**
     * In a collection type, indicate the validations that apply over each value.
     * 
     * Note: This property is used by the preregisted Java collections types factories.
     */
    valueDescriptor?: PropertyValidationsDescriptor
}

/**
 * A type descriptor factory is a function with the responsability of transform a a type with generic arguments
 * in a concrete type. In order to do it, this function recibes the type name with generic arguments, and returns
 * the type definition according to the generic arguments.
 * 
 * Note:
 * Every generic type must have its own type descriptor factory registered in the type descriptor map.
 * 
 * @see {@link TypeName} for more information about how the type names and generics are represented
 * @see {@link TYPE_DESCRIPTORS} for mor information about the type descriptor map
 */
export type TypeValidationsDescriptorFactory = (typeName: TypeName) => TypeValidationsDescriptor;

/**
 * Descriptor of a type's property, which have the onformation about a property, it's type, validation constraints,
 * and validation cascade rules.
 */
export interface PropertyValidationsDescriptor {
    /**
     * Name of the data type of the porperty.
     * 
     * @see {@link TypeName} for more information about how the type names are represented
     */
    porpertyTypeName: TypeName
    /**
     * Validation contraints that apply over the property. It contains all constraints applied ovew a property in Java.
     * 
     * @see {@link ConstraintValidationsDescriptor} for more information about constraints
     */
    constraints?: ConstraintValidationsDescriptor[]
    /**
     * Indicate if the property type must be validated with the value of this property. It corresponds to the
     * @Valid annotation in Java.
     * 
     * Note:
     * All types marked as a basic type are validated ignoring the value of this property.
     * 
     * see {@link TypeValidationsDescriptor} for more information about type descriptors
     */
    cascade?: boolean
    /**
     * In case of apply a casade validation on this property, this constains the group conversion rules. 
     * This constains a map where the key is the original group name (from) and the value is the transformed group
     * name (to), and in Java corresponds to @ConvertGroup annotation usage.
     * 
     * @see {@link GroupConversions} for more information about the map with the group conversion correpondence.
     */
    groupConversions?: GroupConversions
}
/**
 * Map with the properties of a type, this map contains all properties of a type, where the key is the property's name
 * and the value is the property descriptor, which contains the validations rules of a property.
 * 
 * @see {@link PropertyValidationsDescriptor} for more information about property descriptors
 * @see {@link TypeValidationsDescriptor} for more information about type descriptors
 */
export interface TypeValidationsPropertyDescriptorMap { [propertyName: string]: PropertyValidationsDescriptor }

/**
 * Map with the groups converson equivalence, this map contains as key the originl group name, where it is going to be 
 * converted from, ad as a value the name name of the group where the key is going to be converted to. Each rule in the
 * map corresponds to a one entry of the @ConvertGroup annotation in Java.
 * 
 * @see {@link PropertyValidationsDescriptor.groupConversions} for more information about group convertions in a property
 */
export interface GroupConversions { [groupNameFrom: string]: string | undefined /*groupNameTo*/ }

/**
 * Descriptor of a constraint, it represent a validation rule that could be apply over a type or property.
 * 
 * @see {@link PropertyValidationsDescriptor} for more information about property descriptors
 * @see {@link TypeValidationsDescriptor} for more information about type descriptors
 */
export interface ConstraintValidationsDescriptor {
    /**
     * Name of the constraint rule to apply, it must correspond with the validator funtion that implemnet
     * the validation logic for this constraint.
     * 
     * @see {@link Validator} for more informaton about the validator function of a constraint
     */
    constraintName: string
    /**
     * Map with the attribute's values required to validate the value.
     * 
     * It is a map, where the key is the name of the attibute (name of the attibute property of the constraint
     * annotation in Java), and the value is the attribute value.
     * 
     * Notable attibutes:
     * - groups:  List with the name of the groups requered to validate the value, if one of the groups name are 
     *            present in the list of allowed groups during the validaton process, this constraint is going to
     *            apply during the validation process
     * - message: Error message in case to be included in the violation of this constraint
     * 
     * @see {@link groupAllowed} to see how the groups are managed
     * @see {@link getMessage} to see how the error messages are created
     */
    attributes?: any & { groups?: string[], message?: string }
    /**
     * List with the composing constraint of this constraint. In order to consider a constraint as passed all
     * of its composing constraint must pass too.
     */
    composingConstraints?: ConstraintValidationsDescriptor[]
    /**
     * Indicate if the violation of a compossed constraint must be reported as a violation of this constraint,
     * otherwise, the composed constraint violations have its own violation report.
     */
    reportAsSingle?: boolean
    /**
     * If it is know this constraint have no validator associated.
     * 
     * @see {@link Validator} for more informaton about the validator function of a constraint
     */
    hasNoValidator?: boolean
    /**
     * Indicate if the default value of this constraint (indicated in property defaultValues of the corresponding 
     * validator) was already loaded in this constraint descriptor.
     * 
     * Note:
     * This porperty is setted to true during execution time, avoiding load multiple times the default values
     * 
     * @private
     * @see {@link Validator.defaultValues} for more information about the default value of a constraint
     * @see {@link loadDefaultConstraintValues} for more information about the process of load the default value into
     *                                          a constraint definition
     */
    defaultValuesLoaded?: boolean
}

/**
 * Represent a constraint violation report
 */
export interface Violation {
    /**
     * Violated constraint descriptor.
     * 
     * @see {@link ConstraintValidationsDescriptor} for more information about constraints
     */
    constraintDescriptor: ConstraintValidationsDescriptor
    /**
     * Value caused of the violation.
     */
    invalidValue: any
    /**
     * Error message template.
     */
    messageTemplate: string
    /**
     * Localized error message.
     */
    message: string
    /**
     * Invalid value path respect to the root object
     */
    propertyPath: string
}

/**
 * Validator function in charged of evalutate if a value is valid according to a constraint restriction.
 * 
 * Notes:
 * - This is a function that can have extra properties
 * - This function implements the logic associate to a constraint
 * - If the constraint fails no violation is requeried to be appended to the violations list
 * 
 * @param value            Value to be validated according to the constraint rules
 * @param attributes       Constraint attributes values used to test the validity of the tested value
 * @param constraint       Constraint definition of this validation
 * @param path             Value's path respect to the root object
 * @param globalViolations List where is going to be appended the extras violations found independent of the
 *                         current reportAsSingle constraint rule 
 * @param violations       List where is going to be appended the extras violations found
 * @returns                True if the value is valid, otherwise returns false
 * 
 * @see {@link VALIDATORS} for more information about register a constraint's implementation
 * @see {@link ConstraintValidationsDescriptor.attributes} for more information about constraint's attibutes
 */
export interface Validator {
    /**
     * Validator function in charged of evalutate if a value is valid according to a constraint restriction.
     * 
     * Notes:
     * - This is a function that can have extra properties
     * - This function implements the logic associate to a constraint
     * - If the constraint fails no violation is requeried to be appended to the violations list
     * 
     * @param value            Value to be validated according to the constraint rules
     * @param attributes       Constraint attributes values used to test the validity of the tested value
     * @param constraint       Constraint definition of this validation
     * @param path             Value's path respect to the root object
     * @param globalViolations List where is going to be appended the extras violations found independent of the
     *                         current reportAsSingle constraint rule 
     * @param violations       List where is going to be appended the extras violations found
     * @returns                True if the value is valid, otherwise returns false
     * 
     * @see {@link VALIDATORS} for more information about register a constraint's implementation
     * @see {@link ConstraintValidationsDescriptor.attributes} for more information about constraint's attibutes
     */
    (value: any, attributes: any, constraint: ConstraintValidationsDescriptor, path: string, globalViolations: Violation[], violations: Violation[]): boolean
    /**
     * Indicate if all violations of this constraint must be considered as a global one, independtly if it is part of
     * a composed constraint
     */
    isGlobalValidator?: boolean
    /**
     * Indicate if this constraint must be interpretated a a required rules in HTML Validations
     */
    isHtmlRequiredValidator?: boolean
    /**
     * Default value of the attributes of a constraint. It is a map, where the key is the name of the attibute
     * (name of the attibute property of the constraint annotation in Java), and the value is the default attribute
     * value.
     * 
     * Note:
     * If a constraint annotation in Java has default value, the default value must be also registered there
     * 
     * @see {@link ConstraintValidationsDescriptor.attributes} for more information about constraint attributes
     * @see {@link ConstraintValidationsDescriptor.defaultValuesLoaded} for more information about when the default 
     *                                                                  values are loaded into a constraint definition
     * @see {@link loadDefaultConstraintValues} for more information about the process of load the default value into
     *                                          a constraint definition
     */
    defaultValues?: { [propertyName: string]: any | undefined }
}

/**
 * Type with the name of a class, it must be a string whith the name of a class,
 * but, if tha class is have generaric arguments must be an array with the name
 * of the class and the type of each generic argument.
 * 
 * Note: 
 * The name of the class don't include the name of the package.
 * 
 * Example:
 * - The class String in Java must be translated to 'String'
 * - Tha class List<String> in Java must be translated to ['List', 'String']
 * - The class Map<String, Integer> in Java must be traslated to ['Map', 'String', 'Integer']
 * - The class Map<String, List<Integer> in Java must be translated to ['Map', 'String', ['List', 'Integer']]
 * - The class String[] in Java must be translated to ['Array', 'String']
 */
export type TypeName = string | string[];

/**
 * Functions in charged to translate the error messages.
 * 
 * @param template     Template of the error message to be translated, if the constraint have no message the default
 *                     message is '{constraintName}' where constraintName is the name of the constraint's type 
 * @param attributes   Object with the constraint's attributes used to validate the value
 * @param invalidValue Value that failed the constraint's validation
 * @returns            The error message translated in the user's language
 */
export type MessageFormatter = (template: string, attributes: any, invalidValue: any) => string

/* ********************************************************************************************
 * Constants & Values
 */

/**
 * Map with the type descriptor, where the key is a string with the name of the class (no generic class allowed here)
 * and the the value is the type descriptor or a type descriptor factory that create it.
 * 
 * Note:
 * The generic classes require here a type factory, a function that create the concrete type descriptor from the array
 * representation of the generic type.
 * 
 * Note: The name of the class don't include the name of the package.
 * 
 * @see {@link TypeValidationsDescriptor} for more information about type descriptors
 * @see {@link TypeValidationsDescriptorFactory} for more information about type descriptor factories
 */
export const TYPE_DESCRIPTORS: { [typeName: string]: TypeValidationsDescriptor | TypeValidationsDescriptorFactory | undefined } = {};

/**
 * Map with the group inherintance rules, where the key is the name of the group, an the value is an array with the 
 * name of the groups inherited by the key.
 * 
 * It map must contains the name of the validation groups defined in Java and the value must contains the name of 
 * the other gropus extended by this one.
 * 
 * Note: 
 * The name of the group is the name of the class without include the name of the package.
 */
export const GROUPS_INHERITANCE: { [groupName: string]: string[] | undefined } = {};

/**
 * Map with the constraint validators, where the key is a string with the name of the constranint annotation and the
 * value is the validator function of the constraint.
 * 
 * Note: 
 * The name of the class don't include the name of the package.
 * 
 * @see {@link Validator} for more informaton about the validator function of a constraint
 * @see {@link ConstraintValidationsDescriptor} for more information about constraints
 */
export const VALIDATORS: { [constraintName: string]: Validator | undefined } = {};

/**
 * Name of the default group for validation propouses
 */
export const DEFAULT_GROUP = 'Default';

/**
 * List with the default groups used duting the validation process.
 */
export const DEFAULT_GROUPS = [DEFAULT_GROUP];

/* ********************************************************************************************
 * Get / Set messageFormatter
 */

/**
 * Variable with the current message formatter to be used to translate the error messages.
 * 
 * @private
 * @see {@link MessageFormatter} for more information about message formatter
 * @see {@link getMessageFormatter} for get the current message formatter
 * @see {@link setMessageFormatter} for set the current message formatter
 */
var formatMessage: MessageFormatter = function (template: string, attributes: any, invalidValue: any): string {
    // Default error message generator
    return JSON.stringify({ template, attributes, invalidValue });
}

/**
 * Get the current message formatter to be used to translate the error messages.
 * 
 * @return The current message formatter to be used to translate the error messages
 * 
 * @see {@link setMessageFormatter} for set the current message formatter
 * @see {@link MessageFormatter} for more information about message formatter
 */
export function getMessageFormatter(): MessageFormatter {
    return formatMessage;
}

/**
 * Set the current message formatter to be used to translate the error messages.
 * 
 * @param formatter The message formatter to be used to translate the error messages
 * 
 * @see {@link getMessageFormatter} for get the current message formatter
 * @see {@link MessageFormatter} for more information about message formatter
 */
export function setMessageFormatter(formatter: MessageFormatter) {
    formatMessage = formatter;
}

/* ********************************************************************************************
 * Get descriptors
 */

/**
 * Get the type descriptor associated to a type name passed by argument. If the type is not found, add a
 * constraint violation of type 'TypeNotFound' and returns null.
 * 
 * @param typeName         Type name
 * @param value            Value to be used in the violation message as the current value to be validated
 * @param path             Path of the value
 * @param globalViolations List where is going to be appended a violation if the type descriptor was not found
 * @returns                The type descriptor, if it was found, otherwise null
 * 
 * @see {@link TypeName} for more information about how the type names are represented
 * @see {@link TypeValidationsDescriptor} for more information about type descriptors
 * @see {@link TYPE_DESCRIPTORS} for mor information about the type descriptor map
 * @see {@link Violation} for more information about violations
 */
export function getTypeDescriptor(typeName: TypeName, value: any, path: string, globalViolations: Violation[]): TypeValidationsDescriptor | null {
    const name = getSimpleNameWithoutGenericArguments(typeName);
    let typeDescriptor = TYPE_DESCRIPTORS[name];
    if (typeof typeDescriptor === 'function') {
        typeDescriptor = typeDescriptor(typeName);
    }
    if (!typeDescriptor) {
        const violatedConstraint: ConstraintValidationsDescriptor = { constraintName: 'TypeNotFound', attributes: { typeName: typeName } };
        addViolation(violatedConstraint, value, path, globalViolations);
        return null;
    }
    return typeDescriptor;
}

/**
 * Get the property descriptor associated to a property of a type which descriptor is passed by argument. If the 
 * property is not found, add a constraint violation of type 'PropertyNotFound' and returns null.
 * 
 * @param type               Class name with the property which descriptor is required
 * @param propertyName       Name of the property which descriptor is required
 * @param objectWithProperty Value with the property to be used in the violation messages as the current value to
 *                           be validated
 * @param path               Path of the value with the property
 * @param globalViolations   List where is going to be appended a violation if the porperty descriptor was not found
 * @returns                  The property descriptor, if it was found, otherwise null
 * 
 * @see {@link PropertyValidationsDescriptor} for more information about property descriptors
 * @see {@link TypeValidationsDescriptor} for more information about type descriptors
 * @see {@link Violation} for more information about violations
 */
export function getPropertyDescriptor(type: TypeValidationsDescriptor, objectWithProperty: any, propertyName: string | number, path: string, globalViolations: Violation[]): PropertyValidationsDescriptor | null {
    if (type.isCollection) {
        const valueDescriptor = type.valueDescriptor;
        if (valueDescriptor) {
            return valueDescriptor;
        }
    }

    const properties = type.properties;
    if (properties) {
        const property = properties[propertyName];
        if (property) {
            return property;
        }
    }
    const violatedConstraint: ConstraintValidationsDescriptor = { constraintName: 'PropertyNotFound', attributes: { typeName: type.typeName, propertyName } };
    addViolation(violatedConstraint, objectWithProperty, path, globalViolations);
    return null;
}

/**
 * Returns the simple name of a class, if the class is generic, returns the name of the class without the generic arguments.
 * 
 * @private
 * @param typeName Class name
 * @returns        Simple name of the class without generic arguments
 * 
 * @see {@link TypeName} for more information about how the type names are represented
 */
function getSimpleNameWithoutGenericArguments(typeName: TypeName): string {
    if (typeof typeName === 'string') {
        return typeName;
    } else {
        return typeName[0];
    }
}

/* ********************************************************************************************
 * Group functions
 */

/**
 * Verify if some of the candidate groups, or the inherited groups of it, are present en the list of allowed groups.
 * 
 * Verifiy if there are one group in list of candidate groups present in the list of allowed groups. Also is
 * verified if the each group in the list of candiadte groups inherited form other groups present in the list of
 * posible groups, if that happens the group is considered as allowed.
 * 
 * @param candidateGroups List of groups candidate to be allowed
 * @param allowedGroups   List of allowed groups
 * @returns               True if there is at least one group present in the list of allowed groups, 
 *                        if there are no one returns false
 */
export function groupAllowed(candidateGroups: string[], allowedGroups: string[] = DEFAULT_GROUPS): boolean {
    for (let i = 0, length = candidateGroups.length; i < length; i++) {
        const group = candidateGroups[i];
        if (allowedGroups.indexOf(group) >= 0) {
            return true;
        }
    }
    for (let j = 0, l = candidateGroups.length; j < l; j++) {
        const group = candidateGroups[j];
        const inherited = GROUPS_INHERITANCE[group];
        if (inherited && groupAllowed(inherited, allowedGroups)) {
            return true;
        }
    }
    return false;
}

/**
 * Apply the rules of group convertions, defined in Java using @ConvertGroup.
 * 
 * This method take the current groups and the group convertion rules and return a list with all group present 
 * in the the current group list, changing the name of it, according to the group conversion rules if it is
 * requeried.
 * 
 * @param currentGroups    List of groups with the current names
 * @param groupConversions Group conversion rules in order to change the name of a group
 * @returns                List of groups with theirs names changed if it was required
 */
export function convertGroups(currentGroups: string[], groupConversions?: GroupConversions): string[] {
    if (!groupConversions) {
        return currentGroups;
    }
    const cascadeGroups = [];
    for (let i = 0, length = currentGroups.length; i < length; i++) {
        const group = currentGroups[i];
        const mapped = groupConversions[group];
        if (mapped) {
            cascadeGroups.push(mapped);
        } else {
            cascadeGroups.push(group);
        }
    }
    return cascadeGroups;
}

/* ********************************************************************************************
 * Register a constraint violation
 */

/**
 * Create and register a constraint violation in the the violation list passed by argument.
 * 
 * @param constraint   Descriptor of the violated constraint
 * @param invalidValue Value that failed the constraint's validation
 * @param path         Path of the value
 * @param violations   List where is going to be appended the violation
 * 
 * @see {@link Violation} for more information about violations
 */
export function addViolation(constraint: ConstraintValidationsDescriptor, invalidValue: any, path: string, violations: Violation[]): void {
    const messageTemplate = getMessageTemplate(constraint);
    const violation: Violation = {
        constraintDescriptor: constraint,
        invalidValue: invalidValue,
        messageTemplate,
        message: formatMessage(messageTemplate, constraint.attributes, invalidValue),
        propertyPath: path
    };
    violations.push(violation);
}

/**
 * Get the template error message passed as the message attribute of a constraint, if it have no one, the 
 * default template message is created, it look like '{constraintName}' where constraintName is the name of
 * the constraint's type.
 * 
 * @private
 * @param constraint Descriptor of the constraint
 * @returns          Template of the error message
 * 
 * @see {@link ConstraintValidationsDescriptor} for more information about constraints
 * @see {@link ConstraintValidationsDescriptor.attributes} for more information about the attribute with the 
 *                                                         constraint message
 */
function getMessageTemplate(constraint: ConstraintValidationsDescriptor): string {
    let template = null;
    if (constraint.attributes) {
        template = constraint.attributes.message;
    }
    if (!template) {
        template = '{' + constraint.constraintName + '}';
    }
    return template;
}

/* ********************************************************************************************
 * Default values management in constraint
 */

/**
 * Load the default values of a constraint.
 * 
 * The default values of a constraint is stored in the 'defaultValues' property of the repective validator.
 * All properties defined in the defaultValues object are loaded into the constraint descriptor attributes if
 * there are absent in the defition.
 * 
 * At the end the flag 'defaultValuesLoaded' is added to the constraint descriptor to indicate that the default
 * values was already loaded in this constraint.
 * 
 * @param constraint Constraint definition where the default values ar going to be loaded
 * @param validator  Validator where the default values are going to be getted
 * 
 * @see {@link ConstraintValidationsDescriptor} for more information about constraints
 * @see {@link Validator} for more informaton about the validator function of a constraint
 * @see {@link Validator.defaultValues} for more information about the default value of a constraint
 * @see {@link ConstraintValidationsDescriptor.attributes} for more information about constraint attributes
 * @see {@link ConstraintValidationsDescriptor.defaultValuesLoaded} for more information about when the default 
 *                                                                  values are loaded into a constraint definition
 */
export function loadDefaultConstraintValues(constraint: ConstraintValidationsDescriptor, validator: Validator) {
    let defaultValues = validator.defaultValues;
    if (!defaultValues) {
        constraint.defaultValuesLoaded = true;
        return;
    }

    let attributes = constraint.attributes;
    if (!attributes) {
        attributes = {};
        constraint.attributes = attributes;
    }
    
    for (const key in defaultValues) {
        if (attributes[key] === undefined) {
            attributes[key] = defaultValues[key];
        }
    }

    constraint.defaultValuesLoaded = true;
}

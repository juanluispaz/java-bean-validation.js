import * as jbv from '../../src/index';

export interface TestValidatorRegistrationResult {
    violations: jbv.Violation[];
    globalViolations: jbv.Violation[];
    timesCalled: number;
    value: any;
}

export interface TestComposedValidatorRegistrationResult {
    violations: jbv.Violation[];
    globalViolations: jbv.Violation[];
    timesCalled: number;
    composedTimesCalled: number;
    value: any;
}

export interface TestPropertyValidatorRegistrationResult {
    violations: jbv.Violation[];
    globalViolations: jbv.Violation[];
    timesCalled: number;
    typeTimesCalled: number;
    propertyName: string;
    objectWithProperty: any;
}

const myValue = new String('myValue'); // intentionally as an object, in order to make cascade tests
export const myPath = 'myPath';

export function clean() {
    delete jbv.VALIDATORS.MyConstraint;
    delete jbv.VALIDATORS.MyComposedConstraint;
    delete jbv.VALIDATORS.MyPropertyTypeConstraint;
    delete jbv.TYPE_DESCRIPTORS.MyPropertyType;
}

export function getMyConstraintValidator(): jbv.Validator {
    var constraint = jbv.VALIDATORS.MyConstraint;
    if (constraint) {
        return constraint;
    }
    throw new Error('MyConstraintValidator not found');
}

export function getMyPropertyType(): jbv.TypeValidationsDescriptor {
    var myPropertyType = jbv.getTypeDescriptor('MyPropertyType', null, '', []);
    if (myPropertyType) {
        return myPropertyType;
    }
    throw new Error('MyPropertyType not found');
}
jbv.TYPE_DESCRIPTORS.MyPropertyType

export function registerMyConstraint(constraint: jbv.ConstraintValidationsDescriptor, path: string, validatorResult: boolean, mode?: 'EmptyViolations' | 'ViolationsAreGlobal') : TestValidatorRegistrationResult {
    var result = {
        violations: [],
        globalViolations: [],
        timesCalled: 0,
        value: myValue,
    };
    
    jbv.VALIDATORS.MyConstraint = (_value, _attributes, _constraint, _path, _globalViolations, _violations) => {
        expect(_value).toBe(result.value);
        if (constraint.attributes) {
            expect(_attributes).toBe(constraint.attributes);
        } else {
            expect(_attributes).toEqual({});
        }
        expect(_constraint).toBe(constraint);
        expect(_path).toBe(path);
        expect(_globalViolations).toBe(result.globalViolations);
        if (mode === 'ViolationsAreGlobal') {
            expect(_violations).toBe(result.globalViolations);
        } else if (mode === 'EmptyViolations') {
            expect(_violations).toEqual([]);
        } else {
            expect(_violations).toBe(result.violations);
        }
        result.timesCalled++;
        return validatorResult;
    }
    
    return result;
}

export function registerMyComposedConstraint(constraint: jbv.ConstraintValidationsDescriptor, path: string, validatorResult: boolean, composedValidatorResult: boolean, mode?: 'EmptyViolations' | 'ViolationsAreGlobal', composedMode?: 'EmptyViolations' | 'ViolationsAreGlobal') : TestComposedValidatorRegistrationResult {
    var result = {
        violations: [],
        globalViolations: [],
        timesCalled: 0,
        composedTimesCalled: 0,
        value: myValue
    };
    
    jbv.VALIDATORS.MyComposedConstraint = (_value, _attributes, _constraint, _path, _globalViolations, _violations) => {
        expect(_value).toBe(result.value);
        if (constraint.attributes) {
            expect(_attributes).toBe(constraint.attributes);
        } else {
            expect(_attributes).toEqual({});
        }
        expect(_constraint).toBe(constraint);
        expect(_path).toBe(path);
        expect(_globalViolations).toBe(result.globalViolations);
        if (composedMode === 'ViolationsAreGlobal') {
            expect(_violations).toBe(result.globalViolations);
        } else if (composedMode === 'EmptyViolations') {
            expect(_violations).toEqual([]);
        } else {
            expect(_violations).toBe(result.violations);
        }
        result.composedTimesCalled++;
        return composedValidatorResult;
    }
    
    jbv.VALIDATORS.MyConstraint = (_value, _attributes, _constraint, _path, _globalViolations, _violations) => {
        var composingConstraint;
        if (constraint.composingConstraints) {
            composingConstraint = constraint.composingConstraints[0];
        }
        expect(_value).toBe(result.value);
        if (composingConstraint && composingConstraint.attributes) {
            expect(_attributes).toBe(composingConstraint.attributes);
        } else {
            expect(_attributes).toEqual({});
        }
        expect(_constraint).toBe(composingConstraint);
        expect(_path).toBe(path);
        expect(_globalViolations).toBe(result.globalViolations);
        if (mode === 'ViolationsAreGlobal') {
            expect(_violations).toBe(result.globalViolations);
        } else if (mode === 'EmptyViolations') {
            expect(_violations).toEqual([]);
        } else {
            expect(_violations).toBe(result.violations);
        }
        result.timesCalled++;
        return validatorResult;
    }
    
    return result;
}

export const myPathErrors = {
    validatorNotFoundError: {
        constraintDescriptor: {
            attributes: {
                constraintName: "MyConstraintWithNoValidator"
            },
            constraintName: "ValidatorNotFound"
        },
        invalidValue: "myValue",
        message: '{"template":"{ValidatorNotFound}","attributes":{"constraintName":"MyConstraintWithNoValidator"},"invalidValue":"myValue"}',
        messageTemplate: "{ValidatorNotFound}",
        propertyPath: 'myPath'
    },
    
    validatorError: {
        constraintDescriptor: {
            constraintName: "MyConstraint",
            defaultValuesLoaded: true
        },
        invalidValue: "myValue",
        message: '{"template":"{MyConstraint}","invalidValue":"myValue"}',
        messageTemplate: "{MyConstraint}",
        propertyPath: 'myPath',
    },

    composedValidatorError: {
        constraintDescriptor: {
            constraintName: "MyComposedConstraint",
            defaultValuesLoaded: true,
            composingConstraints: [{
                constraintName: "MyConstraint",
                defaultValuesLoaded: true
            }]
        },
        invalidValue: "myValue",
        message: '{"template":"{MyComposedConstraint}","invalidValue":"myValue"}',
        messageTemplate: "{MyComposedConstraint}",
        propertyPath: 'myPath',
    },

    singledComposedValidatorError: {
        constraintDescriptor: {
            constraintName: "MyComposedConstraint",
            defaultValuesLoaded: true,
            reportAsSingle: true,
            composingConstraints: [{
                constraintName: "MyConstraint",
                defaultValuesLoaded: true
            }]
        },
        invalidValue: "myValue",
        message: '{"template":"{MyComposedConstraint}","invalidValue":"myValue"}',
        messageTemplate: "{MyComposedConstraint}",
        propertyPath: 'myPath',
    },
    
    objectError: {
        constraintDescriptor: {
            constraintName: "Object",
            defaultValuesLoaded: true
        },
        invalidValue: "myValue",
        message: '{"template":"{Object}","invalidValue":"myValue"}',
        messageTemplate: "{Object}",
        propertyPath: "myPath",
    }
};

export function registerMyPropertyConstraint(descriptor: jbv.PropertyValidationsDescriptor, path: string, typeValidatorResult: boolean, validatorResult: boolean, typeValidatorMode?: 'EmptyViolations' | 'ViolationsAreGlobal', validatorMode?: 'EmptyViolations' | 'ViolationsAreGlobal') : TestPropertyValidatorRegistrationResult {
    var result = {
        violations: [],
        globalViolations: [],
        timesCalled: 0,
        typeTimesCalled: 0,
        propertyName: 'myProperty',
        objectWithProperty: {
           myProperty: myValue
        }
    };

    jbv.TYPE_DESCRIPTORS.MyPropertyType = {
        typeName: 'MyPropertyType',
        constraints: [{
            constraintName: 'MyPropertyTypeConstraint'
        }]
    };
    
    
    jbv.VALIDATORS.MyPropertyTypeConstraint = (_value, _attributes, _constraint, _path, _globalViolations, _violations) => {
        var myPropertyType = getMyPropertyType();
        var typeConstraint;
        if (myPropertyType.constraints) {
            typeConstraint = myPropertyType.constraints[0];
        }
        if (Array.isArray(result.objectWithProperty)) {
            expect(_value).toBe(result.objectWithProperty[0]);
            expect(_path).toBe(path + '.0');
        } else {
            expect(_value).toBe(result.objectWithProperty.myProperty);
            expect(_path).toBe(path + '.myProperty');
        }
        if (typeConstraint && typeConstraint.attributes) {
            expect(_attributes).toBe(typeConstraint.attributes);
        } else {
            expect(_attributes).toEqual({});
        }
        expect(_constraint).toBe(typeConstraint);
        expect(_globalViolations).toBe(result.globalViolations);
        if (typeValidatorMode === 'ViolationsAreGlobal') {
            expect(_violations).toBe(result.globalViolations);
        } else if (typeValidatorMode === 'EmptyViolations') {
            expect(_violations).toEqual([]);
        } else {
            expect(_violations).toBe(result.violations);
        }
        result.typeTimesCalled++;
        return typeValidatorResult;
    }
    
    jbv.VALIDATORS.MyConstraint = (_value, _attributes, _constraint, _path, _globalViolations, _violations) => {
        var constraint;
        if (descriptor.constraints) {
            constraint = descriptor.constraints[0];
        }
        if (Array.isArray(result.objectWithProperty)) {
            expect(_value).toBe(result.objectWithProperty[0]);
            expect(_path).toBe(path + '.0');
        } else {
            expect(_value).toBe(result.objectWithProperty.myProperty);
            expect(_path).toBe(path + '.myProperty');
        }
        if (constraint && constraint.attributes) {
            expect(_attributes).toBe(constraint.attributes);
        } else {
            expect(_attributes).toEqual({});
        }
        expect(_constraint).toBe(constraint);
        expect(_globalViolations).toBe(result.globalViolations);
        if (validatorMode === 'ViolationsAreGlobal') {
            expect(_violations).toBe(result.globalViolations);
        } else if (validatorMode === 'EmptyViolations') {
            expect(_violations).toEqual([]);
        } else {
            expect(_violations).toBe(result.violations);
        }
        result.timesCalled++;
        return validatorResult;
    }
    
    return result;
}

export const myPropertyErrors = {
    typeNotFoundError: {
        constraintDescriptor: {
            attributes: {
                typeName: "MyPropertyType",
            },
            constraintName: "TypeNotFound"
        },
        invalidValue: "myValue",
        message: '{"template":"{TypeNotFound}","attributes":{"typeName":"MyPropertyType"},"invalidValue":"myValue"}',
        messageTemplate: "{TypeNotFound}",
        propertyPath: "myPath.myProperty"
    },
    
    validatorNotFoundError: {
        constraintDescriptor: {
            attributes: {
                constraintName: "MyConstraint",
            },
            constraintName: "ValidatorNotFound",
        },
        invalidValue: "myValue",
        message: '{"template":"{ValidatorNotFound}","attributes":{"constraintName":"MyConstraint"},"invalidValue":"myValue"}',
        messageTemplate: "{ValidatorNotFound}",
        propertyPath: "myPath.myProperty",
    },
    
    myPropertyTypeValidatorError: {
        constraintDescriptor: {
            constraintName: "MyPropertyTypeConstraint",
            defaultValuesLoaded: true
        },
        invalidValue: "myValue",
        message: '{"template":"{MyPropertyTypeConstraint}","invalidValue":"myValue"}',
        messageTemplate: "{MyPropertyTypeConstraint}",
        propertyPath: "myPath.myProperty"
    },
    
    propertyValidationError: {
        constraintDescriptor: {
            constraintName: "MyConstraint",
            defaultValuesLoaded: true
        },
        invalidValue: "myValue",
        message: '{"template":"{MyConstraint}","invalidValue":"myValue"}',
        messageTemplate: "{MyConstraint}",
        propertyPath: "myPath.myProperty"
    },
    
    indexValidationError: {
        constraintDescriptor: {
            constraintName: "MyConstraint",
            defaultValuesLoaded: true
        },
        invalidValue: "myValue",
        message: '{"template":"{MyConstraint}","invalidValue":"myValue"}',
        messageTemplate: "{MyConstraint}",
        propertyPath: "myPath.0"
    },
    
    undefinedPropertyValidationError: {
        constraintDescriptor: {
            constraintName: "MyConstraint",
            defaultValuesLoaded: true
        },
        invalidValue: undefined,
        message: '{"template":"{MyConstraint}"}',
        messageTemplate: "{MyConstraint}",
        propertyPath: "myPath.myProperty"
    },
    
    undefinedPropertyTypeValidationError: {
        constraintDescriptor: {
            constraintName: "MyPropertyTypeConstraint",
            defaultValuesLoaded: true
        },
        invalidValue: undefined,
        message: '{"template":"{MyPropertyTypeConstraint}"}',
        messageTemplate: "{MyPropertyTypeConstraint}",
        propertyPath: "myPath.myProperty"
    },
    
    objectError: {
        constraintDescriptor: {
            constraintName: "Object",
            defaultValuesLoaded: true
        },
        invalidValue: "myValue",
        message: '{"template":"{Object}","invalidValue":"myValue"}',
        messageTemplate: "{Object}",
        propertyPath: "myPath.myProperty",
    }
};
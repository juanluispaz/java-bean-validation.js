import * as jbv from '../../src/index';
import * as testUtils from './validateTestUtils';


var path = testUtils.myPath;
var groups = jbv.DEFAULT_GROUPS;
    
describe('#validateConstraintDescriptor', () => {
    afterEach(() => {
        testUtils.clean();
    });
    
    test ("Constraint with missing validator", () => {
        var constraint = {
            constraintName: 'MyConstraintWithNoValidator'
        }
        var test = testUtils.registerMyConstraint(constraint, path, true);
        
        var isValid = jbv.validateConstraintDescriptor(constraint, test.value, path, groups, test.violations, test.globalViolations);
        expect(isValid).toBe(true);
        expect(test.violations).toEqual([]);
        expect(test.globalViolations).toEqual([testUtils.myPathErrors.validatorNotFoundError]);
        expect(test.timesCalled).toBe(0);
    });

    test('Constraint without validator', () => {
        var constraint = {
            constraintName: 'MyConstraintWithNoValidator',
            hasNoValidator: true
        }
        var test = testUtils.registerMyConstraint(constraint, path, true);
        
        var isValid = jbv.validateConstraintDescriptor(constraint, test.value, path, groups, test.violations, test.globalViolations);
        expect(isValid).toBe(true);
        expect(test.violations).toEqual([]);
        expect(test.globalViolations).toEqual([]);
        expect(test.timesCalled).toBe(0);
    });        

    test('Constraint with validator', () => {
        var constraint = {
          constraintName: 'MyConstraint'
        };
        var test = testUtils.registerMyConstraint(constraint, path, true);
        
        var isValid = jbv.validateConstraintDescriptor(constraint, test.value, path, groups, test.violations, test.globalViolations);
        expect(isValid).toBe(true);
        expect(test.violations).toEqual([]);
        expect(test.globalViolations).toEqual([]);
        expect(test.timesCalled).toBe(1);
    });
    
    test('Constraint with empty attributes', () => {
        var constraint = {
            constraintName: 'MyConstraint',
            attributes: {}
        }
        var test = testUtils.registerMyConstraint(constraint, path, true);
        
        var isValid = jbv.validateConstraintDescriptor(constraint, test.value, path, groups, test.violations, test.globalViolations);
        expect(isValid).toBe(true);
        expect(test.violations).toEqual([]);
        expect(test.globalViolations).toEqual([]);
        expect(test.timesCalled).toBe(1);
    });
    
    test('Invalid value', () => {
        var constraint = {
          constraintName: 'MyConstraint'
        };
        var test = testUtils.registerMyConstraint(constraint, path, false);
        
        var isValid = jbv.validateConstraintDescriptor(constraint, test.value, path, groups, test.violations, test.globalViolations);
        expect(isValid).toBe(false);
        expect(test.violations).toEqual([testUtils.myPathErrors.validatorError]);
        expect(test.globalViolations).toEqual([]);
        expect(test.timesCalled).toBe(1);
    });

    test('Contraint with an inactive group', () => {
        var constraint = {
            constraintName: 'MyConstraint',
            attributes: {
                groups: ['MyGroup']
            }
        }
        var test = testUtils.registerMyConstraint(constraint, path, true);
        
        var isValid = jbv.validateConstraintDescriptor(constraint, test.value, path, groups, test.violations, test.globalViolations);
        expect(isValid).toBe(true);
        expect(test.violations).toEqual([]);
        expect(test.globalViolations).toEqual([]);
        expect(test.timesCalled).toBe(0);
    });   

    test('Constraint with global validator and invalid value', () => {
        var constraint = {
          constraintName: 'MyConstraint'
        };
        var test = testUtils.registerMyConstraint(constraint, path, false, 'ViolationsAreGlobal');
        testUtils.getMyConstraintValidator().isGlobalValidator = true;

        var isValid = jbv.validateConstraintDescriptor(constraint, test.value, path, groups, test.violations, test.globalViolations);
        expect(isValid).toBe(false);
        expect(test.violations).toEqual([]);
        expect(test.globalViolations).toEqual([testUtils.myPathErrors.validatorError]);
        expect(test.timesCalled).toBe(1);
    });

    test('Constraint with default values', () => {
        var constraint = {
            constraintName: 'MyConstraint'
        };
        var test = testUtils.registerMyConstraint(constraint, path, true);
        testUtils.getMyConstraintValidator().defaultValues = {
            default1: 'default1Value',
            default2: 'default2Value'
        };
        
        var isValid = jbv.validateConstraintDescriptor(constraint, test.value, path, groups, test.violations, test.globalViolations);
        expect(isValid).toBe(true);
        expect(test.violations).toEqual([]);
        expect(test.globalViolations).toEqual([]);
        expect(test.timesCalled).toBe(1);
        expect(constraint).toEqual({
            constraintName: 'MyConstraint',
            defaultValuesLoaded: true,
            attributes: {
                default1: 'default1Value',
                default2: 'default2Value'
            }
        });
    });
});

describe('#validateConstraintDescriptor with composed constraint', () => {
    afterEach(() => {
        testUtils.clean();
    });
    
    test('Valid composed constraint with valid composing constraint', () => {
        var composedConstraint = {
            constraintName: 'MyComposedConstraint',
            composingConstraints: [{
                constraintName: 'MyConstraint'
            }]
        };
        var test = testUtils.registerMyComposedConstraint(composedConstraint, path, true, true);
        
        var isValid = jbv.validateConstraintDescriptor(composedConstraint, test.value, path, groups, test.violations, test.globalViolations);
        expect(isValid).toBe(true);
        expect(test.violations).toEqual([]);
        expect(test.globalViolations).toEqual([]);
        expect(test.timesCalled).toBe(1);
        expect(test.composedTimesCalled).toBe(1);
    });
    
    test('Invalid composed constraint with valid composing constraint', () => {
        var composedConstraint = {
            constraintName: 'MyComposedConstraint',
            composingConstraints: [{
                constraintName: 'MyConstraint'
            }]
        };
        var test = testUtils.registerMyComposedConstraint(composedConstraint, path, true, false);
        
        var isValid = jbv.validateConstraintDescriptor(composedConstraint, test.value, path, groups, test.violations, test.globalViolations);
        expect(isValid).toBe(false);
        expect(test.violations).toEqual([testUtils.myPathErrors.composedValidatorError]);
        expect(test.globalViolations).toEqual([]);
        expect(test.timesCalled).toBe(1);
        expect(test.composedTimesCalled).toBe(1);
    });
    
    test('Valid composed constraint with invalid composing constraint', () => {
        var composedConstraint = {
            constraintName: 'MyComposedConstraint',
            composingConstraints: [{
                constraintName: 'MyConstraint'
            }]
        };
        var test = testUtils.registerMyComposedConstraint(composedConstraint, path, false, true);
        
        var isValid = jbv.validateConstraintDescriptor(composedConstraint, test.value, path, groups, test.violations, test.globalViolations);
        expect(isValid).toBe(false);
        expect(test.violations).toEqual([testUtils.myPathErrors.validatorError, testUtils.myPathErrors.composedValidatorError]); // order is relevant
        expect(test.globalViolations).toEqual([]);
        expect(test.timesCalled).toBe(1);
        expect(test.composedTimesCalled).toBe(1);
    });
    
    test('Invalid composed constraint with invalid composing constraint', () => {
        var composedConstraint = {
            constraintName: 'MyComposedConstraint',
            composingConstraints: [{
                constraintName: 'MyConstraint'
            }]
        };
        var test = testUtils.registerMyComposedConstraint(composedConstraint, path, false, false);
        
        var isValid = jbv.validateConstraintDescriptor(composedConstraint, test.value, path, groups, test.violations, test.globalViolations);
        expect(isValid).toBe(false);
        expect(test.violations).toEqual([testUtils.myPathErrors.validatorError, testUtils.myPathErrors.composedValidatorError]); // order is relevant
        expect(test.globalViolations).toEqual([]);
        expect(test.timesCalled).toBe(1);
        expect(test.composedTimesCalled).toBe(1);
    });
});

describe('#validateConstraintDescriptor with composed constraint and report as single', () => {
    afterEach(() => {
        testUtils.clean();
    });
    
    test('Invalid composed constraint with valid composing constraint and report as single', () => {
        var composedConstraint = {
            constraintName: 'MyComposedConstraint',
            composingConstraints: [{
                constraintName: 'MyConstraint'
            }],
            reportAsSingle: true
        };
        var test = testUtils.registerMyComposedConstraint(composedConstraint, path, true, false, 'EmptyViolations');
        
        var isValid = jbv.validateConstraintDescriptor(composedConstraint, test.value, path, groups, test.violations, test.globalViolations);
        expect(isValid).toBe(false);
        expect(test.violations).toEqual([testUtils.myPathErrors.singledComposedValidatorError]);
        expect(test.globalViolations).toEqual([]);
        expect(test.timesCalled).toBe(1);
        expect(test.composedTimesCalled).toBe(1);
    });
    
    test('Valid composed constraint with invalid composing constraint and report as single', () => {
        var composedConstraint = {
            constraintName: 'MyComposedConstraint',
            composingConstraints: [{
                constraintName: 'MyConstraint'
            }],
            reportAsSingle: true
        };
        var test = testUtils.registerMyComposedConstraint(composedConstraint, path, false, true, 'EmptyViolations');
        
        var isValid = jbv.validateConstraintDescriptor(composedConstraint, test.value, path, groups, test.violations, test.globalViolations);
        expect(isValid).toBe(false);
        expect(test.violations).toEqual([testUtils.myPathErrors.singledComposedValidatorError]);
        expect(test.globalViolations).toEqual([]);
        expect(test.timesCalled).toBe(1);
        expect(test.composedTimesCalled).toBe(1);
    });
    
    test('Invalid composed constraint with invalid composing constraint and report as single', () => {
        var composedConstraint = {
            constraintName: 'MyComposedConstraint',
            composingConstraints: [{
                constraintName: 'MyConstraint'
            }],
            reportAsSingle: true
        };
        var test = testUtils.registerMyComposedConstraint(composedConstraint, path, false, false, 'EmptyViolations');
        
        var isValid = jbv.validateConstraintDescriptor(composedConstraint, test.value, path, groups, test.violations, test.globalViolations);
        expect(isValid).toBe(false);
        expect(test.violations).toEqual([testUtils.myPathErrors.singledComposedValidatorError]);
        expect(test.globalViolations).toEqual([]);
        expect(test.timesCalled).toBe(1);
        expect(test.composedTimesCalled).toBe(1);
    });
});

describe('#validatePropertyDescriptor', () => {
    afterEach(() => {
        testUtils.clean();
    });
    
    test('Missing type descriptor', () => {
        var property = {
            porpertyTypeName: 'MyPropertyType',
            constraints: [{
                constraintName: 'MyConstraint'
            }]
        };
        var test = testUtils.registerMyPropertyConstraint(property, path, true, true, 'ViolationsAreGlobal');
        delete jbv.TYPE_DESCRIPTORS.MyPropertyType;
        delete jbv.VALIDATORS.MyPropertyTypeConstraint;
        delete jbv.VALIDATORS.MyConstraint;
        
        jbv.validatePropertyDescriptor(property, test.propertyName, test.objectWithProperty, path, groups, test.violations, test.globalViolations);
        expect(test.violations).toEqual([]);
        expect(test.globalViolations).toEqual([testUtils.myPropertyErrors.typeNotFoundError]);
        expect(test.timesCalled).toBe(0);
        expect(test.typeTimesCalled).toBe(0);
    });
    
    test('Missing validator', () => {
        var property = {
            porpertyTypeName: 'MyPropertyType',
            constraints: [{
                constraintName: 'MyConstraint'
            }]
        };
        var test = testUtils.registerMyPropertyConstraint(property, path, true, true, 'ViolationsAreGlobal');
        delete jbv.VALIDATORS.MyConstraint;
        
        jbv.validatePropertyDescriptor(property, test.propertyName, test.objectWithProperty, path, groups, test.violations, test.globalViolations);
        expect(test.violations).toEqual([]);
        expect(test.globalViolations).toEqual([testUtils.myPropertyErrors.validatorNotFoundError]);
        expect(test.timesCalled).toBe(0);
        expect(test.typeTimesCalled).toBe(0);
    });
    
    test('Valid', () => {
        var property = {
            porpertyTypeName: 'MyPropertyType',
            constraints: [{
                constraintName: 'MyConstraint'
            }]
        };
        var test = testUtils.registerMyPropertyConstraint(property, path, true, true, 'ViolationsAreGlobal');
        
        jbv.validatePropertyDescriptor(property, test.propertyName, test.objectWithProperty, path, groups, test.violations, test.globalViolations);
        expect(test.violations).toEqual([]);
        expect(test.globalViolations).toEqual([]);
        expect(test.timesCalled).toBe(1);
        expect(test.typeTimesCalled).toBe(0);
    });
    
    test('Valid spite type validator', () => {
        var property = {
            porpertyTypeName: 'MyPropertyType',
            constraints: [{
                constraintName: 'MyConstraint'
            }]
        };
        var test = testUtils.registerMyPropertyConstraint(property, path, false, true, 'ViolationsAreGlobal');
        
        jbv.validatePropertyDescriptor(property, test.propertyName, test.objectWithProperty, path, groups, test.violations, test.globalViolations);
        expect(test.violations).toEqual([]);
        expect(test.globalViolations).toEqual([]);
        expect(test.timesCalled).toBe(1);
        expect(test.typeTimesCalled).toBe(0);
    });
});

describe('#validatePropertyDescriptor with basic type', () => {
    afterEach(() => {
        testUtils.clean();
    });
    
    test('Valid basic type', () => {
        var property = {
            porpertyTypeName: 'MyPropertyType',
            constraints: [{
                constraintName: 'MyConstraint'
            }]
        };
        var test = testUtils.registerMyPropertyConstraint(property, path, true, true, 'ViolationsAreGlobal');
        testUtils.getMyPropertyType().isBasicType = true;
        
        jbv.validatePropertyDescriptor(property, test.propertyName, test.objectWithProperty, path, groups, test.violations, test.globalViolations);
        expect(test.violations).toEqual([]);
        expect(test.globalViolations).toEqual([]);
        expect(test.timesCalled).toBe(1);
        expect(test.typeTimesCalled).toBe(1);
    });
    
    test('Invalid basic type acording to type validator', () => {
        var property = {
            porpertyTypeName: 'MyPropertyType',
            constraints: [{
                constraintName: 'MyConstraint'
            }]
        };
        var test = testUtils.registerMyPropertyConstraint(property, path, false, true, 'ViolationsAreGlobal');
        testUtils.getMyPropertyType().isBasicType = true;
        
        jbv.validatePropertyDescriptor(property, test.propertyName, test.objectWithProperty, path, groups, test.violations, test.globalViolations);
        expect(test.violations).toEqual([]);
        expect(test.globalViolations).toEqual([testUtils.myPropertyErrors.myPropertyTypeValidatorError]);
        expect(test.timesCalled).toBe(1);
        expect(test.typeTimesCalled).toBe(1);
    });

    test('Invalid basic type acording to validator and type validator', () => {
        var property = {
            porpertyTypeName: 'MyPropertyType',
            constraints: [{
                constraintName: 'MyConstraint'
            }]
        };
        var test = testUtils.registerMyPropertyConstraint(property, path, false, false, 'ViolationsAreGlobal');
        testUtils.getMyPropertyType().isBasicType = true;
        
        jbv.validatePropertyDescriptor(property, test.propertyName, test.objectWithProperty, path, groups, test.violations, test.globalViolations);
        expect(test.violations).toEqual([testUtils.myPropertyErrors.propertyValidationError]);
        expect(test.globalViolations).toEqual([testUtils.myPropertyErrors.myPropertyTypeValidatorError]);
        expect(test.timesCalled).toBe(1);
        expect(test.typeTimesCalled).toBe(1);
    });
    
    test('Invalid basic type acording to validator and type validator (mixed violations)', () => {
        var property = {
            porpertyTypeName: 'MyPropertyType',
            constraints: [{
                constraintName: 'MyConstraint'
            }]
        };
        var test = testUtils.registerMyPropertyConstraint(property, path, false, false, 'ViolationsAreGlobal');
        test.globalViolations = test.violations;
        testUtils.getMyPropertyType().isBasicType = true;
        
        jbv.validatePropertyDescriptor(property, test.propertyName, test.objectWithProperty, path, groups, test.violations, test.globalViolations);
        expect(test.violations).toEqual([testUtils.myPropertyErrors.myPropertyTypeValidatorError, testUtils.myPropertyErrors.propertyValidationError]); // order is relevant
        expect(test.timesCalled).toBe(1);
        expect(test.typeTimesCalled).toBe(1);
    });
    
    test('Invalid basic type without property constraint', () => {
        var property = {
            porpertyTypeName: 'MyPropertyType'
        };
        var test = testUtils.registerMyPropertyConstraint(property, path, false, false, 'ViolationsAreGlobal');
        testUtils.getMyPropertyType().isBasicType = true;
        
        jbv.validatePropertyDescriptor(property, test.propertyName, test.objectWithProperty, path, groups, test.violations, test.globalViolations);
        expect(test.violations).toEqual([]);
        expect(test.globalViolations).toEqual([testUtils.myPropertyErrors.myPropertyTypeValidatorError]);
        expect(test.timesCalled).toBe(0);
        expect(test.typeTimesCalled).toBe(1);
    });

    test('Invalid basic type with null object with property', () => {
        var property = {
            porpertyTypeName: 'MyPropertyType',
            constraints: [{
                constraintName: 'MyConstraint'
            }]
        };
        var test = testUtils.registerMyPropertyConstraint(property, path, false, false, 'ViolationsAreGlobal');
        testUtils.getMyPropertyType().isBasicType = true;
        test.objectWithProperty.myProperty = undefined;
        
        jbv.validatePropertyDescriptor(property, test.propertyName, null, path, groups, test.violations, test.globalViolations);
        expect(test.violations).toEqual([testUtils.myPropertyErrors.undefinedPropertyValidationError]);
        expect(test.globalViolations).toEqual([testUtils.myPropertyErrors.undefinedPropertyTypeValidationError]);
        expect(test.timesCalled).toBe(1);
        expect(test.typeTimesCalled).toBe(1);
    });

    test('Invalid basic type with undefined object with property', () => {
        var property = {
            porpertyTypeName: 'MyPropertyType',
            constraints: [{
                constraintName: 'MyConstraint'
            }]
        };
        var test = testUtils.registerMyPropertyConstraint(property, path, false, false, 'ViolationsAreGlobal');
        testUtils.getMyPropertyType().isBasicType = true;
        test.objectWithProperty.myProperty = undefined;
        
        jbv.validatePropertyDescriptor(property, test.propertyName, undefined, path, groups, test.violations, test.globalViolations);
        expect(test.violations).toEqual([testUtils.myPropertyErrors.undefinedPropertyValidationError]);
        expect(test.globalViolations).toEqual([testUtils.myPropertyErrors.undefinedPropertyTypeValidationError]);
        expect(test.timesCalled).toBe(1);
        expect(test.typeTimesCalled).toBe(1);
    });
});

describe('#validatePropertyDescriptor with cascade', () => {
    afterEach(() => {
        testUtils.clean();
    });
    
    test('Valid cascade type', () => {
        var property = {
            porpertyTypeName: 'MyPropertyType',
            constraints: [{
                constraintName: 'MyConstraint'
            }],
            cascade: true
        };
        var test = testUtils.registerMyPropertyConstraint(property, path, true, true);
        
        jbv.validatePropertyDescriptor(property, test.propertyName, test.objectWithProperty, path, groups, test.violations, test.globalViolations);
        expect(test.violations).toEqual([]);
        expect(test.globalViolations).toEqual([]);
        expect(test.timesCalled).toBe(1);
        expect(test.typeTimesCalled).toBe(1);
    });
    
    test('Invalid cascade type acording to type validator', () => {
        var property = {
            porpertyTypeName: 'MyPropertyType',
            constraints: [{
                constraintName: 'MyConstraint'
            }],
            cascade: true
        };
        var test = testUtils.registerMyPropertyConstraint(property, path, false, true);
        
        jbv.validatePropertyDescriptor(property, test.propertyName, test.objectWithProperty, path, groups, test.violations, test.globalViolations);
        expect(test.violations).toEqual([testUtils.myPropertyErrors.myPropertyTypeValidatorError]);
        expect(test.globalViolations).toEqual([]);
        expect(test.timesCalled).toBe(1);
        expect(test.typeTimesCalled).toBe(1);
    });

    test('Invalid cascade type acording to validator and type validator', () => {
        var property = {
            porpertyTypeName: 'MyPropertyType',
            constraints: [{
                constraintName: 'MyConstraint'
            }],
            cascade: true
        };
        var test = testUtils.registerMyPropertyConstraint(property, path, false, false);
        
        jbv.validatePropertyDescriptor(property, test.propertyName, test.objectWithProperty, path, groups, test.violations, test.globalViolations);
        expect(test.violations).toEqual([testUtils.myPropertyErrors.myPropertyTypeValidatorError, testUtils.myPropertyErrors.propertyValidationError]);
        expect(test.globalViolations).toEqual([]);
        expect(test.timesCalled).toBe(1);
        expect(test.typeTimesCalled).toBe(1);
    });
    
    test('Invalid cascade type acording to validator and type validator', () => {
        var property = {
            porpertyTypeName: 'MyPropertyType',
            constraints: [{
                constraintName: 'MyConstraint'
            }],
            cascade: true
        };
        var test = testUtils.registerMyPropertyConstraint(property, path, false, false);
        test.globalViolations = test.violations;
        
        jbv.validatePropertyDescriptor(property, test.propertyName, test.objectWithProperty, path, groups, test.violations, test.globalViolations);
        expect(test.violations).toEqual([testUtils.myPropertyErrors.myPropertyTypeValidatorError, testUtils.myPropertyErrors.propertyValidationError]); // order is relevant
        expect(test.timesCalled).toBe(1);
        expect(test.typeTimesCalled).toBe(1);
    });
    
    test('Invalid cascade type without property constraint', () => {
        var property = {
            porpertyTypeName: 'MyPropertyType',
            cascade: true
        };
        var test = testUtils.registerMyPropertyConstraint(property, path, false, false);
        
        jbv.validatePropertyDescriptor(property, test.propertyName, test.objectWithProperty, path, groups, test.violations, test.globalViolations);
        expect(test.violations).toEqual([testUtils.myPropertyErrors.myPropertyTypeValidatorError]);
        expect(test.globalViolations).toEqual([]);
        expect(test.timesCalled).toBe(0);
        expect(test.typeTimesCalled).toBe(1);
    });

    test('Invalid cascade type with null object with property', () => {
        var property = {
            porpertyTypeName: 'MyPropertyType',
            constraints: [{
                constraintName: 'MyConstraint'
            }],
            cascade: true
        };
        var test = testUtils.registerMyPropertyConstraint(property, path, false, false);
        test.objectWithProperty.myProperty = undefined;
        
        jbv.validatePropertyDescriptor(property, test.propertyName, null, path, groups, test.violations, test.globalViolations);
        expect(test.violations).toEqual([testUtils.myPropertyErrors.undefinedPropertyTypeValidationError, testUtils.myPropertyErrors.undefinedPropertyValidationError]);
        expect(test.globalViolations).toEqual([]);
        expect(test.timesCalled).toBe(1);
        expect(test.typeTimesCalled).toBe(1);
    });

    test('Invalid cascade type with undefined object with property', () => {
        var property = {
            porpertyTypeName: 'MyPropertyType',
            constraints: [{
                constraintName: 'MyConstraint'
            }],
            cascade: true
        };
        var test = testUtils.registerMyPropertyConstraint(property, path, false, false);
        test.objectWithProperty.myProperty = undefined;
        
        jbv.validatePropertyDescriptor(property, test.propertyName, undefined, path, groups, test.violations, test.globalViolations);
        expect(test.violations).toEqual([testUtils.myPropertyErrors.undefinedPropertyTypeValidationError, testUtils.myPropertyErrors.undefinedPropertyValidationError]);
        expect(test.globalViolations).toEqual([]);
        expect(test.timesCalled).toBe(1);
        expect(test.typeTimesCalled).toBe(1);
    });
});

describe('#validateTypeDescriptor', () => {
    afterEach(() => {
        testUtils.clean();
    });
    
    test('Valid cascade type', () => {
        var property = {
            porpertyTypeName: 'MyPropertyType',
            constraints: [{
                constraintName: 'MyConstraint'
            }],
            cascade: true
        };
        var type = {
            typeName: 'MyType',
            properties: {
                myProperty: property
            }
        };
        var test = testUtils.registerMyPropertyConstraint(property, path, true, true);
        
        jbv.validateTypeDescriptor(type, test.objectWithProperty, path, groups, test.violations, test.globalViolations);
        expect(test.violations).toEqual([]);
        expect(test.globalViolations).toEqual([]);
        expect(test.timesCalled).toBe(1);
        expect(test.typeTimesCalled).toBe(1);
    });
    
    test('Invalid cascade type', () => {
        var property = {
            porpertyTypeName: 'MyPropertyType',
            constraints: [{
                constraintName: 'MyConstraint'
            }],
            cascade: true
        };
        var type = {
            typeName: 'MyType',
            properties: {
                myProperty: property
            }
        };
        var test = testUtils.registerMyPropertyConstraint(property, path, true, false);
        
        jbv.validateTypeDescriptor(type, test.objectWithProperty, path, groups, test.violations, test.globalViolations);
        expect(test.violations).toEqual([testUtils.myPropertyErrors.propertyValidationError]);
        expect(test.globalViolations).toEqual([]);
        expect(test.timesCalled).toBe(1);
        expect(test.typeTimesCalled).toBe(1);
    });
    
    test('Invalid cascade basic type', () => {
        var property = {
            porpertyTypeName: 'MyPropertyType',
            constraints: [{
                constraintName: 'MyConstraint'
            }],
            cascade: true
        };
        var type = {
            typeName: 'MyType',
            properties: {
                myProperty: property
            },
            isBasicType: true
        };
        var test = testUtils.registerMyPropertyConstraint(property, path, true, false, 'EmptyViolations', 'EmptyViolations');
        
        jbv.validateTypeDescriptor(type, test.objectWithProperty, path, groups, test.violations, test.globalViolations);
        expect(test.violations).toEqual([]);
        expect(test.globalViolations).toEqual([testUtils.myPropertyErrors.propertyValidationError]);
        expect(test.timesCalled).toBe(1);
        expect(test.typeTimesCalled).toBe(1);
    });
    
    test('Null cascade type', () => {
        var property = {
            porpertyTypeName: 'MyPropertyType',
            constraints: [{
                constraintName: 'MyConstraint'
            }],
            cascade: true
        };
        var type = {
            typeName: 'MyType',
            properties: {
                myProperty: property
            }
        };
        var test = testUtils.registerMyPropertyConstraint(property, path, true, true);
        
        jbv.validateTypeDescriptor(type, null, path, groups, test.violations, test.globalViolations);
        expect(test.violations).toEqual([]);
        expect(test.globalViolations).toEqual([]);
        expect(test.timesCalled).toBe(0);
        expect(test.typeTimesCalled).toBe(0);
    });
    
    test('Undefined cascade type', () => {
        var property = {
            porpertyTypeName: 'MyPropertyType',
            constraints: [{
                constraintName: 'MyConstraint'
            }],
            cascade: true
        };
        var type = {
            typeName: 'MyType',
            properties: {
                myProperty: property
            }
        };
        var test = testUtils.registerMyPropertyConstraint(property, path, true, true);
        
        jbv.validateTypeDescriptor(type, undefined, path, groups, test.violations, test.globalViolations);
        expect(test.violations).toEqual([]);
        expect(test.globalViolations).toEqual([]);
        expect(test.timesCalled).toBe(0);
        expect(test.typeTimesCalled).toBe(0);
    });
    
    test('Valid contrained type', () => {
        var constraint = {
          constraintName: 'MyConstraint'
        };
        var test = testUtils.registerMyConstraint(constraint, path, true);
        
        var type = {
            typeName: 'MyType',
            constraints: [constraint]
        }
        
        jbv.validateTypeDescriptor(type, test.value, path, groups, test.violations, test.globalViolations);
        expect(test.violations).toEqual([]);
        expect(test.globalViolations).toEqual([]);
        expect(test.timesCalled).toBe(1);
    });
    
    test('Not object invalid object contraint', () => {
        var constraint = {
          constraintName: 'MyConstraint'
        };
        var test = testUtils.registerMyConstraint(constraint, path, true);
        
        var type = {
            typeName: 'MyType',
            constraints: [constraint]
        }
        test.value = test.value.toString();
        
        jbv.validateTypeDescriptor(type, test.value, path, groups, test.violations, test.globalViolations);
        expect(test.violations).toEqual([]);
        expect(test.globalViolations).toEqual([testUtils.myPathErrors.objectError]);
        expect(test.timesCalled).toBe(1);
    });
    
    test('Not object basic type object contraint ignored', () => {
        var constraint = {
          constraintName: 'MyConstraint'
        };
        var test = testUtils.registerMyConstraint(constraint, path, true, 'EmptyViolations');
        
        var type = {
            typeName: 'MyType',
            constraints: [constraint],
            isBasicType: true
        }
        test.value = test.value.toString();
        
        jbv.validateTypeDescriptor(type, test.value, path, groups, test.violations, test.globalViolations);
        expect(test.violations).toEqual([]);
        expect(test.globalViolations).toEqual([]);
        expect(test.timesCalled).toBe(1);
    });
    
    test('Invalid contrained type', () => {
        var constraint = {
          constraintName: 'MyConstraint'
        };
        var test = testUtils.registerMyConstraint(constraint, path, false);
        
        var type = {
            typeName: 'MyType',
            constraints: [constraint]
        }
        
        jbv.validateTypeDescriptor(type, test.value, path, groups, test.violations, test.globalViolations);
        expect(test.violations).toEqual([testUtils.myPathErrors.validatorError]);
        expect(test.globalViolations).toEqual([]);
        expect(test.timesCalled).toBe(1);
    });
    
    test('Invalid contrained type', () => {
        var constraint = {
          constraintName: 'MyConstraint'
        };
        var test = testUtils.registerMyConstraint(constraint, path, false, 'EmptyViolations');
        
        var type = {
            typeName: 'MyType',
            constraints: [constraint],
            isBasicType: true
        }
        
        jbv.validateTypeDescriptor(type, test.value, path, groups, test.violations, test.globalViolations);
        expect(test.violations).toEqual([]);
        expect(test.globalViolations).toEqual([testUtils.myPathErrors.validatorError]);
        expect(test.timesCalled).toBe(1);
    });
});

describe('#validateTypeDescriptor with collections', () => {
    afterEach(() => {
        testUtils.clean();
    });

    test('Valid without descriptor', () => {
        var property = {
            porpertyTypeName: 'MyPropertyType',
            constraints: [{
                constraintName: 'MyConstraint'
            }],
            cascade: true
        };
        var type = {
            typeName: 'MyType',
            isCollection: true
        };
        var test = testUtils.registerMyPropertyConstraint(property, path, true, true);
        
        jbv.validateTypeDescriptor(type, test.objectWithProperty, path, groups, test.violations, test.globalViolations);
        expect(test.violations).toEqual([]);
        expect(test.globalViolations).toEqual([]);
        expect(test.timesCalled).toBe(0);
        expect(test.typeTimesCalled).toBe(0);
    });
    
    test('Valid object', () => {
        var property = {
            porpertyTypeName: 'MyPropertyType',
            constraints: [{
                constraintName: 'MyConstraint'
            }],
            cascade: true
        };
        var type = {
            typeName: 'MyType',
            isCollection: true,
            valueDescriptor: property
        };
        var test = testUtils.registerMyPropertyConstraint(property, path, true, true);
        
        jbv.validateTypeDescriptor(type, test.objectWithProperty, path, groups, test.violations, test.globalViolations);
        expect(test.violations).toEqual([]);
        expect(test.globalViolations).toEqual([]);
        expect(test.timesCalled).toBe(1);
        expect(test.typeTimesCalled).toBe(1);
    });
    
    test('Invalid object', () => {
        var property = {
            porpertyTypeName: 'MyPropertyType',
            constraints: [{
                constraintName: 'MyConstraint'
            }],
            cascade: true
        };
        var type = {
            typeName: 'MyType',
            isCollection: true,
            valueDescriptor: property
        };
        var test = testUtils.registerMyPropertyConstraint(property, path, true, false);
        
        jbv.validateTypeDescriptor(type, test.objectWithProperty, path, groups, test.violations, test.globalViolations);
        expect(test.violations).toEqual([testUtils.myPropertyErrors.propertyValidationError]);
        expect(test.globalViolations).toEqual([]);
        expect(test.timesCalled).toBe(1);
        expect(test.typeTimesCalled).toBe(1);
    });

    test('Valid array', () => {
        var property = {
            porpertyTypeName: 'MyPropertyType',
            constraints: [{
                constraintName: 'MyConstraint'
            }],
            cascade: true
        };
        var type = {
            typeName: 'MyType',
            isCollection: true,
            valueDescriptor: property
        };
        var test = testUtils.registerMyPropertyConstraint(property, path, true, true);
        test.objectWithProperty = [test.objectWithProperty.myProperty];
        
        jbv.validateTypeDescriptor(type, test.objectWithProperty, path, groups, test.violations, test.globalViolations);
        expect(test.violations).toEqual([]);
        expect(test.globalViolations).toEqual([]);
        expect(test.timesCalled).toBe(1);
        expect(test.typeTimesCalled).toBe(1);
    });
    
    test('Invalid array', () => {
        var property = {
            porpertyTypeName: 'MyPropertyType',
            constraints: [{
                constraintName: 'MyConstraint'
            }],
            cascade: true
        };
        var type = {
            typeName: 'MyType',
            isCollection: true,
            valueDescriptor: property
        };
        var test = testUtils.registerMyPropertyConstraint(property, path, true, false);
        test.objectWithProperty = [test.objectWithProperty.myProperty];
        
        jbv.validateTypeDescriptor(type, test.objectWithProperty, path, groups, test.violations, test.globalViolations);
        expect(test.violations).toEqual([testUtils.myPropertyErrors.indexValidationError]);
        expect(test.globalViolations).toEqual([]);
        expect(test.timesCalled).toBe(1);
        expect(test.typeTimesCalled).toBe(1);
    });
});

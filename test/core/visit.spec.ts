import * as jbv from '../../src/index';
import * as testUtils from './validateTestUtils';


var path = testUtils.myPath;
var groups = jbv.DEFAULT_GROUPS;

function validateConstraintVisitorMock(times: number, index: number, order: number, mock: any, constraint: any, value: any, path: any, groups: any, violations: any, globalViolations: any, visitor: any, reportAsSingle = false, equalConstraint = false) {
    var validator = jbv.VALIDATORS[constraint.constraintName];
    expect(mock.order.length).toBe(times);
    expect(mock.order[index]).toBe(order);
    expect(mock.calls.length).toBe(times);
    expect(mock.calls[index].length).toBe(7);
    if (equalConstraint) {
        expect(mock.calls[index][0]).toEqual(constraint);
    } else {
        expect(mock.calls[index][0]).toBe(constraint);
    }
    expect(mock.calls[index][1]).toBe(value);
    expect(mock.calls[index][2]).toBe(path);
    expect(mock.calls[index][3]).toBe(groups);
    var global =  validator && validator.isGlobalValidator;
    if (global || reportAsSingle) {
        expect(mock.calls[index][4]).toEqual([]); // violations
    } else {
        expect(mock.calls[index][4]).toBe(violations);
    }
    expect(mock.calls[index][5]).toBe(globalViolations);
    expect(mock.calls[index][6]).toBe(visitor);
}

function validateValidatorVisitorMock(times: number, index: number, order: number, mock: any, constraint: jbv.ConstraintValidationsDescriptor, value: any, path: any, groups: any, violations: any, globalViolations: any, visitor: any, reportAsSingle = false) {
    var validator = jbv.VALIDATORS[constraint.constraintName];
    expect(mock.order.length).toBe(times);
    expect(mock.order[index]).toBe(order);
    expect(mock.calls.length).toBe(times);
    expect(mock.calls[index].length).toBe(9);
    expect(mock.calls[index][0]).toBe(constraint.constraintName);
    expect(mock.calls[index][1]).toBe(validator);
    expect(mock.calls[index][2]).toBe(value);
    if (constraint.attributes) {
        expect(mock.calls[index][3]).toBe(constraint.attributes);
    } else {
        expect(mock.calls[index][3]).toEqual({}); // attributes
    }
    expect(mock.calls[index][4]).toBe(path);
    expect(mock.calls[index][5]).toBe(groups);
    var global =  validator && validator.isGlobalValidator;
    if (global || reportAsSingle) {
        expect(mock.calls[index][6]).toEqual([]); // violations
    } else {
        expect(mock.calls[index][6]).toBe(violations);
    }
    expect(mock.calls[index][7]).toBe(globalViolations);
    expect(mock.calls[index][8]).toBe(visitor);
}

function validatePropertyVisitorMock(times: number, index: number, order: number, mock: any, property: jbv.PropertyValidationsDescriptor, porpertyName: any, objectWithProperty: any, path: any, groups: any, violations: any, globalViolations: any, visitor: any) {
    expect(mock.order.length).toBe(times);
    expect(mock.order[index]).toBe(order);
    expect(mock.calls.length).toBe(times);
    expect(mock.calls[index].length).toBe(8);
    expect(mock.calls[index][0]).toBe(property);
    expect(mock.calls[index][1]).toBe(porpertyName);
    expect(mock.calls[index][2]).toBe(objectWithProperty);
    expect(mock.calls[index][3]).toBe(path);
    expect(mock.calls[index][4]).toBe(groups);
    expect(mock.calls[index][5]).toBe(violations);
    expect(mock.calls[index][6]).toBe(globalViolations);
    expect(mock.calls[index][7]).toBe(visitor);
}

function validateTypeVisitor(times: number, index: number, order: number, mock: any, type: string | jbv.TypeValidationsDescriptor, value: any, path: any, groups: any, violations: any, globalViolations: any, visitor: any) {
    expect(mock.order.length).toBe(times);
    expect(mock.order[index]).toBe(order);
    expect(mock.calls.length).toBe(times);
    expect(mock.calls[index].length).toBe(7);
    if (typeof type === 'string') {
        expect(mock.calls[index][0]).toBe(jbv.TYPE_DESCRIPTORS[type]);
    } else {
        expect(mock.calls[index][0]).toBe(type);
    }
    expect(mock.calls[index][1]).toBe(value);
    expect(mock.calls[index][2]).toBe(path);
    expect(mock.calls[index][3]).toBe(groups);
    expect(mock.calls[index][4]).toBe(violations);
    expect(mock.calls[index][5]).toBe(globalViolations);
    expect(mock.calls[index][6]).toBe(visitor);    
}

function validateNotCalled(mock: any) {
    expect(mock.calls.length).toBe(0);
    expect(mock.order.length).toBe(0);
}
 
function getInnerConstraint(typeName: string) : jbv.ConstraintValidationsDescriptor {
    var type = jbv.TYPE_DESCRIPTORS[typeName];
    if (!type) {
        throw new Error('Type ' + typeName + ' not found');
    }
    if (typeof type === 'function') {
        throw new Error('Type ' + typeName + ' is a function');
    }
    var constraints = type.constraints;
    if (!constraints) {
        throw new Error('Type ' + typeName + ' has no constraints');
    }
    var constraint = constraints[0];
    if (!constraint) {
        throw new Error('Type ' + typeName + ' has no constraints at 0');
    }
    return constraint;
}
var order = 0;   
function fn(result?: any): any {
    var f : any;
    f = function () {
        f.calls.push(arguments);
        f.order.push(++order);
        return result;
    }
    f.calls = [];
    f.order = [];
    return f;
}

describe('#visitConstraintDescriptor', () => {
    var visitor: jbv.Visitor = {
        startTypeVisitor: fn(true),
        endTypeVisitor: fn(),
        startPropertyVisitor: fn(true),
        endPropertyVisitor: fn(),
        startConstraintVisitor: fn(true),
        endConstraintVisitor: fn(),
        startValidatorVisitor: fn(true),
        endValidatorVisitor: fn()
    };
    
    afterEach(() => {
        visitor = {
            startTypeVisitor: fn(true),
            endTypeVisitor: fn(),
            startPropertyVisitor: fn(true),
            endPropertyVisitor: fn(),
            startConstraintVisitor: fn(true),
            endConstraintVisitor: fn(),
            startValidatorVisitor: fn(true),
            endValidatorVisitor: fn()
        };
        order = 0;
        testUtils.clean();
    });
    
    test ("Constraint with missing validator", () => {
        var constraint = {
            constraintName: 'MyConstraintWithNoValidator'
        }
        var test = testUtils.registerMyConstraint(constraint, path, true);
        
        jbv.visitConstraintDescriptor(constraint, test.value, path, groups, test.violations, test.globalViolations, visitor);
        
        validateConstraintVisitorMock(1, 0, 1, visitor.startConstraintVisitor, constraint, test.value, path, groups, test.violations, test.globalViolations, visitor);
        validateValidatorVisitorMock(1, 0, 2, visitor.startValidatorVisitor, constraint, test.value, path, groups, test.violations, test.globalViolations, visitor);
        validateValidatorVisitorMock(1, 0, 3, visitor.endValidatorVisitor, constraint, test.value, path, groups, test.violations, test.globalViolations, visitor);
        validateConstraintVisitorMock(1, 0, 4, visitor.endConstraintVisitor, constraint, test.value, path, groups, test.violations, test.globalViolations, visitor);
        validateNotCalled(visitor.startTypeVisitor);
        validateNotCalled(visitor.endTypeVisitor);
        validateNotCalled(visitor.startPropertyVisitor);
        validateNotCalled(visitor.endPropertyVisitor);

        expect(test.violations).toEqual([]);
        expect(test.globalViolations).toEqual([testUtils.myPathErrors.validatorNotFoundError]);
    });

    test('Constraint without validator', () => {
        var constraint = {
            constraintName: 'MyConstraintWithNoValidator',
            hasNoValidator: true
        }
        var test = testUtils.registerMyConstraint(constraint, path, true);
        
        jbv.visitConstraintDescriptor(constraint, test.value, path, groups, test.violations, test.globalViolations, visitor);
        
        validateConstraintVisitorMock(1, 0, 1, visitor.startConstraintVisitor, constraint, test.value, path, groups, test.violations, test.globalViolations, visitor);
        validateValidatorVisitorMock(1, 0, 2, visitor.startValidatorVisitor, constraint, test.value, path, groups, test.violations, test.globalViolations, visitor);
        validateValidatorVisitorMock(1, 0, 3, visitor.endValidatorVisitor, constraint, test.value, path, groups, test.violations, test.globalViolations, visitor);
        validateConstraintVisitorMock(1, 0, 4, visitor.endConstraintVisitor, constraint, test.value, path, groups, test.violations, test.globalViolations, visitor);
        validateNotCalled(visitor.startTypeVisitor);
        validateNotCalled(visitor.endTypeVisitor);
        validateNotCalled(visitor.startPropertyVisitor);
        validateNotCalled(visitor.endPropertyVisitor);
        
        expect(test.violations).toEqual([]);
        expect(test.globalViolations).toEqual([]);
    });        

    test('Constraint with validator', () => {
        var constraint = {
          constraintName: 'MyConstraint'
        };
        var test = testUtils.registerMyConstraint(constraint, path, true);
        
        jbv.visitConstraintDescriptor(constraint, test.value, path, groups, test.violations, test.globalViolations, visitor);
        
        validateConstraintVisitorMock(1, 0, 1, visitor.startConstraintVisitor, constraint, test.value, path, groups, test.violations, test.globalViolations, visitor);
        validateValidatorVisitorMock(1, 0, 2, visitor.startValidatorVisitor, constraint, test.value, path, groups, test.violations, test.globalViolations, visitor);
        validateValidatorVisitorMock(1, 0, 3, visitor.endValidatorVisitor, constraint, test.value, path, groups, test.violations, test.globalViolations, visitor);
        validateConstraintVisitorMock(1, 0, 4, visitor.endConstraintVisitor, constraint, test.value, path, groups, test.violations, test.globalViolations, visitor);
        validateNotCalled(visitor.startTypeVisitor);
        validateNotCalled(visitor.endTypeVisitor);
        validateNotCalled(visitor.startPropertyVisitor);
        validateNotCalled(visitor.endPropertyVisitor);
        
        expect(test.violations).toEqual([]);
        expect(test.globalViolations).toEqual([]);
    });
    
    test('Constraint with empty attributes', () => {
        var constraint = {
            constraintName: 'MyConstraint',
            attributes: {}
        }
        var test = testUtils.registerMyConstraint(constraint, path, true);
        
        jbv.visitConstraintDescriptor(constraint, test.value, path, groups, test.violations, test.globalViolations, visitor);
        
        validateConstraintVisitorMock(1, 0, 1, visitor.startConstraintVisitor, constraint, test.value, path, groups, test.violations, test.globalViolations, visitor);
        validateValidatorVisitorMock(1, 0, 2, visitor.startValidatorVisitor, constraint, test.value, path, groups, test.violations, test.globalViolations, visitor);
        validateValidatorVisitorMock(1, 0, 3, visitor.endValidatorVisitor, constraint, test.value, path, groups, test.violations, test.globalViolations, visitor);
        validateConstraintVisitorMock(1, 0, 4, visitor.endConstraintVisitor, constraint, test.value, path, groups, test.violations, test.globalViolations, visitor);
        validateNotCalled(visitor.startTypeVisitor);
        validateNotCalled(visitor.endTypeVisitor);
        validateNotCalled(visitor.startPropertyVisitor);
        validateNotCalled(visitor.endPropertyVisitor);
        
        expect(test.violations).toEqual([]);
        expect(test.globalViolations).toEqual([]);
        
    });
    
    test('Invalid value', () => {
        var constraint = {
          constraintName: 'MyConstraint'
        };
        var test = testUtils.registerMyConstraint(constraint, path, false);
        
        jbv.visitConstraintDescriptor(constraint, test.value, path, groups, test.violations, test.globalViolations, visitor);
        
        validateConstraintVisitorMock(1, 0, 1, visitor.startConstraintVisitor, constraint, test.value, path, groups, test.violations, test.globalViolations, visitor);
        validateValidatorVisitorMock(1, 0, 2, visitor.startValidatorVisitor, constraint, test.value, path, groups, test.violations, test.globalViolations, visitor);
        validateValidatorVisitorMock(1, 0, 3, visitor.endValidatorVisitor, constraint, test.value, path, groups, test.violations, test.globalViolations, visitor);
        validateConstraintVisitorMock(1, 0, 4, visitor.endConstraintVisitor, constraint, test.value, path, groups, test.violations, test.globalViolations, visitor);
        validateNotCalled(visitor.startTypeVisitor);
        validateNotCalled(visitor.endTypeVisitor);
        validateNotCalled(visitor.startPropertyVisitor);
        validateNotCalled(visitor.endPropertyVisitor);
        
        expect(test.violations).toEqual([]);
        expect(test.globalViolations).toEqual([]);
    });

    test('Contraint with an inactive group', () => {
        var constraint = {
            constraintName: 'MyConstraint',
            attributes: {
                groups: ['MyGroup']
            }
        }
        var test = testUtils.registerMyConstraint(constraint, path, true);
        
        jbv.visitConstraintDescriptor(constraint, test.value, path, groups, test.violations, test.globalViolations, visitor);
        
        validateConstraintVisitorMock(1, 0, 1, visitor.startConstraintVisitor, constraint, test.value, path, groups, test.violations, test.globalViolations, visitor);
        validateNotCalled(visitor.startValidatorVisitor);
        validateNotCalled(visitor.endValidatorVisitor);
        validateConstraintVisitorMock(1, 0, 2, visitor.endConstraintVisitor, constraint, test.value, path, groups, test.violations, test.globalViolations, visitor);
        validateNotCalled(visitor.startTypeVisitor);
        validateNotCalled(visitor.endTypeVisitor);
        validateNotCalled(visitor.startPropertyVisitor);
        validateNotCalled(visitor.endPropertyVisitor);
        
        expect(test.violations).toEqual([]);
        expect(test.globalViolations).toEqual([]);
    });   

    test('Constraint with global validator and invalid value', () => {
        var constraint = {
          constraintName: 'MyConstraint'
        };
        var test = testUtils.registerMyConstraint(constraint, path, false, 'ViolationsAreGlobal');
        testUtils.getMyConstraintValidator().isGlobalValidator = true;

        jbv.visitConstraintDescriptor(constraint, test.value, path, groups, test.violations, test.globalViolations, visitor);
        
        validateConstraintVisitorMock(1, 0, 1, visitor.startConstraintVisitor, constraint, test.value, path, groups, test.violations, test.globalViolations, visitor);
        validateValidatorVisitorMock(1, 0, 2, visitor.startValidatorVisitor, constraint, test.value, path, groups, test.violations, test.globalViolations, visitor);
        validateValidatorVisitorMock(1, 0, 3, visitor.endValidatorVisitor, constraint, test.value, path, groups, test.violations, test.globalViolations, visitor);
        validateConstraintVisitorMock(1, 0, 4, visitor.endConstraintVisitor, constraint, test.value, path, groups, test.violations, test.globalViolations, visitor);
        validateNotCalled(visitor.startTypeVisitor);
        validateNotCalled(visitor.endTypeVisitor);
        validateNotCalled(visitor.startPropertyVisitor);
        validateNotCalled(visitor.endPropertyVisitor);
        
        expect(test.violations).toEqual([]);
        expect(test.globalViolations).toEqual([]);
        
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
        
        jbv.visitConstraintDescriptor(constraint, test.value, path, groups, test.violations, test.globalViolations, visitor);
        
        validateConstraintVisitorMock(1, 0, 1, visitor.startConstraintVisitor, constraint, test.value, path, groups, test.violations, test.globalViolations, visitor);
        validateValidatorVisitorMock(1, 0, 2, visitor.startValidatorVisitor, constraint, test.value, path, groups, test.violations, test.globalViolations, visitor);
        validateValidatorVisitorMock(1, 0, 3, visitor.endValidatorVisitor, constraint, test.value, path, groups, test.violations, test.globalViolations, visitor);
        validateConstraintVisitorMock(1, 0, 4, visitor.endConstraintVisitor, constraint, test.value, path, groups, test.violations, test.globalViolations, visitor);
        validateNotCalled(visitor.startTypeVisitor);
        validateNotCalled(visitor.endTypeVisitor);
        validateNotCalled(visitor.startPropertyVisitor);
        validateNotCalled(visitor.endPropertyVisitor);
        
        expect(test.violations).toEqual([]);
        expect(test.globalViolations).toEqual([]);
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

describe('#visitConstraintDescriptor with composed constraint', () => {
    var visitor: jbv.Visitor = {
        startTypeVisitor: fn(true),
        endTypeVisitor: fn(),
        startPropertyVisitor: fn(true),
        endPropertyVisitor: fn(),
        startConstraintVisitor: fn(true),
        endConstraintVisitor: fn(),
        startValidatorVisitor: fn(true),
        endValidatorVisitor: fn()
    };
    
    afterEach(() => {
        visitor = {
            startTypeVisitor: fn(true),
            endTypeVisitor: fn(),
            startPropertyVisitor: fn(true),
            endPropertyVisitor: fn(),
            startConstraintVisitor: fn(true),
            endConstraintVisitor: fn(),
            startValidatorVisitor: fn(true),
            endValidatorVisitor: fn()
        };
        order = 0;
        testUtils.clean();
    });
    
    test('Valid composed constraint with valid composing constraint', () => {
        var innerConstraint = {
            constraintName: 'MyConstraint'
        };
        var composedConstraint = {
            constraintName: 'MyComposedConstraint',
            composingConstraints: [innerConstraint]
        };
        var test = testUtils.registerMyComposedConstraint(composedConstraint, path, true, true);
        
        jbv.visitConstraintDescriptor(composedConstraint, test.value, path, groups, test.violations, test.globalViolations, visitor);
        
        validateConstraintVisitorMock(2, 0, 1, visitor.startConstraintVisitor, composedConstraint, test.value, path, groups, test.violations, test.globalViolations, visitor);
        
        validateConstraintVisitorMock(2, 1, 2, visitor.startConstraintVisitor, innerConstraint, test.value, path, groups, test.violations, test.globalViolations, visitor);
        validateValidatorVisitorMock(2, 0, 3, visitor.startValidatorVisitor, innerConstraint, test.value, path, groups, test.violations, test.globalViolations, visitor);
        validateValidatorVisitorMock(2, 0, 4, visitor.endValidatorVisitor, innerConstraint, test.value, path, groups, test.violations, test.globalViolations, visitor);
        validateConstraintVisitorMock(2, 0, 5, visitor.endConstraintVisitor, innerConstraint, test.value, path, groups, test.violations, test.globalViolations, visitor);
        
        validateValidatorVisitorMock(2, 1, 6, visitor.startValidatorVisitor, composedConstraint, test.value, path, groups, test.violations, test.globalViolations, visitor);
        validateValidatorVisitorMock(2, 1, 7, visitor.endValidatorVisitor, composedConstraint, test.value, path, groups, test.violations, test.globalViolations, visitor);
        validateConstraintVisitorMock(2, 1, 8, visitor.endConstraintVisitor, composedConstraint, test.value, path, groups, test.violations, test.globalViolations, visitor);
        
        validateNotCalled(visitor.startTypeVisitor);
        validateNotCalled(visitor.endTypeVisitor);
        validateNotCalled(visitor.startPropertyVisitor);
        validateNotCalled(visitor.endPropertyVisitor);
        
        expect(test.violations).toEqual([]);
        expect(test.globalViolations).toEqual([]);
    });

    test('Invalid composed constraint with valid composing constraint', () => {
        var innerConstraint = {
            constraintName: 'MyConstraint'
        };
        var composedConstraint = {
            constraintName: 'MyComposedConstraint',
            composingConstraints: [innerConstraint]
        };
        var test = testUtils.registerMyComposedConstraint(composedConstraint, path, true, false);
        
        jbv.visitConstraintDescriptor(composedConstraint, test.value, path, groups, test.violations, test.globalViolations, visitor);

        validateConstraintVisitorMock(2, 0, 1, visitor.startConstraintVisitor, composedConstraint, test.value, path, groups, test.violations, test.globalViolations, visitor);
        
        validateConstraintVisitorMock(2, 1, 2, visitor.startConstraintVisitor, innerConstraint, test.value, path, groups, test.violations, test.globalViolations, visitor);
        validateValidatorVisitorMock(2, 0, 3, visitor.startValidatorVisitor, innerConstraint, test.value, path, groups, test.violations, test.globalViolations, visitor);
        validateValidatorVisitorMock(2, 0, 4, visitor.endValidatorVisitor, innerConstraint, test.value, path, groups, test.violations, test.globalViolations, visitor);
        validateConstraintVisitorMock(2, 0, 5, visitor.endConstraintVisitor, innerConstraint, test.value, path, groups, test.violations, test.globalViolations, visitor);
        
        validateValidatorVisitorMock(2, 1, 6, visitor.startValidatorVisitor, composedConstraint, test.value, path, groups, test.violations, test.globalViolations, visitor);
        validateValidatorVisitorMock(2, 1, 7, visitor.endValidatorVisitor, composedConstraint, test.value, path, groups, test.violations, test.globalViolations, visitor);
        validateConstraintVisitorMock(2, 1, 8, visitor.endConstraintVisitor, composedConstraint, test.value, path, groups, test.violations, test.globalViolations, visitor);
        
        validateNotCalled(visitor.startTypeVisitor);
        validateNotCalled(visitor.endTypeVisitor);
        validateNotCalled(visitor.startPropertyVisitor);
        validateNotCalled(visitor.endPropertyVisitor);

        expect(test.violations).toEqual([]);
        expect(test.globalViolations).toEqual([]);
    });
    
    test('Valid composed constraint with invalid composing constraint', () => {
        var innerConstraint = {
            constraintName: 'MyConstraint'
        };
        var composedConstraint = {
            constraintName: 'MyComposedConstraint',
            composingConstraints: [innerConstraint]
        };
        var test = testUtils.registerMyComposedConstraint(composedConstraint, path, false, true);
        
        jbv.visitConstraintDescriptor(composedConstraint, test.value, path, groups, test.violations, test.globalViolations, visitor);
  
        validateConstraintVisitorMock(2, 0, 1, visitor.startConstraintVisitor, composedConstraint, test.value, path, groups, test.violations, test.globalViolations, visitor);
        
        validateConstraintVisitorMock(2, 1, 2, visitor.startConstraintVisitor, innerConstraint, test.value, path, groups, test.violations, test.globalViolations, visitor);
        validateValidatorVisitorMock(2, 0, 3, visitor.startValidatorVisitor, innerConstraint, test.value, path, groups, test.violations, test.globalViolations, visitor);
        validateValidatorVisitorMock(2, 0, 4, visitor.endValidatorVisitor, innerConstraint, test.value, path, groups, test.violations, test.globalViolations, visitor);
        validateConstraintVisitorMock(2, 0, 5, visitor.endConstraintVisitor, innerConstraint, test.value, path, groups, test.violations, test.globalViolations, visitor);
        
        validateValidatorVisitorMock(2, 1, 6, visitor.startValidatorVisitor, composedConstraint, test.value, path, groups, test.violations, test.globalViolations, visitor);
        validateValidatorVisitorMock(2, 1, 7, visitor.endValidatorVisitor, composedConstraint, test.value, path, groups, test.violations, test.globalViolations, visitor);
        validateConstraintVisitorMock(2, 1, 8, visitor.endConstraintVisitor, composedConstraint, test.value, path, groups, test.violations, test.globalViolations, visitor);
        
        validateNotCalled(visitor.startTypeVisitor);
        validateNotCalled(visitor.endTypeVisitor);
        validateNotCalled(visitor.startPropertyVisitor);
        validateNotCalled(visitor.endPropertyVisitor);

        expect(test.violations).toEqual([]);
        expect(test.globalViolations).toEqual([]);

    });

    test('Invalid composed constraint with invalid composing constraint', () => {
        var innerConstraint = {
            constraintName: 'MyConstraint'
        };
        var composedConstraint = {
            constraintName: 'MyComposedConstraint',
            composingConstraints: [innerConstraint]
        };
        var test = testUtils.registerMyComposedConstraint(composedConstraint, path, false, false);
        
        jbv.visitConstraintDescriptor(composedConstraint, test.value, path, groups, test.violations, test.globalViolations, visitor);
        
        validateConstraintVisitorMock(2, 0, 1, visitor.startConstraintVisitor, composedConstraint, test.value, path, groups, test.violations, test.globalViolations, visitor);
        
        validateConstraintVisitorMock(2, 1, 2, visitor.startConstraintVisitor, innerConstraint, test.value, path, groups, test.violations, test.globalViolations, visitor);
        validateValidatorVisitorMock(2, 0, 3, visitor.startValidatorVisitor, innerConstraint, test.value, path, groups, test.violations, test.globalViolations, visitor);
        validateValidatorVisitorMock(2, 0, 4, visitor.endValidatorVisitor, innerConstraint, test.value, path, groups, test.violations, test.globalViolations, visitor);
        validateConstraintVisitorMock(2, 0, 5, visitor.endConstraintVisitor, innerConstraint, test.value, path, groups, test.violations, test.globalViolations, visitor);
        
        validateValidatorVisitorMock(2, 1, 6, visitor.startValidatorVisitor, composedConstraint, test.value, path, groups, test.violations, test.globalViolations, visitor);
        validateValidatorVisitorMock(2, 1, 7, visitor.endValidatorVisitor, composedConstraint, test.value, path, groups, test.violations, test.globalViolations, visitor);
        validateConstraintVisitorMock(2, 1, 8, visitor.endConstraintVisitor, composedConstraint, test.value, path, groups, test.violations, test.globalViolations, visitor);
        
        validateNotCalled(visitor.startTypeVisitor);
        validateNotCalled(visitor.endTypeVisitor);
        validateNotCalled(visitor.startPropertyVisitor);
        validateNotCalled(visitor.endPropertyVisitor);
        
        expect(test.violations).toEqual([]);
        expect(test.globalViolations).toEqual([]);
    });
});

describe('#visitConstraintDescriptor with composed constraint and report as single', () => {
    var visitor: jbv.Visitor = {
        startTypeVisitor: fn(true),
        endTypeVisitor: fn(),
        startPropertyVisitor: fn(true),
        endPropertyVisitor: fn(),
        startConstraintVisitor: fn(true),
        endConstraintVisitor: fn(),
        startValidatorVisitor: fn(true),
        endValidatorVisitor: fn()
    };
    
    afterEach(() => {
        visitor = {
            startTypeVisitor: fn(true),
            endTypeVisitor: fn(),
            startPropertyVisitor: fn(true),
            endPropertyVisitor: fn(),
            startConstraintVisitor: fn(true),
            endConstraintVisitor: fn(),
            startValidatorVisitor: fn(true),
            endValidatorVisitor: fn()
        };
        order = 0;
        testUtils.clean();
    });
    
    test('Invalid composed constraint with valid composing constraint and report as single', () => {
        var innerConstraint = {
            constraintName: 'MyConstraint'
        };
        var composedConstraint = {
            constraintName: 'MyComposedConstraint',
            composingConstraints: [innerConstraint],
            reportAsSingle: true
        };
        var test = testUtils.registerMyComposedConstraint(composedConstraint, path, true, false, 'EmptyViolations');
        
        jbv.visitConstraintDescriptor(composedConstraint, test.value, path, groups, test.violations, test.globalViolations, visitor);
        
        validateConstraintVisitorMock(2, 0, 1, visitor.startConstraintVisitor, composedConstraint, test.value, path, groups, test.violations, test.globalViolations, visitor);
        
        validateConstraintVisitorMock(2, 1, 2, visitor.startConstraintVisitor, innerConstraint, test.value, path, groups, test.violations, test.globalViolations, visitor, true);
        validateValidatorVisitorMock(2, 0, 3, visitor.startValidatorVisitor, innerConstraint, test.value, path, groups, test.violations, test.globalViolations, visitor, true);
        validateValidatorVisitorMock(2, 0, 4, visitor.endValidatorVisitor, innerConstraint, test.value, path, groups, test.violations, test.globalViolations, visitor, true);
        validateConstraintVisitorMock(2, 0, 5, visitor.endConstraintVisitor, innerConstraint, test.value, path, groups, test.violations, test.globalViolations, visitor, true);
        
        validateValidatorVisitorMock(2, 1, 6, visitor.startValidatorVisitor, composedConstraint, test.value, path, groups, test.violations, test.globalViolations, visitor);
        validateValidatorVisitorMock(2, 1, 7, visitor.endValidatorVisitor, composedConstraint, test.value, path, groups, test.violations, test.globalViolations, visitor);
        validateConstraintVisitorMock(2, 1, 8, visitor.endConstraintVisitor, composedConstraint, test.value, path, groups, test.violations, test.globalViolations, visitor);
        
        validateNotCalled(visitor.startTypeVisitor);
        validateNotCalled(visitor.endTypeVisitor);
        validateNotCalled(visitor.startPropertyVisitor);
        validateNotCalled(visitor.endPropertyVisitor);
        
        expect(test.violations).toEqual([]);
        expect(test.globalViolations).toEqual([]);
    });
    
    test('Valid composed constraint with invalid composing constraint and report as single', () => {
        var innerConstraint = {
            constraintName: 'MyConstraint'
        };
        var composedConstraint = {
            constraintName: 'MyComposedConstraint',
            composingConstraints: [innerConstraint],
            reportAsSingle: true
        };
        var test = testUtils.registerMyComposedConstraint(composedConstraint, path, false, true, 'EmptyViolations');
        
        jbv.visitConstraintDescriptor(composedConstraint, test.value, path, groups, test.violations, test.globalViolations, visitor);
        
        validateConstraintVisitorMock(2, 0, 1, visitor.startConstraintVisitor, composedConstraint, test.value, path, groups, test.violations, test.globalViolations, visitor);
        
        validateConstraintVisitorMock(2, 1, 2, visitor.startConstraintVisitor, innerConstraint, test.value, path, groups, test.violations, test.globalViolations, visitor, true);
        validateValidatorVisitorMock(2, 0, 3, visitor.startValidatorVisitor, innerConstraint, test.value, path, groups, test.violations, test.globalViolations, visitor, true);
        validateValidatorVisitorMock(2, 0, 4, visitor.endValidatorVisitor, innerConstraint, test.value, path, groups, test.violations, test.globalViolations, visitor, true);
        validateConstraintVisitorMock(2, 0, 5, visitor.endConstraintVisitor, innerConstraint, test.value, path, groups, test.violations, test.globalViolations, visitor, true);
        
        validateValidatorVisitorMock(2, 1, 6, visitor.startValidatorVisitor, composedConstraint, test.value, path, groups, test.violations, test.globalViolations, visitor);
        validateValidatorVisitorMock(2, 1, 7, visitor.endValidatorVisitor, composedConstraint, test.value, path, groups, test.violations, test.globalViolations, visitor);
        validateConstraintVisitorMock(2, 1, 8, visitor.endConstraintVisitor, composedConstraint, test.value, path, groups, test.violations, test.globalViolations, visitor);
        
        validateNotCalled(visitor.startTypeVisitor);
        validateNotCalled(visitor.endTypeVisitor);
        validateNotCalled(visitor.startPropertyVisitor);
        validateNotCalled(visitor.endPropertyVisitor);
        
        expect(test.violations).toEqual([]);
        expect(test.globalViolations).toEqual([]);
    });
    
    test('Invalid composed constraint with invalid composing constraint and report as single', () => {
        var innerConstraint = {
            constraintName: 'MyConstraint'
        };
        var composedConstraint = {
            constraintName: 'MyComposedConstraint',
            composingConstraints: [innerConstraint],
            reportAsSingle: true
        };
        var test = testUtils.registerMyComposedConstraint(composedConstraint, path, false, false, 'EmptyViolations');
        
        jbv.visitConstraintDescriptor(composedConstraint, test.value, path, groups, test.violations, test.globalViolations, visitor);
        
        validateConstraintVisitorMock(2, 0, 1, visitor.startConstraintVisitor, composedConstraint, test.value, path, groups, test.violations, test.globalViolations, visitor);
        
        validateConstraintVisitorMock(2, 1, 2, visitor.startConstraintVisitor, innerConstraint, test.value, path, groups, test.violations, test.globalViolations, visitor, true);
        validateValidatorVisitorMock(2, 0, 3, visitor.startValidatorVisitor, innerConstraint, test.value, path, groups, test.violations, test.globalViolations, visitor, true);
        validateValidatorVisitorMock(2, 0, 4, visitor.endValidatorVisitor, innerConstraint, test.value, path, groups, test.violations, test.globalViolations, visitor, true);
        validateConstraintVisitorMock(2, 0, 5, visitor.endConstraintVisitor, innerConstraint, test.value, path, groups, test.violations, test.globalViolations, visitor, true);
        
        validateValidatorVisitorMock(2, 1, 6, visitor.startValidatorVisitor, composedConstraint, test.value, path, groups, test.violations, test.globalViolations, visitor);
        validateValidatorVisitorMock(2, 1, 7, visitor.endValidatorVisitor, composedConstraint, test.value, path, groups, test.violations, test.globalViolations, visitor);
        validateConstraintVisitorMock(2, 1, 8, visitor.endConstraintVisitor, composedConstraint, test.value, path, groups, test.violations, test.globalViolations, visitor);
        
        validateNotCalled(visitor.startTypeVisitor);
        validateNotCalled(visitor.endTypeVisitor);
        validateNotCalled(visitor.startPropertyVisitor);
        validateNotCalled(visitor.endPropertyVisitor);
        
        expect(test.violations).toEqual([]);
        expect(test.globalViolations).toEqual([]);
    });
});

describe('#visitPropertyDescriptor', () => {
    var visitor: jbv.Visitor = {
        startTypeVisitor: fn(true),
        endTypeVisitor: fn(),
        startPropertyVisitor: fn(true),
        endPropertyVisitor: fn(),
        startConstraintVisitor: fn(true),
        endConstraintVisitor: fn(),
        startValidatorVisitor: fn(true),
        endValidatorVisitor: fn(),
        recursively: true
    };
    
    afterEach(() => {
        visitor = {
            startTypeVisitor: fn(true),
            endTypeVisitor: fn(),
            startPropertyVisitor: fn(true),
            endPropertyVisitor: fn(),
            startConstraintVisitor: fn(true),
            endConstraintVisitor: fn(),
            startValidatorVisitor: fn(true),
            endValidatorVisitor: fn(),
            recursively: true
        };
        order = 0;
        testUtils.clean();
    });
    
    test('Missing type descriptor', () => {
        var constraint = {
            constraintName: 'MyConstraint'
        };
        var property = {
            porpertyTypeName: 'MyPropertyType',
            constraints: [constraint]
        };
        var test = testUtils.registerMyPropertyConstraint(property, path, true, true, 'ViolationsAreGlobal');
        delete jbv.TYPE_DESCRIPTORS.MyPropertyType;
        delete jbv.VALIDATORS.MyPropertyTypeConstraint;
        delete jbv.VALIDATORS.MyConstraint;
        
        jbv.visitPropertyDescriptor(property, test.propertyName, test.objectWithProperty, path, groups, test.violations, test.globalViolations, visitor);
        
        validatePropertyVisitorMock(1, 0, 1, visitor.startPropertyVisitor, property, test.propertyName, test.objectWithProperty, path, groups, test.violations, test.globalViolations, visitor);
        validateNotCalled(visitor.startConstraintVisitor);
        validateNotCalled(visitor.startValidatorVisitor);
        validateNotCalled(visitor.endValidatorVisitor);
        validateNotCalled(visitor.endConstraintVisitor);
        validatePropertyVisitorMock(1, 0, 2, visitor.endPropertyVisitor, property, test.propertyName, test.objectWithProperty, path, groups, test.violations, test.globalViolations, visitor);
        
        validateNotCalled(visitor.startTypeVisitor);
        validateNotCalled(visitor.endTypeVisitor);
        
        expect(test.violations).toEqual([]);
        expect(test.globalViolations).toEqual([testUtils.myPropertyErrors.typeNotFoundError]);
    });
    
    test('Missing validator', () => {
        var constraint = {
            constraintName: 'MyConstraint'
        };
        var property = {
            porpertyTypeName: 'MyPropertyType',
            constraints: [constraint]
        };
        var test = testUtils.registerMyPropertyConstraint(property, path, true, true, 'ViolationsAreGlobal');
        delete jbv.VALIDATORS.MyConstraint;
        
        jbv.visitPropertyDescriptor(property, test.propertyName, test.objectWithProperty, path, groups, test.violations, test.globalViolations, visitor);
        
        var value = test.objectWithProperty[test.propertyName];
        var propertyPath = path + '.' + test.propertyName;
        validatePropertyVisitorMock(1, 0, 1, visitor.startPropertyVisitor, property, test.propertyName, test.objectWithProperty, path, groups, test.violations, test.globalViolations, visitor);
        validateConstraintVisitorMock(1, 0, 2, visitor.startConstraintVisitor, constraint, value, propertyPath, groups, test.violations, test.globalViolations, visitor);
        validateValidatorVisitorMock(1, 0, 3, visitor.startValidatorVisitor, constraint, value, propertyPath, groups, test.violations, test.globalViolations, visitor);
        validateValidatorVisitorMock(1, 0, 4, visitor.endValidatorVisitor, constraint, value, propertyPath, groups, test.violations, test.globalViolations, visitor);
        validateConstraintVisitorMock(1, 0, 5, visitor.endConstraintVisitor, constraint, value, propertyPath, groups, test.violations, test.globalViolations, visitor);
        validatePropertyVisitorMock(1, 0, 6, visitor.endPropertyVisitor, property, test.propertyName, test.objectWithProperty, path, groups, test.violations, test.globalViolations, visitor);
        
        validateNotCalled(visitor.startTypeVisitor);
        validateNotCalled(visitor.endTypeVisitor);
        
        expect(test.violations).toEqual([]);
        expect(test.globalViolations).toEqual([testUtils.myPropertyErrors.validatorNotFoundError]);
    });
    
    test('Valid', () => {
        var constraint = {
            constraintName: 'MyConstraint'
        };
        var property = {
            porpertyTypeName: 'MyPropertyType',
            constraints: [constraint]
        };
        var test = testUtils.registerMyPropertyConstraint(property, path, true, true, 'ViolationsAreGlobal');
        
        jbv.visitPropertyDescriptor(property, test.propertyName, test.objectWithProperty, path, groups, test.violations, test.globalViolations, visitor);
        
        var value = test.objectWithProperty[test.propertyName];
        var propertyPath = path + '.' + test.propertyName;
        validatePropertyVisitorMock(1, 0, 1, visitor.startPropertyVisitor, property, test.propertyName, test.objectWithProperty, path, groups, test.violations, test.globalViolations, visitor);
        validateConstraintVisitorMock(1, 0, 2, visitor.startConstraintVisitor, constraint, value, propertyPath, groups, test.violations, test.globalViolations, visitor);
        validateValidatorVisitorMock(1, 0, 3, visitor.startValidatorVisitor, constraint, value, propertyPath, groups, test.violations, test.globalViolations, visitor);
        validateValidatorVisitorMock(1, 0, 4, visitor.endValidatorVisitor, constraint, value, propertyPath, groups, test.violations, test.globalViolations, visitor);
        validateConstraintVisitorMock(1, 0, 5, visitor.endConstraintVisitor, constraint, value, propertyPath, groups, test.violations, test.globalViolations, visitor);
        validatePropertyVisitorMock(1, 0, 6, visitor.endPropertyVisitor, property, test.propertyName, test.objectWithProperty, path, groups, test.violations, test.globalViolations, visitor);
        
        validateNotCalled(visitor.startTypeVisitor);
        validateNotCalled(visitor.endTypeVisitor);
        
        expect(test.violations).toEqual([]);
        expect(test.globalViolations).toEqual([]);
    });
    
    test('Valid spite type validator', () => {
        var constraint = {
            constraintName: 'MyConstraint'
        };
        var property = {
            porpertyTypeName: 'MyPropertyType',
            constraints: [constraint]
        };
        var test = testUtils.registerMyPropertyConstraint(property, path, false, true, 'ViolationsAreGlobal');
        
        jbv.visitPropertyDescriptor(property, test.propertyName, test.objectWithProperty, path, groups, test.violations, test.globalViolations, visitor);
        
        var value = test.objectWithProperty[test.propertyName];
        var propertyPath = path + '.' + test.propertyName;
        validatePropertyVisitorMock(1, 0, 1, visitor.startPropertyVisitor, property, test.propertyName, test.objectWithProperty, path, groups, test.violations, test.globalViolations, visitor);
        validateConstraintVisitorMock(1, 0, 2, visitor.startConstraintVisitor, constraint, value, propertyPath, groups, test.violations, test.globalViolations, visitor);
        validateValidatorVisitorMock(1, 0, 3, visitor.startValidatorVisitor, constraint, value, propertyPath, groups, test.violations, test.globalViolations, visitor);
        validateValidatorVisitorMock(1, 0, 4, visitor.endValidatorVisitor, constraint, value, propertyPath, groups, test.violations, test.globalViolations, visitor);
        validateConstraintVisitorMock(1, 0, 5, visitor.endConstraintVisitor, constraint, value, propertyPath, groups, test.violations, test.globalViolations, visitor);
        validatePropertyVisitorMock(1, 0, 6, visitor.endPropertyVisitor, property, test.propertyName, test.objectWithProperty, path, groups, test.violations, test.globalViolations, visitor);
        
        validateNotCalled(visitor.startTypeVisitor);
        validateNotCalled(visitor.endTypeVisitor);
        
        expect(test.violations).toEqual([]);
        expect(test.globalViolations).toEqual([]);
    });
});

describe('#visitPropertyDescriptor with basic type', () => {
    var visitor: jbv.Visitor = {
        startTypeVisitor: fn(true),
        endTypeVisitor: fn(),
        startPropertyVisitor: fn(true),
        endPropertyVisitor: fn(),
        startConstraintVisitor: fn(true),
        endConstraintVisitor: fn(),
        startValidatorVisitor: fn(true),
        endValidatorVisitor: fn(),
        recursively: true
    };
    
    afterEach(() => {
        visitor = {
            startTypeVisitor: fn(true),
            endTypeVisitor: fn(),
            startPropertyVisitor: fn(true),
            endPropertyVisitor: fn(),
            startConstraintVisitor: fn(true),
            endConstraintVisitor: fn(),
            startValidatorVisitor: fn(true),
            endValidatorVisitor: fn(),
            recursively: true
        };
        order = 0;
        testUtils.clean();
    });
    
    test('Valid basic type', () => {
        var constraint = {
            constraintName: 'MyConstraint'
        };
        var property = {
            porpertyTypeName: 'MyPropertyType',
            constraints: [constraint]
        };
        var test = testUtils.registerMyPropertyConstraint(property, path, true, true, 'ViolationsAreGlobal');
        testUtils.getMyPropertyType().isBasicType = true;
        
        jbv.visitPropertyDescriptor(property, test.propertyName, test.objectWithProperty, path, groups, test.violations, test.globalViolations, visitor);
        
        var value = test.objectWithProperty[test.propertyName];
        var propertyPath = path + '.' + test.propertyName;
        var innerConstraint = getInnerConstraint('MyPropertyType');
        
        validatePropertyVisitorMock(1, 0, 1, visitor.startPropertyVisitor, property, test.propertyName, test.objectWithProperty, path, groups, test.violations, test.globalViolations, visitor);
        
        validateTypeVisitor(1, 0, 2, visitor.startTypeVisitor, 'MyPropertyType', value, propertyPath, groups, test.globalViolations, test.globalViolations, visitor);
        validateConstraintVisitorMock(2, 0, 3, visitor.startConstraintVisitor, innerConstraint, value, propertyPath, groups, test.globalViolations, test.globalViolations, visitor);
        validateValidatorVisitorMock(2, 0, 4, visitor.startValidatorVisitor, innerConstraint, value, propertyPath, groups, test.globalViolations, test.globalViolations, visitor);
        validateValidatorVisitorMock(2, 0, 5, visitor.endValidatorVisitor, innerConstraint, value, propertyPath, groups, test.globalViolations, test.globalViolations, visitor);
        validateConstraintVisitorMock(2, 0, 6, visitor.endConstraintVisitor, innerConstraint, value, propertyPath, groups, test.globalViolations, test.globalViolations, visitor);
        validateTypeVisitor(1, 0, 7, visitor.endTypeVisitor, 'MyPropertyType', value, propertyPath, groups, test.globalViolations, test.globalViolations, visitor);
        
        validateConstraintVisitorMock(2, 1, 8, visitor.startConstraintVisitor, constraint, value, propertyPath, groups, test.violations, test.globalViolations, visitor);
        validateValidatorVisitorMock(2, 1, 9, visitor.startValidatorVisitor, constraint, value, propertyPath, groups, test.violations, test.globalViolations, visitor);
        validateValidatorVisitorMock(2, 1, 10, visitor.endValidatorVisitor, constraint, value, propertyPath, groups, test.violations, test.globalViolations, visitor);
        validateConstraintVisitorMock(2, 1, 11, visitor.endConstraintVisitor, constraint, value, propertyPath, groups, test.violations, test.globalViolations, visitor);
        
        validatePropertyVisitorMock(1, 0, 12, visitor.endPropertyVisitor, property, test.propertyName, test.objectWithProperty, path, groups, test.violations, test.globalViolations, visitor);
        
        expect(test.violations).toEqual([]);
        expect(test.globalViolations).toEqual([]);
    });
    
    test('Invalid basic type acording to type validator', () => {
        var constraint = {
            constraintName: 'MyConstraint'
        };
        var property = {
            porpertyTypeName: 'MyPropertyType',
            constraints: [constraint]
        };
        var test = testUtils.registerMyPropertyConstraint(property, path, false, true, 'ViolationsAreGlobal');
        testUtils.getMyPropertyType().isBasicType = true;
        
        jbv.visitPropertyDescriptor(property, test.propertyName, test.objectWithProperty, path, groups, test.violations, test.globalViolations, visitor);
        
        var value = test.objectWithProperty[test.propertyName];
        var propertyPath = path + '.' + test.propertyName;
        var innerConstraint = getInnerConstraint('MyPropertyType');
        
        validatePropertyVisitorMock(1, 0, 1, visitor.startPropertyVisitor, property, test.propertyName, test.objectWithProperty, path, groups, test.violations, test.globalViolations, visitor);
        
        validateTypeVisitor(1, 0, 2, visitor.startTypeVisitor, 'MyPropertyType', value, propertyPath, groups, test.globalViolations, test.globalViolations, visitor);
        validateConstraintVisitorMock(2, 0, 3, visitor.startConstraintVisitor, innerConstraint, value, propertyPath, groups, test.globalViolations, test.globalViolations, visitor);
        validateValidatorVisitorMock(2, 0, 4, visitor.startValidatorVisitor, innerConstraint, value, propertyPath, groups, test.globalViolations, test.globalViolations, visitor);
        validateValidatorVisitorMock(2, 0, 5, visitor.endValidatorVisitor, innerConstraint, value, propertyPath, groups, test.globalViolations, test.globalViolations, visitor);
        validateConstraintVisitorMock(2, 0, 6, visitor.endConstraintVisitor, innerConstraint, value, propertyPath, groups, test.globalViolations, test.globalViolations, visitor);
        validateTypeVisitor(1, 0, 7, visitor.endTypeVisitor, 'MyPropertyType', value, propertyPath, groups, test.globalViolations, test.globalViolations, visitor);
        
        validateConstraintVisitorMock(2, 1, 8, visitor.startConstraintVisitor, constraint, value, propertyPath, groups, test.violations, test.globalViolations, visitor);
        validateValidatorVisitorMock(2, 1, 9, visitor.startValidatorVisitor, constraint, value, propertyPath, groups, test.violations, test.globalViolations, visitor);
        validateValidatorVisitorMock(2, 1, 10, visitor.endValidatorVisitor, constraint, value, propertyPath, groups, test.violations, test.globalViolations, visitor);
        validateConstraintVisitorMock(2, 1, 11, visitor.endConstraintVisitor, constraint, value, propertyPath, groups, test.violations, test.globalViolations, visitor);
        
        validatePropertyVisitorMock(1, 0, 12, visitor.endPropertyVisitor, property, test.propertyName, test.objectWithProperty, path, groups, test.violations, test.globalViolations, visitor);
        
        expect(test.violations).toEqual([]);
        expect(test.globalViolations).toEqual([]);
    });

    test('Invalid basic type acording to validator and type validator', () => {
        var constraint = {
            constraintName: 'MyConstraint'
        };
        var property = {
            porpertyTypeName: 'MyPropertyType',
            constraints: [constraint]
        };
        var test = testUtils.registerMyPropertyConstraint(property, path, false, false, 'ViolationsAreGlobal');
        testUtils.getMyPropertyType().isBasicType = true;
        
        jbv.visitPropertyDescriptor(property, test.propertyName, test.objectWithProperty, path, groups, test.violations, test.globalViolations, visitor);
        
        var value = test.objectWithProperty[test.propertyName];
        var propertyPath = path + '.' + test.propertyName;
        var innerConstraint = getInnerConstraint('MyPropertyType');
        
        validatePropertyVisitorMock(1, 0, 1, visitor.startPropertyVisitor, property, test.propertyName, test.objectWithProperty, path, groups, test.violations, test.globalViolations, visitor);
        
        validateTypeVisitor(1, 0, 2, visitor.startTypeVisitor, 'MyPropertyType', value, propertyPath, groups, test.globalViolations, test.globalViolations, visitor);
        validateConstraintVisitorMock(2, 0, 3, visitor.startConstraintVisitor, innerConstraint, value, propertyPath, groups, test.globalViolations, test.globalViolations, visitor);
        validateValidatorVisitorMock(2, 0, 4, visitor.startValidatorVisitor, innerConstraint, value, propertyPath, groups, test.globalViolations, test.globalViolations, visitor);
        validateValidatorVisitorMock(2, 0, 5, visitor.endValidatorVisitor, innerConstraint, value, propertyPath, groups, test.globalViolations, test.globalViolations, visitor);
        validateConstraintVisitorMock(2, 0, 6, visitor.endConstraintVisitor, innerConstraint, value, propertyPath, groups, test.globalViolations, test.globalViolations, visitor);
        validateTypeVisitor(1, 0, 7, visitor.endTypeVisitor, 'MyPropertyType', value, propertyPath, groups, test.globalViolations, test.globalViolations, visitor);
        
        validateConstraintVisitorMock(2, 1, 8, visitor.startConstraintVisitor, constraint, value, propertyPath, groups, test.violations, test.globalViolations, visitor);
        validateValidatorVisitorMock(2, 1, 9, visitor.startValidatorVisitor, constraint, value, propertyPath, groups, test.violations, test.globalViolations, visitor);
        validateValidatorVisitorMock(2, 1, 10, visitor.endValidatorVisitor, constraint, value, propertyPath, groups, test.violations, test.globalViolations, visitor);
        validateConstraintVisitorMock(2, 1, 11, visitor.endConstraintVisitor, constraint, value, propertyPath, groups, test.violations, test.globalViolations, visitor);
        
        validatePropertyVisitorMock(1, 0, 12, visitor.endPropertyVisitor, property, test.propertyName, test.objectWithProperty, path, groups, test.violations, test.globalViolations, visitor);
        
        expect(test.violations).toEqual([]);
        expect(test.globalViolations).toEqual([]);
    });
    
    test('Invalid basic type acording to validator and type validator (mixed violations)', () => {
        var constraint = {
            constraintName: 'MyConstraint'
        };
        var property = {
            porpertyTypeName: 'MyPropertyType',
            constraints: [constraint]
        };
        var test = testUtils.registerMyPropertyConstraint(property, path, false, false, 'ViolationsAreGlobal');
        test.globalViolations = test.violations;
        testUtils.getMyPropertyType().isBasicType = true;
        
        jbv.visitPropertyDescriptor(property, test.propertyName, test.objectWithProperty, path, groups, test.violations, test.globalViolations, visitor);
        
        var value = test.objectWithProperty[test.propertyName];
        var propertyPath = path + '.' + test.propertyName;
        var innerConstraint = getInnerConstraint('MyPropertyType');
        
        validatePropertyVisitorMock(1, 0, 1, visitor.startPropertyVisitor, property, test.propertyName, test.objectWithProperty, path, groups, test.violations, test.globalViolations, visitor);
        
        validateTypeVisitor(1, 0, 2, visitor.startTypeVisitor, 'MyPropertyType', value, propertyPath, groups, test.globalViolations, test.globalViolations, visitor);
        validateConstraintVisitorMock(2, 0, 3, visitor.startConstraintVisitor, innerConstraint, value, propertyPath, groups, test.globalViolations, test.globalViolations, visitor);
        validateValidatorVisitorMock(2, 0, 4, visitor.startValidatorVisitor, innerConstraint, value, propertyPath, groups, test.globalViolations, test.globalViolations, visitor);
        validateValidatorVisitorMock(2, 0, 5, visitor.endValidatorVisitor, innerConstraint, value, propertyPath, groups, test.globalViolations, test.globalViolations, visitor);
        validateConstraintVisitorMock(2, 0, 6, visitor.endConstraintVisitor, innerConstraint, value, propertyPath, groups, test.globalViolations, test.globalViolations, visitor);
        validateTypeVisitor(1, 0, 7, visitor.endTypeVisitor, 'MyPropertyType', value, propertyPath, groups, test.globalViolations, test.globalViolations, visitor);
        
        validateConstraintVisitorMock(2, 1, 8, visitor.startConstraintVisitor, constraint, value, propertyPath, groups, test.violations, test.globalViolations, visitor);
        validateValidatorVisitorMock(2, 1, 9, visitor.startValidatorVisitor, constraint, value, propertyPath, groups, test.violations, test.globalViolations, visitor);
        validateValidatorVisitorMock(2, 1, 10, visitor.endValidatorVisitor, constraint, value, propertyPath, groups, test.violations, test.globalViolations, visitor);
        validateConstraintVisitorMock(2, 1, 11, visitor.endConstraintVisitor, constraint, value, propertyPath, groups, test.violations, test.globalViolations, visitor);
        
        validatePropertyVisitorMock(1, 0, 12, visitor.endPropertyVisitor, property, test.propertyName, test.objectWithProperty, path, groups, test.violations, test.globalViolations, visitor);
        
        expect(test.violations).toEqual([]);
    });
    
    test('Invalid basic type without property constraint', () => {
        var property = {
            porpertyTypeName: 'MyPropertyType'
        };
        var test = testUtils.registerMyPropertyConstraint(property, path, false, false, 'ViolationsAreGlobal');
        testUtils.getMyPropertyType().isBasicType = true;
        
        jbv.visitPropertyDescriptor(property, test.propertyName, test.objectWithProperty, path, groups, test.violations, test.globalViolations, visitor);
        
        var value = test.objectWithProperty[test.propertyName];
        var propertyPath = path + '.' + test.propertyName;
        var innerConstraint = getInnerConstraint('MyPropertyType');
        
        validatePropertyVisitorMock(1, 0, 1, visitor.startPropertyVisitor, property, test.propertyName, test.objectWithProperty, path, groups, test.violations, test.globalViolations, visitor);
        
        validateTypeVisitor(1, 0, 2, visitor.startTypeVisitor, 'MyPropertyType', value, propertyPath, groups, test.globalViolations, test.globalViolations, visitor);
        validateConstraintVisitorMock(1, 0, 3, visitor.startConstraintVisitor, innerConstraint, value, propertyPath, groups, test.globalViolations, test.globalViolations, visitor);
        validateValidatorVisitorMock(1, 0, 4, visitor.startValidatorVisitor, innerConstraint, value, propertyPath, groups, test.globalViolations, test.globalViolations, visitor);
        validateValidatorVisitorMock(1, 0, 5, visitor.endValidatorVisitor, innerConstraint, value, propertyPath, groups, test.globalViolations, test.globalViolations, visitor);
        validateConstraintVisitorMock(1, 0, 6, visitor.endConstraintVisitor, innerConstraint, value, propertyPath, groups, test.globalViolations, test.globalViolations, visitor);
        validateTypeVisitor(1, 0, 7, visitor.endTypeVisitor, 'MyPropertyType', value, propertyPath, groups, test.globalViolations, test.globalViolations, visitor);
        
        validatePropertyVisitorMock(1, 0, 8, visitor.endPropertyVisitor, property, test.propertyName, test.objectWithProperty, path, groups, test.violations, test.globalViolations, visitor);
        
        expect(test.violations).toEqual([]);
        expect(test.globalViolations).toEqual([]);
    });

    test('Invalid basic type with null object with property', () => {
        var constraint = {
            constraintName: 'MyConstraint'
        };
        var property = {
            porpertyTypeName: 'MyPropertyType',
            constraints: [constraint]
        };
        var test = testUtils.registerMyPropertyConstraint(property, path, false, false, 'ViolationsAreGlobal');
        testUtils.getMyPropertyType().isBasicType = true;
        test.objectWithProperty.myProperty = undefined;
        
        jbv.visitPropertyDescriptor(property, test.propertyName, null, path, groups, test.violations, test.globalViolations, visitor);
        
        var value = test.objectWithProperty[test.propertyName];
        var propertyPath = path + '.' + test.propertyName;
        var innerConstraint = getInnerConstraint('MyPropertyType');
        
        validatePropertyVisitorMock(1, 0, 1, visitor.startPropertyVisitor, property, test.propertyName, null, path, groups, test.violations, test.globalViolations, visitor);
        
        validateTypeVisitor(1, 0, 2, visitor.startTypeVisitor, 'MyPropertyType', value, propertyPath, groups, test.globalViolations, test.globalViolations, visitor);
        validateConstraintVisitorMock(2, 0, 3, visitor.startConstraintVisitor, innerConstraint, value, propertyPath, groups, test.globalViolations, test.globalViolations, visitor);
        validateValidatorVisitorMock(2, 0, 4, visitor.startValidatorVisitor, innerConstraint, value, propertyPath, groups, test.globalViolations, test.globalViolations, visitor);
        validateValidatorVisitorMock(2, 0, 5, visitor.endValidatorVisitor, innerConstraint, value, propertyPath, groups, test.globalViolations, test.globalViolations, visitor);
        validateConstraintVisitorMock(2, 0, 6, visitor.endConstraintVisitor, innerConstraint, value, propertyPath, groups, test.globalViolations, test.globalViolations, visitor);
        validateTypeVisitor(1, 0, 7, visitor.endTypeVisitor, 'MyPropertyType', value, propertyPath, groups, test.globalViolations, test.globalViolations, visitor);
        
        validateConstraintVisitorMock(2, 1, 8, visitor.startConstraintVisitor, constraint, value, propertyPath, groups, test.violations, test.globalViolations, visitor);
        validateValidatorVisitorMock(2, 1, 9, visitor.startValidatorVisitor, constraint, value, propertyPath, groups, test.violations, test.globalViolations, visitor);
        validateValidatorVisitorMock(2, 1, 10, visitor.endValidatorVisitor, constraint, value, propertyPath, groups, test.violations, test.globalViolations, visitor);
        validateConstraintVisitorMock(2, 1, 11, visitor.endConstraintVisitor, constraint, value, propertyPath, groups, test.violations, test.globalViolations, visitor);
        
        validatePropertyVisitorMock(1, 0, 12, visitor.endPropertyVisitor, property, test.propertyName, null, path, groups, test.violations, test.globalViolations, visitor);
        
        expect(test.violations).toEqual([]);
        expect(test.globalViolations).toEqual([]);
    });

    test('Invalid basic type with undefined object with property', () => {
        var constraint = {
            constraintName: 'MyConstraint'
        };
        var property = {
            porpertyTypeName: 'MyPropertyType',
            constraints: [constraint]
        };
        var test = testUtils.registerMyPropertyConstraint(property, path, false, false, 'ViolationsAreGlobal');
        testUtils.getMyPropertyType().isBasicType = true;
        test.objectWithProperty.myProperty = undefined;
        
        jbv.visitPropertyDescriptor(property, test.propertyName, undefined, path, groups, test.violations, test.globalViolations, visitor);
        
        var value = test.objectWithProperty[test.propertyName];
        var propertyPath = path + '.' + test.propertyName;
        var innerConstraint = getInnerConstraint('MyPropertyType');
        
        validatePropertyVisitorMock(1, 0, 1, visitor.startPropertyVisitor, property, test.propertyName, undefined, path, groups, test.violations, test.globalViolations, visitor);
        
        validateTypeVisitor(1, 0, 2, visitor.startTypeVisitor, 'MyPropertyType', value, propertyPath, groups, test.globalViolations, test.globalViolations, visitor);
        validateConstraintVisitorMock(2, 0, 3, visitor.startConstraintVisitor, innerConstraint, value, propertyPath, groups, test.globalViolations, test.globalViolations, visitor);
        validateValidatorVisitorMock(2, 0, 4, visitor.startValidatorVisitor, innerConstraint, value, propertyPath, groups, test.globalViolations, test.globalViolations, visitor);
        validateValidatorVisitorMock(2, 0, 5, visitor.endValidatorVisitor, innerConstraint, value, propertyPath, groups, test.globalViolations, test.globalViolations, visitor);
        validateConstraintVisitorMock(2, 0, 6, visitor.endConstraintVisitor, innerConstraint, value, propertyPath, groups, test.globalViolations, test.globalViolations, visitor);
        validateTypeVisitor(1, 0, 7, visitor.endTypeVisitor, 'MyPropertyType', value, propertyPath, groups, test.globalViolations, test.globalViolations, visitor);
        
        validateConstraintVisitorMock(2, 1, 8, visitor.startConstraintVisitor, constraint, value, propertyPath, groups, test.violations, test.globalViolations, visitor);
        validateValidatorVisitorMock(2, 1, 9, visitor.startValidatorVisitor, constraint, value, propertyPath, groups, test.violations, test.globalViolations, visitor);
        validateValidatorVisitorMock(2, 1, 10, visitor.endValidatorVisitor, constraint, value, propertyPath, groups, test.violations, test.globalViolations, visitor);
        validateConstraintVisitorMock(2, 1, 11, visitor.endConstraintVisitor, constraint, value, propertyPath, groups, test.violations, test.globalViolations, visitor);
        
        validatePropertyVisitorMock(1, 0, 12, visitor.endPropertyVisitor, property, test.propertyName, undefined, path, groups, test.violations, test.globalViolations, visitor);
        
        expect(test.violations).toEqual([]);
        expect(test.globalViolations).toEqual([]);
    });
});

describe('#visitPropertyDescriptor with cascade', () => {
    var visitor: jbv.Visitor = {
        startTypeVisitor: fn(true),
        endTypeVisitor: fn(),
        startPropertyVisitor: fn(true),
        endPropertyVisitor: fn(),
        startConstraintVisitor: fn(true),
        endConstraintVisitor: fn(),
        startValidatorVisitor: fn(true),
        endValidatorVisitor: fn(),
        recursively: true
    };
    
    afterEach(() => {
        visitor = {
            startTypeVisitor: fn(true),
            endTypeVisitor: fn(),
            startPropertyVisitor: fn(true),
            endPropertyVisitor: fn(),
            startConstraintVisitor: fn(true),
            endConstraintVisitor: fn(),
            startValidatorVisitor: fn(true),
            endValidatorVisitor: fn(),
            recursively: true
        };
        order = 0;
        testUtils.clean();
    });
    
    test('Valid cascade type', () => {
        var constraint = {
            constraintName: 'MyConstraint'
        };
        var property = {
            porpertyTypeName: 'MyPropertyType',
            constraints: [constraint],
            cascade: true
        };
        var test = testUtils.registerMyPropertyConstraint(property, path, true, true);
        
        jbv.visitPropertyDescriptor(property, test.propertyName, test.objectWithProperty, path, groups, test.violations, test.globalViolations, visitor);
        
        var value = test.objectWithProperty[test.propertyName];
        var propertyPath = path + '.' + test.propertyName;
        var innerConstraint = getInnerConstraint('MyPropertyType');
        var objectConstraint = { constraintName: 'Object', defaultValuesLoaded: true};
        
        validatePropertyVisitorMock(1, 0, 1, visitor.startPropertyVisitor, property, test.propertyName, test.objectWithProperty, path, groups, test.violations, test.globalViolations, visitor);
        
        validateTypeVisitor(1, 0, 2, visitor.startTypeVisitor, 'MyPropertyType', value, propertyPath, groups, test.violations, test.globalViolations, visitor);
        
        validateConstraintVisitorMock(3, 0, 3, visitor.startConstraintVisitor, innerConstraint, value, propertyPath, groups, test.violations, test.globalViolations, visitor);
        validateValidatorVisitorMock(3, 0, 4, visitor.startValidatorVisitor, innerConstraint, value, propertyPath, groups, test.violations, test.globalViolations, visitor);
        validateValidatorVisitorMock(3, 0, 5, visitor.endValidatorVisitor, innerConstraint, value, propertyPath, groups, test.violations, test.globalViolations, visitor);
        validateConstraintVisitorMock(3, 0, 6, visitor.endConstraintVisitor, innerConstraint, value, propertyPath, groups, test.violations, test.globalViolations, visitor);
        
        validateConstraintVisitorMock(3, 1, 7, visitor.startConstraintVisitor, objectConstraint, value, propertyPath, groups, test.violations, test.globalViolations, visitor, false, true);
        validateValidatorVisitorMock(3, 1, 8, visitor.startValidatorVisitor, objectConstraint, value, propertyPath, groups, test.violations, test.globalViolations, visitor);
        validateValidatorVisitorMock(3, 1, 9, visitor.endValidatorVisitor, objectConstraint, value, propertyPath, groups, test.violations, test.globalViolations, visitor);
        validateConstraintVisitorMock(3, 1, 10, visitor.endConstraintVisitor, objectConstraint, value, propertyPath, groups, test.violations, test.globalViolations, visitor, false, true);
        
        validateTypeVisitor(1, 0, 11, visitor.endTypeVisitor, 'MyPropertyType', value, propertyPath, groups, test.violations, test.globalViolations, visitor);
        
        validateConstraintVisitorMock(3, 2, 12, visitor.startConstraintVisitor, constraint, value, propertyPath, groups, test.violations, test.globalViolations, visitor);
        validateValidatorVisitorMock(3, 2, 13, visitor.startValidatorVisitor, constraint, value, propertyPath, groups, test.violations, test.globalViolations, visitor);
        validateValidatorVisitorMock(3, 2, 14, visitor.endValidatorVisitor, constraint, value, propertyPath, groups, test.violations, test.globalViolations, visitor);
        validateConstraintVisitorMock(3, 2, 15, visitor.endConstraintVisitor, constraint, value, propertyPath, groups, test.violations, test.globalViolations, visitor);
        
        validatePropertyVisitorMock(1, 0, 16, visitor.endPropertyVisitor, property, test.propertyName, test.objectWithProperty, path, groups, test.violations, test.globalViolations, visitor);
        
        expect(test.violations).toEqual([]);
        expect(test.globalViolations).toEqual([]);
    });
    
    test('Invalid cascade type acording to type validator', () => {
        var constraint = {
            constraintName: 'MyConstraint'
        };
        var property = {
            porpertyTypeName: 'MyPropertyType',
            constraints: [constraint],
            cascade: true
        };
        var test = testUtils.registerMyPropertyConstraint(property, path, false, true);
        
        jbv.visitPropertyDescriptor(property, test.propertyName, test.objectWithProperty, path, groups, test.violations, test.globalViolations, visitor);
        
        var value = test.objectWithProperty[test.propertyName];
        var propertyPath = path + '.' + test.propertyName;
        var innerConstraint = getInnerConstraint('MyPropertyType');
        var objectConstraint = { constraintName: 'Object', defaultValuesLoaded: true};
        
        validatePropertyVisitorMock(1, 0, 1, visitor.startPropertyVisitor, property, test.propertyName, test.objectWithProperty, path, groups, test.violations, test.globalViolations, visitor);
        
        validateTypeVisitor(1, 0, 2, visitor.startTypeVisitor, 'MyPropertyType', value, propertyPath, groups, test.violations, test.globalViolations, visitor);
        
        validateConstraintVisitorMock(3, 0, 3, visitor.startConstraintVisitor, innerConstraint, value, propertyPath, groups, test.violations, test.globalViolations, visitor);
        validateValidatorVisitorMock(3, 0, 4, visitor.startValidatorVisitor, innerConstraint, value, propertyPath, groups, test.violations, test.globalViolations, visitor);
        validateValidatorVisitorMock(3, 0, 5, visitor.endValidatorVisitor, innerConstraint, value, propertyPath, groups, test.violations, test.globalViolations, visitor);
        validateConstraintVisitorMock(3, 0, 6, visitor.endConstraintVisitor, innerConstraint, value, propertyPath, groups, test.violations, test.globalViolations, visitor);
        
        validateConstraintVisitorMock(3, 1, 7, visitor.startConstraintVisitor, objectConstraint, value, propertyPath, groups, test.violations, test.globalViolations, visitor, false, true);
        validateValidatorVisitorMock(3, 1, 8, visitor.startValidatorVisitor, objectConstraint, value, propertyPath, groups, test.violations, test.globalViolations, visitor);
        validateValidatorVisitorMock(3, 1, 9, visitor.endValidatorVisitor, objectConstraint, value, propertyPath, groups, test.violations, test.globalViolations, visitor);
        validateConstraintVisitorMock(3, 1, 10, visitor.endConstraintVisitor, objectConstraint, value, propertyPath, groups, test.violations, test.globalViolations, visitor, false, true);
        
        validateTypeVisitor(1, 0, 11, visitor.endTypeVisitor, 'MyPropertyType', value, propertyPath, groups, test.violations, test.globalViolations, visitor);
        
        validateConstraintVisitorMock(3, 2, 12, visitor.startConstraintVisitor, constraint, value, propertyPath, groups, test.violations, test.globalViolations, visitor);
        validateValidatorVisitorMock(3, 2, 13, visitor.startValidatorVisitor, constraint, value, propertyPath, groups, test.violations, test.globalViolations, visitor);
        validateValidatorVisitorMock(3, 2, 14, visitor.endValidatorVisitor, constraint, value, propertyPath, groups, test.violations, test.globalViolations, visitor);
        validateConstraintVisitorMock(3, 2, 15, visitor.endConstraintVisitor, constraint, value, propertyPath, groups, test.violations, test.globalViolations, visitor);
        
        validatePropertyVisitorMock(1, 0, 16, visitor.endPropertyVisitor, property, test.propertyName, test.objectWithProperty, path, groups, test.violations, test.globalViolations, visitor);
        
        expect(test.violations).toEqual([]);
        expect(test.globalViolations).toEqual([]);
    });

    test('Invalid cascade type acording to validator and type validator', () => {
        var constraint = {
            constraintName: 'MyConstraint'
        };
        var property = {
            porpertyTypeName: 'MyPropertyType',
            constraints: [constraint],
            cascade: true
        };
        var test = testUtils.registerMyPropertyConstraint(property, path, false, false);
        
        jbv.visitPropertyDescriptor(property, test.propertyName, test.objectWithProperty, path, groups, test.violations, test.globalViolations, visitor);
        
        var value = test.objectWithProperty[test.propertyName];
        var propertyPath = path + '.' + test.propertyName;
        var innerConstraint = getInnerConstraint('MyPropertyType');
        var objectConstraint = { constraintName: 'Object', defaultValuesLoaded: true};
        
        validatePropertyVisitorMock(1, 0, 1, visitor.startPropertyVisitor, property, test.propertyName, test.objectWithProperty, path, groups, test.violations, test.globalViolations, visitor);
        
        validateTypeVisitor(1, 0, 2, visitor.startTypeVisitor, 'MyPropertyType', value, propertyPath, groups, test.violations, test.globalViolations, visitor);
        
        validateConstraintVisitorMock(3, 0, 3, visitor.startConstraintVisitor, innerConstraint, value, propertyPath, groups, test.violations, test.globalViolations, visitor);
        validateValidatorVisitorMock(3, 0, 4, visitor.startValidatorVisitor, innerConstraint, value, propertyPath, groups, test.violations, test.globalViolations, visitor);
        validateValidatorVisitorMock(3, 0, 5, visitor.endValidatorVisitor, innerConstraint, value, propertyPath, groups, test.violations, test.globalViolations, visitor);
        validateConstraintVisitorMock(3, 0, 6, visitor.endConstraintVisitor, innerConstraint, value, propertyPath, groups, test.violations, test.globalViolations, visitor);
        
        validateConstraintVisitorMock(3, 1, 7, visitor.startConstraintVisitor, objectConstraint, value, propertyPath, groups, test.violations, test.globalViolations, visitor, false, true);
        validateValidatorVisitorMock(3, 1, 8, visitor.startValidatorVisitor, objectConstraint, value, propertyPath, groups, test.violations, test.globalViolations, visitor);
        validateValidatorVisitorMock(3, 1, 9, visitor.endValidatorVisitor, objectConstraint, value, propertyPath, groups, test.violations, test.globalViolations, visitor);
        validateConstraintVisitorMock(3, 1, 10, visitor.endConstraintVisitor, objectConstraint, value, propertyPath, groups, test.violations, test.globalViolations, visitor, false, true);
        
        validateTypeVisitor(1, 0, 11, visitor.endTypeVisitor, 'MyPropertyType', value, propertyPath, groups, test.violations, test.globalViolations, visitor);
        
        validateConstraintVisitorMock(3, 2, 12, visitor.startConstraintVisitor, constraint, value, propertyPath, groups, test.violations, test.globalViolations, visitor);
        validateValidatorVisitorMock(3, 2, 13, visitor.startValidatorVisitor, constraint, value, propertyPath, groups, test.violations, test.globalViolations, visitor);
        validateValidatorVisitorMock(3, 2, 14, visitor.endValidatorVisitor, constraint, value, propertyPath, groups, test.violations, test.globalViolations, visitor);
        validateConstraintVisitorMock(3, 2, 15, visitor.endConstraintVisitor, constraint, value, propertyPath, groups, test.violations, test.globalViolations, visitor);
        
        validatePropertyVisitorMock(1, 0, 16, visitor.endPropertyVisitor, property, test.propertyName, test.objectWithProperty, path, groups, test.violations, test.globalViolations, visitor);
        
        expect(test.violations).toEqual([]);
        expect(test.globalViolations).toEqual([]);
    });
    
    test('Invalid cascade type acording to validator and type validator', () => {
        var constraint = {
            constraintName: 'MyConstraint'
        };
        var property = {
            porpertyTypeName: 'MyPropertyType',
            constraints: [constraint],
            cascade: true
        };
        var test = testUtils.registerMyPropertyConstraint(property, path, false, false);
        test.globalViolations = test.violations;
        
        jbv.visitPropertyDescriptor(property, test.propertyName, test.objectWithProperty, path, groups, test.violations, test.globalViolations, visitor);
        
        var value = test.objectWithProperty[test.propertyName];
        var propertyPath = path + '.' + test.propertyName;
        var innerConstraint = getInnerConstraint('MyPropertyType');
        var objectConstraint = { constraintName: 'Object', defaultValuesLoaded: true};
        
        validatePropertyVisitorMock(1, 0, 1, visitor.startPropertyVisitor, property, test.propertyName, test.objectWithProperty, path, groups, test.violations, test.globalViolations, visitor);
        
        validateTypeVisitor(1, 0, 2, visitor.startTypeVisitor, 'MyPropertyType', value, propertyPath, groups, test.violations, test.globalViolations, visitor);
        
        validateConstraintVisitorMock(3, 0, 3, visitor.startConstraintVisitor, innerConstraint, value, propertyPath, groups, test.violations, test.globalViolations, visitor);
        validateValidatorVisitorMock(3, 0, 4, visitor.startValidatorVisitor, innerConstraint, value, propertyPath, groups, test.violations, test.globalViolations, visitor);
        validateValidatorVisitorMock(3, 0, 5, visitor.endValidatorVisitor, innerConstraint, value, propertyPath, groups, test.violations, test.globalViolations, visitor);
        validateConstraintVisitorMock(3, 0, 6, visitor.endConstraintVisitor, innerConstraint, value, propertyPath, groups, test.violations, test.globalViolations, visitor);
        
        validateConstraintVisitorMock(3, 1, 7, visitor.startConstraintVisitor, objectConstraint, value, propertyPath, groups, test.violations, test.globalViolations, visitor, false, true);
        validateValidatorVisitorMock(3, 1, 8, visitor.startValidatorVisitor, objectConstraint, value, propertyPath, groups, test.violations, test.globalViolations, visitor);
        validateValidatorVisitorMock(3, 1, 9, visitor.endValidatorVisitor, objectConstraint, value, propertyPath, groups, test.violations, test.globalViolations, visitor);
        validateConstraintVisitorMock(3, 1, 10, visitor.endConstraintVisitor, objectConstraint, value, propertyPath, groups, test.violations, test.globalViolations, visitor, false, true);
        
        validateTypeVisitor(1, 0, 11, visitor.endTypeVisitor, 'MyPropertyType', value, propertyPath, groups, test.violations, test.globalViolations, visitor);
        
        validateConstraintVisitorMock(3, 2, 12, visitor.startConstraintVisitor, constraint, value, propertyPath, groups, test.violations, test.globalViolations, visitor);
        validateValidatorVisitorMock(3, 2, 13, visitor.startValidatorVisitor, constraint, value, propertyPath, groups, test.violations, test.globalViolations, visitor);
        validateValidatorVisitorMock(3, 2, 14, visitor.endValidatorVisitor, constraint, value, propertyPath, groups, test.violations, test.globalViolations, visitor);
        validateConstraintVisitorMock(3, 2, 15, visitor.endConstraintVisitor, constraint, value, propertyPath, groups, test.violations, test.globalViolations, visitor);
        
        validatePropertyVisitorMock(1, 0, 16, visitor.endPropertyVisitor, property, test.propertyName, test.objectWithProperty, path, groups, test.violations, test.globalViolations, visitor);
        
        expect(test.violations).toEqual([]);
    });
    
    test('Invalid cascade type without property constraint', () => {
        var property = {
            porpertyTypeName: 'MyPropertyType',
            cascade: true
        };
        var test = testUtils.registerMyPropertyConstraint(property, path, false, false);
        
        jbv.visitPropertyDescriptor(property, test.propertyName, test.objectWithProperty, path, groups, test.violations, test.globalViolations, visitor);
        
        var value = test.objectWithProperty[test.propertyName];
        var propertyPath = path + '.' + test.propertyName;
        var innerConstraint = getInnerConstraint('MyPropertyType');
        var objectConstraint = { constraintName: 'Object', defaultValuesLoaded: true};
        
        validatePropertyVisitorMock(1, 0, 1, visitor.startPropertyVisitor, property, test.propertyName, test.objectWithProperty, path, groups, test.violations, test.globalViolations, visitor);
        
        validateTypeVisitor(1, 0, 2, visitor.startTypeVisitor, 'MyPropertyType', value, propertyPath, groups, test.violations, test.globalViolations, visitor);
        
        validateConstraintVisitorMock(2, 0, 3, visitor.startConstraintVisitor, innerConstraint, value, propertyPath, groups, test.violations, test.globalViolations, visitor);
        validateValidatorVisitorMock(2, 0, 4, visitor.startValidatorVisitor, innerConstraint, value, propertyPath, groups, test.violations, test.globalViolations, visitor);
        validateValidatorVisitorMock(2, 0, 5, visitor.endValidatorVisitor, innerConstraint, value, propertyPath, groups, test.violations, test.globalViolations, visitor);
        validateConstraintVisitorMock(2, 0, 6, visitor.endConstraintVisitor, innerConstraint, value, propertyPath, groups, test.violations, test.globalViolations, visitor);
        
        validateConstraintVisitorMock(2, 1, 7, visitor.startConstraintVisitor, objectConstraint, value, propertyPath, groups, test.violations, test.globalViolations, visitor, false, true);
        validateValidatorVisitorMock(2, 1, 8, visitor.startValidatorVisitor, objectConstraint, value, propertyPath, groups, test.violations, test.globalViolations, visitor);
        validateValidatorVisitorMock(2, 1, 9, visitor.endValidatorVisitor, objectConstraint, value, propertyPath, groups, test.violations, test.globalViolations, visitor);
        validateConstraintVisitorMock(2, 1, 10, visitor.endConstraintVisitor, objectConstraint, value, propertyPath, groups, test.violations, test.globalViolations, visitor, false, true);
        
        validateTypeVisitor(1, 0, 11, visitor.endTypeVisitor, 'MyPropertyType', value, propertyPath, groups, test.violations, test.globalViolations, visitor);
        
        validatePropertyVisitorMock(1, 0, 12, visitor.endPropertyVisitor, property, test.propertyName, test.objectWithProperty, path, groups, test.violations, test.globalViolations, visitor);
        
        expect(test.violations).toEqual([]);
        expect(test.globalViolations).toEqual([]);
    });

    test('Invalid cascade type with null object with property', () => {
        var constraint = {
            constraintName: 'MyConstraint'
        };
        var property = {
            porpertyTypeName: 'MyPropertyType',
            constraints: [constraint],
            cascade: true
        };
        var test = testUtils.registerMyPropertyConstraint(property, path, false, false);
        test.objectWithProperty.myProperty = undefined;
        
        jbv.visitPropertyDescriptor(property, test.propertyName, null, path, groups, test.violations, test.globalViolations, visitor);
        
        var value = test.objectWithProperty[test.propertyName];
        var propertyPath = path + '.' + test.propertyName;
        var innerConstraint = getInnerConstraint('MyPropertyType');
        
        validatePropertyVisitorMock(1, 0, 1, visitor.startPropertyVisitor, property, test.propertyName, null, path, groups, test.violations, test.globalViolations, visitor);
        
        validateTypeVisitor(1, 0, 2, visitor.startTypeVisitor, 'MyPropertyType', value, propertyPath, groups, test.violations, test.globalViolations, visitor);
        
        validateConstraintVisitorMock(2, 0, 3, visitor.startConstraintVisitor, innerConstraint, value, propertyPath, groups, test.violations, test.globalViolations, visitor);
        validateValidatorVisitorMock(2, 0, 4, visitor.startValidatorVisitor, innerConstraint, value, propertyPath, groups, test.violations, test.globalViolations, visitor);
        validateValidatorVisitorMock(2, 0, 5, visitor.endValidatorVisitor, innerConstraint, value, propertyPath, groups, test.violations, test.globalViolations, visitor);
        validateConstraintVisitorMock(2, 0, 6, visitor.endConstraintVisitor, innerConstraint, value, propertyPath, groups, test.violations, test.globalViolations, visitor);
        
        validateTypeVisitor(1, 0, 7, visitor.endTypeVisitor, 'MyPropertyType', value, propertyPath, groups, test.violations, test.globalViolations, visitor);
        
        validateConstraintVisitorMock(2, 1, 8, visitor.startConstraintVisitor, constraint, value, propertyPath, groups, test.violations, test.globalViolations, visitor);
        validateValidatorVisitorMock(2, 1, 9, visitor.startValidatorVisitor, constraint, value, propertyPath, groups, test.violations, test.globalViolations, visitor);
        validateValidatorVisitorMock(2, 1, 10, visitor.endValidatorVisitor, constraint, value, propertyPath, groups, test.violations, test.globalViolations, visitor);
        validateConstraintVisitorMock(2, 1, 11, visitor.endConstraintVisitor, constraint, value, propertyPath, groups, test.violations, test.globalViolations, visitor);
        
        validatePropertyVisitorMock(1, 0, 12, visitor.endPropertyVisitor, property, test.propertyName, null, path, groups, test.violations, test.globalViolations, visitor);
        
        expect(test.violations).toEqual([]);
        expect(test.globalViolations).toEqual([]);
    });

    test('Invalid cascade type with undefined object with property', () => {
        var constraint = {
            constraintName: 'MyConstraint'
        };
        var property = {
            porpertyTypeName: 'MyPropertyType',
            constraints: [constraint],
            cascade: true
        };
        var test = testUtils.registerMyPropertyConstraint(property, path, false, false);
        test.objectWithProperty.myProperty = undefined;
        
        jbv.visitPropertyDescriptor(property, test.propertyName, undefined, path, groups, test.violations, test.globalViolations, visitor);
        
        var value = test.objectWithProperty[test.propertyName];
        var propertyPath = path + '.' + test.propertyName;
        var innerConstraint = getInnerConstraint('MyPropertyType');
        
        validatePropertyVisitorMock(1, 0, 1, visitor.startPropertyVisitor, property, test.propertyName, undefined, path, groups, test.violations, test.globalViolations, visitor);
        
        validateTypeVisitor(1, 0, 2, visitor.startTypeVisitor, 'MyPropertyType', value, propertyPath, groups, test.violations, test.globalViolations, visitor);
        
        validateConstraintVisitorMock(2, 0, 3, visitor.startConstraintVisitor, innerConstraint, value, propertyPath, groups, test.violations, test.globalViolations, visitor);
        validateValidatorVisitorMock(2, 0, 4, visitor.startValidatorVisitor, innerConstraint, value, propertyPath, groups, test.violations, test.globalViolations, visitor);
        validateValidatorVisitorMock(2, 0, 5, visitor.endValidatorVisitor, innerConstraint, value, propertyPath, groups, test.violations, test.globalViolations, visitor);
        validateConstraintVisitorMock(2, 0, 6, visitor.endConstraintVisitor, innerConstraint, value, propertyPath, groups, test.violations, test.globalViolations, visitor);
        
        validateTypeVisitor(1, 0, 7, visitor.endTypeVisitor, 'MyPropertyType', value, propertyPath, groups, test.violations, test.globalViolations, visitor);
        
        validateConstraintVisitorMock(2, 1, 8, visitor.startConstraintVisitor, constraint, value, propertyPath, groups, test.violations, test.globalViolations, visitor);
        validateValidatorVisitorMock(2, 1, 9, visitor.startValidatorVisitor, constraint, value, propertyPath, groups, test.violations, test.globalViolations, visitor);
        validateValidatorVisitorMock(2, 1, 10, visitor.endValidatorVisitor, constraint, value, propertyPath, groups, test.violations, test.globalViolations, visitor);
        validateConstraintVisitorMock(2, 1, 11, visitor.endConstraintVisitor, constraint, value, propertyPath, groups, test.violations, test.globalViolations, visitor);
        
        validatePropertyVisitorMock(1, 0, 12, visitor.endPropertyVisitor, property, test.propertyName, undefined, path, groups, test.violations, test.globalViolations, visitor);
        
        expect(test.violations).toEqual([]);
        expect(test.globalViolations).toEqual([]);
    });
});

describe('#visitTypeDescriptor', () => {
    var visitor: jbv.Visitor = {
        startTypeVisitor: fn(true),
        endTypeVisitor: fn(),
        startPropertyVisitor: fn(true),
        endPropertyVisitor: fn(),
        startConstraintVisitor: fn(true),
        endConstraintVisitor: fn(),
        startValidatorVisitor: fn(true),
        endValidatorVisitor: fn(),
        recursively: true
    };
    
    afterEach(() => {
        visitor = {
            startTypeVisitor: fn(true),
            endTypeVisitor: fn(),
            startPropertyVisitor: fn(true),
            endPropertyVisitor: fn(),
            startConstraintVisitor: fn(true),
            endConstraintVisitor: fn(),
            startValidatorVisitor: fn(true),
            endValidatorVisitor: fn(),
            recursively: true
        };
        order = 0;
        testUtils.clean();
    });
    
    test('Valid cascade type', () => {
        var propertyConstraint = {
            constraintName: 'MyConstraint'
        };
        var property = {
            porpertyTypeName: 'MyPropertyType',
            constraints: [propertyConstraint],
            cascade: true
        };
        var type = {
            typeName: 'MyType',
            properties: {
                myProperty: property
            }
        };
        var test = testUtils.registerMyPropertyConstraint(property, path, true, true);
        
        jbv.visitTypeDescriptor(type, test.objectWithProperty, path, groups, test.violations, test.globalViolations, visitor);
        
        var propertyValue = test.objectWithProperty[test.propertyName];
        var propertyPath = path + '.' + test.propertyName;
        var propertyTypeInnerConstraint = getInnerConstraint('MyPropertyType');
        var objectConstraint = { constraintName: 'Object', defaultValuesLoaded: true};
        
        validateTypeVisitor(2, 0, 1, visitor.startTypeVisitor, type, test.objectWithProperty, path, groups, test.violations, test.globalViolations, visitor);
        
        validateConstraintVisitorMock(4, 0, 2, visitor.startConstraintVisitor, objectConstraint, test.objectWithProperty, path, groups, test.violations, test.globalViolations, visitor, false, true);
        validateValidatorVisitorMock(4, 0, 3, visitor.startValidatorVisitor, objectConstraint, test.objectWithProperty, path, groups, test.violations, test.globalViolations, visitor);
        validateValidatorVisitorMock(4, 0, 4, visitor.endValidatorVisitor, objectConstraint, test.objectWithProperty, path, groups, test.violations, test.globalViolations, visitor);
        validateConstraintVisitorMock(4, 0, 5, visitor.endConstraintVisitor, objectConstraint, test.objectWithProperty, path, groups, test.violations, test.globalViolations, visitor, false, true);
        
        validatePropertyVisitorMock(1, 0, 6, visitor.startPropertyVisitor, property, test.propertyName, test.objectWithProperty, path, groups, test.violations, test.globalViolations, visitor);
        
        validateTypeVisitor(2, 1, 7, visitor.startTypeVisitor, 'MyPropertyType', propertyValue, propertyPath, groups, test.violations, test.globalViolations, visitor);
        
        validateConstraintVisitorMock(4, 1, 8, visitor.startConstraintVisitor, propertyTypeInnerConstraint, propertyValue, propertyPath, groups, test.violations, test.globalViolations, visitor);
        validateValidatorVisitorMock(4, 1, 9, visitor.startValidatorVisitor, propertyTypeInnerConstraint, propertyValue, propertyPath, groups, test.violations, test.globalViolations, visitor);
        validateValidatorVisitorMock(4, 1, 10, visitor.endValidatorVisitor, propertyTypeInnerConstraint, propertyValue, propertyPath, groups, test.violations, test.globalViolations, visitor);
        validateConstraintVisitorMock(4, 1, 11, visitor.endConstraintVisitor, propertyTypeInnerConstraint, propertyValue, propertyPath, groups, test.violations, test.globalViolations, visitor);
        
        validateConstraintVisitorMock(4, 2, 12, visitor.startConstraintVisitor, objectConstraint, propertyValue, propertyPath, groups, test.violations, test.globalViolations, visitor, false, true);
        validateValidatorVisitorMock(4, 2, 13, visitor.startValidatorVisitor, objectConstraint, propertyValue, propertyPath, groups, test.violations, test.globalViolations, visitor);
        validateValidatorVisitorMock(4, 2, 14, visitor.endValidatorVisitor, objectConstraint, propertyValue, propertyPath, groups, test.violations, test.globalViolations, visitor);
        validateConstraintVisitorMock(4, 2, 15, visitor.endConstraintVisitor, objectConstraint, propertyValue, propertyPath, groups, test.violations, test.globalViolations, visitor, false, true);
        
        validateTypeVisitor(2, 0, 16, visitor.endTypeVisitor, 'MyPropertyType', propertyValue, propertyPath, groups, test.violations, test.globalViolations, visitor);
        
        validateConstraintVisitorMock(4, 3, 17, visitor.startConstraintVisitor, propertyConstraint, propertyValue, propertyPath, groups, test.violations, test.globalViolations, visitor);
        validateValidatorVisitorMock(4, 3, 18, visitor.startValidatorVisitor, propertyConstraint, propertyValue, propertyPath, groups, test.violations, test.globalViolations, visitor);
        validateValidatorVisitorMock(4, 3, 19, visitor.endValidatorVisitor, propertyConstraint, propertyValue, propertyPath, groups, test.violations, test.globalViolations, visitor);
        validateConstraintVisitorMock(4, 3, 20, visitor.endConstraintVisitor, propertyConstraint, propertyValue, propertyPath, groups, test.violations, test.globalViolations, visitor);
        
        validatePropertyVisitorMock(1, 0, 21, visitor.endPropertyVisitor, property, test.propertyName, test.objectWithProperty, path, groups, test.violations, test.globalViolations, visitor);
        
        validateTypeVisitor(2, 1, 22, visitor.endTypeVisitor, type, test.objectWithProperty, path, groups, test.violations, test.globalViolations, visitor);
        
        expect(test.violations).toEqual([]);
        expect(test.globalViolations).toEqual([]);
    });
    
    test('Invalid cascade type', () => {
        var propertyConstraint = {
            constraintName: 'MyConstraint'
        };
        var property = {
            porpertyTypeName: 'MyPropertyType',
            constraints: [propertyConstraint],
            cascade: true
        };
        var type = {
            typeName: 'MyType',
            properties: {
                myProperty: property
            }
        };
        var test = testUtils.registerMyPropertyConstraint(property, path, true, false);
        
        jbv.visitTypeDescriptor(type, test.objectWithProperty, path, groups, test.violations, test.globalViolations, visitor);
        
        var propertyValue = test.objectWithProperty[test.propertyName];
        var propertyPath = path + '.' + test.propertyName;
        var propertyTypeInnerConstraint = getInnerConstraint('MyPropertyType');
        var objectConstraint = { constraintName: 'Object', defaultValuesLoaded: true};
        
        validateTypeVisitor(2, 0, 1, visitor.startTypeVisitor, type, test.objectWithProperty, path, groups, test.violations, test.globalViolations, visitor);
        
        validateConstraintVisitorMock(4, 0, 2, visitor.startConstraintVisitor, objectConstraint, test.objectWithProperty, path, groups, test.violations, test.globalViolations, visitor, false, true);
        validateValidatorVisitorMock(4, 0, 3, visitor.startValidatorVisitor, objectConstraint, test.objectWithProperty, path, groups, test.violations, test.globalViolations, visitor);
        validateValidatorVisitorMock(4, 0, 4, visitor.endValidatorVisitor, objectConstraint, test.objectWithProperty, path, groups, test.violations, test.globalViolations, visitor);
        validateConstraintVisitorMock(4, 0, 5, visitor.endConstraintVisitor, objectConstraint, test.objectWithProperty, path, groups, test.violations, test.globalViolations, visitor, false, true);
        
        validatePropertyVisitorMock(1, 0, 6, visitor.startPropertyVisitor, property, test.propertyName, test.objectWithProperty, path, groups, test.violations, test.globalViolations, visitor);
        
        validateTypeVisitor(2, 1, 7, visitor.startTypeVisitor, 'MyPropertyType', propertyValue, propertyPath, groups, test.violations, test.globalViolations, visitor);
        
        validateConstraintVisitorMock(4, 1, 8, visitor.startConstraintVisitor, propertyTypeInnerConstraint, propertyValue, propertyPath, groups, test.violations, test.globalViolations, visitor);
        validateValidatorVisitorMock(4, 1, 9, visitor.startValidatorVisitor, propertyTypeInnerConstraint, propertyValue, propertyPath, groups, test.violations, test.globalViolations, visitor);
        validateValidatorVisitorMock(4, 1, 10, visitor.endValidatorVisitor, propertyTypeInnerConstraint, propertyValue, propertyPath, groups, test.violations, test.globalViolations, visitor);
        validateConstraintVisitorMock(4, 1, 11, visitor.endConstraintVisitor, propertyTypeInnerConstraint, propertyValue, propertyPath, groups, test.violations, test.globalViolations, visitor);
        
        validateConstraintVisitorMock(4, 2, 12, visitor.startConstraintVisitor, objectConstraint, propertyValue, propertyPath, groups, test.violations, test.globalViolations, visitor, false, true);
        validateValidatorVisitorMock(4, 2, 13, visitor.startValidatorVisitor, objectConstraint, propertyValue, propertyPath, groups, test.violations, test.globalViolations, visitor);
        validateValidatorVisitorMock(4, 2, 14, visitor.endValidatorVisitor, objectConstraint, propertyValue, propertyPath, groups, test.violations, test.globalViolations, visitor);
        validateConstraintVisitorMock(4, 2, 15, visitor.endConstraintVisitor, objectConstraint, propertyValue, propertyPath, groups, test.violations, test.globalViolations, visitor, false, true);
        
        validateTypeVisitor(2, 0, 16, visitor.endTypeVisitor, 'MyPropertyType', propertyValue, propertyPath, groups, test.violations, test.globalViolations, visitor);
        
        validateConstraintVisitorMock(4, 3, 17, visitor.startConstraintVisitor, propertyConstraint, propertyValue, propertyPath, groups, test.violations, test.globalViolations, visitor);
        validateValidatorVisitorMock(4, 3, 18, visitor.startValidatorVisitor, propertyConstraint, propertyValue, propertyPath, groups, test.violations, test.globalViolations, visitor);
        validateValidatorVisitorMock(4, 3, 19, visitor.endValidatorVisitor, propertyConstraint, propertyValue, propertyPath, groups, test.violations, test.globalViolations, visitor);
        validateConstraintVisitorMock(4, 3, 20, visitor.endConstraintVisitor, propertyConstraint, propertyValue, propertyPath, groups, test.violations, test.globalViolations, visitor);
        
        validatePropertyVisitorMock(1, 0, 21, visitor.endPropertyVisitor, property, test.propertyName, test.objectWithProperty, path, groups, test.violations, test.globalViolations, visitor);
        
        validateTypeVisitor(2, 1, 22, visitor.endTypeVisitor, type, test.objectWithProperty, path, groups, test.violations, test.globalViolations, visitor);
        
        expect(test.violations).toEqual([]);
        expect(test.globalViolations).toEqual([]);
    });
    
    test('Invalid cascade basic type', () => {
        var propertyConstraint = {
            constraintName: 'MyConstraint'
        };
        var property = {
            porpertyTypeName: 'MyPropertyType',
            constraints: [propertyConstraint],
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
        
        jbv.visitTypeDescriptor(type, test.objectWithProperty, path, groups, test.violations, test.globalViolations, visitor);
        
        var propertyValue = test.objectWithProperty[test.propertyName];
        var propertyPath = path + '.' + test.propertyName;
        var propertyTypeInnerConstraint = getInnerConstraint('MyPropertyType');
        var objectConstraint = { constraintName: 'Object', defaultValuesLoaded: true};
        
        validateTypeVisitor(2, 0, 1, visitor.startTypeVisitor, type, test.objectWithProperty, path, groups, test.globalViolations, test.globalViolations, visitor);
        
        validatePropertyVisitorMock(1, 0, 2, visitor.startPropertyVisitor, property, test.propertyName, test.objectWithProperty, path, groups, test.globalViolations, test.globalViolations, visitor);
        
        validateTypeVisitor(2, 1, 3, visitor.startTypeVisitor, 'MyPropertyType', propertyValue, propertyPath, groups, test.globalViolations, test.globalViolations, visitor);
        
        validateConstraintVisitorMock(3, 0, 4, visitor.startConstraintVisitor, propertyTypeInnerConstraint, propertyValue, propertyPath, groups, test.globalViolations, test.globalViolations, visitor);
        validateValidatorVisitorMock(3, 0, 5, visitor.startValidatorVisitor, propertyTypeInnerConstraint, propertyValue, propertyPath, groups, test.globalViolations, test.globalViolations, visitor);
        validateValidatorVisitorMock(3, 0, 6, visitor.endValidatorVisitor, propertyTypeInnerConstraint, propertyValue, propertyPath, groups, test.globalViolations, test.globalViolations, visitor);
        validateConstraintVisitorMock(3, 0, 7, visitor.endConstraintVisitor, propertyTypeInnerConstraint, propertyValue, propertyPath, groups, test.globalViolations, test.globalViolations, visitor);
        
        validateConstraintVisitorMock(3, 1, 8, visitor.startConstraintVisitor, objectConstraint, propertyValue, propertyPath, groups, test.globalViolations, test.globalViolations, visitor, false, true);
        validateValidatorVisitorMock(3, 1, 9, visitor.startValidatorVisitor, objectConstraint, propertyValue, propertyPath, groups, test.globalViolations, test.globalViolations, visitor);
        validateValidatorVisitorMock(3, 1, 10, visitor.endValidatorVisitor, objectConstraint, propertyValue, propertyPath, groups, test.globalViolations, test.globalViolations, visitor);
        validateConstraintVisitorMock(3, 1, 11, visitor.endConstraintVisitor, objectConstraint, propertyValue, propertyPath, groups, test.globalViolations, test.globalViolations, visitor, false, true);
        
        validateTypeVisitor(2, 0, 12, visitor.endTypeVisitor, 'MyPropertyType', propertyValue, propertyPath, groups, test.globalViolations, test.globalViolations, visitor);
        
        validateConstraintVisitorMock(3, 2, 13, visitor.startConstraintVisitor, propertyConstraint, propertyValue, propertyPath, groups, test.globalViolations, test.globalViolations, visitor);
        validateValidatorVisitorMock(3, 2, 14, visitor.startValidatorVisitor, propertyConstraint, propertyValue, propertyPath, groups, test.globalViolations, test.globalViolations, visitor);
        validateValidatorVisitorMock(3, 2, 15, visitor.endValidatorVisitor, propertyConstraint, propertyValue, propertyPath, groups, test.globalViolations, test.globalViolations, visitor);
        validateConstraintVisitorMock(3, 2, 16, visitor.endConstraintVisitor, propertyConstraint, propertyValue, propertyPath, groups, test.globalViolations, test.globalViolations, visitor);
        
        validatePropertyVisitorMock(1, 0, 17, visitor.endPropertyVisitor, property, test.propertyName, test.objectWithProperty, path, groups, test.globalViolations, test.globalViolations, visitor);
        
        validateTypeVisitor(2, 1, 18, visitor.endTypeVisitor, type, test.objectWithProperty, path, groups, test.globalViolations, test.globalViolations, visitor);
        
        expect(test.violations).toEqual([]);
        expect(test.globalViolations).toEqual([]);
    });
    
    test('Null cascade type', () => {
        var propertyConstraint = {
            constraintName: 'MyConstraint'
        };
        var property = {
            porpertyTypeName: 'MyPropertyType',
            constraints: [propertyConstraint],
            cascade: true
        };
        var type = {
            typeName: 'MyType',
            properties: {
                myProperty: property
            }
        };
        var test = testUtils.registerMyPropertyConstraint(property, path, true, true);
        
        jbv.visitTypeDescriptor(type, null, path, groups, test.violations, test.globalViolations, visitor);

        validateTypeVisitor(1, 0, 1, visitor.startTypeVisitor, type, null, path, groups, test.violations, test.globalViolations, visitor);
        validateTypeVisitor(1, 0, 2, visitor.endTypeVisitor, type, null, path, groups, test.violations, test.globalViolations, visitor);
        
        expect(test.violations).toEqual([]);
        expect(test.globalViolations).toEqual([]);
    });
    
    test('Undefined cascade type', () => {
        var propertyConstraint = {
            constraintName: 'MyConstraint'
        };
        var property = {
            porpertyTypeName: 'MyPropertyType',
            constraints: [propertyConstraint],
            cascade: true
        };
        var type = {
            typeName: 'MyType',
            properties: {
                myProperty: property
            }
        };
        var test = testUtils.registerMyPropertyConstraint(property, path, true, true);
        
        jbv.visitTypeDescriptor(type, undefined, path, groups, test.violations, test.globalViolations, visitor);
        
        validateTypeVisitor(1, 0, 1, visitor.startTypeVisitor, type, undefined, path, groups, test.violations, test.globalViolations, visitor);
        validateTypeVisitor(1, 0, 2, visitor.endTypeVisitor, type, undefined, path, groups, test.violations, test.globalViolations, visitor);

        expect(test.violations).toEqual([]);
        expect(test.globalViolations).toEqual([]);
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
        
        jbv.visitTypeDescriptor(type, test.value, path, groups, test.violations, test.globalViolations, visitor);
        
        var objectConstraint = { constraintName: 'Object', defaultValuesLoaded: true};
        
        validateTypeVisitor(1, 0, 1, visitor.startTypeVisitor, type, test.value, path, groups, test.violations, test.globalViolations, visitor);
        
        validateConstraintVisitorMock(2, 0, 2, visitor.startConstraintVisitor, constraint, test.value, path, groups, test.violations, test.globalViolations, visitor);
        validateValidatorVisitorMock(2, 0, 3, visitor.startValidatorVisitor, constraint, test.value, path, groups, test.violations, test.globalViolations, visitor);
        validateValidatorVisitorMock(2, 0, 4, visitor.endValidatorVisitor, constraint, test.value, path, groups, test.violations, test.globalViolations, visitor);
        validateConstraintVisitorMock(2, 0, 5, visitor.endConstraintVisitor, constraint, test.value, path, groups, test.violations, test.globalViolations, visitor);

        validateConstraintVisitorMock(2, 1, 6, visitor.startConstraintVisitor, objectConstraint, test.value, path, groups, test.violations, test.globalViolations, visitor, false, true);
        validateValidatorVisitorMock(2, 1, 7, visitor.startValidatorVisitor, objectConstraint, test.value, path, groups, test.violations, test.globalViolations, visitor);
        validateValidatorVisitorMock(2, 1, 8, visitor.endValidatorVisitor, objectConstraint, test.value, path, groups, test.violations, test.globalViolations, visitor);
        validateConstraintVisitorMock(2, 1, 9, visitor.endConstraintVisitor, objectConstraint, test.value, path, groups, test.violations, test.globalViolations, visitor, false, true);
        
        validateTypeVisitor(1, 0, 10, visitor.endTypeVisitor, type, test.value, path, groups, test.violations, test.globalViolations, visitor);
        
        expect(test.violations).toEqual([]);
        expect(test.globalViolations).toEqual([]);
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
        
        jbv.visitTypeDescriptor(type, test.value, path, groups, test.violations, test.globalViolations, visitor);
        
        var objectConstraint = { constraintName: 'Object', defaultValuesLoaded: true};
        
        validateTypeVisitor(1, 0, 1, visitor.startTypeVisitor, type, test.value, path, groups, test.violations, test.globalViolations, visitor);
        
        validateConstraintVisitorMock(2, 0, 2, visitor.startConstraintVisitor, constraint, test.value, path, groups, test.violations, test.globalViolations, visitor);
        validateValidatorVisitorMock(2, 0, 3, visitor.startValidatorVisitor, constraint, test.value, path, groups, test.violations, test.globalViolations, visitor);
        validateValidatorVisitorMock(2, 0, 4, visitor.endValidatorVisitor, constraint, test.value, path, groups, test.violations, test.globalViolations, visitor);
        validateConstraintVisitorMock(2, 0, 5, visitor.endConstraintVisitor, constraint, test.value, path, groups, test.violations, test.globalViolations, visitor);

        validateConstraintVisitorMock(2, 1, 6, visitor.startConstraintVisitor, objectConstraint, test.value, path, groups, test.violations, test.globalViolations, visitor, false, true);
        validateValidatorVisitorMock(2, 1, 7, visitor.startValidatorVisitor, objectConstraint, test.value, path, groups, test.violations, test.globalViolations, visitor);
        validateValidatorVisitorMock(2, 1, 8, visitor.endValidatorVisitor, objectConstraint, test.value, path, groups, test.violations, test.globalViolations, visitor);
        validateConstraintVisitorMock(2, 1, 9, visitor.endConstraintVisitor, objectConstraint, test.value, path, groups, test.violations, test.globalViolations, visitor, false, true);
        
        validateTypeVisitor(1, 0, 10, visitor.endTypeVisitor, type, test.value, path, groups, test.violations, test.globalViolations, visitor);
        
        expect(test.violations).toEqual([]);
        expect(test.globalViolations).toEqual([]);
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
        
        jbv.visitTypeDescriptor(type, test.value, path, groups, test.violations, test.globalViolations, visitor);
        
        validateTypeVisitor(1, 0, 1, visitor.startTypeVisitor, type, test.value, path, groups, test.globalViolations, test.globalViolations, visitor);
        
        validateConstraintVisitorMock(1, 0, 2, visitor.startConstraintVisitor, constraint, test.value, path, groups, test.globalViolations, test.globalViolations, visitor);
        validateValidatorVisitorMock(1, 0, 3, visitor.startValidatorVisitor, constraint, test.value, path, groups, test.globalViolations, test.globalViolations, visitor);
        validateValidatorVisitorMock(1, 0, 4, visitor.endValidatorVisitor, constraint, test.value, path, groups, test.globalViolations, test.globalViolations, visitor);
        validateConstraintVisitorMock(1, 0, 5, visitor.endConstraintVisitor, constraint, test.value, path, groups, test.globalViolations, test.globalViolations, visitor);

        validateTypeVisitor(1, 0, 6, visitor.endTypeVisitor, type, test.value, path, groups, test.globalViolations, test.globalViolations, visitor);
        
        expect(test.violations).toEqual([]);
        expect(test.globalViolations).toEqual([]);
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
        
        jbv.visitTypeDescriptor(type, test.value, path, groups, test.violations, test.globalViolations, visitor);
        
        var objectConstraint = { constraintName: 'Object', defaultValuesLoaded: true};
        
        validateTypeVisitor(1, 0, 1, visitor.startTypeVisitor, type, test.value, path, groups, test.violations, test.globalViolations, visitor);
        
        validateConstraintVisitorMock(2, 0, 2, visitor.startConstraintVisitor, constraint, test.value, path, groups, test.violations, test.globalViolations, visitor);
        validateValidatorVisitorMock(2, 0, 3, visitor.startValidatorVisitor, constraint, test.value, path, groups, test.violations, test.globalViolations, visitor);
        validateValidatorVisitorMock(2, 0, 4, visitor.endValidatorVisitor, constraint, test.value, path, groups, test.violations, test.globalViolations, visitor);
        validateConstraintVisitorMock(2, 0, 5, visitor.endConstraintVisitor, constraint, test.value, path, groups, test.violations, test.globalViolations, visitor);

        validateConstraintVisitorMock(2, 1, 6, visitor.startConstraintVisitor, objectConstraint, test.value, path, groups, test.violations, test.globalViolations, visitor, false, true);
        validateValidatorVisitorMock(2, 1, 7, visitor.startValidatorVisitor, objectConstraint, test.value, path, groups, test.violations, test.globalViolations, visitor);
        validateValidatorVisitorMock(2, 1, 8, visitor.endValidatorVisitor, objectConstraint, test.value, path, groups, test.violations, test.globalViolations, visitor);
        validateConstraintVisitorMock(2, 1, 9, visitor.endConstraintVisitor, objectConstraint, test.value, path, groups, test.violations, test.globalViolations, visitor, false, true);
        
        validateTypeVisitor(1, 0, 10, visitor.endTypeVisitor, type, test.value, path, groups, test.violations, test.globalViolations, visitor);
        
        expect(test.violations).toEqual([]);
        expect(test.globalViolations).toEqual([]);
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
        
        jbv.visitTypeDescriptor(type, test.value, path, groups, test.violations, test.globalViolations, visitor);
        
        validateTypeVisitor(1, 0, 1, visitor.startTypeVisitor, type, test.value, path, groups, test.globalViolations, test.globalViolations, visitor);
        
        validateConstraintVisitorMock(1, 0, 2, visitor.startConstraintVisitor, constraint, test.value, path, groups, test.globalViolations, test.globalViolations, visitor);
        validateValidatorVisitorMock(1, 0, 3, visitor.startValidatorVisitor, constraint, test.value, path, groups, test.globalViolations, test.globalViolations, visitor);
        validateValidatorVisitorMock(1, 0, 4, visitor.endValidatorVisitor, constraint, test.value, path, groups, test.globalViolations, test.globalViolations, visitor);
        validateConstraintVisitorMock(1, 0, 5, visitor.endConstraintVisitor, constraint, test.value, path, groups, test.globalViolations, test.globalViolations, visitor);

        validateTypeVisitor(1, 0, 6, visitor.endTypeVisitor, type, test.value, path, groups, test.globalViolations, test.globalViolations, visitor);
        
        expect(test.violations).toEqual([]);
        expect(test.globalViolations).toEqual([]);
    });
});

describe('#visitTypeDescriptor with collections', () => {
    var visitor: jbv.Visitor = {
        startTypeVisitor: fn(true),
        endTypeVisitor: fn(),
        startPropertyVisitor: fn(true),
        endPropertyVisitor: fn(),
        startConstraintVisitor: fn(true),
        endConstraintVisitor: fn(),
        startValidatorVisitor: fn(true),
        endValidatorVisitor: fn(),
        recursively: true
    };
    
    afterEach(() => {
        visitor = {
            startTypeVisitor: fn(true),
            endTypeVisitor: fn(),
            startPropertyVisitor: fn(true),
            endPropertyVisitor: fn(),
            startConstraintVisitor: fn(true),
            endConstraintVisitor: fn(),
            startValidatorVisitor: fn(true),
            endValidatorVisitor: fn(),
            recursively: true
        };
        order = 0;
        testUtils.clean();
    });

    test('Valid without descriptor', () => {
        var propertyConstraint = {
            constraintName: 'MyConstraint'
        }
        var property = {
            porpertyTypeName: 'MyPropertyType',
            constraints: [propertyConstraint],
            cascade: true
        };
        var type = {
            typeName: 'MyType',
            isCollection: true
        };
        var test = testUtils.registerMyPropertyConstraint(property, path, true, true);
        
        jbv.visitTypeDescriptor(type, test.objectWithProperty, path, groups, test.violations, test.globalViolations, visitor);
        
        var objectConstraint = { constraintName: 'Object', defaultValuesLoaded: true};
        
        validateTypeVisitor(1, 0, 1, visitor.startTypeVisitor, type, test.objectWithProperty, path, groups, test.violations, test.globalViolations, visitor);
        
        validateConstraintVisitorMock(1, 0, 2, visitor.startConstraintVisitor, objectConstraint, test.objectWithProperty, path, groups, test.violations, test.globalViolations, visitor, false, true);
        validateValidatorVisitorMock(1, 0, 3, visitor.startValidatorVisitor, objectConstraint, test.objectWithProperty, path, groups, test.violations, test.globalViolations, visitor);
        validateValidatorVisitorMock(1, 0, 4, visitor.endValidatorVisitor, objectConstraint, test.objectWithProperty, path, groups, test.violations, test.globalViolations, visitor);
        validateConstraintVisitorMock(1, 0, 5, visitor.endConstraintVisitor, objectConstraint, test.objectWithProperty, path, groups, test.violations, test.globalViolations, visitor, false, true);
        
        validateTypeVisitor(1, 0, 6, visitor.endTypeVisitor, type, test.objectWithProperty, path, groups, test.violations, test.globalViolations, visitor);
        
        expect(test.violations).toEqual([]);
        expect(test.globalViolations).toEqual([]);
    });
    
    test('Valid object', () => {
        var propertyConstraint = {
            constraintName: 'MyConstraint'
        }
        var property = {
            porpertyTypeName: 'MyPropertyType',
            constraints: [propertyConstraint],
            cascade: true
        };
        var type = {
            typeName: 'MyType',
            isCollection: true,
            valueDescriptor: property
        };
        var test = testUtils.registerMyPropertyConstraint(property, path, true, true);
        
        jbv.visitTypeDescriptor(type, test.objectWithProperty, path, groups, test.violations, test.globalViolations, visitor);
        
        var propertyValue = test.objectWithProperty[test.propertyName];
        var propertyPath = path + '.' + test.propertyName;
        var propertyTypeInnerConstraint = getInnerConstraint('MyPropertyType');
        var objectConstraint = { constraintName: 'Object', defaultValuesLoaded: true};
        
        validateTypeVisitor(2, 0, 1, visitor.startTypeVisitor, type, test.objectWithProperty, path, groups, test.violations, test.globalViolations, visitor);
        
        validateConstraintVisitorMock(4, 0, 2, visitor.startConstraintVisitor, objectConstraint, test.objectWithProperty, path, groups, test.violations, test.globalViolations, visitor, false, true);
        validateValidatorVisitorMock(4, 0, 3, visitor.startValidatorVisitor, objectConstraint, test.objectWithProperty, path, groups, test.violations, test.globalViolations, visitor);
        validateValidatorVisitorMock(4, 0, 4, visitor.endValidatorVisitor, objectConstraint, test.objectWithProperty, path, groups, test.violations, test.globalViolations, visitor);
        validateConstraintVisitorMock(4, 0, 5, visitor.endConstraintVisitor, objectConstraint, test.objectWithProperty, path, groups, test.violations, test.globalViolations, visitor, false, true);
        
        validatePropertyVisitorMock(1, 0, 6, visitor.startPropertyVisitor, property, test.propertyName, test.objectWithProperty, path, groups, test.violations, test.globalViolations, visitor);
        
        validateTypeVisitor(2, 1, 7, visitor.startTypeVisitor, 'MyPropertyType', propertyValue, propertyPath, groups, test.violations, test.globalViolations, visitor);
        
        validateConstraintVisitorMock(4, 1, 8, visitor.startConstraintVisitor, propertyTypeInnerConstraint, propertyValue, propertyPath, groups, test.violations, test.globalViolations, visitor);
        validateValidatorVisitorMock(4, 1, 9, visitor.startValidatorVisitor, propertyTypeInnerConstraint, propertyValue, propertyPath, groups, test.violations, test.globalViolations, visitor);
        validateValidatorVisitorMock(4, 1, 10, visitor.endValidatorVisitor, propertyTypeInnerConstraint, propertyValue, propertyPath, groups, test.violations, test.globalViolations, visitor);
        validateConstraintVisitorMock(4, 1, 11, visitor.endConstraintVisitor, propertyTypeInnerConstraint, propertyValue, propertyPath, groups, test.violations, test.globalViolations, visitor);
        
        validateConstraintVisitorMock(4, 2, 12, visitor.startConstraintVisitor, objectConstraint, propertyValue, propertyPath, groups, test.violations, test.globalViolations, visitor, false, true);
        validateValidatorVisitorMock(4, 2, 13, visitor.startValidatorVisitor, objectConstraint, propertyValue, propertyPath, groups, test.violations, test.globalViolations, visitor);
        validateValidatorVisitorMock(4, 2, 14, visitor.endValidatorVisitor, objectConstraint, propertyValue, propertyPath, groups, test.violations, test.globalViolations, visitor);
        validateConstraintVisitorMock(4, 2, 15, visitor.endConstraintVisitor, objectConstraint, propertyValue, propertyPath, groups, test.violations, test.globalViolations, visitor, false, true);
        
        validateTypeVisitor(2, 0, 16, visitor.endTypeVisitor, 'MyPropertyType', propertyValue, propertyPath, groups, test.violations, test.globalViolations, visitor);
        
        validateConstraintVisitorMock(4, 3, 17, visitor.startConstraintVisitor, propertyConstraint, propertyValue, propertyPath, groups, test.violations, test.globalViolations, visitor);
        validateValidatorVisitorMock(4, 3, 18, visitor.startValidatorVisitor, propertyConstraint, propertyValue, propertyPath, groups, test.violations, test.globalViolations, visitor);
        validateValidatorVisitorMock(4, 3, 19, visitor.endValidatorVisitor, propertyConstraint, propertyValue, propertyPath, groups, test.violations, test.globalViolations, visitor);
        validateConstraintVisitorMock(4, 3, 20, visitor.endConstraintVisitor, propertyConstraint, propertyValue, propertyPath, groups, test.violations, test.globalViolations, visitor);
        
        validatePropertyVisitorMock(1, 0, 21, visitor.endPropertyVisitor, property, test.propertyName, test.objectWithProperty, path, groups, test.violations, test.globalViolations, visitor);
        
        validateTypeVisitor(2, 1, 22, visitor.endTypeVisitor, type, test.objectWithProperty, path, groups, test.violations, test.globalViolations, visitor);

        expect(test.violations).toEqual([]);
        expect(test.globalViolations).toEqual([]);
    });
    
    test('Invalid object', () => {
        var propertyConstraint = {
            constraintName: 'MyConstraint'
        }
        var property = {
            porpertyTypeName: 'MyPropertyType',
            constraints: [propertyConstraint],
            cascade: true
        };
        var type = {
            typeName: 'MyType',
            isCollection: true,
            valueDescriptor: property
        };
        var test = testUtils.registerMyPropertyConstraint(property, path, true, false);
        
        jbv.visitTypeDescriptor(type, test.objectWithProperty, path, groups, test.violations, test.globalViolations, visitor);
        
        var propertyValue = test.objectWithProperty[test.propertyName];
        var propertyPath = path + '.' + test.propertyName;
        var propertyTypeInnerConstraint = getInnerConstraint('MyPropertyType');
        var objectConstraint = { constraintName: 'Object', defaultValuesLoaded: true};
        
        validateTypeVisitor(2, 0, 1, visitor.startTypeVisitor, type, test.objectWithProperty, path, groups, test.violations, test.globalViolations, visitor);
        
        validateConstraintVisitorMock(4, 0, 2, visitor.startConstraintVisitor, objectConstraint, test.objectWithProperty, path, groups, test.violations, test.globalViolations, visitor, false, true);
        validateValidatorVisitorMock(4, 0, 3, visitor.startValidatorVisitor, objectConstraint, test.objectWithProperty, path, groups, test.violations, test.globalViolations, visitor);
        validateValidatorVisitorMock(4, 0, 4, visitor.endValidatorVisitor, objectConstraint, test.objectWithProperty, path, groups, test.violations, test.globalViolations, visitor);
        validateConstraintVisitorMock(4, 0, 5, visitor.endConstraintVisitor, objectConstraint, test.objectWithProperty, path, groups, test.violations, test.globalViolations, visitor, false, true);
        
        validatePropertyVisitorMock(1, 0, 6, visitor.startPropertyVisitor, property, test.propertyName, test.objectWithProperty, path, groups, test.violations, test.globalViolations, visitor);
        
        validateTypeVisitor(2, 1, 7, visitor.startTypeVisitor, 'MyPropertyType', propertyValue, propertyPath, groups, test.violations, test.globalViolations, visitor);
        
        validateConstraintVisitorMock(4, 1, 8, visitor.startConstraintVisitor, propertyTypeInnerConstraint, propertyValue, propertyPath, groups, test.violations, test.globalViolations, visitor);
        validateValidatorVisitorMock(4, 1, 9, visitor.startValidatorVisitor, propertyTypeInnerConstraint, propertyValue, propertyPath, groups, test.violations, test.globalViolations, visitor);
        validateValidatorVisitorMock(4, 1, 10, visitor.endValidatorVisitor, propertyTypeInnerConstraint, propertyValue, propertyPath, groups, test.violations, test.globalViolations, visitor);
        validateConstraintVisitorMock(4, 1, 11, visitor.endConstraintVisitor, propertyTypeInnerConstraint, propertyValue, propertyPath, groups, test.violations, test.globalViolations, visitor);
        
        validateConstraintVisitorMock(4, 2, 12, visitor.startConstraintVisitor, objectConstraint, propertyValue, propertyPath, groups, test.violations, test.globalViolations, visitor, false, true);
        validateValidatorVisitorMock(4, 2, 13, visitor.startValidatorVisitor, objectConstraint, propertyValue, propertyPath, groups, test.violations, test.globalViolations, visitor);
        validateValidatorVisitorMock(4, 2, 14, visitor.endValidatorVisitor, objectConstraint, propertyValue, propertyPath, groups, test.violations, test.globalViolations, visitor);
        validateConstraintVisitorMock(4, 2, 15, visitor.endConstraintVisitor, objectConstraint, propertyValue, propertyPath, groups, test.violations, test.globalViolations, visitor, false, true);
        
        validateTypeVisitor(2, 0, 16, visitor.endTypeVisitor, 'MyPropertyType', propertyValue, propertyPath, groups, test.violations, test.globalViolations, visitor);
        
        validateConstraintVisitorMock(4, 3, 17, visitor.startConstraintVisitor, propertyConstraint, propertyValue, propertyPath, groups, test.violations, test.globalViolations, visitor);
        validateValidatorVisitorMock(4, 3, 18, visitor.startValidatorVisitor, propertyConstraint, propertyValue, propertyPath, groups, test.violations, test.globalViolations, visitor);
        validateValidatorVisitorMock(4, 3, 19, visitor.endValidatorVisitor, propertyConstraint, propertyValue, propertyPath, groups, test.violations, test.globalViolations, visitor);
        validateConstraintVisitorMock(4, 3, 20, visitor.endConstraintVisitor, propertyConstraint, propertyValue, propertyPath, groups, test.violations, test.globalViolations, visitor);
        
        validatePropertyVisitorMock(1, 0, 21, visitor.endPropertyVisitor, property, test.propertyName, test.objectWithProperty, path, groups, test.violations, test.globalViolations, visitor);
        
        validateTypeVisitor(2, 1, 22, visitor.endTypeVisitor, type, test.objectWithProperty, path, groups, test.violations, test.globalViolations, visitor);
                
        expect(test.violations).toEqual([]);
        expect(test.globalViolations).toEqual([]);
    });

    test('Valid array', () => {
        var propertyConstraint = {
            constraintName: 'MyConstraint'
        }
        var property = {
            porpertyTypeName: 'MyPropertyType',
            constraints: [propertyConstraint],
            cascade: true
        };
        var type = {
            typeName: 'MyType',
            isCollection: true,
            valueDescriptor: property
        };
        var test = testUtils.registerMyPropertyConstraint(property, path, true, true);
        test.objectWithProperty = [test.objectWithProperty.myProperty];
        
        jbv.visitTypeDescriptor(type, test.objectWithProperty, path, groups, test.violations, test.globalViolations, visitor);
        
        var propertyValue = test.objectWithProperty[0];
        var propertyPath = path + '.0';
        var propertyTypeInnerConstraint = getInnerConstraint('MyPropertyType');
        var objectConstraint = { constraintName: 'Object', defaultValuesLoaded: true};
        
        validateTypeVisitor(2, 0, 1, visitor.startTypeVisitor, type, test.objectWithProperty, path, groups, test.violations, test.globalViolations, visitor);
        
        validateConstraintVisitorMock(4, 0, 2, visitor.startConstraintVisitor, objectConstraint, test.objectWithProperty, path, groups, test.violations, test.globalViolations, visitor, false, true);
        validateValidatorVisitorMock(4, 0, 3, visitor.startValidatorVisitor, objectConstraint, test.objectWithProperty, path, groups, test.violations, test.globalViolations, visitor);
        validateValidatorVisitorMock(4, 0, 4, visitor.endValidatorVisitor, objectConstraint, test.objectWithProperty, path, groups, test.violations, test.globalViolations, visitor);
        validateConstraintVisitorMock(4, 0, 5, visitor.endConstraintVisitor, objectConstraint, test.objectWithProperty, path, groups, test.violations, test.globalViolations, visitor, false, true);
        
        validatePropertyVisitorMock(1, 0, 6, visitor.startPropertyVisitor, property, 0, test.objectWithProperty, path, groups, test.violations, test.globalViolations, visitor);
        
        validateTypeVisitor(2, 1, 7, visitor.startTypeVisitor, 'MyPropertyType', propertyValue, propertyPath, groups, test.violations, test.globalViolations, visitor);
        
        validateConstraintVisitorMock(4, 1, 8, visitor.startConstraintVisitor, propertyTypeInnerConstraint, propertyValue, propertyPath, groups, test.violations, test.globalViolations, visitor);
        validateValidatorVisitorMock(4, 1, 9, visitor.startValidatorVisitor, propertyTypeInnerConstraint, propertyValue, propertyPath, groups, test.violations, test.globalViolations, visitor);
        validateValidatorVisitorMock(4, 1, 10, visitor.endValidatorVisitor, propertyTypeInnerConstraint, propertyValue, propertyPath, groups, test.violations, test.globalViolations, visitor);
        validateConstraintVisitorMock(4, 1, 11, visitor.endConstraintVisitor, propertyTypeInnerConstraint, propertyValue, propertyPath, groups, test.violations, test.globalViolations, visitor);
        
        validateConstraintVisitorMock(4, 2, 12, visitor.startConstraintVisitor, objectConstraint, propertyValue, propertyPath, groups, test.violations, test.globalViolations, visitor, false, true);
        validateValidatorVisitorMock(4, 2, 13, visitor.startValidatorVisitor, objectConstraint, propertyValue, propertyPath, groups, test.violations, test.globalViolations, visitor);
        validateValidatorVisitorMock(4, 2, 14, visitor.endValidatorVisitor, objectConstraint, propertyValue, propertyPath, groups, test.violations, test.globalViolations, visitor);
        validateConstraintVisitorMock(4, 2, 15, visitor.endConstraintVisitor, objectConstraint, propertyValue, propertyPath, groups, test.violations, test.globalViolations, visitor, false, true);
        
        validateTypeVisitor(2, 0, 16, visitor.endTypeVisitor, 'MyPropertyType', propertyValue, propertyPath, groups, test.violations, test.globalViolations, visitor);
        
        validateConstraintVisitorMock(4, 3, 17, visitor.startConstraintVisitor, propertyConstraint, propertyValue, propertyPath, groups, test.violations, test.globalViolations, visitor);
        validateValidatorVisitorMock(4, 3, 18, visitor.startValidatorVisitor, propertyConstraint, propertyValue, propertyPath, groups, test.violations, test.globalViolations, visitor);
        validateValidatorVisitorMock(4, 3, 19, visitor.endValidatorVisitor, propertyConstraint, propertyValue, propertyPath, groups, test.violations, test.globalViolations, visitor);
        validateConstraintVisitorMock(4, 3, 20, visitor.endConstraintVisitor, propertyConstraint, propertyValue, propertyPath, groups, test.violations, test.globalViolations, visitor);
        
        validatePropertyVisitorMock(1, 0, 21, visitor.endPropertyVisitor, property, 0, test.objectWithProperty, path, groups, test.violations, test.globalViolations, visitor);
        
        validateTypeVisitor(2, 1, 22, visitor.endTypeVisitor, type, test.objectWithProperty, path, groups, test.violations, test.globalViolations, visitor);
                        
        expect(test.violations).toEqual([]);
        expect(test.globalViolations).toEqual([]);
    });
    
    test('Invalid array', () => {
        var propertyConstraint = {
            constraintName: 'MyConstraint'
        }
        var property = {
            porpertyTypeName: 'MyPropertyType',
            constraints: [propertyConstraint],
            cascade: true
        };
        var type = {
            typeName: 'MyType',
            isCollection: true,
            valueDescriptor: property
        };
        var test = testUtils.registerMyPropertyConstraint(property, path, true, false);
        test.objectWithProperty = [test.objectWithProperty.myProperty];
        
        jbv.visitTypeDescriptor(type, test.objectWithProperty, path, groups, test.violations, test.globalViolations, visitor);
        
        var propertyValue = test.objectWithProperty[0];
        var propertyPath = path + '.0';
        var propertyTypeInnerConstraint = getInnerConstraint('MyPropertyType');
        var objectConstraint = { constraintName: 'Object', defaultValuesLoaded: true};
        
        validateTypeVisitor(2, 0, 1, visitor.startTypeVisitor, type, test.objectWithProperty, path, groups, test.violations, test.globalViolations, visitor);
        
        validateConstraintVisitorMock(4, 0, 2, visitor.startConstraintVisitor, objectConstraint, test.objectWithProperty, path, groups, test.violations, test.globalViolations, visitor, false, true);
        validateValidatorVisitorMock(4, 0, 3, visitor.startValidatorVisitor, objectConstraint, test.objectWithProperty, path, groups, test.violations, test.globalViolations, visitor);
        validateValidatorVisitorMock(4, 0, 4, visitor.endValidatorVisitor, objectConstraint, test.objectWithProperty, path, groups, test.violations, test.globalViolations, visitor);
        validateConstraintVisitorMock(4, 0, 5, visitor.endConstraintVisitor, objectConstraint, test.objectWithProperty, path, groups, test.violations, test.globalViolations, visitor, false, true);
        
        validatePropertyVisitorMock(1, 0, 6, visitor.startPropertyVisitor, property, 0, test.objectWithProperty, path, groups, test.violations, test.globalViolations, visitor);
        
        validateTypeVisitor(2, 1, 7, visitor.startTypeVisitor, 'MyPropertyType', propertyValue, propertyPath, groups, test.violations, test.globalViolations, visitor);
        
        validateConstraintVisitorMock(4, 1, 8, visitor.startConstraintVisitor, propertyTypeInnerConstraint, propertyValue, propertyPath, groups, test.violations, test.globalViolations, visitor);
        validateValidatorVisitorMock(4, 1, 9, visitor.startValidatorVisitor, propertyTypeInnerConstraint, propertyValue, propertyPath, groups, test.violations, test.globalViolations, visitor);
        validateValidatorVisitorMock(4, 1, 10, visitor.endValidatorVisitor, propertyTypeInnerConstraint, propertyValue, propertyPath, groups, test.violations, test.globalViolations, visitor);
        validateConstraintVisitorMock(4, 1, 11, visitor.endConstraintVisitor, propertyTypeInnerConstraint, propertyValue, propertyPath, groups, test.violations, test.globalViolations, visitor);
        
        validateConstraintVisitorMock(4, 2, 12, visitor.startConstraintVisitor, objectConstraint, propertyValue, propertyPath, groups, test.violations, test.globalViolations, visitor, false, true);
        validateValidatorVisitorMock(4, 2, 13, visitor.startValidatorVisitor, objectConstraint, propertyValue, propertyPath, groups, test.violations, test.globalViolations, visitor);
        validateValidatorVisitorMock(4, 2, 14, visitor.endValidatorVisitor, objectConstraint, propertyValue, propertyPath, groups, test.violations, test.globalViolations, visitor);
        validateConstraintVisitorMock(4, 2, 15, visitor.endConstraintVisitor, objectConstraint, propertyValue, propertyPath, groups, test.violations, test.globalViolations, visitor, false, true);
        
        validateTypeVisitor(2, 0, 16, visitor.endTypeVisitor, 'MyPropertyType', propertyValue, propertyPath, groups, test.violations, test.globalViolations, visitor);
        
        validateConstraintVisitorMock(4, 3, 17, visitor.startConstraintVisitor, propertyConstraint, propertyValue, propertyPath, groups, test.violations, test.globalViolations, visitor);
        validateValidatorVisitorMock(4, 3, 18, visitor.startValidatorVisitor, propertyConstraint, propertyValue, propertyPath, groups, test.violations, test.globalViolations, visitor);
        validateValidatorVisitorMock(4, 3, 19, visitor.endValidatorVisitor, propertyConstraint, propertyValue, propertyPath, groups, test.violations, test.globalViolations, visitor);
        validateConstraintVisitorMock(4, 3, 20, visitor.endConstraintVisitor, propertyConstraint, propertyValue, propertyPath, groups, test.violations, test.globalViolations, visitor);
        
        validatePropertyVisitorMock(1, 0, 21, visitor.endPropertyVisitor, property, 0, test.objectWithProperty, path, groups, test.violations, test.globalViolations, visitor);
        
        validateTypeVisitor(2, 1, 22, visitor.endTypeVisitor, type, test.objectWithProperty, path, groups, test.violations, test.globalViolations, visitor);
        
        expect(test.violations).toEqual([]);
        expect(test.globalViolations).toEqual([]);
    });
});

describe('#visitPropertyDescriptor with cascade and ignoreValue set to true', () => {
    var visitor: jbv.Visitor = {
        startTypeVisitor: fn(true),
        endTypeVisitor: fn(),
        startPropertyVisitor: fn(true),
        endPropertyVisitor: fn(),
        startConstraintVisitor: fn(true),
        endConstraintVisitor: fn(),
        startValidatorVisitor: fn(true),
        endValidatorVisitor: fn(),
        recursively: true,
        ignoreValue: true
    };
    
    afterEach(() => {
        visitor = {
            startTypeVisitor: fn(true),
            endTypeVisitor: fn(),
            startPropertyVisitor: fn(true),
            endPropertyVisitor: fn(),
            startConstraintVisitor: fn(true),
            endConstraintVisitor: fn(),
            startValidatorVisitor: fn(true),
            endValidatorVisitor: fn(),
            recursively: true,
            ignoreValue: true
        };
        order = 0;
        testUtils.clean();
    });
    
    test('Valid cascade type', () => {
        var constraint = {
            constraintName: 'MyConstraint'
        };
        var property = {
            porpertyTypeName: 'MyPropertyType',
            constraints: [constraint],
            cascade: true
        };
        var test = testUtils.registerMyPropertyConstraint(property, path, true, true);
        
        jbv.visitPropertyDescriptor(property, test.propertyName, test.objectWithProperty, path, groups, test.violations, test.globalViolations, visitor);
        
        var value = test.objectWithProperty[test.propertyName];
        var propertyPath = path + '.' + test.propertyName;
        var innerConstraint = getInnerConstraint('MyPropertyType');
        var objectConstraint = { constraintName: 'Object', defaultValuesLoaded: true};
        
        validatePropertyVisitorMock(1, 0, 1, visitor.startPropertyVisitor, property, test.propertyName, test.objectWithProperty, path, groups, test.violations, test.globalViolations, visitor);
        
        validateTypeVisitor(1, 0, 2, visitor.startTypeVisitor, 'MyPropertyType', value, propertyPath, groups, test.violations, test.globalViolations, visitor);
        
        validateConstraintVisitorMock(3, 0, 3, visitor.startConstraintVisitor, innerConstraint, value, propertyPath, groups, test.violations, test.globalViolations, visitor);
        validateValidatorVisitorMock(3, 0, 4, visitor.startValidatorVisitor, innerConstraint, value, propertyPath, groups, test.violations, test.globalViolations, visitor);
        validateValidatorVisitorMock(3, 0, 5, visitor.endValidatorVisitor, innerConstraint, value, propertyPath, groups, test.violations, test.globalViolations, visitor);
        validateConstraintVisitorMock(3, 0, 6, visitor.endConstraintVisitor, innerConstraint, value, propertyPath, groups, test.violations, test.globalViolations, visitor);
        
        validateConstraintVisitorMock(3, 1, 7, visitor.startConstraintVisitor, objectConstraint, value, propertyPath, groups, test.violations, test.globalViolations, visitor, false, true);
        validateValidatorVisitorMock(3, 1, 8, visitor.startValidatorVisitor, objectConstraint, value, propertyPath, groups, test.violations, test.globalViolations, visitor);
        validateValidatorVisitorMock(3, 1, 9, visitor.endValidatorVisitor, objectConstraint, value, propertyPath, groups, test.violations, test.globalViolations, visitor);
        validateConstraintVisitorMock(3, 1, 10, visitor.endConstraintVisitor, objectConstraint, value, propertyPath, groups, test.violations, test.globalViolations, visitor, false, true);
        
        validateTypeVisitor(1, 0, 11, visitor.endTypeVisitor, 'MyPropertyType', value, propertyPath, groups, test.violations, test.globalViolations, visitor);
        
        validateConstraintVisitorMock(3, 2, 12, visitor.startConstraintVisitor, constraint, value, propertyPath, groups, test.violations, test.globalViolations, visitor);
        validateValidatorVisitorMock(3, 2, 13, visitor.startValidatorVisitor, constraint, value, propertyPath, groups, test.violations, test.globalViolations, visitor);
        validateValidatorVisitorMock(3, 2, 14, visitor.endValidatorVisitor, constraint, value, propertyPath, groups, test.violations, test.globalViolations, visitor);
        validateConstraintVisitorMock(3, 2, 15, visitor.endConstraintVisitor, constraint, value, propertyPath, groups, test.violations, test.globalViolations, visitor);
        
        validatePropertyVisitorMock(1, 0, 16, visitor.endPropertyVisitor, property, test.propertyName, test.objectWithProperty, path, groups, test.violations, test.globalViolations, visitor);
        
        expect(test.violations).toEqual([]);
        expect(test.globalViolations).toEqual([]);
    });
    
    test('Invalid cascade type acording to type validator', () => {
        var constraint = {
            constraintName: 'MyConstraint'
        };
        var property = {
            porpertyTypeName: 'MyPropertyType',
            constraints: [constraint],
            cascade: true
        };
        var test = testUtils.registerMyPropertyConstraint(property, path, false, true);
        
        jbv.visitPropertyDescriptor(property, test.propertyName, test.objectWithProperty, path, groups, test.violations, test.globalViolations, visitor);
        
        var value = test.objectWithProperty[test.propertyName];
        var propertyPath = path + '.' + test.propertyName;
        var innerConstraint = getInnerConstraint('MyPropertyType');
        var objectConstraint = { constraintName: 'Object', defaultValuesLoaded: true};
        
        validatePropertyVisitorMock(1, 0, 1, visitor.startPropertyVisitor, property, test.propertyName, test.objectWithProperty, path, groups, test.violations, test.globalViolations, visitor);
        
        validateTypeVisitor(1, 0, 2, visitor.startTypeVisitor, 'MyPropertyType', value, propertyPath, groups, test.violations, test.globalViolations, visitor);
        
        validateConstraintVisitorMock(3, 0, 3, visitor.startConstraintVisitor, innerConstraint, value, propertyPath, groups, test.violations, test.globalViolations, visitor);
        validateValidatorVisitorMock(3, 0, 4, visitor.startValidatorVisitor, innerConstraint, value, propertyPath, groups, test.violations, test.globalViolations, visitor);
        validateValidatorVisitorMock(3, 0, 5, visitor.endValidatorVisitor, innerConstraint, value, propertyPath, groups, test.violations, test.globalViolations, visitor);
        validateConstraintVisitorMock(3, 0, 6, visitor.endConstraintVisitor, innerConstraint, value, propertyPath, groups, test.violations, test.globalViolations, visitor);
        
        validateConstraintVisitorMock(3, 1, 7, visitor.startConstraintVisitor, objectConstraint, value, propertyPath, groups, test.violations, test.globalViolations, visitor, false, true);
        validateValidatorVisitorMock(3, 1, 8, visitor.startValidatorVisitor, objectConstraint, value, propertyPath, groups, test.violations, test.globalViolations, visitor);
        validateValidatorVisitorMock(3, 1, 9, visitor.endValidatorVisitor, objectConstraint, value, propertyPath, groups, test.violations, test.globalViolations, visitor);
        validateConstraintVisitorMock(3, 1, 10, visitor.endConstraintVisitor, objectConstraint, value, propertyPath, groups, test.violations, test.globalViolations, visitor, false, true);
        
        validateTypeVisitor(1, 0, 11, visitor.endTypeVisitor, 'MyPropertyType', value, propertyPath, groups, test.violations, test.globalViolations, visitor);
        
        validateConstraintVisitorMock(3, 2, 12, visitor.startConstraintVisitor, constraint, value, propertyPath, groups, test.violations, test.globalViolations, visitor);
        validateValidatorVisitorMock(3, 2, 13, visitor.startValidatorVisitor, constraint, value, propertyPath, groups, test.violations, test.globalViolations, visitor);
        validateValidatorVisitorMock(3, 2, 14, visitor.endValidatorVisitor, constraint, value, propertyPath, groups, test.violations, test.globalViolations, visitor);
        validateConstraintVisitorMock(3, 2, 15, visitor.endConstraintVisitor, constraint, value, propertyPath, groups, test.violations, test.globalViolations, visitor);
        
        validatePropertyVisitorMock(1, 0, 16, visitor.endPropertyVisitor, property, test.propertyName, test.objectWithProperty, path, groups, test.violations, test.globalViolations, visitor);
        
        expect(test.violations).toEqual([]);
        expect(test.globalViolations).toEqual([]);
    });

    test('Invalid cascade type acording to validator and type validator', () => {
        var constraint = {
            constraintName: 'MyConstraint'
        };
        var property = {
            porpertyTypeName: 'MyPropertyType',
            constraints: [constraint],
            cascade: true
        };
        var test = testUtils.registerMyPropertyConstraint(property, path, false, false);
        
        jbv.visitPropertyDescriptor(property, test.propertyName, test.objectWithProperty, path, groups, test.violations, test.globalViolations, visitor);
        
        var value = test.objectWithProperty[test.propertyName];
        var propertyPath = path + '.' + test.propertyName;
        var innerConstraint = getInnerConstraint('MyPropertyType');
        var objectConstraint = { constraintName: 'Object', defaultValuesLoaded: true};
        
        validatePropertyVisitorMock(1, 0, 1, visitor.startPropertyVisitor, property, test.propertyName, test.objectWithProperty, path, groups, test.violations, test.globalViolations, visitor);
        
        validateTypeVisitor(1, 0, 2, visitor.startTypeVisitor, 'MyPropertyType', value, propertyPath, groups, test.violations, test.globalViolations, visitor);
        
        validateConstraintVisitorMock(3, 0, 3, visitor.startConstraintVisitor, innerConstraint, value, propertyPath, groups, test.violations, test.globalViolations, visitor);
        validateValidatorVisitorMock(3, 0, 4, visitor.startValidatorVisitor, innerConstraint, value, propertyPath, groups, test.violations, test.globalViolations, visitor);
        validateValidatorVisitorMock(3, 0, 5, visitor.endValidatorVisitor, innerConstraint, value, propertyPath, groups, test.violations, test.globalViolations, visitor);
        validateConstraintVisitorMock(3, 0, 6, visitor.endConstraintVisitor, innerConstraint, value, propertyPath, groups, test.violations, test.globalViolations, visitor);
        
        validateConstraintVisitorMock(3, 1, 7, visitor.startConstraintVisitor, objectConstraint, value, propertyPath, groups, test.violations, test.globalViolations, visitor, false, true);
        validateValidatorVisitorMock(3, 1, 8, visitor.startValidatorVisitor, objectConstraint, value, propertyPath, groups, test.violations, test.globalViolations, visitor);
        validateValidatorVisitorMock(3, 1, 9, visitor.endValidatorVisitor, objectConstraint, value, propertyPath, groups, test.violations, test.globalViolations, visitor);
        validateConstraintVisitorMock(3, 1, 10, visitor.endConstraintVisitor, objectConstraint, value, propertyPath, groups, test.violations, test.globalViolations, visitor, false, true);
        
        validateTypeVisitor(1, 0, 11, visitor.endTypeVisitor, 'MyPropertyType', value, propertyPath, groups, test.violations, test.globalViolations, visitor);
        
        validateConstraintVisitorMock(3, 2, 12, visitor.startConstraintVisitor, constraint, value, propertyPath, groups, test.violations, test.globalViolations, visitor);
        validateValidatorVisitorMock(3, 2, 13, visitor.startValidatorVisitor, constraint, value, propertyPath, groups, test.violations, test.globalViolations, visitor);
        validateValidatorVisitorMock(3, 2, 14, visitor.endValidatorVisitor, constraint, value, propertyPath, groups, test.violations, test.globalViolations, visitor);
        validateConstraintVisitorMock(3, 2, 15, visitor.endConstraintVisitor, constraint, value, propertyPath, groups, test.violations, test.globalViolations, visitor);
        
        validatePropertyVisitorMock(1, 0, 16, visitor.endPropertyVisitor, property, test.propertyName, test.objectWithProperty, path, groups, test.violations, test.globalViolations, visitor);
        
        expect(test.violations).toEqual([]);
        expect(test.globalViolations).toEqual([]);
    });
    
    test('Invalid cascade type acording to validator and type validator', () => {
        var constraint = {
            constraintName: 'MyConstraint'
        };
        var property = {
            porpertyTypeName: 'MyPropertyType',
            constraints: [constraint],
            cascade: true
        };
        var test = testUtils.registerMyPropertyConstraint(property, path, false, false);
        test.globalViolations = test.violations;
        
        jbv.visitPropertyDescriptor(property, test.propertyName, test.objectWithProperty, path, groups, test.violations, test.globalViolations, visitor);
        
        var value = test.objectWithProperty[test.propertyName];
        var propertyPath = path + '.' + test.propertyName;
        var innerConstraint = getInnerConstraint('MyPropertyType');
        var objectConstraint = { constraintName: 'Object', defaultValuesLoaded: true};
        
        validatePropertyVisitorMock(1, 0, 1, visitor.startPropertyVisitor, property, test.propertyName, test.objectWithProperty, path, groups, test.violations, test.globalViolations, visitor);
        
        validateTypeVisitor(1, 0, 2, visitor.startTypeVisitor, 'MyPropertyType', value, propertyPath, groups, test.violations, test.globalViolations, visitor);
        
        validateConstraintVisitorMock(3, 0, 3, visitor.startConstraintVisitor, innerConstraint, value, propertyPath, groups, test.violations, test.globalViolations, visitor);
        validateValidatorVisitorMock(3, 0, 4, visitor.startValidatorVisitor, innerConstraint, value, propertyPath, groups, test.violations, test.globalViolations, visitor);
        validateValidatorVisitorMock(3, 0, 5, visitor.endValidatorVisitor, innerConstraint, value, propertyPath, groups, test.violations, test.globalViolations, visitor);
        validateConstraintVisitorMock(3, 0, 6, visitor.endConstraintVisitor, innerConstraint, value, propertyPath, groups, test.violations, test.globalViolations, visitor);
        
        validateConstraintVisitorMock(3, 1, 7, visitor.startConstraintVisitor, objectConstraint, value, propertyPath, groups, test.violations, test.globalViolations, visitor, false, true);
        validateValidatorVisitorMock(3, 1, 8, visitor.startValidatorVisitor, objectConstraint, value, propertyPath, groups, test.violations, test.globalViolations, visitor);
        validateValidatorVisitorMock(3, 1, 9, visitor.endValidatorVisitor, objectConstraint, value, propertyPath, groups, test.violations, test.globalViolations, visitor);
        validateConstraintVisitorMock(3, 1, 10, visitor.endConstraintVisitor, objectConstraint, value, propertyPath, groups, test.violations, test.globalViolations, visitor, false, true);
        
        validateTypeVisitor(1, 0, 11, visitor.endTypeVisitor, 'MyPropertyType', value, propertyPath, groups, test.violations, test.globalViolations, visitor);
        
        validateConstraintVisitorMock(3, 2, 12, visitor.startConstraintVisitor, constraint, value, propertyPath, groups, test.violations, test.globalViolations, visitor);
        validateValidatorVisitorMock(3, 2, 13, visitor.startValidatorVisitor, constraint, value, propertyPath, groups, test.violations, test.globalViolations, visitor);
        validateValidatorVisitorMock(3, 2, 14, visitor.endValidatorVisitor, constraint, value, propertyPath, groups, test.violations, test.globalViolations, visitor);
        validateConstraintVisitorMock(3, 2, 15, visitor.endConstraintVisitor, constraint, value, propertyPath, groups, test.violations, test.globalViolations, visitor);
        
        validatePropertyVisitorMock(1, 0, 16, visitor.endPropertyVisitor, property, test.propertyName, test.objectWithProperty, path, groups, test.violations, test.globalViolations, visitor);
        
        expect(test.violations).toEqual([]);
    });
    
    test('Invalid cascade type without property constraint', () => {
        var property = {
            porpertyTypeName: 'MyPropertyType',
            cascade: true
        };
        var test = testUtils.registerMyPropertyConstraint(property, path, false, false);
        
        jbv.visitPropertyDescriptor(property, test.propertyName, test.objectWithProperty, path, groups, test.violations, test.globalViolations, visitor);
        
        var value = test.objectWithProperty[test.propertyName];
        var propertyPath = path + '.' + test.propertyName;
        var innerConstraint = getInnerConstraint('MyPropertyType');
        var objectConstraint = { constraintName: 'Object', defaultValuesLoaded: true};
        
        validatePropertyVisitorMock(1, 0, 1, visitor.startPropertyVisitor, property, test.propertyName, test.objectWithProperty, path, groups, test.violations, test.globalViolations, visitor);
        
        validateTypeVisitor(1, 0, 2, visitor.startTypeVisitor, 'MyPropertyType', value, propertyPath, groups, test.violations, test.globalViolations, visitor);
        
        validateConstraintVisitorMock(2, 0, 3, visitor.startConstraintVisitor, innerConstraint, value, propertyPath, groups, test.violations, test.globalViolations, visitor);
        validateValidatorVisitorMock(2, 0, 4, visitor.startValidatorVisitor, innerConstraint, value, propertyPath, groups, test.violations, test.globalViolations, visitor);
        validateValidatorVisitorMock(2, 0, 5, visitor.endValidatorVisitor, innerConstraint, value, propertyPath, groups, test.violations, test.globalViolations, visitor);
        validateConstraintVisitorMock(2, 0, 6, visitor.endConstraintVisitor, innerConstraint, value, propertyPath, groups, test.violations, test.globalViolations, visitor);
        
        validateConstraintVisitorMock(2, 1, 7, visitor.startConstraintVisitor, objectConstraint, value, propertyPath, groups, test.violations, test.globalViolations, visitor, false, true);
        validateValidatorVisitorMock(2, 1, 8, visitor.startValidatorVisitor, objectConstraint, value, propertyPath, groups, test.violations, test.globalViolations, visitor);
        validateValidatorVisitorMock(2, 1, 9, visitor.endValidatorVisitor, objectConstraint, value, propertyPath, groups, test.violations, test.globalViolations, visitor);
        validateConstraintVisitorMock(2, 1, 10, visitor.endConstraintVisitor, objectConstraint, value, propertyPath, groups, test.violations, test.globalViolations, visitor, false, true);
        
        validateTypeVisitor(1, 0, 11, visitor.endTypeVisitor, 'MyPropertyType', value, propertyPath, groups, test.violations, test.globalViolations, visitor);
        
        validatePropertyVisitorMock(1, 0, 12, visitor.endPropertyVisitor, property, test.propertyName, test.objectWithProperty, path, groups, test.violations, test.globalViolations, visitor);
        
        expect(test.violations).toEqual([]);
        expect(test.globalViolations).toEqual([]);
    });

    test('Invalid cascade type with null object with property', () => {
        var constraint = {
            constraintName: 'MyConstraint'
        };
        var property = {
            porpertyTypeName: 'MyPropertyType',
            constraints: [constraint],
            cascade: true
        };
        var test = testUtils.registerMyPropertyConstraint(property, path, false, false);
        test.objectWithProperty.myProperty = undefined;
        
        jbv.visitPropertyDescriptor(property, test.propertyName, null, path, groups, test.violations, test.globalViolations, visitor);
        
        var value = test.objectWithProperty[test.propertyName];
        var propertyPath = path + '.' + test.propertyName;
        var innerConstraint = getInnerConstraint('MyPropertyType');
        var objectConstraint = { constraintName: 'Object', defaultValuesLoaded: true};
        
        validatePropertyVisitorMock(1, 0, 1, visitor.startPropertyVisitor, property, test.propertyName, null, path, groups, test.violations, test.globalViolations, visitor);
        
        validateTypeVisitor(1, 0, 2, visitor.startTypeVisitor, 'MyPropertyType', value, propertyPath, groups, test.violations, test.globalViolations, visitor);
        
        validateConstraintVisitorMock(3, 0, 3, visitor.startConstraintVisitor, innerConstraint, value, propertyPath, groups, test.violations, test.globalViolations, visitor);
        validateValidatorVisitorMock(3, 0, 4, visitor.startValidatorVisitor, innerConstraint, value, propertyPath, groups, test.violations, test.globalViolations, visitor);
        validateValidatorVisitorMock(3, 0, 5, visitor.endValidatorVisitor, innerConstraint, value, propertyPath, groups, test.violations, test.globalViolations, visitor);
        validateConstraintVisitorMock(3, 0, 6, visitor.endConstraintVisitor, innerConstraint, value, propertyPath, groups, test.violations, test.globalViolations, visitor);
        
        validateConstraintVisitorMock(3, 1, 7, visitor.startConstraintVisitor, objectConstraint, value, propertyPath, groups, test.violations, test.globalViolations, visitor, false, true);
        validateValidatorVisitorMock(3, 1, 8, visitor.startValidatorVisitor, objectConstraint, value, propertyPath, groups, test.violations, test.globalViolations, visitor);
        validateValidatorVisitorMock(3, 1, 9, visitor.endValidatorVisitor, objectConstraint, value, propertyPath, groups, test.violations, test.globalViolations, visitor);
        validateConstraintVisitorMock(3, 1, 10, visitor.endConstraintVisitor, objectConstraint, value, propertyPath, groups, test.violations, test.globalViolations, visitor, false, true);
        
        validateTypeVisitor(1, 0, 11, visitor.endTypeVisitor, 'MyPropertyType', value, propertyPath, groups, test.violations, test.globalViolations, visitor);
        
        validateConstraintVisitorMock(3, 2, 12, visitor.startConstraintVisitor, constraint, value, propertyPath, groups, test.violations, test.globalViolations, visitor);
        validateValidatorVisitorMock(3, 2, 13, visitor.startValidatorVisitor, constraint, value, propertyPath, groups, test.violations, test.globalViolations, visitor);
        validateValidatorVisitorMock(3, 2, 14, visitor.endValidatorVisitor, constraint, value, propertyPath, groups, test.violations, test.globalViolations, visitor);
        validateConstraintVisitorMock(3, 2, 15, visitor.endConstraintVisitor, constraint, value, propertyPath, groups, test.violations, test.globalViolations, visitor);
        
        validatePropertyVisitorMock(1, 0, 16, visitor.endPropertyVisitor, property, test.propertyName, null, path, groups, test.violations, test.globalViolations, visitor);
        
        expect(test.violations).toEqual([]);
        expect(test.globalViolations).toEqual([]);
    });

    test('Invalid cascade type with undefined object with property', () => {
        var constraint = {
            constraintName: 'MyConstraint'
        };
        var property = {
            porpertyTypeName: 'MyPropertyType',
            constraints: [constraint],
            cascade: true
        };
        var test = testUtils.registerMyPropertyConstraint(property, path, false, false);
        test.objectWithProperty.myProperty = undefined;
        
        jbv.visitPropertyDescriptor(property, test.propertyName, undefined, path, groups, test.violations, test.globalViolations, visitor);
        
        var value = test.objectWithProperty[test.propertyName];
        var propertyPath = path + '.' + test.propertyName;
        var innerConstraint = getInnerConstraint('MyPropertyType');
        var objectConstraint = { constraintName: 'Object', defaultValuesLoaded: true};
        
        validatePropertyVisitorMock(1, 0, 1, visitor.startPropertyVisitor, property, test.propertyName, undefined, path, groups, test.violations, test.globalViolations, visitor);
        
        validateTypeVisitor(1, 0, 2, visitor.startTypeVisitor, 'MyPropertyType', value, propertyPath, groups, test.violations, test.globalViolations, visitor);
        
        validateConstraintVisitorMock(3, 0, 3, visitor.startConstraintVisitor, innerConstraint, value, propertyPath, groups, test.violations, test.globalViolations, visitor);
        validateValidatorVisitorMock(3, 0, 4, visitor.startValidatorVisitor, innerConstraint, value, propertyPath, groups, test.violations, test.globalViolations, visitor);
        validateValidatorVisitorMock(3, 0, 5, visitor.endValidatorVisitor, innerConstraint, value, propertyPath, groups, test.violations, test.globalViolations, visitor);
        validateConstraintVisitorMock(3, 0, 6, visitor.endConstraintVisitor, innerConstraint, value, propertyPath, groups, test.violations, test.globalViolations, visitor);
        
        validateConstraintVisitorMock(3, 1, 7, visitor.startConstraintVisitor, objectConstraint, value, propertyPath, groups, test.violations, test.globalViolations, visitor, false, true);
        validateValidatorVisitorMock(3, 1, 8, visitor.startValidatorVisitor, objectConstraint, value, propertyPath, groups, test.violations, test.globalViolations, visitor);
        validateValidatorVisitorMock(3, 1, 9, visitor.endValidatorVisitor, objectConstraint, value, propertyPath, groups, test.violations, test.globalViolations, visitor);
        validateConstraintVisitorMock(3, 1, 10, visitor.endConstraintVisitor, objectConstraint, value, propertyPath, groups, test.violations, test.globalViolations, visitor, false, true);
        
        validateTypeVisitor(1, 0, 11, visitor.endTypeVisitor, 'MyPropertyType', value, propertyPath, groups, test.violations, test.globalViolations, visitor);
        
        validateConstraintVisitorMock(3, 2, 12, visitor.startConstraintVisitor, constraint, value, propertyPath, groups, test.violations, test.globalViolations, visitor);
        validateValidatorVisitorMock(3, 2, 13, visitor.startValidatorVisitor, constraint, value, propertyPath, groups, test.violations, test.globalViolations, visitor);
        validateValidatorVisitorMock(3, 2, 14, visitor.endValidatorVisitor, constraint, value, propertyPath, groups, test.violations, test.globalViolations, visitor);
        validateConstraintVisitorMock(3, 2, 15, visitor.endConstraintVisitor, constraint, value, propertyPath, groups, test.violations, test.globalViolations, visitor);
        
        validatePropertyVisitorMock(1, 0, 16, visitor.endPropertyVisitor, property, test.propertyName, undefined, path, groups, test.violations, test.globalViolations, visitor);
        
        expect(test.violations).toEqual([]);
        expect(test.globalViolations).toEqual([]);
    });
});

describe('#visitPropertyDescriptor with cascade and ignoreValue set to true and not recursively', () => {
    var visitor: jbv.Visitor = {
        startTypeVisitor: fn(true),
        endTypeVisitor: fn(),
        startPropertyVisitor: fn(true),
        endPropertyVisitor: fn(),
        startConstraintVisitor: fn(true),
        endConstraintVisitor: fn(),
        startValidatorVisitor: fn(true),
        endValidatorVisitor: fn(),
        ignoreValue: true
    };
    
    afterEach(() => {
        visitor = {
            startTypeVisitor: fn(true),
            endTypeVisitor: fn(),
            startPropertyVisitor: fn(true),
            endPropertyVisitor: fn(),
            startConstraintVisitor: fn(true),
            endConstraintVisitor: fn(),
            startValidatorVisitor: fn(true),
            endValidatorVisitor: fn(),
            ignoreValue: true
        };
        order = 0;
        testUtils.clean();
    });
    
    test('Valid cascade type', () => {
        var constraint = {
            constraintName: 'MyConstraint'
        };
        var property = {
            porpertyTypeName: 'MyPropertyType',
            constraints: [constraint],
            cascade: true
        };
        var test = testUtils.registerMyPropertyConstraint(property, path, true, true);
        
        jbv.visitPropertyDescriptor(property, test.propertyName, test.objectWithProperty, path, groups, test.violations, test.globalViolations, visitor);
        
        var value = test.objectWithProperty[test.propertyName];
        var propertyPath = path + '.' + test.propertyName;
        
        validatePropertyVisitorMock(1, 0, 1, visitor.startPropertyVisitor, property, test.propertyName, test.objectWithProperty, path, groups, test.violations, test.globalViolations, visitor);
        
        validateConstraintVisitorMock(1, 0, 2, visitor.startConstraintVisitor, constraint, value, propertyPath, groups, test.violations, test.globalViolations, visitor);
        validateValidatorVisitorMock(1, 0, 3, visitor.startValidatorVisitor, constraint, value, propertyPath, groups, test.violations, test.globalViolations, visitor);
        validateValidatorVisitorMock(1, 0, 4, visitor.endValidatorVisitor, constraint, value, propertyPath, groups, test.violations, test.globalViolations, visitor);
        validateConstraintVisitorMock(1, 0, 5, visitor.endConstraintVisitor, constraint, value, propertyPath, groups, test.violations, test.globalViolations, visitor);
        
        validatePropertyVisitorMock(1, 0, 6, visitor.endPropertyVisitor, property, test.propertyName, test.objectWithProperty, path, groups, test.violations, test.globalViolations, visitor);
        
        validateNotCalled(visitor.startTypeVisitor);
        validateNotCalled(visitor.endTypeVisitor);
        
        expect(test.violations).toEqual([]);
        expect(test.globalViolations).toEqual([]);
    });
    
    test('Invalid cascade type acording to type validator', () => {
        var constraint = {
            constraintName: 'MyConstraint'
        };
        var property = {
            porpertyTypeName: 'MyPropertyType',
            constraints: [constraint],
            cascade: true
        };
        var test = testUtils.registerMyPropertyConstraint(property, path, false, true);
        
        jbv.visitPropertyDescriptor(property, test.propertyName, test.objectWithProperty, path, groups, test.violations, test.globalViolations, visitor);
        
        var value = test.objectWithProperty[test.propertyName];
        var propertyPath = path + '.' + test.propertyName;
        
        validatePropertyVisitorMock(1, 0, 1, visitor.startPropertyVisitor, property, test.propertyName, test.objectWithProperty, path, groups, test.violations, test.globalViolations, visitor);
        
        validateConstraintVisitorMock(1, 0, 2, visitor.startConstraintVisitor, constraint, value, propertyPath, groups, test.violations, test.globalViolations, visitor);
        validateValidatorVisitorMock(1, 0, 3, visitor.startValidatorVisitor, constraint, value, propertyPath, groups, test.violations, test.globalViolations, visitor);
        validateValidatorVisitorMock(1, 0, 4, visitor.endValidatorVisitor, constraint, value, propertyPath, groups, test.violations, test.globalViolations, visitor);
        validateConstraintVisitorMock(1, 0, 5, visitor.endConstraintVisitor, constraint, value, propertyPath, groups, test.violations, test.globalViolations, visitor);
        
        validatePropertyVisitorMock(1, 0, 6, visitor.endPropertyVisitor, property, test.propertyName, test.objectWithProperty, path, groups, test.violations, test.globalViolations, visitor);
        
        validateNotCalled(visitor.startTypeVisitor);
        validateNotCalled(visitor.endTypeVisitor);
        
        expect(test.violations).toEqual([]);
        expect(test.globalViolations).toEqual([]);
    });

    test('Invalid cascade type acording to validator and type validator', () => {
        var constraint = {
            constraintName: 'MyConstraint'
        };
        var property = {
            porpertyTypeName: 'MyPropertyType',
            constraints: [constraint],
            cascade: true
        };
        var test = testUtils.registerMyPropertyConstraint(property, path, false, false);
        
        jbv.visitPropertyDescriptor(property, test.propertyName, test.objectWithProperty, path, groups, test.violations, test.globalViolations, visitor);
        
        var value = test.objectWithProperty[test.propertyName];
        var propertyPath = path + '.' + test.propertyName;
        
        validatePropertyVisitorMock(1, 0, 1, visitor.startPropertyVisitor, property, test.propertyName, test.objectWithProperty, path, groups, test.violations, test.globalViolations, visitor);
        
        validateConstraintVisitorMock(1, 0, 2, visitor.startConstraintVisitor, constraint, value, propertyPath, groups, test.violations, test.globalViolations, visitor);
        validateValidatorVisitorMock(1, 0, 3, visitor.startValidatorVisitor, constraint, value, propertyPath, groups, test.violations, test.globalViolations, visitor);
        validateValidatorVisitorMock(1, 0, 4, visitor.endValidatorVisitor, constraint, value, propertyPath, groups, test.violations, test.globalViolations, visitor);
        validateConstraintVisitorMock(1, 0, 5, visitor.endConstraintVisitor, constraint, value, propertyPath, groups, test.violations, test.globalViolations, visitor);
        
        validatePropertyVisitorMock(1, 0, 6, visitor.endPropertyVisitor, property, test.propertyName, test.objectWithProperty, path, groups, test.violations, test.globalViolations, visitor);
        
        validateNotCalled(visitor.startTypeVisitor);
        validateNotCalled(visitor.endTypeVisitor);
        
        expect(test.violations).toEqual([]);
        expect(test.globalViolations).toEqual([]);
    });
    
    test('Invalid cascade type acording to validator and type validator', () => {
        var constraint = {
            constraintName: 'MyConstraint'
        };
        var property = {
            porpertyTypeName: 'MyPropertyType',
            constraints: [constraint],
            cascade: true
        };
        var test = testUtils.registerMyPropertyConstraint(property, path, false, false);
        test.globalViolations = test.violations;
        
        jbv.visitPropertyDescriptor(property, test.propertyName, test.objectWithProperty, path, groups, test.violations, test.globalViolations, visitor);
        
        var value = test.objectWithProperty[test.propertyName];
        var propertyPath = path + '.' + test.propertyName;
        
        validatePropertyVisitorMock(1, 0, 1, visitor.startPropertyVisitor, property, test.propertyName, test.objectWithProperty, path, groups, test.violations, test.globalViolations, visitor);
        
        validateConstraintVisitorMock(1, 0, 2, visitor.startConstraintVisitor, constraint, value, propertyPath, groups, test.violations, test.globalViolations, visitor);
        validateValidatorVisitorMock(1, 0, 3, visitor.startValidatorVisitor, constraint, value, propertyPath, groups, test.violations, test.globalViolations, visitor);
        validateValidatorVisitorMock(1, 0, 4, visitor.endValidatorVisitor, constraint, value, propertyPath, groups, test.violations, test.globalViolations, visitor);
        validateConstraintVisitorMock(1, 0, 5, visitor.endConstraintVisitor, constraint, value, propertyPath, groups, test.violations, test.globalViolations, visitor);
        
        validatePropertyVisitorMock(1, 0, 6, visitor.endPropertyVisitor, property, test.propertyName, test.objectWithProperty, path, groups, test.violations, test.globalViolations, visitor);
        
        validateNotCalled(visitor.startTypeVisitor);
        validateNotCalled(visitor.endTypeVisitor);
        
        expect(test.violations).toEqual([]);
    });
    
    test('Invalid cascade type without property constraint', () => {
        var property = {
            porpertyTypeName: 'MyPropertyType',
            cascade: true
        };
        var test = testUtils.registerMyPropertyConstraint(property, path, false, false);
        
        jbv.visitPropertyDescriptor(property, test.propertyName, test.objectWithProperty, path, groups, test.violations, test.globalViolations, visitor);
        
        validatePropertyVisitorMock(1, 0, 1, visitor.startPropertyVisitor, property, test.propertyName, test.objectWithProperty, path, groups, test.violations, test.globalViolations, visitor);
        validatePropertyVisitorMock(1, 0, 2, visitor.endPropertyVisitor, property, test.propertyName, test.objectWithProperty, path, groups, test.violations, test.globalViolations, visitor);
        
        validateNotCalled(visitor.startTypeVisitor);
        validateNotCalled(visitor.endTypeVisitor);
        validateNotCalled(visitor.startConstraintVisitor);
        validateNotCalled(visitor.endConstraintVisitor);
        validateNotCalled(visitor.endValidatorVisitor);
        validateNotCalled(visitor.endTypeVisitor);
        
        expect(test.violations).toEqual([]);
        expect(test.globalViolations).toEqual([]);
    });

    test('Invalid cascade type with null object with property', () => {
        var constraint = {
            constraintName: 'MyConstraint'
        };
        var property = {
            porpertyTypeName: 'MyPropertyType',
            constraints: [constraint],
            cascade: true
        };
        var test = testUtils.registerMyPropertyConstraint(property, path, false, false);
        test.objectWithProperty.myProperty = undefined;
        
        jbv.visitPropertyDescriptor(property, test.propertyName, null, path, groups, test.violations, test.globalViolations, visitor);
        
        var value = test.objectWithProperty[test.propertyName];
        var propertyPath = path + '.' + test.propertyName;
        
        validatePropertyVisitorMock(1, 0, 1, visitor.startPropertyVisitor, property, test.propertyName, null, path, groups, test.violations, test.globalViolations, visitor);
        
        validateConstraintVisitorMock(1, 0, 2, visitor.startConstraintVisitor, constraint, value, propertyPath, groups, test.violations, test.globalViolations, visitor);
        validateValidatorVisitorMock(1, 0, 3, visitor.startValidatorVisitor, constraint, value, propertyPath, groups, test.violations, test.globalViolations, visitor);
        validateValidatorVisitorMock(1, 0, 4, visitor.endValidatorVisitor, constraint, value, propertyPath, groups, test.violations, test.globalViolations, visitor);
        validateConstraintVisitorMock(1, 0, 5, visitor.endConstraintVisitor, constraint, value, propertyPath, groups, test.violations, test.globalViolations, visitor);
        
        validatePropertyVisitorMock(1, 0, 6, visitor.endPropertyVisitor, property, test.propertyName, null, path, groups, test.violations, test.globalViolations, visitor);
        
        validateNotCalled(visitor.startTypeVisitor);
        validateNotCalled(visitor.endTypeVisitor);
        
        expect(test.violations).toEqual([]);
        expect(test.globalViolations).toEqual([]);
    });

    test('Invalid cascade type with undefined object with property', () => {
        var constraint = {
            constraintName: 'MyConstraint'
        };
        var property = {
            porpertyTypeName: 'MyPropertyType',
            constraints: [constraint],
            cascade: true
        };
        var test = testUtils.registerMyPropertyConstraint(property, path, false, false);
        test.objectWithProperty.myProperty = undefined;
        
        jbv.visitPropertyDescriptor(property, test.propertyName, undefined, path, groups, test.violations, test.globalViolations, visitor);
        
        var value = test.objectWithProperty[test.propertyName];
        var propertyPath = path + '.' + test.propertyName;
        
        validatePropertyVisitorMock(1, 0, 1, visitor.startPropertyVisitor, property, test.propertyName, undefined, path, groups, test.violations, test.globalViolations, visitor);
        
        validateConstraintVisitorMock(1, 0, 2, visitor.startConstraintVisitor, constraint, value, propertyPath, groups, test.violations, test.globalViolations, visitor);
        validateValidatorVisitorMock(1, 0, 3, visitor.startValidatorVisitor, constraint, value, propertyPath, groups, test.violations, test.globalViolations, visitor);
        validateValidatorVisitorMock(1, 0, 4, visitor.endValidatorVisitor, constraint, value, propertyPath, groups, test.violations, test.globalViolations, visitor);
        validateConstraintVisitorMock(1, 0, 5, visitor.endConstraintVisitor, constraint, value, propertyPath, groups, test.violations, test.globalViolations, visitor);
        
        validatePropertyVisitorMock(1, 0, 6, visitor.endPropertyVisitor, property, test.propertyName, undefined, path, groups, test.violations, test.globalViolations, visitor);
        
        validateNotCalled(visitor.startTypeVisitor);
        validateNotCalled(visitor.endTypeVisitor);
        
        expect(test.violations).toEqual([]);
        expect(test.globalViolations).toEqual([]);
    });
});

describe('#visitPropertyDescriptor with not cascade and recursivelyEvenNotCascade set to true', () => {
    var visitor: jbv.Visitor = {
        startTypeVisitor: fn(true),
        endTypeVisitor: fn(),
        startPropertyVisitor: fn(true),
        endPropertyVisitor: fn(),
        startConstraintVisitor: fn(true),
        endConstraintVisitor: fn(),
        startValidatorVisitor: fn(true),
        endValidatorVisitor: fn(),
        recursively: true,
        recursivelyEvenNotCascade: true
    };
    
    afterEach(() => {
        visitor = {
            startTypeVisitor: fn(true),
            endTypeVisitor: fn(),
            startPropertyVisitor: fn(true),
            endPropertyVisitor: fn(),
            startConstraintVisitor: fn(true),
            endConstraintVisitor: fn(),
            startValidatorVisitor: fn(true),
            endValidatorVisitor: fn(),
            recursively: true,
            recursivelyEvenNotCascade: true
        };
        order = 0;
        testUtils.clean();
    });
    
    test('Valid cascade type', () => {
        var constraint = {
            constraintName: 'MyConstraint'
        };
        var property = {
            porpertyTypeName: 'MyPropertyType',
            constraints: [constraint]
        };
        var test = testUtils.registerMyPropertyConstraint(property, path, true, true);
        
        jbv.visitPropertyDescriptor(property, test.propertyName, test.objectWithProperty, path, groups, test.violations, test.globalViolations, visitor);
        
        var value = test.objectWithProperty[test.propertyName];
        var propertyPath = path + '.' + test.propertyName;
        var innerConstraint = getInnerConstraint('MyPropertyType');
        var objectConstraint = { constraintName: 'Object', defaultValuesLoaded: true};
        
        validatePropertyVisitorMock(1, 0, 1, visitor.startPropertyVisitor, property, test.propertyName, test.objectWithProperty, path, groups, test.violations, test.globalViolations, visitor);
        
        validateTypeVisitor(1, 0, 2, visitor.startTypeVisitor, 'MyPropertyType', value, propertyPath, groups, test.violations, test.globalViolations, visitor);
        
        validateConstraintVisitorMock(3, 0, 3, visitor.startConstraintVisitor, innerConstraint, value, propertyPath, groups, test.violations, test.globalViolations, visitor);
        validateValidatorVisitorMock(3, 0, 4, visitor.startValidatorVisitor, innerConstraint, value, propertyPath, groups, test.violations, test.globalViolations, visitor);
        validateValidatorVisitorMock(3, 0, 5, visitor.endValidatorVisitor, innerConstraint, value, propertyPath, groups, test.violations, test.globalViolations, visitor);
        validateConstraintVisitorMock(3, 0, 6, visitor.endConstraintVisitor, innerConstraint, value, propertyPath, groups, test.violations, test.globalViolations, visitor);
        
        validateConstraintVisitorMock(3, 1, 7, visitor.startConstraintVisitor, objectConstraint, value, propertyPath, groups, test.violations, test.globalViolations, visitor, false, true);
        validateValidatorVisitorMock(3, 1, 8, visitor.startValidatorVisitor, objectConstraint, value, propertyPath, groups, test.violations, test.globalViolations, visitor);
        validateValidatorVisitorMock(3, 1, 9, visitor.endValidatorVisitor, objectConstraint, value, propertyPath, groups, test.violations, test.globalViolations, visitor);
        validateConstraintVisitorMock(3, 1, 10, visitor.endConstraintVisitor, objectConstraint, value, propertyPath, groups, test.violations, test.globalViolations, visitor, false, true);
        
        validateTypeVisitor(1, 0, 11, visitor.endTypeVisitor, 'MyPropertyType', value, propertyPath, groups, test.violations, test.globalViolations, visitor);
        
        validateConstraintVisitorMock(3, 2, 12, visitor.startConstraintVisitor, constraint, value, propertyPath, groups, test.violations, test.globalViolations, visitor);
        validateValidatorVisitorMock(3, 2, 13, visitor.startValidatorVisitor, constraint, value, propertyPath, groups, test.violations, test.globalViolations, visitor);
        validateValidatorVisitorMock(3, 2, 14, visitor.endValidatorVisitor, constraint, value, propertyPath, groups, test.violations, test.globalViolations, visitor);
        validateConstraintVisitorMock(3, 2, 15, visitor.endConstraintVisitor, constraint, value, propertyPath, groups, test.violations, test.globalViolations, visitor);
        
        validatePropertyVisitorMock(1, 0, 16, visitor.endPropertyVisitor, property, test.propertyName, test.objectWithProperty, path, groups, test.violations, test.globalViolations, visitor);
        
        expect(test.violations).toEqual([]);
        expect(test.globalViolations).toEqual([]);
    });
    
    test('Invalid cascade type acording to type validator', () => {
        var constraint = {
            constraintName: 'MyConstraint'
        };
        var property = {
            porpertyTypeName: 'MyPropertyType',
            constraints: [constraint]
        };
        var test = testUtils.registerMyPropertyConstraint(property, path, false, true);
        
        jbv.visitPropertyDescriptor(property, test.propertyName, test.objectWithProperty, path, groups, test.violations, test.globalViolations, visitor);
        
        var value = test.objectWithProperty[test.propertyName];
        var propertyPath = path + '.' + test.propertyName;
        var innerConstraint = getInnerConstraint('MyPropertyType');
        var objectConstraint = { constraintName: 'Object', defaultValuesLoaded: true};
        
        validatePropertyVisitorMock(1, 0, 1, visitor.startPropertyVisitor, property, test.propertyName, test.objectWithProperty, path, groups, test.violations, test.globalViolations, visitor);
        
        validateTypeVisitor(1, 0, 2, visitor.startTypeVisitor, 'MyPropertyType', value, propertyPath, groups, test.violations, test.globalViolations, visitor);
        
        validateConstraintVisitorMock(3, 0, 3, visitor.startConstraintVisitor, innerConstraint, value, propertyPath, groups, test.violations, test.globalViolations, visitor);
        validateValidatorVisitorMock(3, 0, 4, visitor.startValidatorVisitor, innerConstraint, value, propertyPath, groups, test.violations, test.globalViolations, visitor);
        validateValidatorVisitorMock(3, 0, 5, visitor.endValidatorVisitor, innerConstraint, value, propertyPath, groups, test.violations, test.globalViolations, visitor);
        validateConstraintVisitorMock(3, 0, 6, visitor.endConstraintVisitor, innerConstraint, value, propertyPath, groups, test.violations, test.globalViolations, visitor);
        
        validateConstraintVisitorMock(3, 1, 7, visitor.startConstraintVisitor, objectConstraint, value, propertyPath, groups, test.violations, test.globalViolations, visitor, false, true);
        validateValidatorVisitorMock(3, 1, 8, visitor.startValidatorVisitor, objectConstraint, value, propertyPath, groups, test.violations, test.globalViolations, visitor);
        validateValidatorVisitorMock(3, 1, 9, visitor.endValidatorVisitor, objectConstraint, value, propertyPath, groups, test.violations, test.globalViolations, visitor);
        validateConstraintVisitorMock(3, 1, 10, visitor.endConstraintVisitor, objectConstraint, value, propertyPath, groups, test.violations, test.globalViolations, visitor, false, true);
        
        validateTypeVisitor(1, 0, 11, visitor.endTypeVisitor, 'MyPropertyType', value, propertyPath, groups, test.violations, test.globalViolations, visitor);
        
        validateConstraintVisitorMock(3, 2, 12, visitor.startConstraintVisitor, constraint, value, propertyPath, groups, test.violations, test.globalViolations, visitor);
        validateValidatorVisitorMock(3, 2, 13, visitor.startValidatorVisitor, constraint, value, propertyPath, groups, test.violations, test.globalViolations, visitor);
        validateValidatorVisitorMock(3, 2, 14, visitor.endValidatorVisitor, constraint, value, propertyPath, groups, test.violations, test.globalViolations, visitor);
        validateConstraintVisitorMock(3, 2, 15, visitor.endConstraintVisitor, constraint, value, propertyPath, groups, test.violations, test.globalViolations, visitor);
        
        validatePropertyVisitorMock(1, 0, 16, visitor.endPropertyVisitor, property, test.propertyName, test.objectWithProperty, path, groups, test.violations, test.globalViolations, visitor);
        
        expect(test.violations).toEqual([]);
        expect(test.globalViolations).toEqual([]);
    });

    test('Invalid cascade type acording to validator and type validator', () => {
        var constraint = {
            constraintName: 'MyConstraint'
        };
        var property = {
            porpertyTypeName: 'MyPropertyType',
            constraints: [constraint]
        };
        var test = testUtils.registerMyPropertyConstraint(property, path, false, false);
        
        jbv.visitPropertyDescriptor(property, test.propertyName, test.objectWithProperty, path, groups, test.violations, test.globalViolations, visitor);
        
        var value = test.objectWithProperty[test.propertyName];
        var propertyPath = path + '.' + test.propertyName;
        var innerConstraint = getInnerConstraint('MyPropertyType');
        var objectConstraint = { constraintName: 'Object', defaultValuesLoaded: true};
        
        validatePropertyVisitorMock(1, 0, 1, visitor.startPropertyVisitor, property, test.propertyName, test.objectWithProperty, path, groups, test.violations, test.globalViolations, visitor);
        
        validateTypeVisitor(1, 0, 2, visitor.startTypeVisitor, 'MyPropertyType', value, propertyPath, groups, test.violations, test.globalViolations, visitor);
        
        validateConstraintVisitorMock(3, 0, 3, visitor.startConstraintVisitor, innerConstraint, value, propertyPath, groups, test.violations, test.globalViolations, visitor);
        validateValidatorVisitorMock(3, 0, 4, visitor.startValidatorVisitor, innerConstraint, value, propertyPath, groups, test.violations, test.globalViolations, visitor);
        validateValidatorVisitorMock(3, 0, 5, visitor.endValidatorVisitor, innerConstraint, value, propertyPath, groups, test.violations, test.globalViolations, visitor);
        validateConstraintVisitorMock(3, 0, 6, visitor.endConstraintVisitor, innerConstraint, value, propertyPath, groups, test.violations, test.globalViolations, visitor);
        
        validateConstraintVisitorMock(3, 1, 7, visitor.startConstraintVisitor, objectConstraint, value, propertyPath, groups, test.violations, test.globalViolations, visitor, false, true);
        validateValidatorVisitorMock(3, 1, 8, visitor.startValidatorVisitor, objectConstraint, value, propertyPath, groups, test.violations, test.globalViolations, visitor);
        validateValidatorVisitorMock(3, 1, 9, visitor.endValidatorVisitor, objectConstraint, value, propertyPath, groups, test.violations, test.globalViolations, visitor);
        validateConstraintVisitorMock(3, 1, 10, visitor.endConstraintVisitor, objectConstraint, value, propertyPath, groups, test.violations, test.globalViolations, visitor, false, true);
        
        validateTypeVisitor(1, 0, 11, visitor.endTypeVisitor, 'MyPropertyType', value, propertyPath, groups, test.violations, test.globalViolations, visitor);
        
        validateConstraintVisitorMock(3, 2, 12, visitor.startConstraintVisitor, constraint, value, propertyPath, groups, test.violations, test.globalViolations, visitor);
        validateValidatorVisitorMock(3, 2, 13, visitor.startValidatorVisitor, constraint, value, propertyPath, groups, test.violations, test.globalViolations, visitor);
        validateValidatorVisitorMock(3, 2, 14, visitor.endValidatorVisitor, constraint, value, propertyPath, groups, test.violations, test.globalViolations, visitor);
        validateConstraintVisitorMock(3, 2, 15, visitor.endConstraintVisitor, constraint, value, propertyPath, groups, test.violations, test.globalViolations, visitor);
        
        validatePropertyVisitorMock(1, 0, 16, visitor.endPropertyVisitor, property, test.propertyName, test.objectWithProperty, path, groups, test.violations, test.globalViolations, visitor);
        
        expect(test.violations).toEqual([]);
        expect(test.globalViolations).toEqual([]);
    });
    
    test('Invalid cascade type acording to validator and type validator', () => {
        var constraint = {
            constraintName: 'MyConstraint'
        };
        var property = {
            porpertyTypeName: 'MyPropertyType',
            constraints: [constraint]
        };
        var test = testUtils.registerMyPropertyConstraint(property, path, false, false);
        test.globalViolations = test.violations;
        
        jbv.visitPropertyDescriptor(property, test.propertyName, test.objectWithProperty, path, groups, test.violations, test.globalViolations, visitor);
        
        var value = test.objectWithProperty[test.propertyName];
        var propertyPath = path + '.' + test.propertyName;
        var innerConstraint = getInnerConstraint('MyPropertyType');
        var objectConstraint = { constraintName: 'Object', defaultValuesLoaded: true};
        
        validatePropertyVisitorMock(1, 0, 1, visitor.startPropertyVisitor, property, test.propertyName, test.objectWithProperty, path, groups, test.violations, test.globalViolations, visitor);
        
        validateTypeVisitor(1, 0, 2, visitor.startTypeVisitor, 'MyPropertyType', value, propertyPath, groups, test.violations, test.globalViolations, visitor);
        
        validateConstraintVisitorMock(3, 0, 3, visitor.startConstraintVisitor, innerConstraint, value, propertyPath, groups, test.violations, test.globalViolations, visitor);
        validateValidatorVisitorMock(3, 0, 4, visitor.startValidatorVisitor, innerConstraint, value, propertyPath, groups, test.violations, test.globalViolations, visitor);
        validateValidatorVisitorMock(3, 0, 5, visitor.endValidatorVisitor, innerConstraint, value, propertyPath, groups, test.violations, test.globalViolations, visitor);
        validateConstraintVisitorMock(3, 0, 6, visitor.endConstraintVisitor, innerConstraint, value, propertyPath, groups, test.violations, test.globalViolations, visitor);
        
        validateConstraintVisitorMock(3, 1, 7, visitor.startConstraintVisitor, objectConstraint, value, propertyPath, groups, test.violations, test.globalViolations, visitor, false, true);
        validateValidatorVisitorMock(3, 1, 8, visitor.startValidatorVisitor, objectConstraint, value, propertyPath, groups, test.violations, test.globalViolations, visitor);
        validateValidatorVisitorMock(3, 1, 9, visitor.endValidatorVisitor, objectConstraint, value, propertyPath, groups, test.violations, test.globalViolations, visitor);
        validateConstraintVisitorMock(3, 1, 10, visitor.endConstraintVisitor, objectConstraint, value, propertyPath, groups, test.violations, test.globalViolations, visitor, false, true);
        
        validateTypeVisitor(1, 0, 11, visitor.endTypeVisitor, 'MyPropertyType', value, propertyPath, groups, test.violations, test.globalViolations, visitor);
        
        validateConstraintVisitorMock(3, 2, 12, visitor.startConstraintVisitor, constraint, value, propertyPath, groups, test.violations, test.globalViolations, visitor);
        validateValidatorVisitorMock(3, 2, 13, visitor.startValidatorVisitor, constraint, value, propertyPath, groups, test.violations, test.globalViolations, visitor);
        validateValidatorVisitorMock(3, 2, 14, visitor.endValidatorVisitor, constraint, value, propertyPath, groups, test.violations, test.globalViolations, visitor);
        validateConstraintVisitorMock(3, 2, 15, visitor.endConstraintVisitor, constraint, value, propertyPath, groups, test.violations, test.globalViolations, visitor);
        
        validatePropertyVisitorMock(1, 0, 16, visitor.endPropertyVisitor, property, test.propertyName, test.objectWithProperty, path, groups, test.violations, test.globalViolations, visitor);
        
        expect(test.violations).toEqual([]);
    });
    
    test('Invalid cascade type without property constraint', () => {
        var property = {
            porpertyTypeName: 'MyPropertyType'
        };
        var test = testUtils.registerMyPropertyConstraint(property, path, false, false);
        
        jbv.visitPropertyDescriptor(property, test.propertyName, test.objectWithProperty, path, groups, test.violations, test.globalViolations, visitor);
        
        var value = test.objectWithProperty[test.propertyName];
        var propertyPath = path + '.' + test.propertyName;
        var innerConstraint = getInnerConstraint('MyPropertyType');
        var objectConstraint = { constraintName: 'Object', defaultValuesLoaded: true};
        
        validatePropertyVisitorMock(1, 0, 1, visitor.startPropertyVisitor, property, test.propertyName, test.objectWithProperty, path, groups, test.violations, test.globalViolations, visitor);
        
        validateTypeVisitor(1, 0, 2, visitor.startTypeVisitor, 'MyPropertyType', value, propertyPath, groups, test.violations, test.globalViolations, visitor);
        
        validateConstraintVisitorMock(2, 0, 3, visitor.startConstraintVisitor, innerConstraint, value, propertyPath, groups, test.violations, test.globalViolations, visitor);
        validateValidatorVisitorMock(2, 0, 4, visitor.startValidatorVisitor, innerConstraint, value, propertyPath, groups, test.violations, test.globalViolations, visitor);
        validateValidatorVisitorMock(2, 0, 5, visitor.endValidatorVisitor, innerConstraint, value, propertyPath, groups, test.violations, test.globalViolations, visitor);
        validateConstraintVisitorMock(2, 0, 6, visitor.endConstraintVisitor, innerConstraint, value, propertyPath, groups, test.violations, test.globalViolations, visitor);
        
        validateConstraintVisitorMock(2, 1, 7, visitor.startConstraintVisitor, objectConstraint, value, propertyPath, groups, test.violations, test.globalViolations, visitor, false, true);
        validateValidatorVisitorMock(2, 1, 8, visitor.startValidatorVisitor, objectConstraint, value, propertyPath, groups, test.violations, test.globalViolations, visitor);
        validateValidatorVisitorMock(2, 1, 9, visitor.endValidatorVisitor, objectConstraint, value, propertyPath, groups, test.violations, test.globalViolations, visitor);
        validateConstraintVisitorMock(2, 1, 10, visitor.endConstraintVisitor, objectConstraint, value, propertyPath, groups, test.violations, test.globalViolations, visitor, false, true);
        
        validateTypeVisitor(1, 0, 11, visitor.endTypeVisitor, 'MyPropertyType', value, propertyPath, groups, test.violations, test.globalViolations, visitor);
        
        validatePropertyVisitorMock(1, 0, 12, visitor.endPropertyVisitor, property, test.propertyName, test.objectWithProperty, path, groups, test.violations, test.globalViolations, visitor);
        
        expect(test.violations).toEqual([]);
        expect(test.globalViolations).toEqual([]);
    });

    test('Invalid cascade type with null object with property', () => {
        var constraint = {
            constraintName: 'MyConstraint'
        };
        var property = {
            porpertyTypeName: 'MyPropertyType',
            constraints: [constraint]
        };
        var test = testUtils.registerMyPropertyConstraint(property, path, false, false);
        test.objectWithProperty.myProperty = undefined;
        
        jbv.visitPropertyDescriptor(property, test.propertyName, null, path, groups, test.violations, test.globalViolations, visitor);
        
        var value = test.objectWithProperty[test.propertyName];
        var propertyPath = path + '.' + test.propertyName;
        var innerConstraint = getInnerConstraint('MyPropertyType');
        
        validatePropertyVisitorMock(1, 0, 1, visitor.startPropertyVisitor, property, test.propertyName, null, path, groups, test.violations, test.globalViolations, visitor);
        
        validateTypeVisitor(1, 0, 2, visitor.startTypeVisitor, 'MyPropertyType', value, propertyPath, groups, test.violations, test.globalViolations, visitor);
        
        validateConstraintVisitorMock(2, 0, 3, visitor.startConstraintVisitor, innerConstraint, value, propertyPath, groups, test.violations, test.globalViolations, visitor);
        validateValidatorVisitorMock(2, 0, 4, visitor.startValidatorVisitor, innerConstraint, value, propertyPath, groups, test.violations, test.globalViolations, visitor);
        validateValidatorVisitorMock(2, 0, 5, visitor.endValidatorVisitor, innerConstraint, value, propertyPath, groups, test.violations, test.globalViolations, visitor);
        validateConstraintVisitorMock(2, 0, 6, visitor.endConstraintVisitor, innerConstraint, value, propertyPath, groups, test.violations, test.globalViolations, visitor);

        validateTypeVisitor(1, 0, 7, visitor.endTypeVisitor, 'MyPropertyType', value, propertyPath, groups, test.violations, test.globalViolations, visitor);
        
        validateConstraintVisitorMock(2, 1, 8, visitor.startConstraintVisitor, constraint, value, propertyPath, groups, test.violations, test.globalViolations, visitor);
        validateValidatorVisitorMock(2, 1, 9, visitor.startValidatorVisitor, constraint, value, propertyPath, groups, test.violations, test.globalViolations, visitor);
        validateValidatorVisitorMock(2, 1, 10, visitor.endValidatorVisitor, constraint, value, propertyPath, groups, test.violations, test.globalViolations, visitor);
        validateConstraintVisitorMock(2, 1, 11, visitor.endConstraintVisitor, constraint, value, propertyPath, groups, test.violations, test.globalViolations, visitor);
        
        validatePropertyVisitorMock(1, 0, 12, visitor.endPropertyVisitor, property, test.propertyName, null, path, groups, test.violations, test.globalViolations, visitor);
        
        expect(test.violations).toEqual([]);
        expect(test.globalViolations).toEqual([]);
    });

    test('Invalid cascade type with undefined object with property', () => {
        var constraint = {
            constraintName: 'MyConstraint'
        };
        var property = {
            porpertyTypeName: 'MyPropertyType',
            constraints: [constraint]
        };
        var test = testUtils.registerMyPropertyConstraint(property, path, false, false);
        test.objectWithProperty.myProperty = undefined;
        
        jbv.visitPropertyDescriptor(property, test.propertyName, undefined, path, groups, test.violations, test.globalViolations, visitor);
        
        var value = test.objectWithProperty[test.propertyName];
        var propertyPath = path + '.' + test.propertyName;
        var innerConstraint = getInnerConstraint('MyPropertyType');
        
        validatePropertyVisitorMock(1, 0, 1, visitor.startPropertyVisitor, property, test.propertyName, undefined, path, groups, test.violations, test.globalViolations, visitor);
        
        validateTypeVisitor(1, 0, 2, visitor.startTypeVisitor, 'MyPropertyType', value, propertyPath, groups, test.violations, test.globalViolations, visitor);
        
        validateConstraintVisitorMock(2, 0, 3, visitor.startConstraintVisitor, innerConstraint, value, propertyPath, groups, test.violations, test.globalViolations, visitor);
        validateValidatorVisitorMock(2, 0, 4, visitor.startValidatorVisitor, innerConstraint, value, propertyPath, groups, test.violations, test.globalViolations, visitor);
        validateValidatorVisitorMock(2, 0, 5, visitor.endValidatorVisitor, innerConstraint, value, propertyPath, groups, test.violations, test.globalViolations, visitor);
        validateConstraintVisitorMock(2, 0, 6, visitor.endConstraintVisitor, innerConstraint, value, propertyPath, groups, test.violations, test.globalViolations, visitor);
        
        validateTypeVisitor(1, 0, 7, visitor.endTypeVisitor, 'MyPropertyType', value, propertyPath, groups, test.violations, test.globalViolations, visitor);
        
        validateConstraintVisitorMock(2, 1, 8, visitor.startConstraintVisitor, constraint, value, propertyPath, groups, test.violations, test.globalViolations, visitor);
        validateValidatorVisitorMock(2, 1, 9, visitor.startValidatorVisitor, constraint, value, propertyPath, groups, test.violations, test.globalViolations, visitor);
        validateValidatorVisitorMock(2, 1, 10, visitor.endValidatorVisitor, constraint, value, propertyPath, groups, test.violations, test.globalViolations, visitor);
        validateConstraintVisitorMock(2, 1, 11, visitor.endConstraintVisitor, constraint, value, propertyPath, groups, test.violations, test.globalViolations, visitor);
        
        validatePropertyVisitorMock(1, 0, 12, visitor.endPropertyVisitor, property, test.propertyName, undefined, path, groups, test.violations, test.globalViolations, visitor);
        
        expect(test.violations).toEqual([]);
        expect(test.globalViolations).toEqual([]);
    });
});

describe('#visitPropertyDescriptor with cascade and not recursively', () => {
    var visitor: jbv.Visitor = {
        startTypeVisitor: fn(true),
        endTypeVisitor: fn(),
        startPropertyVisitor: fn(true),
        endPropertyVisitor: fn(),
        startConstraintVisitor: fn(true),
        endConstraintVisitor: fn(),
        startValidatorVisitor: fn(true),
        endValidatorVisitor: fn()
    };
    
    afterEach(() => {
        visitor = {
            startTypeVisitor: fn(true),
            endTypeVisitor: fn(),
            startPropertyVisitor: fn(true),
            endPropertyVisitor: fn(),
            startConstraintVisitor: fn(true),
            endConstraintVisitor: fn(),
            startValidatorVisitor: fn(true),
            endValidatorVisitor: fn()
        };
        order = 0;
        testUtils.clean();
    });
    
    test('Valid cascade type', () => {
        var constraint = {
            constraintName: 'MyConstraint'
        };
        var property = {
            porpertyTypeName: 'MyPropertyType',
            constraints: [constraint],
            cascade: true
        };
        var test = testUtils.registerMyPropertyConstraint(property, path, true, true);
        
        jbv.visitPropertyDescriptor(property, test.propertyName, test.objectWithProperty, path, groups, test.violations, test.globalViolations, visitor);
        
        var value = test.objectWithProperty[test.propertyName];
        var propertyPath = path + '.' + test.propertyName;
        
        validatePropertyVisitorMock(1, 0, 1, visitor.startPropertyVisitor, property, test.propertyName, test.objectWithProperty, path, groups, test.violations, test.globalViolations, visitor);
        
        validateConstraintVisitorMock(1, 0, 2, visitor.startConstraintVisitor, constraint, value, propertyPath, groups, test.violations, test.globalViolations, visitor);
        validateValidatorVisitorMock(1, 0, 3, visitor.startValidatorVisitor, constraint, value, propertyPath, groups, test.violations, test.globalViolations, visitor);
        validateValidatorVisitorMock(1, 0, 4, visitor.endValidatorVisitor, constraint, value, propertyPath, groups, test.violations, test.globalViolations, visitor);
        validateConstraintVisitorMock(1, 0, 5, visitor.endConstraintVisitor, constraint, value, propertyPath, groups, test.violations, test.globalViolations, visitor);
        
        validatePropertyVisitorMock(1, 0, 6, visitor.endPropertyVisitor, property, test.propertyName, test.objectWithProperty, path, groups, test.violations, test.globalViolations, visitor);
        
        validateNotCalled(visitor.startTypeVisitor);
        validateNotCalled(visitor.endTypeVisitor);
        
        expect(test.violations).toEqual([]);
        expect(test.globalViolations).toEqual([]);
    });
    
    test('Invalid cascade type acording to type validator', () => {
        var constraint = {
            constraintName: 'MyConstraint'
        };
        var property = {
            porpertyTypeName: 'MyPropertyType',
            constraints: [constraint],
            cascade: true
        };
        var test = testUtils.registerMyPropertyConstraint(property, path, false, true);
        
        jbv.visitPropertyDescriptor(property, test.propertyName, test.objectWithProperty, path, groups, test.violations, test.globalViolations, visitor);
        
        var value = test.objectWithProperty[test.propertyName];
        var propertyPath = path + '.' + test.propertyName;
        
        validatePropertyVisitorMock(1, 0, 1, visitor.startPropertyVisitor, property, test.propertyName, test.objectWithProperty, path, groups, test.violations, test.globalViolations, visitor);
        
        validateConstraintVisitorMock(1, 0, 2, visitor.startConstraintVisitor, constraint, value, propertyPath, groups, test.violations, test.globalViolations, visitor);
        validateValidatorVisitorMock(1, 0, 3, visitor.startValidatorVisitor, constraint, value, propertyPath, groups, test.violations, test.globalViolations, visitor);
        validateValidatorVisitorMock(1, 0, 4, visitor.endValidatorVisitor, constraint, value, propertyPath, groups, test.violations, test.globalViolations, visitor);
        validateConstraintVisitorMock(1, 0, 5, visitor.endConstraintVisitor, constraint, value, propertyPath, groups, test.violations, test.globalViolations, visitor);
        
        validatePropertyVisitorMock(1, 0, 6, visitor.endPropertyVisitor, property, test.propertyName, test.objectWithProperty, path, groups, test.violations, test.globalViolations, visitor);
        
        validateNotCalled(visitor.startTypeVisitor);
        validateNotCalled(visitor.endTypeVisitor);
        
        expect(test.violations).toEqual([]);
        expect(test.globalViolations).toEqual([]);
    });

    test('Invalid cascade type acording to validator and type validator', () => {
        var constraint = {
            constraintName: 'MyConstraint'
        };
        var property = {
            porpertyTypeName: 'MyPropertyType',
            constraints: [constraint],
            cascade: true
        };
        var test = testUtils.registerMyPropertyConstraint(property, path, false, false);
        
        jbv.visitPropertyDescriptor(property, test.propertyName, test.objectWithProperty, path, groups, test.violations, test.globalViolations, visitor);
        
        var value = test.objectWithProperty[test.propertyName];
        var propertyPath = path + '.' + test.propertyName;
        
        validatePropertyVisitorMock(1, 0, 1, visitor.startPropertyVisitor, property, test.propertyName, test.objectWithProperty, path, groups, test.violations, test.globalViolations, visitor);
        
        validateConstraintVisitorMock(1, 0, 2, visitor.startConstraintVisitor, constraint, value, propertyPath, groups, test.violations, test.globalViolations, visitor);
        validateValidatorVisitorMock(1, 0, 3, visitor.startValidatorVisitor, constraint, value, propertyPath, groups, test.violations, test.globalViolations, visitor);
        validateValidatorVisitorMock(1, 0, 4, visitor.endValidatorVisitor, constraint, value, propertyPath, groups, test.violations, test.globalViolations, visitor);
        validateConstraintVisitorMock(1, 0, 5, visitor.endConstraintVisitor, constraint, value, propertyPath, groups, test.violations, test.globalViolations, visitor);
        
        validatePropertyVisitorMock(1, 0, 6, visitor.endPropertyVisitor, property, test.propertyName, test.objectWithProperty, path, groups, test.violations, test.globalViolations, visitor);
        
        validateNotCalled(visitor.startTypeVisitor);
        validateNotCalled(visitor.endTypeVisitor);
        
        expect(test.violations).toEqual([]);
        expect(test.globalViolations).toEqual([]);
    });
    
    test('Invalid cascade type acording to validator and type validator', () => {
        var constraint = {
            constraintName: 'MyConstraint'
        };
        var property = {
            porpertyTypeName: 'MyPropertyType',
            constraints: [constraint],
            cascade: true
        };
        var test = testUtils.registerMyPropertyConstraint(property, path, false, false);
        test.globalViolations = test.violations;
        
        jbv.visitPropertyDescriptor(property, test.propertyName, test.objectWithProperty, path, groups, test.violations, test.globalViolations, visitor);
        
        var value = test.objectWithProperty[test.propertyName];
        var propertyPath = path + '.' + test.propertyName;
        
        validatePropertyVisitorMock(1, 0, 1, visitor.startPropertyVisitor, property, test.propertyName, test.objectWithProperty, path, groups, test.violations, test.globalViolations, visitor);
        
        validateConstraintVisitorMock(1, 0, 2, visitor.startConstraintVisitor, constraint, value, propertyPath, groups, test.violations, test.globalViolations, visitor);
        validateValidatorVisitorMock(1, 0, 3, visitor.startValidatorVisitor, constraint, value, propertyPath, groups, test.violations, test.globalViolations, visitor);
        validateValidatorVisitorMock(1, 0, 4, visitor.endValidatorVisitor, constraint, value, propertyPath, groups, test.violations, test.globalViolations, visitor);
        validateConstraintVisitorMock(1, 0, 5, visitor.endConstraintVisitor, constraint, value, propertyPath, groups, test.violations, test.globalViolations, visitor);
        
        validatePropertyVisitorMock(1, 0, 6, visitor.endPropertyVisitor, property, test.propertyName, test.objectWithProperty, path, groups, test.violations, test.globalViolations, visitor);
        
        validateNotCalled(visitor.startTypeVisitor);
        validateNotCalled(visitor.endTypeVisitor);
        
        expect(test.violations).toEqual([]);
    });
    
    test('Invalid cascade type without property constraint', () => {
        var property = {
            porpertyTypeName: 'MyPropertyType',
            cascade: true
        };
        var test = testUtils.registerMyPropertyConstraint(property, path, false, false);
        
        jbv.visitPropertyDescriptor(property, test.propertyName, test.objectWithProperty, path, groups, test.violations, test.globalViolations, visitor);
        
        validatePropertyVisitorMock(1, 0, 1, visitor.startPropertyVisitor, property, test.propertyName, test.objectWithProperty, path, groups, test.violations, test.globalViolations, visitor);
        validatePropertyVisitorMock(1, 0, 2, visitor.endPropertyVisitor, property, test.propertyName, test.objectWithProperty, path, groups, test.violations, test.globalViolations, visitor);
        
        validateNotCalled(visitor.startTypeVisitor);
        validateNotCalled(visitor.endTypeVisitor);
        validateNotCalled(visitor.startConstraintVisitor);
        validateNotCalled(visitor.endConstraintVisitor);
        validateNotCalled(visitor.endValidatorVisitor);
        validateNotCalled(visitor.endTypeVisitor);
        
        expect(test.violations).toEqual([]);
        expect(test.globalViolations).toEqual([]);
    });

    test('Invalid cascade type with null object with property', () => {
        var constraint = {
            constraintName: 'MyConstraint'
        };
        var property = {
            porpertyTypeName: 'MyPropertyType',
            constraints: [constraint],
            cascade: true
        };
        var test = testUtils.registerMyPropertyConstraint(property, path, false, false);
        test.objectWithProperty.myProperty = undefined;
        
        jbv.visitPropertyDescriptor(property, test.propertyName, null, path, groups, test.violations, test.globalViolations, visitor);
        
        var value = test.objectWithProperty[test.propertyName];
        var propertyPath = path + '.' + test.propertyName;
        
        validatePropertyVisitorMock(1, 0, 1, visitor.startPropertyVisitor, property, test.propertyName, null, path, groups, test.violations, test.globalViolations, visitor);
        
        validateConstraintVisitorMock(1, 0, 2, visitor.startConstraintVisitor, constraint, value, propertyPath, groups, test.violations, test.globalViolations, visitor);
        validateValidatorVisitorMock(1, 0, 3, visitor.startValidatorVisitor, constraint, value, propertyPath, groups, test.violations, test.globalViolations, visitor);
        validateValidatorVisitorMock(1, 0, 4, visitor.endValidatorVisitor, constraint, value, propertyPath, groups, test.violations, test.globalViolations, visitor);
        validateConstraintVisitorMock(1, 0, 5, visitor.endConstraintVisitor, constraint, value, propertyPath, groups, test.violations, test.globalViolations, visitor);
        
        validatePropertyVisitorMock(1, 0, 6, visitor.endPropertyVisitor, property, test.propertyName, null, path, groups, test.violations, test.globalViolations, visitor);
        
        validateNotCalled(visitor.startTypeVisitor);
        validateNotCalled(visitor.endTypeVisitor);
        
        expect(test.violations).toEqual([]);
        expect(test.globalViolations).toEqual([]);
    });

    test('Invalid cascade type with undefined object with property', () => {
        var constraint = {
            constraintName: 'MyConstraint'
        };
        var property = {
            porpertyTypeName: 'MyPropertyType',
            constraints: [constraint],
            cascade: true
        };
        var test = testUtils.registerMyPropertyConstraint(property, path, false, false);
        test.objectWithProperty.myProperty = undefined;
        
        jbv.visitPropertyDescriptor(property, test.propertyName, undefined, path, groups, test.violations, test.globalViolations, visitor);
        
        var value = test.objectWithProperty[test.propertyName];
        var propertyPath = path + '.' + test.propertyName;
        
        validatePropertyVisitorMock(1, 0, 1, visitor.startPropertyVisitor, property, test.propertyName, undefined, path, groups, test.violations, test.globalViolations, visitor);
        
        validateConstraintVisitorMock(1, 0, 2, visitor.startConstraintVisitor, constraint, value, propertyPath, groups, test.violations, test.globalViolations, visitor);
        validateValidatorVisitorMock(1, 0, 3, visitor.startValidatorVisitor, constraint, value, propertyPath, groups, test.violations, test.globalViolations, visitor);
        validateValidatorVisitorMock(1, 0, 4, visitor.endValidatorVisitor, constraint, value, propertyPath, groups, test.violations, test.globalViolations, visitor);
        validateConstraintVisitorMock(1, 0, 5, visitor.endConstraintVisitor, constraint, value, propertyPath, groups, test.violations, test.globalViolations, visitor);
        
        validatePropertyVisitorMock(1, 0, 6, visitor.endPropertyVisitor, property, test.propertyName, undefined, path, groups, test.violations, test.globalViolations, visitor);
        
        validateNotCalled(visitor.startTypeVisitor);
        validateNotCalled(visitor.endTypeVisitor);
        
        expect(test.violations).toEqual([]);
        expect(test.globalViolations).toEqual([]);
    });
});


describe('#visitTypeDescriptor with ignoreValue set to true', () => {
    var visitor: jbv.Visitor = {
        startTypeVisitor: fn(true),
        endTypeVisitor: fn(),
        startPropertyVisitor: fn(true),
        endPropertyVisitor: fn(),
        startConstraintVisitor: fn(true),
        endConstraintVisitor: fn(),
        startValidatorVisitor: fn(true),
        endValidatorVisitor: fn(),
        recursively: true,
        ignoreValue: true
    };
    
    afterEach(() => {
        visitor = {
            startTypeVisitor: fn(true),
            endTypeVisitor: fn(),
            startPropertyVisitor: fn(true),
            endPropertyVisitor: fn(),
            startConstraintVisitor: fn(true),
            endConstraintVisitor: fn(),
            startValidatorVisitor: fn(true),
            endValidatorVisitor: fn(),
            recursively: true,
            ignoreValue: true
        };
        order = 0;
        testUtils.clean();
    });
    
    test('Null cascade type', () => {
        var propertyConstraint = {
            constraintName: 'MyConstraint'
        };
        var property = {
            porpertyTypeName: 'MyPropertyType',
            constraints: [propertyConstraint],
            cascade: true
        };
        var type = {
            typeName: 'MyType',
            properties: {
                myProperty: property
            }
        };
        var test = testUtils.registerMyPropertyConstraint(property, path, true, true);
        
        jbv.visitTypeDescriptor(type, null, path, groups, test.violations, test.globalViolations, visitor);
        
        var propertyValue = undefined;
        var propertyPath = path + '.' + test.propertyName;
        var propertyTypeInnerConstraint = getInnerConstraint('MyPropertyType');
        var objectConstraint = { constraintName: 'Object', defaultValuesLoaded: true};
        
        validateTypeVisitor(2, 0, 1, visitor.startTypeVisitor, type, null, path, groups, test.violations, test.globalViolations, visitor);
        
        validateConstraintVisitorMock(4, 0, 2, visitor.startConstraintVisitor, objectConstraint, null, path, groups, test.violations, test.globalViolations, visitor, false, true);
        validateValidatorVisitorMock(4, 0, 3, visitor.startValidatorVisitor, objectConstraint, null, path, groups, test.violations, test.globalViolations, visitor);
        validateValidatorVisitorMock(4, 0, 4, visitor.endValidatorVisitor, objectConstraint, null, path, groups, test.violations, test.globalViolations, visitor);
        validateConstraintVisitorMock(4, 0, 5, visitor.endConstraintVisitor, objectConstraint, null, path, groups, test.violations, test.globalViolations, visitor, false, true);
        
        validatePropertyVisitorMock(1, 0, 6, visitor.startPropertyVisitor, property, test.propertyName, null, path, groups, test.violations, test.globalViolations, visitor);
        
        validateTypeVisitor(2, 1, 7, visitor.startTypeVisitor, 'MyPropertyType', propertyValue, propertyPath, groups, test.violations, test.globalViolations, visitor);
        
        validateConstraintVisitorMock(4, 1, 8, visitor.startConstraintVisitor, propertyTypeInnerConstraint, propertyValue, propertyPath, groups, test.violations, test.globalViolations, visitor);
        validateValidatorVisitorMock(4, 1, 9, visitor.startValidatorVisitor, propertyTypeInnerConstraint, propertyValue, propertyPath, groups, test.violations, test.globalViolations, visitor);
        validateValidatorVisitorMock(4, 1, 10, visitor.endValidatorVisitor, propertyTypeInnerConstraint, propertyValue, propertyPath, groups, test.violations, test.globalViolations, visitor);
        validateConstraintVisitorMock(4, 1, 11, visitor.endConstraintVisitor, propertyTypeInnerConstraint, propertyValue, propertyPath, groups, test.violations, test.globalViolations, visitor);
        
        validateConstraintVisitorMock(4, 2, 12, visitor.startConstraintVisitor, objectConstraint, propertyValue, propertyPath, groups, test.violations, test.globalViolations, visitor, false, true);
        validateValidatorVisitorMock(4, 2, 13, visitor.startValidatorVisitor, objectConstraint, propertyValue, propertyPath, groups, test.violations, test.globalViolations, visitor);
        validateValidatorVisitorMock(4, 2, 14, visitor.endValidatorVisitor, objectConstraint, propertyValue, propertyPath, groups, test.violations, test.globalViolations, visitor);
        validateConstraintVisitorMock(4, 2, 15, visitor.endConstraintVisitor, objectConstraint, propertyValue, propertyPath, groups, test.violations, test.globalViolations, visitor, false, true);
        
        validateTypeVisitor(2, 0, 16, visitor.endTypeVisitor, 'MyPropertyType', propertyValue, propertyPath, groups, test.violations, test.globalViolations, visitor);
        
        validateConstraintVisitorMock(4, 3, 17, visitor.startConstraintVisitor, propertyConstraint, propertyValue, propertyPath, groups, test.violations, test.globalViolations, visitor);
        validateValidatorVisitorMock(4, 3, 18, visitor.startValidatorVisitor, propertyConstraint, propertyValue, propertyPath, groups, test.violations, test.globalViolations, visitor);
        validateValidatorVisitorMock(4, 3, 19, visitor.endValidatorVisitor, propertyConstraint, propertyValue, propertyPath, groups, test.violations, test.globalViolations, visitor);
        validateConstraintVisitorMock(4, 3, 20, visitor.endConstraintVisitor, propertyConstraint, propertyValue, propertyPath, groups, test.violations, test.globalViolations, visitor);
        
        validatePropertyVisitorMock(1, 0, 21, visitor.endPropertyVisitor, property, test.propertyName, null, path, groups, test.violations, test.globalViolations, visitor);
        
        validateTypeVisitor(2, 1, 22, visitor.endTypeVisitor, type, null, path, groups, test.violations, test.globalViolations, visitor);
        
        expect(test.violations).toEqual([]);
        expect(test.globalViolations).toEqual([]);
    });
    
    test('Undefined cascade type', () => {
        var propertyConstraint = {
            constraintName: 'MyConstraint'
        };
        var property = {
            porpertyTypeName: 'MyPropertyType',
            constraints: [propertyConstraint],
            cascade: true
        };
        var type = {
            typeName: 'MyType',
            properties: {
                myProperty: property
            }
        };
        var test = testUtils.registerMyPropertyConstraint(property, path, true, true);
        
        jbv.visitTypeDescriptor(type, undefined, path, groups, test.violations, test.globalViolations, visitor);
        
        var propertyValue = undefined;
        var propertyPath = path + '.' + test.propertyName;
        var propertyTypeInnerConstraint = getInnerConstraint('MyPropertyType');
        var objectConstraint = { constraintName: 'Object', defaultValuesLoaded: true};
        
        validateTypeVisitor(2, 0, 1, visitor.startTypeVisitor, type, undefined, path, groups, test.violations, test.globalViolations, visitor);
        
        validateConstraintVisitorMock(4, 0, 2, visitor.startConstraintVisitor, objectConstraint, undefined, path, groups, test.violations, test.globalViolations, visitor, false, true);
        validateValidatorVisitorMock(4, 0, 3, visitor.startValidatorVisitor, objectConstraint, undefined, path, groups, test.violations, test.globalViolations, visitor);
        validateValidatorVisitorMock(4, 0, 4, visitor.endValidatorVisitor, objectConstraint, undefined, path, groups, test.violations, test.globalViolations, visitor);
        validateConstraintVisitorMock(4, 0, 5, visitor.endConstraintVisitor, objectConstraint, undefined, path, groups, test.violations, test.globalViolations, visitor, false, true);
        
        validatePropertyVisitorMock(1, 0, 6, visitor.startPropertyVisitor, property, test.propertyName, undefined, path, groups, test.violations, test.globalViolations, visitor);
        
        validateTypeVisitor(2, 1, 7, visitor.startTypeVisitor, 'MyPropertyType', propertyValue, propertyPath, groups, test.violations, test.globalViolations, visitor);
        
        validateConstraintVisitorMock(4, 1, 8, visitor.startConstraintVisitor, propertyTypeInnerConstraint, propertyValue, propertyPath, groups, test.violations, test.globalViolations, visitor);
        validateValidatorVisitorMock(4, 1, 9, visitor.startValidatorVisitor, propertyTypeInnerConstraint, propertyValue, propertyPath, groups, test.violations, test.globalViolations, visitor);
        validateValidatorVisitorMock(4, 1, 10, visitor.endValidatorVisitor, propertyTypeInnerConstraint, propertyValue, propertyPath, groups, test.violations, test.globalViolations, visitor);
        validateConstraintVisitorMock(4, 1, 11, visitor.endConstraintVisitor, propertyTypeInnerConstraint, propertyValue, propertyPath, groups, test.violations, test.globalViolations, visitor);
        
        validateConstraintVisitorMock(4, 2, 12, visitor.startConstraintVisitor, objectConstraint, propertyValue, propertyPath, groups, test.violations, test.globalViolations, visitor, false, true);
        validateValidatorVisitorMock(4, 2, 13, visitor.startValidatorVisitor, objectConstraint, propertyValue, propertyPath, groups, test.violations, test.globalViolations, visitor);
        validateValidatorVisitorMock(4, 2, 14, visitor.endValidatorVisitor, objectConstraint, propertyValue, propertyPath, groups, test.violations, test.globalViolations, visitor);
        validateConstraintVisitorMock(4, 2, 15, visitor.endConstraintVisitor, objectConstraint, propertyValue, propertyPath, groups, test.violations, test.globalViolations, visitor, false, true);
        
        validateTypeVisitor(2, 0, 16, visitor.endTypeVisitor, 'MyPropertyType', propertyValue, propertyPath, groups, test.violations, test.globalViolations, visitor);
        
        validateConstraintVisitorMock(4, 3, 17, visitor.startConstraintVisitor, propertyConstraint, propertyValue, propertyPath, groups, test.violations, test.globalViolations, visitor);
        validateValidatorVisitorMock(4, 3, 18, visitor.startValidatorVisitor, propertyConstraint, propertyValue, propertyPath, groups, test.violations, test.globalViolations, visitor);
        validateValidatorVisitorMock(4, 3, 19, visitor.endValidatorVisitor, propertyConstraint, propertyValue, propertyPath, groups, test.violations, test.globalViolations, visitor);
        validateConstraintVisitorMock(4, 3, 20, visitor.endConstraintVisitor, propertyConstraint, propertyValue, propertyPath, groups, test.violations, test.globalViolations, visitor);
        
        validatePropertyVisitorMock(1, 0, 21, visitor.endPropertyVisitor, property, test.propertyName, undefined, path, groups, test.violations, test.globalViolations, visitor);
        
        validateTypeVisitor(2, 1, 22, visitor.endTypeVisitor, type, undefined, path, groups, test.violations, test.globalViolations, visitor);
        
        expect(test.violations).toEqual([]);
        expect(test.globalViolations).toEqual([]);
    });
});

import * as jbv from '../../src/index';

describe('basic objects', () => {
   
    test('jbv has TYPE_DESCRIPTORS', () => {
        expect(jbv.TYPE_DESCRIPTORS).toBeInstanceOf(Object);
    });
    
    test('jbv has GROUPS_INHERITANCE', () => {
        expect(jbv.GROUPS_INHERITANCE).toBeInstanceOf(Object);
    });
    
    test('jbv has VALIDATORS', () => {
        expect(jbv.VALIDATORS).toBeInstanceOf(Object);
    });
    
    test('jbv defines DEFAULT_GROUP', () => {
        expect(jbv.DEFAULT_GROUP).toBe('Default');
    });
    
    test('jbv defines DEFAULT_GROUPS', () => {
        expect(jbv.DEFAULT_GROUPS).toEqual(['Default']);
    });
    
    test('Allow change formatter', () => {
        var oldFormatter = jbv.getMessageFormatter();
        var newFormatter = oldFormatter.bind(undefined);
        
        jbv.setMessageFormatter(newFormatter);
        expect(jbv.getMessageFormatter()).toBe(newFormatter);
        jbv.setMessageFormatter(oldFormatter);        
    });
});

describe('#loadDefaultConstraintValues with validator without defaults', () => {
    var validator: jbv.Validator = () => { return true; };

    test('without default values', () => {
        var constraint = {
            constraintName: 'TestConstraint'
        };
        
        jbv.loadDefaultConstraintValues(constraint, validator);
        expect(constraint).toEqual({
            constraintName: 'TestConstraint',
            defaultValuesLoaded: true
        });        
    });

    test('whith empty values', () => {
        var constraint = {
            constraintName: 'TestConstraint',
            attributes: {}
        };
        
        jbv.loadDefaultConstraintValues(constraint, validator);
        expect(constraint).toEqual({
            constraintName: 'TestConstraint',
            defaultValuesLoaded: true,
            attributes: {}
        });        
    });

    test('with a value', () => {
        var constraint = {
            constraintName: 'TestConstraint',
            attributes: {
                foo: 'fooValue'
            }
        };
    
        jbv.loadDefaultConstraintValues(constraint, validator);
        expect(constraint).toEqual({
            constraintName: 'TestConstraint',
            defaultValuesLoaded: true,
            attributes: {
                foo: 'fooValue'
            }
        });        
    });
});

describe('#loadDefaultConstraintValues with validator with defaults', () => {
    var validator: jbv.Validator = () => { return true; };
    validator.defaultValues = {
        default1: 'default1Value',
        default2: 'default2Value'
    };

    test('without default values', () => {
        var constraint = {
            constraintName: 'TestConstraint'
        };
        
        jbv.loadDefaultConstraintValues(constraint, validator);
        expect(constraint).toEqual({
            constraintName: 'TestConstraint',
            defaultValuesLoaded: true,
            attributes: {
                default1: 'default1Value',
                default2: 'default2Value'
            }
        });
    });
    
    test('with empty values', () => {
        var constraint = {
            constraintName: 'TestConstraint',
            attributes: {}
        };
    
        jbv.loadDefaultConstraintValues(constraint, validator);
        expect(constraint).toEqual({
            constraintName: 'TestConstraint',
            defaultValuesLoaded: true,
            attributes: {
                default1: 'default1Value',
                default2: 'default2Value'
            }
        });        
    });

    test('with a value', () => {
        var constraint = {
            constraintName: 'TestConstraint',
            attributes: {
                foo: 'fooValue'
            }
        };
    
        jbv.loadDefaultConstraintValues(constraint, validator);
        expect(constraint).toEqual({
            constraintName: 'TestConstraint',
            defaultValuesLoaded: true,
            attributes: {
                foo: 'fooValue',
                default1: 'default1Value',
                default2: 'default2Value'
            }
        });        
    })

    test('with a overrided value', () => {
        var constraint = {
            constraintName: 'TestConstraint',
            attributes: {
                default1: 'fooValue'
            }
        };
    
        jbv.loadDefaultConstraintValues(constraint, validator);
        expect(constraint).toEqual({
            constraintName: 'TestConstraint',
            defaultValuesLoaded: true,
            attributes: {
                default1: 'fooValue',
                default2: 'default2Value'
            }
        });        
    });
});

describe('#addViolation', () => {
    test('without attribures', () => {
        var constraint = {
            constraintName: 'TestConstraint'
        };
        var violations: jbv.Violation[] = [];
        jbv.addViolation(constraint, 'invalidValue', 'path', violations);
        
        expect(violations).toEqual([{
            constraintDescriptor: constraint,
            invalidValue: 'invalidValue',
            messageTemplate: '{TestConstraint}',
            message: '{"template":"{TestConstraint}","invalidValue":"invalidValue"}',
            propertyPath: 'path'
        }]);        
    });

    test('with empty attributes', () => {
        var constraint = {
            constraintName: 'TestConstraint',
            attributes: {}
        };
        var violations: jbv.Violation[] = [];
        jbv.addViolation(constraint, 'invalidValue', 'path', violations);
        
        expect(violations).toEqual([{
            constraintDescriptor: constraint,
            invalidValue: 'invalidValue',
            messageTemplate: '{TestConstraint}',
            message: '{"template":"{TestConstraint}","attributes":{},"invalidValue":"invalidValue"}',
            propertyPath: 'path'
        }]);        
    });

    test('with message', () => {
        var constraint = {
            constraintName: 'TestConstraint',
            attributes: {
                message : 'message'
            }
        };
        var violations: jbv.Violation[] = [];
        jbv.addViolation(constraint, 'invalidValue', 'path', violations);
        
        expect(violations).toEqual([{
            constraintDescriptor: constraint,
            invalidValue: 'invalidValue',
            messageTemplate: 'message',
            message: '{"template":"message","attributes":{"message":"message"},"invalidValue":"invalidValue"}',
            propertyPath: 'path'
        }]);        
    });

});

describe('#convertGroups', () => {
    var currentGroups = ['A', 'B', 'C'];
    var groupConversions = {
        'A': 'AA',
        'B': 'BB'
    };
    
    test('with some convertions', () => {
        var convertedGroups = jbv.convertGroups(currentGroups, groupConversions);
        expect(convertedGroups).toEqual(['AA', 'BB', 'C']);        
    });

    test('with undefined convertions rules', () => {
        var convertedGroups = jbv.convertGroups(currentGroups, undefined);
        expect(convertedGroups).toEqual(['A', 'B', 'C']);        
    });

    test('with null convertions rules', () => {
        var groupConversions: any = null;
        var convertedGroups = jbv.convertGroups(currentGroups, groupConversions);
        expect(convertedGroups).toEqual(['A', 'B', 'C']);
    });
});

describe('#groupAllowed', () => {
    test('allowed withot inheritance', () => {
        var candidateGroups = ['A', 'B', 'C'];
        var allowedGroups = ['B', 'C'];
        
        var allowed = jbv.groupAllowed(candidateGroups, allowedGroups);
        expect(allowed).toBe(true);        
    });

    test('allowed with inheritance', () => {
        var candidateGroups = ['A', 'B'];
        var allowedGroups = ['D'];
        jbv.GROUPS_INHERITANCE.A = ['C', 'D'];
    
        var allowed = jbv.groupAllowed(candidateGroups, allowedGroups);
        expect(allowed).toBe(true);
        delete jbv.GROUPS_INHERITANCE.A;
    });
    
    test('not allowed without inheritance', () => {
        var candidateGroups = ['A', 'B'];
        var allowedGroups = ['D'];
    
        var allowed = jbv.groupAllowed(candidateGroups, allowedGroups);
        expect(allowed).toBe(false);
    });
    
    test('allowed default group', () => {
        var allowed = jbv.groupAllowed([jbv.DEFAULT_GROUP]);
        expect(allowed).toBe(true);        
    });
});

describe('#getPropertyDescriptor', () => {
    var path = 'path';
    var objectWithProperty = {
        property: 'value'
    };
    var property = {
        porpertyTypeName: 'PropertyType'
    };
    var type = {
        typeName: 'TypeName',
        properties: {
            property
        }
    };
    
    test('no error', () => {
        var globalViolations: jbv.Violation[] = [];
        var propertyName = 'property';
        
        var propertyDescriptor = jbv.getPropertyDescriptor(type, objectWithProperty, propertyName, path, globalViolations);
        expect(propertyDescriptor).toBe(property);
        expect(globalViolations).toEqual([]);        
    });

    test('wrong property', () => {
        var globalViolations: jbv.Violation[] = [];
        var propertyName = 'otherProperty';
        
        var propertyDescriptor = jbv.getPropertyDescriptor(type, objectWithProperty, propertyName, path, globalViolations);
        expect(propertyDescriptor).toBe(null);
        expect(globalViolations).toEqual([{
            constraintDescriptor: {
                attributes: {
                    propertyName: 'otherProperty',
                    typeName: 'TypeName',
                },
                constraintName: 'PropertyNotFound',
            },
            invalidValue: {
                property: 'value',
            },
            message: '{"template":"{PropertyNotFound}","attributes":{"typeName":"TypeName","propertyName":"otherProperty"},"invalidValue":{"property":"value"}}',
            messageTemplate: '{PropertyNotFound}',
            propertyPath: 'path',
        }]);        
    });

    test('is collection with property', () => {
        var globalViolations: jbv.Violation[] = [];
        var propertyName = 'property';
        
        var collectionType = {
            typeName: 'CollectionTypeName',
            isCollection: true,
            properties: {
               property
            }
        };
        
        var propertyDescriptor = jbv.getPropertyDescriptor(collectionType, objectWithProperty, propertyName, path, globalViolations);
        expect(propertyDescriptor).toBe(property);
        expect(globalViolations).toEqual([]);
    })

    test('is collection with value descriptor', () => {
        var globalViolations: jbv.Violation[] = [];
        var propertyName = 'property';
        
        var collectionType = {
            typeName: 'MyCollection',
            isCollection: true,
            valueDescriptor: property
        };
        
        var propertyDescriptor = jbv.getPropertyDescriptor(collectionType, objectWithProperty, propertyName, path, globalViolations);
        expect(propertyDescriptor).toBe(property);
        expect(globalViolations).toEqual([]);        
    })

    test('without any property', () => {
        var globalViolations: jbv.Violation[] = [];
        var propertyName = 'property';
        
        var typeWithoutProperty = {
            typeName: 'TypeName'
        };
        
        var propertyDescriptor = jbv.getPropertyDescriptor(typeWithoutProperty, objectWithProperty, propertyName, path, globalViolations);
        expect(propertyDescriptor).toBe(null);
        expect(globalViolations).toEqual([{
            constraintDescriptor: {
                attributes: {
                    propertyName: 'property',
                    typeName: 'TypeName',
                },
                constraintName: 'PropertyNotFound',
            },
            invalidValue: {
                property: 'value',
            },
            message: '{"template":"{PropertyNotFound}","attributes":{"typeName":"TypeName","propertyName":"property"},"invalidValue":{"property":"value"}}',
            messageTemplate: '{PropertyNotFound}',
            propertyPath: 'path',
        }]);        
    });
});

describe('#getTypeDescriptor', () => {
    var path = 'path';
    var value = 'value';
    var typeName = 'MyType';
    
    var type = {
        typeName: 'MyType'
    }
    var typeName = 'MyType';
    
    beforeAll(() => {
        jbv.TYPE_DESCRIPTORS.MyType = type;
    });
    
    afterAll(() => {
        delete jbv.TYPE_DESCRIPTORS.MyType;
    })
    
    test('as simple type', () => {
        var globalViolations: jbv.Violation[] = [];
        var typeDescriptor = jbv.getTypeDescriptor(typeName, value, path, globalViolations);
        expect(typeDescriptor).toBe(type);
        expect(globalViolations).toEqual([]);        
    });

    test('as a generic type', () => {
        var globalViolations: jbv.Violation[] = [];
        var typeDescriptor = jbv.getTypeDescriptor([typeName], value, path, globalViolations);
        expect(typeDescriptor).toBe(type);
        expect(globalViolations).toEqual([]);
    });

    test('unknown type', () => {
        var globalViolations: jbv.Violation[] = [];
        var unknownTypeName = 'OtherType';
        var typeDescriptor = jbv.getTypeDescriptor(unknownTypeName, value, path, globalViolations);
        expect(typeDescriptor).toBe(null);
        expect(globalViolations).toEqual([{
            constraintDescriptor: {
                attributes: {
                    typeName: 'OtherType',
                },
                constraintName: 'TypeNotFound',
            },
            invalidValue: 'value',
            message: '{"template":"{TypeNotFound}","attributes":{"typeName":"OtherType"},"invalidValue":"value"}',
            messageTemplate: '{TypeNotFound}',
            propertyPath: 'path',
        }]);        
    });

    test('as a generic on demand constructed type', () => {
        jbv.TYPE_DESCRIPTORS.MyConstructedType = (constructedTypeName) => {
            return {
                typeName: constructedTypeName
            };
        };
        var genericTypeName = 'MyConstructedType';
        var globalViolations: jbv.Violation[] = [];
        
        var typeDescriptor = jbv.getTypeDescriptor(genericTypeName, value, path, globalViolations);
        expect(typeDescriptor).toEqual({
            typeName: 'MyConstructedType'
        });
        expect(globalViolations).toEqual([]);
        delete jbv.TYPE_DESCRIPTORS.MyConstructedType;        
    });
});
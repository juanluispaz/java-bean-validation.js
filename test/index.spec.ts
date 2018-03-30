import * as jbv from '../src/index';
import { formatMessage } from '../src/messageFormatter/en';

const typeDescriptors = [{
    "typeName": "Person",
    "properties": {
        "name": {
            "porpertyTypeName": "String",
            "constraints": [
                {
                    "constraintName": "NotEmpty",
                    "composingConstraints": [
                        {
                            "constraintName": "Size",
                            "attributes": {
                                "min": 1
                            }
                        },
                        {
                            "constraintName": "NotNull"
                        }
                    ],
                    "reportAsSingle": true,
                    "hasNoValidator": true
                }
            ]
        },
        "age": {
            "porpertyTypeName": "int",
            "constraints": [
                {
                    "constraintName": "Max",
                    "attributes": {
                        "value": 99
                    }
                },
                {
                    "constraintName": "Min",
                    "attributes": {
                        "value": 0
                    }
                }
            ]
        }
    }
}]

describe('basic tests', () => {
    
    beforeAll(() => {
        jbv.registerTypes(typeDescriptors);
    });
    
    test('#validateObject: valid person', () => {
        const person = {
            name: 'John Smith',
            age: 24
        };
        const violations = jbv.validateObject('Person', person);
        expect(violations).toEqual([]);
    });
    
    test('#validateObject: person too old', () => {
        const person = {
            name: 'John Smith',
            age: 999
        };
        const violations = jbv.validateObject('Person', person);
        expect(violations[0].message).toEqual('{"template":"{Max}","attributes":{"value":99},"invalidValue":999}');
    });
    
    test('#validateValueOfProperty: valid age', () => {
        const violations = jbv.validateValueOfProperty('Person', 'age', 24);
        expect(violations).toEqual([]);
    });
    
    test('#validateValueOfProperty: invalid age', () => {
        const violations = jbv.validateValueOfProperty('Person', 'age', 999);
        expect(violations[0].message).toEqual('{"template":"{Max}","attributes":{"value":99},"invalidValue":999}');
    });
});
import { TYPE_DESCRIPTORS, TypeValidationsDescriptorFactory, TypeValidationsDescriptor, TypeName } from "./core";

const basicTypeDescriptors: TypeValidationsDescriptor[] = [
    { typeName: 'Object' },
    { typeName: 'Void', constraints: [{ constraintName: 'Null' }] },
    { typeName: 'String', constraints: [{ constraintName: 'String' }] },
    { typeName: 'boolean', constraints: [{ constraintName: 'Boolean' }] }, // Ignore {constraintName: 'NotNull'} to allow null == false
    { typeName: 'Boolean', constraints: [{ constraintName: 'Boolean' }] },
    { typeName: 'byte', constraints: [{ constraintName: 'IntegerNumber' }, { constraintName: 'Min', attributes: { value: -128 } }, { constraintName: 'Max', attributes: { value: 127 } }, { constraintName: 'NotBlank' }] },
    { typeName: 'byte', constraints: [{ constraintName: 'IntegerNumber' }, { constraintName: 'Min', attributes: { value: -128 } }, { constraintName: 'Max', attributes: { value: 127 } }] },
    { typeName: 'short', constraints: [{ constraintName: 'IntegerNumber' }, { constraintName: 'Min', attributes: { value: -32768 } }, { constraintName: 'Max', attributes: { value: 32767 } }, { constraintName: 'NotBlank' }] },
    { typeName: 'Short', constraints: [{ constraintName: 'IntegerNumber' }, { constraintName: 'Min', attributes: { value: -32768 } }, { constraintName: 'Max', attributes: { value: 32767 } }] },
    { typeName: 'int', constraints: [{ constraintName: 'IntegerNumber' }, { constraintName: 'Min', attributes: { value: -2147483648 } }, { constraintName: 'Max', attributes: { value: 2147483647 } }, { constraintName: 'NotBlank' }] },
    { typeName: 'Integer', constraints: [{ constraintName: 'IntegerNumber' }, { constraintName: 'Min', attributes: { value: -2147483648 } }, { constraintName: 'Max', attributes: { value: 2147483647 } }] },
    { typeName: 'long', constraints: [{ constraintName: 'IntegerNumber' }, { constraintName: 'Min', attributes: { value: -9223372036854775808 } }, { constraintName: 'Max', attributes: { value: 9223372036854775807 } }, { constraintName: 'NotBlank' }] },
    { typeName: 'Long', constraints: [{ constraintName: 'IntegerNumber' }, { constraintName: 'Min', attributes: { value: -9223372036854775808 } }, { constraintName: 'Max', attributes: { value: 9223372036854775807 } }] },
    { typeName: 'float', constraints: [{ constraintName: 'FloatNumber' }, { constraintName: 'NotBlank' }] },
    { typeName: 'Float', constraints: [{ constraintName: 'FloatNumber' }] },
    { typeName: 'double', constraints: [{ constraintName: 'FloatNumber' }, { constraintName: 'NotBlank' }] },
    { typeName: 'Double', constraints: [{ constraintName: 'FloatNumber' }] },
    { typeName: 'BigDecimal', constraints: [{ constraintName: 'FloatNumber' }] },
    { typeName: 'BigInteger', constraints: [{ constraintName: 'IntegerNumber' }] },
    { typeName: 'Date', constraints: [{ constraintName: 'Date' }] },
    { typeName: 'SqlDate', constraints: [{ constraintName: 'Date' }] },
    { typeName: 'SqlTime', constraints: [{ constraintName: 'Time' }] },
    { typeName: 'SqlTimestamp', constraints: [{ constraintName: 'Timestamp' }] }
];

for (let i = 0, length = basicTypeDescriptors.length; i < length; i++) {
    const basicType = basicTypeDescriptors[i];
    TYPE_DESCRIPTORS[basicType.typeName as string] = basicType;
    basicType.isBasicType = true;
}

/* ********************************************************************************************
 * List types
 */

function listTypeDescriptorFactoryFactory(listType: string): TypeValidationsDescriptorFactory {
    return function listTypeDescriptorFactory(type: TypeName): TypeValidationsDescriptor {
        if (!Array.isArray(type)) {
            if (type.length == 2) {
                return { typeName: [listType, type[1]], valueDescriptor: { porpertyTypeName: type[1] }, isCollection: true, constraints: [{ constraintName: 'List' }] };
            } else if (type.length > 2) {
                return { typeName: [listType, type[1]], valueDescriptor: { porpertyTypeName: type[1] }, isCollection: true, constraints: [{ constraintName: 'List' }, { constraintName: 'InvalidNumberGenenricArguments', attributes: { typeName: listType, expected: 1, found: type.length - 1 } }] };
            } else {
                return { typeName: [listType], isCollection: true, constraints: [{ constraintName: 'List' }, { constraintName: 'InvalidNumberGenenricArguments', attributes: { typeName: listType, expected: 1, found: type.length - 1 } }] };
            }
        } else {
            return { typeName: [listType], isCollection: true, constraints: [{ constraintName: 'List' }, { constraintName: 'InvalidNumberGenenricArguments', attributes: { typeName: listType, expected: 1, found: 0 } }] };
        }
    };
}

TYPE_DESCRIPTORS['Array'] = listTypeDescriptorFactoryFactory('Array');
TYPE_DESCRIPTORS['List'] = listTypeDescriptorFactoryFactory('List');
TYPE_DESCRIPTORS['ArrayList'] = listTypeDescriptorFactoryFactory('ArrayList');
TYPE_DESCRIPTORS['Set'] = listTypeDescriptorFactoryFactory('Set');

/* ********************************************************************************************
 * Map types
 */

function mapTypeDecriptorFactoryFactory(mapType: string): TypeValidationsDescriptorFactory {
    return function mapTypeDescriptorFactory(type: TypeName): TypeValidationsDescriptor {
        if (Array.isArray(type)) {
            if (type.length == 3) {
                return { typeName: [mapType, type[1], type[2]], valueDescriptor: { porpertyTypeName: type[2] }, isCollection: true, constraints: [{ constraintName: 'Map' }] };
            } else if (type.length > 3) {
                return { typeName: [mapType, type[1], type[2]], valueDescriptor: { porpertyTypeName: type[2] }, isCollection: true, constraints: [{ constraintName: 'Map' }, { constraintName: 'InvalidNumberGenenricArguments', attributes: { typeName: mapType, expected: 1, found: type.length - 1 } }] };
            } else if (type.length == 2) {
                return { typeName: [mapType, type[1]], isCollection: true, constraints: [{ constraintName: 'Map' }, { constraintName: 'InvalidNumberGenenricArguments', attributes: { typeName: mapType, expected: 1, found: type.length - 1 } }] };
            } else {
                return { typeName: [mapType], isCollection: true, constraints: [{ constraintName: 'Map' }, { constraintName: 'InvalidNumberGenenricArguments', attributes: { typeName: mapType, expected: 1, found: type.length - 1 } }] };
            }
        } else {
            return { typeName: [mapType], isCollection: true, constraints: [{ constraintName: 'Map' }, { constraintName: 'InvalidNumberGenenricArguments', attributes: { typeName: mapType, expected: 1, found: 0 } }] };
        }
    };
}

TYPE_DESCRIPTORS['HashSet'] = mapTypeDecriptorFactoryFactory('HashSet');
TYPE_DESCRIPTORS['Map'] = mapTypeDecriptorFactoryFactory('Map');
TYPE_DESCRIPTORS['HashMap'] = mapTypeDecriptorFactoryFactory('HashMap');



/* ********************************************************************************************
 * Container type
 */

TYPE_DESCRIPTORS['Container'] = function (type: TypeName): TypeValidationsDescriptor {
    if (!Array.isArray(type)) {
        if (type.length == 2) {
            return { typeName: ['Container', type[1]], };
        } else if (type.length > 2) {
            return { typeName: ['Container', type[1]], properties: { value: { porpertyTypeName: 'Object' } }, constraints: [{ constraintName: 'InvalidNumberGenenricArguments', attributes: { typeName: 'Container', expected: 1, found: type.length - 1 } }] };
        } else {
            return { typeName: ['Container'], properties: { value: { porpertyTypeName: 'Object' } }, constraints: [{ constraintName: 'InvalidNumberGenenricArguments', attributes: { typeName: 'Container', expected: 1, found: type.length - 1 } }] };
        }
    } else {
        return { typeName: ['Container'], properties: { value: { porpertyTypeName: 'Object' } } };
    }
}

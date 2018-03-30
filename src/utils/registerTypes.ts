import { TypeValidationsDescriptor, TYPE_DESCRIPTORS } from '../core/core'

/**
 * Register a list of type definitions
 * 
 * @paran types: list of type definitions to be registered
 * 
 * @see {@link TYPE_DESCRIPTORS} for mor information about the type descriptor map
 */ 
export function registerTypes(types: TypeValidationsDescriptor[]) {
    for (let i = 0, length = types.length; i < length; i++) {
        const type = types[i];
        TYPE_DESCRIPTORS[type.typeName.toString()] = type;
    }
}
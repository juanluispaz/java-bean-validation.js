# Java Bean Validation implementation for JavaScript

Full implementation of Java Bean Validation 1.1 and Hibernate Validator 5.4.1 completely written in TypeScript allow to run the validation in JavaScript without any communication with a Java server.

# Type definitions

Before using the validations in JavaScript, you need to get the type definitions from your Java types. For this propose you need to invoke `describe` method from the Java `JavaBeanValidationDescriber` class (included in the `java` folder); this method returns a string with the metadata required in JavaScript in JSON format.

```java
JavaBeanValidationDescriber.describe(MyClass.class)
```

**For example**: For the class

```java
public class Person {
    @NotEmpty
    private String name;
    @Min(0) @Max(99)
    private int age;

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public int getAge() {
        return age;
    }

    public void setAge(int age) {
        this.age = age;
    }
}
```

The following type definition is returned:

```json
[
  {
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
  }
]
```

**Note**: the `describe` method can receive a list of classes instead of one specific class.

# Usage

Once you have the definitions of your types, you can use them to validate your objects in JavaScript without having any communication with the server.

In order to use the validation, you need to register your type definitions and to set the message formatter appropriated for your language (supported languages: `en`, `en-US`, `en-GB`, `es` and `es-ES`).

**Example**: Initialization required before using the validations

```typescript
import * as jbv from 'java-bean-validation.js';
import { formatMessage } from 'java-bean-validation.js/dist/messageFormatter/en';

jbv.setMessageFormatter(formatMessage);

const typeDescriptors = /* type descriptor got in the previous section */;
jbv.registerTypes(typeDescriptors); 
```

You can validate one object with the function `validateObject`. This function returns a list of violations, where the  `message` property contains the error message and the  `propertyPath` property contains the path of the invalid value. 

**Example**: Validation of an object of `Person` type

```typescript
const person = {
    name: 'John Smith',
    age: 999
};
const violations = jbv.validateObject('Person', person);
expect(violations[0].propertyPath).toEqual('.age');
expect(violations[0].message).toEqual('This must be less than or equal to 99');
```

You can validate if a value follows the restrictions of an object property with the `validateValueOfProperty` function. 

**Example**: Validation of a value according to the rules of the `age` property of the `Person` type  

```typescript
const violations = jbv.validateValueOfProperty('Person', 'age', 999);
expect(violations[0].propertyPath).toEqual('.age');
expect(violations[0].message).toEqual('This must be less than or equal to 99');
```

# Documentation

The source code is completely documented. The most important files are:

- `src/core/core.ts`
- `src/utils/registerTypes.ts`
- `src/utils/validateUtils.ts`

And the `src/messageFormatter/` folder that contains the different language support.

# Extras

Having the type definitions in JavaScript allows to perform different actions additionally to validate a type:

- The `src/utils/getHtmlValidationRules.ts` file exports a function that allows to get the HTML5 Validation rules of a property from the type definitions.
- The `src/utils/getHtmlInputType.ts` file exports a function that allows to get the HTML5 input type of a property from the type definitions.
- The `src/utils/fillObjectProperties.ts` file exports a function that allows to ensure that all properties defined in the type definition are present in the value object, even if the property's value is undefined.
- The `src/utils/setObjectType.ts` file export a function that allows to set a property with the type name of an object according to the type definition.
- You can write you own function that take advantage of the type definitions. To do it, you can use the functions exposed in the `src/core/visit.ts` file.

# License

MIT

<!--
Edited with: https://stackedit.io/app
-->

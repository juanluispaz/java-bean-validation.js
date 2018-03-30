
import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import java.lang.annotation.Annotation;
import java.lang.reflect.Array;
import java.lang.reflect.Field;
import java.lang.reflect.GenericArrayType;
import java.lang.reflect.Method;
import java.lang.reflect.ParameterizedType;
import java.lang.reflect.Type;
import java.lang.reflect.TypeVariable;
import java.util.ArrayList;
import java.util.Collection;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;
import javax.validation.Validation;
import javax.validation.Validator;
import javax.validation.ValidatorFactory;
import javax.validation.groups.Default;
import javax.validation.metadata.BeanDescriptor;
import javax.validation.metadata.ConstraintDescriptor;
import javax.validation.metadata.GroupConversionDescriptor;
import javax.validation.metadata.PropertyDescriptor;

public class JavaBeanValidationDescriber {

    /* *************************************************************************
     * Publics *****************************************************************
     * ************************************************************************/
    
    public static String describe(Class<?> clazz) {
        ArrayList<Class<?>> clazzs = new ArrayList<Class<?>>(1);
        clazzs.add(clazz);
        return describe(clazzs);
    }
    
    public static String describe(Collection<Class<?>> clazzs) {
        ValidatorFactory validatorFactory = Validation.buildDefaultValidatorFactory();
        Validator validator = validatorFactory.getValidator();
        ArrayList<TypeValidationsDescriptor> descriptors = describeClass(validator, clazzs);
        GsonBuilder builder = new GsonBuilder();
        Gson gson = builder.create();
        String jsonResult = gson.toJson(descriptors);
        return jsonResult;
    }

 /* *************************************************************************
     * Privates ****************************************************************
     * ************************************************************************/
    private JavaBeanValidationDescriber() {
    }

    // <editor-fold defaultstate="collapsed" desc="Types">
    /* *************************************************************************
     * Types
     */
    private static class TypeValidationsDescriptor {

        Object typeName; // String or ArrayList<String>
        ArrayList<ConstraintValidationsDescriptor> constraints;
        HashMap<String, PropertyValidationsDescriptor> properties;
        Boolean isBasicType;
        // Boolean isCollection; // Only used in JavaScript
        // PropertyValidationsDescriptor valueDescriptor; // Only used in JavaScript
    }

    private static class PropertyValidationsDescriptor {

        Object porpertyTypeName; // String or ArrayList<String>
        ArrayList<ConstraintValidationsDescriptor> constraints;
        Boolean cascade;
        HashMap<String, String> groupConversions;
    }

    private static class ConstraintValidationsDescriptor {

        Object constraintName; // String
        HashMap<String, Object> attributes;
        ArrayList<ConstraintValidationsDescriptor> composingConstraints;
        Boolean reportAsSingle;
        Boolean hasNoValidator;
        // Boolean defaultValuesLoaded; // Only used in JavaScript
    }
    // </editor-fold>

    // <editor-fold defaultstate="collapsed" desc="getClassType">
    /* *************************************************************************
     * getClassType
     */
    private static Object getClassType(Class<?> clazz) {
        if (clazz.getComponentType() != null) {
            ArrayList<Object> result = new ArrayList<Object>(2);
            result.add("Array");
            result.add(getClassType(clazz.getComponentType()));
            return result;
        }
        if (clazz.getCanonicalName().startsWith("java.sql.")) {
            return "Sql" + clazz.getSimpleName();
        } else {
            return clazz.getSimpleName();
        }
    }

    private static Object getClassType(Field field, HashSet<Class<?>> futureDescribe) {
        try {
            Type type = field.getGenericType();
            return getClassType(type, futureDescribe);
        } catch (SecurityException e) {
            throw new RuntimeException(e);
        }
    }

    private static Object getClassType(Type type, HashSet<Class<?>> futureDescribe) {
        if (type instanceof ParameterizedType) {

            ParameterizedType parameterizedType = (ParameterizedType) type;
            Class clazz = (Class) parameterizedType.getRawType();
            futureDescribe.add(clazz);
            Type[] generics = parameterizedType.getActualTypeArguments();

            ArrayList<Object> result = new ArrayList<Object>(generics.length + 1);
            result.add(getClassType(clazz));
            for (Type generic : generics) {
                if (generic instanceof TypeVariable) {
                    // ignore it
                } else {
                    result.add(getClassType(generic, futureDescribe));
                }
            }
            return result;
        } else if (type instanceof GenericArrayType) {
            GenericArrayType arrayType = (GenericArrayType) type;
            ArrayList<Object> result = new ArrayList<Object>(2);
            result.add("Array");
            result.add(getClassType(arrayType.getGenericComponentType(), futureDescribe));
            return result;
        } else {
            Class clazz = (Class) type;
            if (clazz.isArray()) {
                futureDescribe.add(clazz.getComponentType());
            } else {
                futureDescribe.add(clazz);
            }
            return getClassType(clazz);
        }
    }
    // </editor-fold>

    // <editor-fold defaultstate="collapsed" desc="describeClass">
    /* *************************************************************************
     * describeClass
     */
    private static ArrayList<TypeValidationsDescriptor> describeClass(Validator validator, Collection<Class<?>> clazzs) {
        ArrayList<TypeValidationsDescriptor> result = new ArrayList<TypeValidationsDescriptor>();
        HashSet<String> ready = new HashSet<String>();
        ready.add("boolean");
        ready.add("byte");
        ready.add("char");
        ready.add("double");
        ready.add("float");
        ready.add("int");
        ready.add("long");
        ready.add("short");
        HashSet<Class<?>> future = new HashSet<Class<?>>();
        HashSet<Class<?>> futureOld = new HashSet<Class<?>>();
        for (Class<?> clazz : clazzs) {
            TypeValidationsDescriptor descriptor = describeClass(validator, clazz, future);
            result.add(descriptor);
            ready.add(clazz.getName());
        }
        while (!future.isEmpty()) {
            HashSet<Class<?>> processingFuture = future;
            future = futureOld;
            future.clear();
            futureOld = processingFuture;

            for (Class<?> c : processingFuture) {
                String name = c.getCanonicalName();
                if (name.startsWith("java")) {
                    continue;
                }
                if (ready.contains(c.getName())) {
                    continue;
                }
                if (c.isEnum()) {
                    continue;
                }
                TypeValidationsDescriptor descriptor = describeClass(validator, c, future);
                result.add(descriptor);
                ready.add(c.getName());
            }
        }
        return result;
    }

    private static TypeValidationsDescriptor describeClass(Validator validator, Class<?> clazz, HashSet<Class<?>> futureDescribe) {
        TypeValidationsDescriptor result = new TypeValidationsDescriptor();
        result.typeName = getClassType(clazz);

        if (clazz.isEnum()) {
            result.isBasicType = true;
            Enum[] values = (Enum[]) clazz.getEnumConstants();
            ArrayList<String> names = new ArrayList<String>(values.length);
            for (Enum e : values) {
                names.add(e.name());
            }
            ConstraintValidationsDescriptor constraint = new ConstraintValidationsDescriptor();
            constraint.constraintName = "Enum";
            HashMap<String, Object> attributes = new HashMap<String, Object>(1);
            attributes.put("values", names);
            constraint.attributes = attributes;
            if (result.constraints == null) {
                result.constraints = new ArrayList<ConstraintValidationsDescriptor>(1);
            }
            result.constraints.add(constraint);
            return result;
        }

        BeanDescriptor descriptor = validator.getConstraintsForClass(clazz);

        Set<ConstraintDescriptor<?>> constraints = descriptor.getConstraintDescriptors();
        if (!constraints.isEmpty()) {
            result.constraints = new ArrayList<ConstraintValidationsDescriptor>(constraints.size());
        }
        for (ConstraintDescriptor<?> constraintDescriptor : constraints) {
            ConstraintValidationsDescriptor constraint = processConstraint(constraintDescriptor);
            result.constraints.add(constraint);
        }

        Set<PropertyDescriptor> constrainedProperties = descriptor.getConstrainedProperties();

        Class c = clazz;
        HashMap<String, Field> fields = new HashMap<String, Field>();
        while (c != null && c != Object.class) {
            for (Field field : c.getDeclaredFields()) {
                fields.put(field.getName(), field);
            }
            c = c.getSuperclass();
        }
        if (fields.size() > 0) {
            result.properties = new HashMap<String, PropertyValidationsDescriptor>(fields.size());
        }
        for (PropertyDescriptor propertyDescriptor : constrainedProperties) {
            String name = propertyDescriptor.getPropertyName();
            Field field = fields.get(name);
            PropertyValidationsDescriptor constrained = processProperty(field, propertyDescriptor, futureDescribe);
            result.properties.put(name, constrained);
            fields.remove(name);
        }
        for (Field field : fields.values()) {
            PropertyValidationsDescriptor propertyDescriptor = new PropertyValidationsDescriptor();
            propertyDescriptor.porpertyTypeName = getClassType(field, futureDescribe);
            result.properties.put(field.getName(), propertyDescriptor);
        }

        return result;
    }
    // </editor-fold>

    // <editor-fold defaultstate="collapsed" desc="processConstraint">
    /* *************************************************************************
     * processConstraint
     */
    private static ConstraintValidationsDescriptor processConstraint(ConstraintDescriptor<?> descriptor) {
        ConstraintValidationsDescriptor result = new ConstraintValidationsDescriptor();
        Class<? extends Annotation> annotation = descriptor.getAnnotation().annotationType();
        result.constraintName = getClassType(annotation);
        if (descriptor.isReportAsSingleViolation()) {
            result.reportAsSingle = true;
        }
        HashMap<String, Object> attributes = new HashMap<String, Object>(descriptor.getAttributes().size());
        external:
        for (Map.Entry<String, Object> entry : descriptor.getAttributes().entrySet()) {
            Object value = entry.getValue();
            String name = entry.getKey();
            Object defaultValue;
            try {
                Method method = annotation.getMethod(name);
                defaultValue = method.getDefaultValue();
            } catch (NoSuchMethodException ex) {
                defaultValue = null;
            } catch (SecurityException ex) {
                defaultValue = null;
            }
            if (value.equals(defaultValue)) {
                continue;
            }
            if (value.getClass().isArray()) {
                int size = Array.getLength(value);
                if (size <= 0) {
                    continue;
                }
                if (value instanceof Class[]) {
                    Class[] classes = (Class[]) value;
                    Object[] r = new String[classes.length];
                    for (int i = 0; i < classes.length; i++) {
                        if (size == 1) {
                            if (classes[i] == Default.class) {
                                continue external;
                            }
                        }
                        r[i] = getClassType(classes[i]);
                    }
                    value = r;
                }
            }
            if (value instanceof Class) {
                value = getClassType((Class) value);
            }
            attributes.put(entry.getKey(), value);
        }
        if (!attributes.isEmpty()) {
            result.attributes = attributes;
        }

        Set<ConstraintDescriptor<?>> composingConstraints = descriptor.getComposingConstraints();
        if (!composingConstraints.isEmpty()) {
            result.composingConstraints = new ArrayList<ConstraintValidationsDescriptor>(composingConstraints.size());
        }
        for (ConstraintDescriptor<?> constraintDescriptor : composingConstraints) {
            ConstraintValidationsDescriptor constraint = processConstraint(constraintDescriptor);
            result.composingConstraints.add(constraint);
        }

        if (descriptor.getConstraintValidatorClasses().isEmpty()) {
            result.hasNoValidator = true;
        }

        return result;
    }
    // </editor-fold>

    // <editor-fold defaultstate="collapsed" desc="processProperty">
    /* *************************************************************************
     * processProperty
     */
    private static PropertyValidationsDescriptor processProperty(Field field, PropertyDescriptor descriptor, HashSet<Class<?>> futureDescribe) {
        PropertyValidationsDescriptor result = new PropertyValidationsDescriptor();
        result.porpertyTypeName = getClassType(field, futureDescribe);
        if (descriptor.isCascaded()) {
            result.cascade = true;
        }

        Set<ConstraintDescriptor<?>> constraints = descriptor.getConstraintDescriptors();
        if (!constraints.isEmpty()) {
            result.constraints = new ArrayList<ConstraintValidationsDescriptor>(constraints.size());
        }
        for (ConstraintDescriptor<?> constraintDescriptor : constraints) {
            ConstraintValidationsDescriptor constraint = processConstraint(constraintDescriptor);
            result.constraints.add(constraint);
        }

        Set<GroupConversionDescriptor> groupConversions = descriptor.getGroupConversions();
        if (!groupConversions.isEmpty()) {
            result.groupConversions = new HashMap<String, String>(groupConversions.size());
        }
        for (GroupConversionDescriptor groupConversionDescriptor : groupConversions) {
            String from = getGroupName(groupConversionDescriptor.getFrom());
            String to = getGroupName(groupConversionDescriptor.getTo());
            result.groupConversions.put(from, to);
        }
        return result;
    }

    private static String getGroupName(Class<?> clazz) {
        return clazz.getSimpleName();
    }
    // </editor-fold>
}

/*
 * Strictier version of email validation, similar to Hibernate one
 * 
 * It implementation require pass the function toASCII from punycode package
 */

// Based in hibernate implementation in: org.hibernate.validator.internal.constraintvalidators.hv.EmailValidator
// Based in: org.hibernate:hibernate-validator:5.4.0.Final

import { VALIDATORS } from "../core/core";

export function registerStricterEmailValidator(punycodeToASCII: (utf8String: string) => string) {
    VALIDATORS['Email'] = function EmailValidator(value: any): boolean {
        // org.hibernate.validator.constraints.Email
        if (value === null || value === undefined) {
            return true;
        }
        if (typeof value === 'number') {
            value = value + '';
        }
        if (value instanceof Date) {
            value = value + '';
        }
        if (typeof value !== 'string') {
            return true; // wrong data type
        }
        return isValid(value);
    };

    const CASE_INSENSITIVE = "i";

    const LOCAL_PART_ATOM = "[a-z0-9!#$%&'*+/=?^_`{|}~\u0080-\uFFFF-]";
    const LOCAL_PART_INSIDE_QUOTES_ATOM = "([a-z0-9!#$%&'*.(),<>\\[\\]:;  @+/=?^_`{|}~\u0080-\uFFFF-]|\\\\\\\\|\\\\\\\")";
    const DOMAIN_LABEL = "[a-z0-9!#$%&'*+/=?^_`{|}~-]";
    const DOMAIN = DOMAIN_LABEL + "+(\\." + DOMAIN_LABEL + "+)*";
    const IP_DOMAIN = "\\[[0-9]{1,3}\\.[0-9]{1,3}\\.[0-9]{1,3}\\.[0-9]{1,3}\\]";
    //IP v6 regex taken from http://stackoverflow.com/questions/53497/regular-expression-that-matches-valid-ipv6-addresses
    const IP_V6_DOMAIN = "(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))";
    const MAX_LOCAL_PART_LENGTH = 64;
    /**
     * This is the maximum length of a domain name. But be aware that each label (parts separated by a dot) of the
     * domain name must be at most 63 characters long. This is verified by {@link IDN#toASCII(String)}.
     */
    const MAX_DOMAIN_PART_LENGTH = 255;


    /**
     * Regular expression for the local part of an email address (everything before '@')
     */
    const LOCAL_PART_PATTERN = new RegExp(
        "^" + // Added in order to obtain the same behaivor that java matcher.matches()
        "(" + LOCAL_PART_ATOM + "+|\"" + LOCAL_PART_INSIDE_QUOTES_ATOM + "+\")" +
        "(\\." + "(" + LOCAL_PART_ATOM + "+|\"" + LOCAL_PART_INSIDE_QUOTES_ATOM + "+\")" + ")*"
        + "$" // Added in order to obtain the same behaivor that java matcher.matches()
        , CASE_INSENSITIVE
    );

    /**
     * Regular expression for the domain part of an email address (everything after '@')
     */
    const DOMAIN_PATTERN = new RegExp(
        "^" + // Added in order to obtain the same behaivor that java matcher.matches()
        DOMAIN + "|" + IP_DOMAIN + "|" + "\\[IPv6:" + IP_V6_DOMAIN + "\\]"
        + "$" // Added in order to obtain the same behaivor that java matcher.matches()
        , CASE_INSENSITIVE
    );

    function isValid(value?: string): boolean {
        if (value === null || value === undefined || value.length === 0) {
            return true;
        }

        // cannot split email string at @ as it can be a part of quoted local part of email.
        // so we need to split at a position of last @ present in the string:
        const stringValue: string = value;
        const splitPosition: number = stringValue.lastIndexOf("@");

        // need to check if
        if (splitPosition < 0) {
            return false;
        }

        const localPart: string = stringValue.substring(0, splitPosition);
        const domainPart: string = stringValue.substring(splitPosition + 1);

        if (!matchLocalPart(localPart)) {
            return false;
        }

        return matchDomain(domainPart);
    }

    function matchLocalPart(localPart: string): boolean {
        if (localPart.length > MAX_LOCAL_PART_LENGTH) {
            return false;
        }
        return LOCAL_PART_PATTERN.test(localPart);
    }

    function matchDomain(domain: string): boolean {
        // if we have a trailing dot the domain part we have an invalid email address.
        // the regular expression match would take care of this, but IDN.toASCII drops the trailing '.'
        if (domain.lastIndexOf(".") === domain.length) { // endsWith
            return false;
        }

        let asciiString: string;
        try {
            asciiString = punycodeToASCII(domain);
        }
        catch (e) {
            return false;
        }

        if (asciiString.length > MAX_DOMAIN_PART_LENGTH) {
            return false;
        }

        return DOMAIN_PATTERN.test(asciiString);
    }

}
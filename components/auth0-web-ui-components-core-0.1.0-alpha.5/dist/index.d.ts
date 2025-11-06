import { MyAccountClient, Auth0MyAccount } from '@auth0/myaccount';
import { MyOrgClient, Auth0MyOrg } from 'auth0-myorg-sdk';
import { z } from 'zod';
import * as _auth0_myaccount_dist_cjs_api from '@auth0/myaccount/dist/cjs/api';

/**
 * Represents a component placeholder that will be replaced by the consuming framework.
 * In React apps, this would be ReactElement. In other frameworks, it could be different.
 */
type TransComponent = unknown;
/**
 * Function type for creating components from translation content.
 * Takes the translated text content and returns a component representation.
 * The actual implementation depends on the consuming framework.
 *
 * @param children - The translated text content to wrap in the component
 * @returns A component representation (framework-specific)
 *
 * @example
 * ```typescript
 * // In React implementation:
 * const linkComponent: TransComponentFunction = (children) =>
 *   React.createElement('a', { href: '/help' }, children);
 *
 * // In Vue implementation:
 * const linkComponent: TransComponentFunction = (children) =>
 *   h('a', { href: '/help' }, children);
 * ```
 */
type TransComponentFunction = (children: string) => TransComponent;
/**
 * Mapping of component keys to component representations or component functions.
 * Used in translation strings with component placeholders like <link>text</link>.
 * Framework-agnostic - the actual component type depends on the implementation.
 *
 * @example
 * ```typescript
 * const components: TranslationElements = {
 *   link: (children) => createLinkComponent(children),
 *   strong: (children) => createStrongComponent(children),
 *   button: createButtonComponent()
 * };
 * ```
 */
type TranslationElements = Record<string, TransComponent | TransComponentFunction>;
/**
 * Basic translation function that returns a translated string.
 *
 * @param key - The translation key (without namespace prefix)
 * @param vars - Optional variables for string interpolation
 * @param fallback - Optional fallback text if translation is not found
 * @returns The translated string with variables substituted
 */
type TranslationFunction = (key: string, vars?: Record<string, unknown>, fallback?: string) => string;
/**
 * Enhanced translation function with Trans component support.
 * Extends the basic translation function with a `trans` method for safe component rendering.
 * Framework-agnostic - works with any UI framework.
 */
type EnhancedTranslationFunction = TranslationFunction & {
    /**
     * Renders a translation with framework components for safe HTML-like content.
     * Returns an array of strings and framework-specific components.
     *
     * @param key - The translation key
     * @param options - Configuration options for component rendering
     * @param options.components - Mapping of component keys to framework elements
     * @param options.vars - Variables for string interpolation
     * @param options.fallback - Fallback text if translation is not found
     * @returns Array of strings and framework components for safe rendering
     *
     * @example
     * ```typescript
     * // Framework-agnostic usage
     * const elements = t.trans('help.message', {
     *   components: {
     *     link: (children) => createLinkComponent(children)
     *   },
     *   vars: { name: 'John' }
     * });
     *
     * // Result: ['Hello ', LinkComponent, ', click here for help.']
     * ```
     */
    trans: (key: string, options?: {
        components?: TranslationElements;
        vars?: Record<string, unknown>;
        fallback?: string;
    }) => (string | TransComponent)[];
};
/**
 * Factory function type for creating translation functions.
 *
 * @param namespace - The namespace for translations
 * @param overrides - Optional override translations
 * @returns A translation function scoped to the namespace
 */
type TFactory = (namespace: string, overrides?: Record<string, unknown>) => EnhancedTranslationFunction;
/**
 * Language-specific translation data structure.
 * Nested object containing all translations for a specific language.
 */
type LangTranslations = Record<string, unknown>;
/**
 * Configuration options for initializing the i18n service.
 */
interface I18nInitOptions {
    /** The current/preferred language code (e.g., 'en-US', 'es-ES') */
    currentLanguage?: string;
    /** The fallback language code if current language fails to load */
    fallbackLanguage?: string;
}
/**
 * Main interface for the i18n service providing translation management capabilities.
 * Framework-agnostic core functionality.
 */
interface I18nServiceInterface {
    /** Current active language code */
    currentLanguage: string;
    /** Fallback language code */
    fallbackLanguage: string | undefined;
    /** Factory for creating namespace-scoped translation functions */
    translator: TFactory;
    /** Pre-configured translator for common translations */
    commonTranslator: EnhancedTranslationFunction;
    /**
     * Gets the currently loaded translation data.
     * @returns The translation data or null if not loaded
     */
    getCurrentTranslations(): LangTranslations | null;
    /**
     * Changes the active language and reloads translations.
     * @param language - The new language code to switch to
     * @param newFallbackLanguage - Optional new fallback language
     */
    changeLanguage(language: string, newFallbackLanguage?: string): Promise<void>;
}

/**
 * Pure utility functions for internationalization (i18n) functionality.
 * These functions handle translation loading, variable substitution, and namespace-based translation.
 */
declare const I18nUtils: {
    /**
     * Regular expression for matching variable placeholders in translation strings.
     * Matches patterns like ${variableName} for dynamic content substitution.
     */
    VAR_REGEX: RegExp;
    /**
     * Regular expression for matching component placeholders in translation strings.
     * Matches patterns like <0>text</0> or <link>text</link> for safe HTML rendering.
     */
    COMPONENT_REGEX: RegExp;
    /**
     * Retrieves a nested value from an object using dot notation path traversal.
     *
     * @param obj - The object to traverse
     * @param path - Dot-separated path to the desired value (e.g., 'common.errors.required')
     * @returns The value at the specified path, or undefined if not found
     *
     * @example
     * ```typescript
     * const obj = { common: { errors: { required: 'Field is required' } } };
     * getNestedValue(obj, 'common.errors.required') // Returns: 'Field is required'
     * ```
     */
    getNestedValue(obj: Record<string, unknown>, path: string): unknown;
    /**
     * Performs variable substitution in a template string using provided variables.
     *
     * @param template - The template string containing ${variable} placeholders
     * @param vars - Object containing variable values for substitution
     * @returns The template string with variables substituted
     *
     * @example
     * ```typescript
     * substitute('Hello ${name}!', { name: 'World' }) // Returns: 'Hello World!'
     * substitute('No variables here', { name: 'World' }) // Returns: 'No variables here'
     * ```
     */
    substitute(template: string, vars?: Record<string, unknown>): string;
    /**
     * Parses a translation string with component placeholders and returns structured data
     * for safe rendering without dangerouslySetInnerHTML.
     *
     * @param template - The translation string with component placeholders like <0>text</0>
     * @param components - Object mapping component keys to React elements or render functions
     * @returns Array of strings and React elements for safe rendering
     *
     * @example
     * ```typescript
     * const result = parseComponents(
     *   'Click <link>here</link> to learn more',
     *   { link: (children) => <a href="/help">{children}</a> }
     * );
     * // Returns: ['Click ', <a href="/help">here</a>, ' to learn more']
     * ```
     */
    parseComponents(template: string, components?: TranslationElements): (string | TransComponent)[];
    /**
     * Creates an enhanced translation function that supports both simple translations
     * and component-based translations for safe HTML rendering.
     *
     * @param namespace - The namespace prefix for translations
     * @param translations - The loaded translation data
     * @param overrides - Optional override translations that take precedence
     * @returns An enhanced translation function with Trans component support
     */
    createEnhancedTranslator(namespace: string, translations: LangTranslations | null, overrides?: Record<string, unknown>): TranslationFunction & {
        trans: (key: string, options?: {
            components?: TranslationElements;
            vars?: Record<string, unknown>;
            fallback?: string;
        }) => (string | TransComponent)[];
    };
    /**
     * Creates a translation function for a specific namespace with optional overrides.
     *
     * @param namespace - The namespace prefix for translations (e.g., 'mfa', 'common')
     * @param translations - The loaded translation data
     * @param overrides - Optional override translations that take precedence
     * @returns A translation function scoped to the specified namespace
     */
    createTranslator(namespace: string, translations: LangTranslations | null, overrides?: Record<string, unknown>): TranslationFunction;
    /**
     * Loads translation data for a specific language from the translations directory.
     *
     * @param language - The language code to load (e.g., 'en-US', 'es-ES')
     * @param cache - Optional cache map to store loaded translations
     * @returns Promise resolving to translation data or null if not found
     */
    loadTranslations(language: string, cache?: Map<string, LangTranslations | null>): Promise<LangTranslations | null>;
    /**
     * Loads translations with automatic fallback support for missing languages.
     *
     * @param currentLanguage - The primary language to load
     * @param fallbackLanguage - Optional fallback language if primary fails
     * @param cache - Optional cache map to store loaded translations
     * @returns Promise resolving to translation data with fallback support
     */
    loadTranslationsWithFallback(currentLanguage: string, fallbackLanguage?: string, cache?: Map<string, LangTranslations | null>): Promise<LangTranslations | null>;
};
/**
 * Creates an internationalization (i18n) service with translation loading and management capabilities.
 *
 * This factory function initializes the i18n service with language support, translation loading,
 * and runtime language switching. It supports namespace-based translations, variable substitution,
 * and safe HTML rendering through Trans component pattern.
 *
 * @param options - Optional configuration for i18n initialization
 * @param options.currentLanguage - The current language code (defaults to 'en-US')
 * @param options.fallbackLanguage - The fallback language code (defaults to 'en-US')
 * @returns Promise resolving to a fully configured i18n service interface
 *
 * @example
 * ```typescript
 * // Basic initialization
 * const i18nService = await createI18nService();
 *
 * // With custom language
 * const i18nService = await createI18nService({
 *   currentLanguage: 'es-ES',
 *   fallbackLanguage: 'en-US'
 * });
 *
 * // Use translations with safe HTML rendering
 * const t = i18nService.translator('mfa');
 * const message = t('enrollment.success'); // Plain text
 * const elements = t.trans('help.link', {
 *   components: {
 *     link: (children) => <a href="/help">{children}</a>
 *   }
 * }); // Safe HTML components
 * ```
 */
declare function createI18nService(options?: I18nInitOptions): Promise<I18nServiceInterface>;

/**
 * Interface for MFA messages that can be used in the UI.
 */
interface MFAMessages {
    title?: string;
    description?: string;
    no_active_mfa?: string;
    enroll?: string;
    delete?: string;
    enrolled?: string;
    enroll_factor?: string;
    remove_factor?: string;
    delete_mfa_title?: string;
    delete_mfa_content?: string;
    cancel?: string;
    deleting?: string;
    enrollment?: string;
    confirmation?: string;
    sms?: MFAFactorContent;
    'push-notification'?: MFAFactorContent;
    otp?: MFAFactorContent;
    email?: MFAFactorContent;
    duo?: MFAFactorContent;
    'webauthn-roaming'?: MFAFactorContent;
    'webauthn-platform'?: MFAFactorContent;
    'recovery-code'?: MFAFactorContent;
    errors?: {
        factors_loading_error?: string;
        delete_factor?: string;
        failed?: string;
    };
}
interface MFAFactorContent {
    title: string;
    description: string;
}

/**
 * Custom message types for Provisioning Token Modal Content components
 */
interface ProvisioningCreateTokenModalContentMessages {
    description?: string;
    field?: {
        label?: string;
    };
}
interface ProvisioningCreateTokenModalMessages {
    title?: string;
    content?: ProvisioningCreateTokenModalContentMessages;
}
interface ProvisioningDeleteTokenModalContentMessages {
    confirmation?: string;
    description?: string;
}
interface ProvisioningDeleteTokenModalMessages {
    title?: string;
    content?: ProvisioningDeleteTokenModalContentMessages;
}

/**
 * Custom message types for Provisioning Manage Token component
 */
interface ProvisioningManageTokenMessages {
    title?: string;
    description?: string;
    generate_button_label?: string;
    empty_state?: {
        title?: string;
        description?: string;
    };
    table?: {
        token_id_label?: string;
        created_label?: string;
        expires_label?: string;
        actions_label?: string;
    };
    create_modal?: {
        title?: string;
    };
    delete_modal?: {
        title?: string;
        cancel_button_label?: string;
        delete_button_label?: string;
    };
}

interface DomainTabCreateMessages {
    modal: {
        title?: string;
        field?: {
            label?: string;
            placeholder?: string;
            error?: string;
        };
        actions?: {
            cancel_button_text?: string;
            create_button_text?: string;
        };
    };
}
interface DomainTabDeleteMessages {
    modal: {
        title?: string;
        description?: {
            pending?: string;
            verified?: string;
        };
        actions?: {
            cancel_button_text?: string;
            create_button_text?: string;
        };
    };
}
interface DomainTabVerifyMessages {
    modal: {
        title?: string;
        txt_record_name?: {
            label?: string;
            description?: string;
        };
        txt_record_content?: {
            label?: string;
            description?: string;
        };
        verification_status?: {
            label?: string;
            description?: string;
            pending?: string;
        };
        actions?: {
            verify_button_text?: string;
            delete_button_text?: string;
            done_button_text?: string;
        };
        errors: {
            verification_failed: string;
        };
    };
}
interface SsoDomainTabMessages {
    title?: string;
    description?: string;
    create_button_text?: string;
    table?: {
        empty_message?: string;
        columns?: {
            name?: string;
            status?: string;
            verify?: string;
        };
        domain_statuses?: {
            pending?: string;
            verified?: string;
            failed?: string;
        };
    };
    domain_create?: DomainTabCreateMessages;
    domain_verify?: DomainTabVerifyMessages;
    domain_delete?: DomainTabDeleteMessages;
}

/**
 * Interface for SSO Provider Select messages that can be used in the UI.
 */
interface ProviderSelectMessages {
    title?: string;
    description?: string;
}
interface ProviderDetailsMessages {
    title?: string;
    description?: string;
    fields?: {
        name?: {
            label?: string;
            placeholder?: string;
            helper_text?: string;
            error?: string;
        };
        display_name?: {
            label?: string;
            placeholder?: string;
            helper_text?: string;
            error?: string;
        };
    };
}
/**
 * Interface for provider configuration field messages
 */
interface ProviderConfigureFieldsMessages {
    okta?: {
        domain?: {
            label?: string;
            placeholder?: string;
            helper_text?: string;
            error?: string;
        };
        client_id?: {
            label?: string;
            placeholder?: string;
            helper_text?: string;
            error?: string;
        };
        client_secret?: {
            label?: string;
            placeholder?: string;
            helper_text?: string;
            error?: string;
        };
        icon_url?: {
            label?: string;
            placeholder?: string;
            helper_text?: string;
            error?: string;
        };
        callback_url?: {
            label?: string;
            placeholder?: string;
            helper_text?: string;
            error?: string;
        };
    };
    adfs?: {
        meta_data_source?: {
            label?: string;
            helper_text?: string;
            options?: {
                meta_data_url?: {
                    label?: string;
                };
                meta_data_file?: {
                    label?: string;
                };
            };
        };
        meta_data_url?: {
            label?: string;
            placeholder?: string;
            helper_text?: string;
            error?: string;
        };
        meta_data_location_url?: {
            label?: string;
            placeholder?: string;
            helper_text?: string;
            error?: string;
        };
        federation_meta_data_file?: {
            label?: string;
            placeholder?: string;
            helper_text?: string;
            error?: string;
        };
        upload_button_label?: string;
    };
    'google-apps'?: {
        domain?: {
            label?: string;
            placeholder?: string;
            helper_text?: string;
            error?: string;
        };
        client_id?: {
            label?: string;
            placeholder?: string;
            helper_text?: string;
            error?: string;
        };
        client_secret?: {
            label?: string;
            placeholder?: string;
            helper_text?: string;
            error?: string;
        };
        icon_url?: {
            label?: string;
            placeholder?: string;
            helper_text?: string;
            error?: string;
        };
        callback_url?: {
            label?: string;
            placeholder?: string;
            helper_text?: string;
            error?: string;
        };
    };
    oidc?: {
        type?: {
            label?: string;
            helper_text?: string;
            options?: {
                back_channel?: {
                    label?: string;
                };
                front_channel?: {
                    label?: string;
                };
            };
        };
        client_id?: {
            label?: string;
            placeholder?: string;
            helper_text?: string;
            error?: string;
        };
        client_secret?: {
            label?: string;
            placeholder?: string;
            helper_text?: string;
            error?: string;
        };
        discovery_url?: {
            label?: string;
            placeholder?: string;
            helper_text?: string;
            error?: string;
        };
    };
    pingfederate?: {
        ping_federate_baseurl?: {
            label?: string;
            placeholder?: string;
            helper_text?: string;
            error?: string;
        };
        sign_cert?: {
            label?: string;
            placeholder?: string;
            helper_text?: string;
            error?: string;
        };
        advanced_settings?: {
            title?: string;
            upload_button_label?: string;
            sign_request?: {
                label?: string;
                placeholder?: string;
                helper_text?: string;
                error?: string;
            };
            sign_request_algorithm?: {
                label?: string;
                placeholder?: string;
                helper_text?: string;
                error?: string;
            };
            sign_request_algorithm_digest?: {
                label?: string;
                placeholder?: string;
                helper_text?: string;
                error?: string;
            };
        };
    };
    samlp?: {
        meta_data_source?: {
            label?: string;
            helper_text?: string;
            options?: {
                meta_data_url?: {
                    label?: string;
                };
                meta_data_file?: {
                    label?: string;
                };
            };
        };
        meta_data_url?: {
            label?: string;
            placeholder?: string;
            helper_text?: string;
            error?: string;
        };
        single_sign_on_login_url?: {
            label?: string;
            placeholder?: string;
            helper_text?: string;
            error?: string;
        };
        cert?: {
            label?: string;
            placeholder?: string;
            helper_text?: string;
            error?: string;
        };
        advanced_settings?: {
            title?: string;
            sign_request?: {
                label?: string;
                placeholder?: string;
                helper_text?: string;
                error?: string;
            };
            request_protocol_binding?: {
                label?: string;
                placeholder?: string;
                helper_text?: string;
                error?: string;
            };
            sign_request_algorithm?: {
                label?: string;
                placeholder?: string;
                helper_text?: string;
                error?: string;
            };
            sign_request_algorithm_digest?: {
                label?: string;
                placeholder?: string;
                helper_text?: string;
                error?: string;
            };
        };
    };
    waad?: {
        tenant_domain?: {
            label?: string;
            placeholder?: string;
            helper_text?: string;
            error?: string;
        };
        client_id?: {
            label?: string;
            placeholder?: string;
            helper_text?: string;
            error?: string;
        };
        client_secret?: {
            label?: string;
            placeholder?: string;
            helper_text?: string;
            error?: string;
        };
        icon_url?: {
            label?: string;
            placeholder?: string;
            helper_text?: string;
            error?: string;
        };
        callback_url?: {
            label?: string;
            placeholder?: string;
            helper_text?: string;
            error?: string;
        };
    };
}
/**
 * Interface for provider configuration messages
 */
interface ProviderConfigureMessages {
    title?: string;
    description?: string;
    guided_setup_button_text?: string;
    fields?: ProviderConfigureFieldsMessages;
}
interface SsoProviderCreateMessages {
    header?: {
        title?: string;
        back_button_text?: string;
    };
    provider_select?: ProviderSelectMessages;
    provider_details?: ProviderDetailsMessages;
    provider_configure?: ProviderConfigureMessages;
    notifications?: {
        general_error?: string;
        provider_create_success?: string;
    };
}

interface SsoProviderDeleteModalContentMessages {
    description?: string;
    field: {
        label?: string;
        placeholder?: string;
    };
}
interface SsoProvideDeleteMessages {
    title?: string;
    description?: string;
    delete_button_label?: string;
    modal?: {
        title?: string;
        description?: string;
        content: SsoProviderDeleteModalContentMessages;
        actions?: {
            cancel_button_label?: string;
            delete_button_label?: string;
        };
    };
}
interface SsoProvideRemoveMessages {
    title?: string;
    description?: string;
    remove_button_label?: string;
    modal?: {
        title?: string;
        description?: string;
        content: SsoProviderDeleteModalContentMessages;
        actions?: {
            cancel_button_label?: string;
            delete_button_label?: string;
        };
    };
}

interface SsoProviderEditMessages {
    header?: {
        back_button_text?: string;
    };
    tabs?: {
        sso?: {
            name?: string;
            content?: SsoProviderTabMessages;
        };
        provisioning?: {
            name?: string;
            content?: SsoProvisioningTabMessages;
        };
        domains?: {
            name?: string;
            content?: SsoDomainTabMessages;
        };
    };
}
interface SsoProviderTabMessages {
    alert?: {
        warning: string;
        error: string;
    };
    delete?: SsoProvideDeleteMessages;
    remove?: SsoProvideRemoveMessages;
    details?: SsoProviderDetailsMessages;
}
interface SsoProviderDetailsMessages {
    submit_button_label?: string;
    unsaved_changes_text?: string;
    details_fields?: ProviderDetailsMessages;
    configure_fields?: ProviderConfigureFieldsMessages;
}
interface SsoProviderNotificationMessages {
    delete_success?: string;
    remove_success?: string;
    update_success?: string;
    general_error?: string;
    provisioning_disabled_success?: string;
    scim_token_delete_sucess?: string;
}

interface SsoProvisioningTabMessages {
    header?: {
        title?: string;
        description?: string;
        guided_setup_button_label?: string;
        enable_provisioning_tooltip?: string;
    };
    warning_alert_message?: {
        title?: string;
        description?: string;
    };
    save_button_label?: string;
    unsaved_changes_text?: string;
    notifications?: SsoProviderNotificationMessages;
    details?: SsoProvisioningDetailsMessages;
    delete?: SsoProvisioningDeleteMessages;
}
interface SsoProvisioningDetailsMessages {
    manage_tokens?: ProvisioningManageTokenMessages;
    fields?: {
        user_id_attribute?: {
            label?: string;
            placeholder?: string;
            helper_text?: string;
            error?: string;
        };
        scim_endpoint_url?: {
            label?: string;
            placeholder?: string;
            helper_text?: string;
            error?: string;
        };
    };
    mappings?: ProvisioningFieldMappingsMessages;
}
interface SsoProvisioningDeleteModalContentMessages {
    description?: string;
}
interface SsoProvisioningDeleteMessages {
    modal?: {
        title?: string;
        content: SsoProvisioningDeleteModalContentMessages;
        actions?: {
            cancel_button_label?: string;
            delete_button_label?: string;
        };
    };
}
interface ProvisioningFieldMappingsMessages {
    title?: string;
    description?: string;
    card?: {
        title?: string;
        description?: string;
        table?: {
            columns?: {
                attribute_name_label?: string;
                external_field_label?: string;
            };
        };
    };
}

interface SsoProviderTableMessages {
    header?: {
        title?: string;
        description?: string;
        create_button_text?: string;
    };
    table?: {
        empty_message?: string;
        columns?: {
            name?: string;
            identity_provider?: string;
            display_name?: string;
        };
        actions?: {
            edit_button_text?: string;
            delete_button_text?: string;
            remove_button_text?: string;
        };
    };
    create_consent_modal?: {
        title?: string;
        description?: string;
        actions?: {
            cancel_button_text?: string;
            process_button_text?: string;
        };
    };
    delete_modal?: SsoProvideDeleteMessages;
    remove_modal?: {
        title?: string;
        description?: string;
        model_content?: SsoProviderDeleteModalContentMessages;
        actions?: {
            cancel_button_text?: string;
            remove_button_text?: string;
        };
    };
    notifications?: {
        general_error?: string;
        fetch_providers_error?: string;
        fetch_domains_error?: string;
        domain_create?: {
            success?: string;
            error?: string;
            on_before?: string;
        };
        domain_verify?: {
            success?: string;
            error?: string;
            on_before?: string;
            verification_failed?: string;
        };
        domain_delete?: {
            success?: string;
            error?: string;
        };
        domain_associate_provider?: {
            success?: string;
            error?: string;
            on_before?: string;
        };
        domain_delete_provider?: {
            success?: string;
            error?: string;
            on_before?: string;
        };
    };
}

/**
 * Messages that can be used to override default messages.
 */
interface OrgDetailsMessages {
    sections?: {
        settings?: {
            title?: string;
            fields?: {
                name?: {
                    label?: string;
                    placeholder?: string;
                    helper_text?: string;
                    error?: string;
                };
                display_name?: {
                    label?: string;
                    placeholder?: string;
                    helper_text?: string;
                    error?: string;
                };
            };
        };
        branding?: {
            title?: string;
            fields?: {
                logo?: {
                    label?: string;
                    helper_text?: string;
                    error?: string;
                };
                primary_color?: {
                    label?: string;
                    helper_text?: string;
                    error?: string;
                };
                page_background_color?: {
                    label?: string;
                    helper_text?: string;
                    error?: string;
                };
            };
        };
    };
    unsaved_changes_text?: string;
    submit_button_label?: string;
    cancel_button_label?: string;
}

interface OrgDetailsEditMessages {
    header?: {
        title?: string;
        back_button_text?: string;
    };
    details?: OrgDetailsMessages;
    save_org_changes_message?: string;
    org_changes_error_message?: string;
    org_changes_error_message_generic?: string;
}

/**
 * Messages that can be used in the UI.
 */
interface OrgDeleteMessages {
    title?: string;
    description?: string;
    delete_button_label?: string;
    modal_title?: string;
    modal_description?: string;
    org_name_field_placeholder?: string;
    org_name_field_label?: string;
}

interface DomainCreateMessages {
    modal: {
        title?: string;
        field?: {
            label?: string;
            placeholder?: string;
            error?: string;
        };
        actions?: {
            cancel_button_text?: string;
            create_button_text?: string;
        };
    };
}

interface DomainDeleteMessages {
    modal: {
        title?: string;
        description?: {
            pending?: string;
            verified?: string;
        };
        actions?: {
            cancel_button_text?: string;
            create_button_text?: string;
        };
    };
}

interface DomainConfigureMessages {
    modal?: {
        title?: string;
        description?: string;
        table?: {
            empty_message?: string;
            columns?: {
                name?: string;
                provider?: string;
            };
            actions?: {
                add_provider_button_text?: string;
                view_provider_button_text?: string;
            };
        };
        actions?: {
            close_button_text?: string;
        };
    };
}

interface DomainVerifyMessages {
    modal: {
        title?: string;
        txt_record_name?: {
            label?: string;
            description?: string;
        };
        txt_record_content?: {
            label?: string;
            description?: string;
        };
        verification_status?: {
            label?: string;
            description?: string;
            pending?: string;
        };
        actions?: {
            verify_button_text?: string;
            delete_button_text?: string;
            done_button_text?: string;
        };
        errors: {
            verification_failed: string;
        };
    };
}

interface DomainTableMessages {
    header: {
        title: string;
        description: string;
        create_button_text: string;
    };
    table: {
        empty_message: string;
        columns: {
            domain: string;
            status: string;
        };
        actions: {
            configure_button_text: string;
            view_button_text: string;
            verify_button_text: string;
            delete_button_text: string;
        };
    };
    notifications: {
        fetch_providers_error: string;
        fetch_domains_error: string;
        domain_create_success: string;
        domain_create_error: string;
        domain_verify_success: string;
        domain_verify_error: string;
        domain_verify_verification_failed: string;
        domain_delete_success: string;
        domain_delete_error: string;
        domain_associate_provider_success: string;
        domain_associate_provider_error: string;
        domain_delete_provider_success: string;
        domain_delete_provider_error: string;
    };
}

/**
 * Represents a standardized API error shape.
 */
interface ApiError {
    readonly name: 'ApiError';
    readonly message: string;
    readonly status: number;
    readonly data?: {
        error?: string;
        [key: string]: unknown;
    };
}

/**
 * Type guard to determine if a given value is an ApiError.
 *
 * @param error - The unknown value to test.
 * @returns `true` if the value conforms to the ApiError shape; otherwise, `false`.
 */
declare function isApiError(error: unknown): error is ApiError;
/**
 * Type guard to check if an error has a structured API error body
 */
declare function hasApiErrorBody(error: unknown): error is {
    body?: {
        detail?: string;
        title?: string;
        status?: number;
    };
};
/**
 * Normalizes an unknown error into a standard JavaScript Error instance.
 *
 * This function tries to extract meaningful information from API errors,
 * strings, or other unknown error shapes. You can provide a custom resolver
 * function to map API error codes to user-friendly messages.
 *
 * @param error - The unknown error object or value to normalize.
 * @param options - Optional settings including:
 *   - resolver: A function that maps error codes to user-friendly messages.
 *   - fallbackMessage: A default message used when the error cannot be mapped.
 * @returns A standard Error object with an appropriate message.
 */
declare function normalizeError(error: unknown, options?: {
    resolver?: (code: string) => string | undefined | null;
    fallbackMessage?: string;
}): Error;
declare function getStatusCode(error: unknown): number | undefined;

interface BusinessErrorData {
    message: string;
}
declare class BusinessError extends Error {
    readonly type = "BusinessError";
    constructor(data: BusinessErrorData);
}
declare function isBusinessError(error: unknown): error is BusinessError;

interface StylingVariables {
    common?: {
        '--font-size-heading'?: string;
        '--font-size-description'?: string;
        '--font-size-title'?: string;
        '--font-size-paragraph'?: string;
        '--font-size-label'?: string;
        '--radius-xs'?: string;
        '--radius-sm'?: string;
        '--radius-md'?: string;
        '--radius-lg'?: string;
        '--radius-xl'?: string;
        '--radius-2xl'?: string;
        '--radius-3xl'?: string;
        '--radius-4xl'?: string;
        '--radius-5xl'?: string;
        '--radius-6xl'?: string;
        '--radius-7xl'?: string;
        '--radius-8xl'?: string;
        '--radius-9xl'?: string;
    };
    light?: {
        '--color-page'?: string;
        '--color-background'?: string;
        '--color-foreground'?: string;
        '--color-card'?: string;
        '--color-card-foreground'?: string;
        '--color-primary'?: string;
        '--color-primary-foreground'?: string;
        '--color-secondary'?: string;
        '--color-secondary-foreground'?: string;
        '--color-accent'?: string;
        '--color-accent-foreground'?: string;
        '--color-muted'?: string;
        '--color-muted-foreground'?: string;
        '--color-border'?: string;
        '--color-ring'?: string;
        '--color-info'?: string;
        '--color-info-foreground'?: string;
        '--color-success'?: string;
        '--color-success-foreground'?: string;
        '--color-warning'?: string;
        '--color-warning-foreground'?: string;
        '--color-destructive'?: string;
        '--color-destructive-foreground'?: string;
        '--color-destructive-border'?: string;
        '--color-popover'?: string;
        '--color-popover-foreground'?: string;
        '--color-popover-border'?: string;
        '--color-input'?: string;
        '--color-input-foreground'?: string;
        '--color-input-muted'?: string;
        '--shadow-bevel-xs'?: string;
        '--shadow-bevel-sm'?: string;
        '--shadow-bevel-md'?: string;
        '--shadow-bevel-lg'?: string;
        '--shadow-bevel-xl'?: string;
        '--shadow-bevel-2xl'?: string;
        '--shadow-button-resting'?: string;
        '--shadow-button-hover'?: string;
        '--shadow-button-focus'?: string;
        '--shadow-button-destructive-resting'?: string;
        '--shadow-button-destructive-hover'?: string;
        '--shadow-button-destructive-focus'?: string;
        '--shadow-button-outlined-resting'?: string;
        '--shadow-button-outlined-hover'?: string;
        '--shadow-button-outlined-focus'?: string;
        '--shadow-input-resting'?: string;
        '--shadow-input-hover'?: string;
        '--shadow-input-focus'?: string;
        '--shadow-input-destructive-resting'?: string;
        '--shadow-input-destructive-hover'?: string;
        '--shadow-input-destructive-focus'?: string;
        '--shadow-checkbox-resting'?: string;
        '--shadow-checkbox-hover'?: string;
        '--shadow-switch-resting'?: string;
        '--shadow-switch-hover'?: string;
        '--shadow-switch-focus'?: string;
        '--shadow-switch-thumb'?: string;
    };
    dark?: {
        '--color-page'?: string;
        '--color-background'?: string;
        '--color-foreground'?: string;
        '--color-card'?: string;
        '--color-card-foreground'?: string;
        '--color-primary'?: string;
        '--color-primary-foreground'?: string;
        '--color-secondary'?: string;
        '--color-secondary-foreground'?: string;
        '--color-accent'?: string;
        '--color-accent-foreground'?: string;
        '--color-muted'?: string;
        '--color-muted-foreground'?: string;
        '--color-border'?: string;
        '--color-ring'?: string;
        '--color-info'?: string;
        '--color-info-foreground'?: string;
        '--color-success'?: string;
        '--color-success-foreground'?: string;
        '--color-warning'?: string;
        '--color-warning-foreground'?: string;
        '--color-destructive'?: string;
        '--color-destructive-foreground'?: string;
        '--color-destructive-border'?: string;
        '--color-popover'?: string;
        '--color-popover-foreground'?: string;
        '--color-popover-border'?: string;
        '--color-input'?: string;
        '--color-input-foreground'?: string;
        '--color-input-muted'?: string;
        '--shadow-bevel-xs'?: string;
        '--shadow-bevel-sm'?: string;
        '--shadow-bevel-md'?: string;
        '--shadow-bevel-lg'?: string;
        '--shadow-bevel-xl'?: string;
        '--shadow-bevel-2xl'?: string;
        '--shadow-button-resting'?: string;
        '--shadow-button-hover'?: string;
        '--shadow-button-focus'?: string;
        '--shadow-button-destructive-resting'?: string;
        '--shadow-button-destructive-hover'?: string;
        '--shadow-button-destructive-focus'?: string;
        '--shadow-button-outlined-resting'?: string;
        '--shadow-button-outlined-hover'?: string;
        '--shadow-button-outlined-focus'?: string;
        '--shadow-input-resting'?: string;
        '--shadow-input-hover'?: string;
        '--shadow-input-focus'?: string;
        '--shadow-input-destructive-resting'?: string;
        '--shadow-input-destructive-hover'?: string;
        '--shadow-input-destructive-focus'?: string;
        '--shadow-checkbox-resting'?: string;
        '--shadow-checkbox-hover'?: string;
        '--shadow-switch-resting'?: string;
        '--shadow-switch-hover'?: string;
        '--shadow-switch-focus'?: string;
        '--shadow-switch-thumb'?: string;
    };
}
type MergedStyles = {
    variables: {
        [K in keyof NonNullable<StylingVariables>['common'] | keyof NonNullable<StylingVariables>['light'] | keyof NonNullable<StylingVariables>['dark']]?: string;
    };
    classes?: Record<string, string | undefined>;
};

/**
 * Returns the merged CSS variables for the current theme.
 *
 * @param styling - An object containing variables for common, light, and dark themes.
 * @param isDarkMode - A boolean indicating if dark mode is active.
 * @returns An object with a variables property containing the merged CSS variables.
 */
declare const getCoreStyles: (styling?: StylingVariables, isDarkMode?: boolean) => MergedStyles;
/**
 * Returns component styles supporting both flat and nested variable formats.
 *
 * @param styling - Object containing either direct styling variables or nested under 'variables'
 * @param isDarkMode - Boolean indicating if dark mode is active
 * @returns Merged styles with variables and classNames
 */
declare const getComponentStyles: (styling?: {
    variables?: StylingVariables;
    classes?: Record<string, string | undefined>;
}, isDarkMode?: boolean) => MergedStyles;
/**
 * Apply theme styling to document and set CSS variables
 *
 * @param styling - Theme variables to apply
 * @param mode - Theme mode (dark/light)
 * @param theme - UI theme variant
 */
declare function applyStyleOverrides(styling: StylingVariables, mode?: 'dark' | 'light', theme?: 'default' | 'minimal' | 'rounded'): void;

type SafeAny = any;
interface ActionButton<Item = void> {
    label: string;
    variant?: 'primary' | 'outline' | 'ghost' | 'destructive' | 'link';
    size?: 'default' | 'xs' | 'sm' | 'lg' | 'icon';
    icon?: unknown;
    onClick: Item extends void ? (event: Event) => void : (data: Item) => void | boolean | Promise<boolean>;
    disabled?: boolean;
    className?: string;
    type?: 'button' | 'submit';
}
interface ComponentStyling<Classes> {
    variables?: StylingVariables;
    classes?: Partial<Classes>;
}
interface SharedComponentProps<Messages extends object = Record<string, unknown>, Classes extends object = Record<string, string | undefined>, Schema extends object = object> {
    styling?: ComponentStyling<Classes>;
    customMessages?: Partial<Messages>;
    schema?: Partial<Schema>;
    readOnly?: boolean;
}
interface BlockComponentSharedProps<Messages extends object = Record<string, unknown>, Classes extends object = Record<string, string | undefined>, Schema extends object = object> extends SharedComponentProps<Messages, Classes, Schema> {
    hideHeader?: boolean;
    isLoading?: boolean;
}
interface ComponentAction<Item, Context = void> {
    disabled?: boolean;
    onBefore?: (item: Item, context?: Context) => boolean;
    onAfter?: (item: Item, context?: Context) => void | boolean | Promise<boolean>;
}
interface BackButton {
    icon?: unknown;
    onClick: (e: Event) => void;
}

type TokenEndpointResponse = {
    id_token: string;
    access_token: string;
    refresh_token?: string;
    expires_in: number;
    scope?: string;
};
type GetTokenSilentlyVerboseResponse = Omit<TokenEndpointResponse, 'refresh_token'>;
interface User {
    name?: string;
    given_name?: string;
    family_name?: string;
    middle_name?: string;
    nickname?: string;
    preferred_username?: string;
    profile?: string;
    picture?: string;
    website?: string;
    email?: string;
    email_verified?: boolean;
    gender?: string;
    birthdate?: string;
    zoneinfo?: string;
    locale?: string;
    phone_number?: string;
    phone_number_verified?: boolean;
    address?: string;
    updated_at?: string;
    sub?: string;
    [key: string]: SafeAny;
}
interface GetTokenSilentlyOptions {
    cacheMode?: 'on' | 'off' | 'cache-only';
    authorizationParams?: {
        redirect_uri?: string;
        scope?: string;
        audience?: string;
        [key: string]: SafeAny;
    };
    timeoutInSeconds?: number;
    detailedResponse?: boolean;
}
interface BasicAuth0ContextInterface<TUser = User> {
    user?: TUser;
    isAuthenticated: boolean;
    getAccessTokenSilently: {
        (options: GetTokenSilentlyOptions & {
            detailedResponse: true;
        }): Promise<GetTokenSilentlyVerboseResponse>;
        (options?: GetTokenSilentlyOptions): Promise<string>;
        (options: GetTokenSilentlyOptions): Promise<GetTokenSilentlyVerboseResponse | string>;
    };
    getAccessTokenWithPopup: (options?: SafeAny) => Promise<string | undefined>;
    loginWithRedirect: (options?: SafeAny) => Promise<void>;
}
interface AuthDetails {
    domain?: string | undefined;
    authProxyUrl?: string | undefined;
    contextInterface?: BasicAuth0ContextInterface | undefined;
}
interface BaseCoreClientInterface {
    auth: AuthDetails;
    i18nService: I18nServiceInterface;
    getToken: (scope: string, audiencePath: string, ignoreCache?: boolean) => Promise<string | undefined>;
    isProxyMode: () => boolean;
    ensureScopes: (requiredScopes: string, audiencePath: string) => Promise<void>;
}
interface CoreClientInterface extends BaseCoreClientInterface {
    myAccountApiClient: MyAccountClient | undefined;
    myOrgApiClient: MyOrgClient | undefined;
    getMyAccountApiClient: () => MyAccountClient;
    getMyOrgApiClient: () => MyOrgClient;
}

declare function createCoreClient(authDetails: AuthDetails, i18nOptions?: I18nInitOptions): Promise<CoreClientInterface>;

/**
 * Creates a schema for email-based MFA contact validation with custom error message and optional custom regex
 * @param errorMessage - Custom error message for invalid email
 * @param customRegex - Optional custom regex for email validation
 * @returns Zod schema for email validation
 */
declare const createEmailContactSchema: (errorMessage?: string, customRegex?: RegExp) => z.ZodObject<{
    contact: z.ZodString;
}, "strip", z.ZodTypeAny, {
    contact: string;
}, {
    contact: string;
}>;
/**
 * Default schema for email-based MFA contact validation
 */
declare const EmailContactSchema: z.ZodObject<{
    contact: z.ZodString;
}, "strip", z.ZodTypeAny, {
    contact: string;
}, {
    contact: string;
}>;
/**
 * Type for email contact form data
 */
type EmailContactForm = z.infer<typeof EmailContactSchema>;

/**
 * Creates a schema for SMS-based MFA contact validation with custom error message and optional custom regex
 * @param errorMessage - Custom error message for invalid phone number
 * @param customRegex - Optional custom regex for phone number validation
 * @returns Zod schema for phone number validation
 */
declare const createSmsContactSchema: (errorMessage?: string, customRegex?: RegExp) => z.ZodObject<{
    contact: z.ZodString;
}, "strip", z.ZodTypeAny, {
    contact: string;
}, {
    contact: string;
}>;
/**
 * Default schema for SMS-based MFA contact validation
 */
declare const SmsContactSchema: z.ZodObject<{
    contact: z.ZodString;
}, "strip", z.ZodTypeAny, {
    contact: string;
}, {
    contact: string;
}>;
/**
 * Type for SMS contact form data
 */
type SmsContactForm = z.infer<typeof SmsContactSchema>;

/**
 * Schemas that can be used to override default schemas.
 */
interface OrgDetailsSchemas {
    name?: {
        errorMessage?: string;
    };
    displayName?: {
        regex?: RegExp;
        errorMessage?: string;
        minLength?: number;
        maxLength?: number;
        required?: boolean;
    };
    color?: {
        regex?: RegExp;
        errorMessage?: string;
    };
    logoURL?: {
        regex?: RegExp;
        errorMessage?: string;
    };
}

/**
 * Creates a schema for organization detail form validation
 * @param options - Configuration options for schema validation
 * @returns Zod schema for organization detail validation
 */
declare const createOrganizationDetailSchema: (options?: OrgDetailsSchemas) => z.ZodObject<{
    name: z.ZodString | z.ZodEffects<z.ZodOptional<z.ZodString>, string | undefined, string | undefined>;
    display_name: z.ZodString | z.ZodEffects<z.ZodOptional<z.ZodString>, string | undefined, string | undefined>;
    branding: z.ZodObject<{
        logo_url: z.ZodString | z.ZodEffects<z.ZodString, string, string> | z.ZodEffects<z.ZodOptional<z.ZodString>, string | undefined, string | undefined>;
        colors: z.ZodObject<{
            primary: z.ZodString;
            page_background: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            primary: string;
            page_background: string;
        }, {
            primary: string;
            page_background: string;
        }>;
    }, "strip", z.ZodTypeAny, {
        colors: {
            primary: string;
            page_background: string;
        };
        logo_url?: string | undefined;
    }, {
        colors: {
            primary: string;
            page_background: string;
        };
        logo_url?: string | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    branding: {
        colors: {
            primary: string;
            page_background: string;
        };
        logo_url?: string | undefined;
    };
    name?: string | undefined;
    display_name?: string | undefined;
}, {
    branding: {
        colors: {
            primary: string;
            page_background: string;
        };
        logo_url?: string | undefined;
    };
    name?: string | undefined;
    display_name?: string | undefined;
}>;
/**
 * Default schema for organization detail form validation
 */
declare const organizationDetailSchema: z.ZodObject<{
    name: z.ZodString | z.ZodEffects<z.ZodOptional<z.ZodString>, string | undefined, string | undefined>;
    display_name: z.ZodString | z.ZodEffects<z.ZodOptional<z.ZodString>, string | undefined, string | undefined>;
    branding: z.ZodObject<{
        logo_url: z.ZodString | z.ZodEffects<z.ZodString, string, string> | z.ZodEffects<z.ZodOptional<z.ZodString>, string | undefined, string | undefined>;
        colors: z.ZodObject<{
            primary: z.ZodString;
            page_background: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            primary: string;
            page_background: string;
        }, {
            primary: string;
            page_background: string;
        }>;
    }, "strip", z.ZodTypeAny, {
        colors: {
            primary: string;
            page_background: string;
        };
        logo_url?: string | undefined;
    }, {
        colors: {
            primary: string;
            page_background: string;
        };
        logo_url?: string | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    branding: {
        colors: {
            primary: string;
            page_background: string;
        };
        logo_url?: string | undefined;
    };
    name?: string | undefined;
    display_name?: string | undefined;
}, {
    branding: {
        colors: {
            primary: string;
            page_background: string;
        };
        logo_url?: string | undefined;
    };
    name?: string | undefined;
    display_name?: string | undefined;
}>;
/**
 * Type for organization detail form data
 */
type InternalOrganizationDetailsFormValues = z.infer<typeof organizationDetailSchema>;

interface StringValidationOptions {
    required?: boolean;
    regex?: RegExp;
    minLength?: number;
    maxLength?: number;
    errorMessage?: string;
}
interface LogoValidationOptions {
    required?: boolean;
    regex?: RegExp;
    errorMessage?: string;
}
interface DomainValidationOptions {
    required?: boolean;
    regex?: RegExp;
    errorMessage?: string;
}
interface BooleanFieldOptions {
    required?: boolean;
    errorMessage?: string;
}
interface FieldOptions {
    required?: boolean;
    regex?: RegExp;
    errorMessage?: string;
    minLength?: number;
    maxLength?: number;
}
declare const createStringSchema: (options?: StringValidationOptions) => z.ZodString | z.ZodEffects<z.ZodOptional<z.ZodString>, string | undefined, string | undefined>;
declare const createLogoSchema: (options?: LogoValidationOptions) => z.ZodString | z.ZodEffects<z.ZodString, string, string> | z.ZodEffects<z.ZodOptional<z.ZodString>, string | undefined, string | undefined>;
/**
 * Regex pattern for validating domain URLs in a flexible way
 * Accepts:
 * - Domain names: example.com, sub.example.com
 * - With protocol: https://example.com, http://example.com
 * - With port: example.com:8080
 * - With path: example.com/path
 * - Localhost and IPs: localhost, 192.168.1.1
 */
declare const DOMAIN_REGEX: RegExp;
declare const createDomainSchema: (options?: DomainValidationOptions) => z.ZodString | z.ZodEffects<z.ZodOptional<z.ZodString>, string | undefined, string | undefined>;
declare const createBooleanSchema: (options?: BooleanFieldOptions) => z.ZodBoolean | z.ZodOptional<z.ZodBoolean>;
declare const COMMON_FIELD_CONFIGS: {
    readonly domain: {
        readonly defaultError: "Please enter a valid domain";
        readonly regex: RegExp | undefined;
    };
    readonly client_id: {
        readonly defaultError: "Please enter a valid client ID";
        readonly regex: RegExp | undefined;
    };
    readonly client_secret: {
        readonly defaultError: "Please enter a valid client secret";
        readonly regex: RegExp | undefined;
    };
    readonly icon_url: {
        readonly defaultError: "Please enter a valid URL";
        readonly regex: RegExp;
    };
    readonly callback_url: {
        readonly defaultError: "Please enter a valid URL";
        readonly regex: RegExp;
    };
    readonly url: {
        readonly defaultError: "Please enter a valid URL";
        readonly regex: RegExp;
    };
    readonly certificate: {
        readonly defaultError: "Please enter a valid certificate";
        readonly regex: RegExp | undefined;
    };
    readonly algorithm: {
        readonly defaultError: "Please enter a valid algorithm";
        readonly regex: RegExp | undefined;
    };
    readonly metadata: {
        readonly defaultError: "Please enter valid metadata";
        readonly regex: RegExp | undefined;
    };
    readonly userIdAttribute: {
        readonly defaultError: "Please enter a valid user ID attribute";
        readonly regex: RegExp | undefined;
    };
};
type FieldConfig = (typeof COMMON_FIELD_CONFIGS)[keyof typeof COMMON_FIELD_CONFIGS];
declare const createFieldSchema: (fieldConfig: FieldConfig, options?: FieldOptions, customError?: string) => z.ZodString | z.ZodEffects<z.ZodOptional<z.ZodString>, string | undefined, string | undefined>;

type ListFactorsResponseContent = Auth0MyAccount.ListFactorsResponseContent;
type ListAuthenticationMethodsResponseContent = Auth0MyAccount.ListAuthenticationMethodsResponseContent;
type CreateAuthenticationMethodRequestContent = Auth0MyAccount.CreateAuthenticationMethodRequestContent;
type CreateAuthenticationMethodResponseContent = Auth0MyAccount.CreateAuthenticationMethodResponseContent;
type PathAuthenticationMethodId = Auth0MyAccount.PathAuthenticationMethodId;
type VerifyAuthenticationMethodRequestContent = Auth0MyAccount.VerifyAuthenticationMethodRequestContent;
type VerifyAuthenticationMethodResponseContent = Auth0MyAccount.VerifyAuthenticationMethodResponseContent;
interface Authenticator {
    id: string;
    type: MFAType;
    enrolled: boolean;
    email?: string;
    name?: string;
    confirmed?: boolean;
    created_at: string | null;
}
/**
 * Represents the type of an MFA authenticator.
 */
type MFAType = 'phone' | 'push-notification' | 'totp' | 'email' | 'webauthn-roaming' | 'webauthn-platform' | 'recovery-code';
/**
 * Options for enrolling in MFA factors.
 */
interface EnrollOptions {
    phone_number?: string;
    email?: string;
}
/**
 * Options for confirming MFA enrollment.
 */
interface ConfirmEnrollmentOptions {
    userOtpCode?: string;
}
/**
 * Interface for MFA controller.
 */
interface MFAControllerInterface {
    fetchFactors(onlyActive?: boolean): Promise<unknown>;
    enrollFactor(factorType: string, options?: SafeAny): Promise<CreateAuthenticationMethodResponseContent>;
    deleteFactor(authenticatorId: string): Promise<void>;
    confirmEnrollment(factorType: string, authSession: string, authenticationMethodId: string, options: ConfirmEnrollmentOptions): Promise<VerifyAuthenticationMethodResponseContent>;
}

declare const FACTOR_TYPE_EMAIL = "email";
declare const FACTOR_TYPE_PHONE = "phone";
declare const FACTOR_TYPE_PUSH_NOTIFICATION = "push-notification";
declare const FACTOR_TYPE_TOTP = "totp";
declare const FACTOR_TYPE_RECOVERY_CODE = "recovery-code";
declare const FACTOR_TYPE_WEBAUTHN_ROAMING = "webauthn-roaming";
declare const FACTOR_TYPE_WEBAUTHN_PLATFORM = "webauthn-platform";
/**
 * Array of all supported MFA factor types for validation and iteration
 */
declare const SUPPORTED_FACTOR_TYPES: readonly ["email", "phone", "push-notification", "totp", "recovery-code", "webauthn-platform"];

declare function buildEnrollParams(factorType: MFAType, options?: EnrollOptions): CreateAuthenticationMethodRequestContent;
declare function transformMyAccountFactors(availableFactorsResponse: ListFactorsResponseContent, enrolledFactors: ListAuthenticationMethodsResponseContent, onlyActive: boolean): Partial<Record<MFAType, Authenticator[]>>;

declare const MFAMappers: {
    fromAPI(availableFactorsResponse: ListFactorsResponseContent, enrolledFactorsResponse: ListAuthenticationMethodsResponseContent, onlyActive?: boolean): Record<MFAType, Authenticator[]>;
    buildEnrollParams(factorType: MFAType, options?: EnrollOptions): _auth0_myaccount_dist_cjs_api.CreateAuthenticationMethodRequestContent;
    buildConfirmEnrollmentParams(factorType: MFAType, authSession: string, options: ConfirmEnrollmentOptions): VerifyAuthenticationMethodRequestContent;
};

declare const USER_MFA_SCOPES = "create:me:authentication_methods read:me:authentication_methods delete:me:authentication_methods update:me:authentication_methods read:me:factors";

type GetOrganizationDetailsResponseContent = Auth0MyOrg.GetOrganizationDetailsResponseContent;
type UpdateOrganizationDetailsRequestContent = Auth0MyOrg.UpdateOrganizationDetailsRequestContent;
type UpdateOrganizationDetailsResponseContent = Auth0MyOrg.UpdateOrganizationDetailsResponseContent;
interface OrganizationPrivate extends OrganizationDetailsFormValues {
    id?: string;
    name?: string;
}
interface Organization extends OrganizationPrivate {
    id: string;
    name: string;
}
type OrganizationDetailsFormValues = InternalOrganizationDetailsFormValues;

declare const OrgDetailsFactory: {
    create: () => OrganizationPrivate;
};

declare const OrgDetailsMappers: {
    fromAPI(orgData: GetOrganizationDetailsResponseContent): OrganizationPrivate;
    toAPI(formValues: OrganizationPrivate): UpdateOrganizationDetailsRequestContent;
};

declare const DEFAULT_COLORS: {
    UL_PRIMARY: string;
    UL_PAGE_BG: string;
};

type ListIdentityProvidersResponseContent = Auth0MyOrg.ListIdentityProvidersResponseContent;
type IdentityProvider = Auth0MyOrg.IdpKnown;
type DetachIdpProviderResponseContent = Auth0MyOrg.DetachIdpProviderResponseContent;
type CreateIdentityProviderRequestContent = Auth0MyOrg.CreateIdentityProviderRequestContent;
type CreateIdentityProviderResponseContent = Auth0MyOrg.CreateIdentityProviderResponseContent;
type GetIdentityProviderResponseContent = Auth0MyOrg.GetIdentityProviderResponseContent;
type IdpId = Auth0MyOrg.IdpId;
type UpdateIdentityProviderRequestContent = Auth0MyOrg.UpdateIdentityProviderRequestContent;
type UpdateIdentityProviderResponseContent = Auth0MyOrg.UpdateIdentityProviderResponseContent;
type CreateIdentityProviderRequestContentPrivate = ProviderSelectionFormValues & ProviderDetailsFormValues & ProviderConfigureFormValues;
type IdpUpdateBase = Auth0MyOrg.IdpUpdateBase;
type UpdateIdentityProviderRequestContentPrivate = ProviderSelectionFormValues & Partial<IdpUpdateBase> & Partial<ProviderDetailsFormValues> & Partial<ProviderConfigureFormValues>;
type CreateIdpDomainRequestContent = Auth0MyOrg.CreateIdpDomainRequestContent;
type CreateIdpDomainResponseContent = Auth0MyOrg.CreateIdpDomainResponseContent;
type IdpStrategy = 'adfs' | 'google-apps' | 'oidc' | 'okta' | 'pingfederate' | 'samlp' | 'waad';
type IdentityProviderCreate = Omit<IdentityProvider, 'id'>;
type IdentityProviderAssociatedWithDomain = IdentityProvider & {
    is_associated: boolean;
};
type Method = 'scim' | 'google-sync';
interface ProvisioningField {
    provisioning_field: string;
    user_attribute: string;
    description: string;
    label: string;
}
interface Provisioning {
    identity_provider_id: string;
    identity_provider_name: string;
    strategy: IdpStrategy;
    method: Method;
    fields: ProvisioningField[];
    updated_on: string;
    created_at: string;
    user_id_attribute: string;
}
interface SCIMTokenCreate {
    token_lifetime?: number;
}
interface SCIMToken {
    token_id: string;
    token: string;
    created_at: string;
    valid_until?: string;
}

type GetIdPProvisioningConfigResponseContent = Auth0MyOrg.GetIdPProvisioningConfigResponseContent;
type CreateIdPProvisioningConfigResponseContent = Auth0MyOrg.CreateIdPProvisioningConfigResponseContent;
type ListIdpProvisioningScimTokensResponseContent = Auth0MyOrg.ListIdpProvisioningScimTokensResponseContent;
type CreateIdpProvisioningScimTokenResponseContent = Auth0MyOrg.CreateIdpProvisioningScimTokenResponseContent;
type CreateIdpProvisioningScimTokenRequestContent = Auth0MyOrg.CreateIdpProvisioningScimTokenRequestContent;
type IdpProvisioningConfig = Auth0MyOrg.IdpProvisioningConfig;
type IdpScimTokenBase = Auth0MyOrg.IdpScimTokenBase;
type ProvisioningFieldMap = Auth0MyOrg.IdpProvisioningFieldMapItem[];

declare const STRATEGIES: {
    readonly ADFS: "adfs";
    readonly GOOGLE_APPS: "google-apps";
    readonly OIDC: "oidc";
    readonly OKTA: "okta";
    readonly PINGFEDERATE: "pingfederate";
    readonly SAMLP: "samlp";
    readonly WAAD: "waad";
};
declare const AVAILABLE_STRATEGY_LIST: IdpStrategy[];
declare const STRATEGY_DISPLAY_NAMES: Record<IdpStrategy, string>;

type CombinedProviderFormValues = ProviderSelectionFormValues & ProviderDetailsFormValues & {
    options: ProviderConfigureFormValues;
};
type UpdateProviderFormValues = Partial<ProviderDetailsFormValues> & {
    strategy?: IdpStrategy;
    options?: Partial<ProviderConfigureFormValues>;
    is_enabled?: boolean;
    show_as_button?: boolean;
    assign_membership_on_login?: boolean;
};
declare const SsoProviderMappers: {
    /**
     * Transforms form data to API request format for creating SSO providers.
     * Filters out form-specific fields and includes only strategy-valid API fields.
     */
    createToAPI(data: CombinedProviderFormValues): CreateIdentityProviderRequestContent;
    /**
     * Transforms form data to API request format for updating SSO providers.
     * Only includes fields that have been modified and are valid for the strategy.
     */
    updateToAPI(data: UpdateProviderFormValues): UpdateIdentityProviderRequestContent;
};

type GetOrganizationDomainResponseContent = Auth0MyOrg.GetOrganizationDomainResponseContent;
type CreateOrganizationDomainResponseContent = Auth0MyOrg.CreateOrganizationDomainResponseContent;
type CreateOrganizationDomainRequestContent = Auth0MyOrg.CreateOrganizationDomainRequestContent;
type CreateDomainRequestContentPrivate = InternalDomainCreateFormValues;
type DomainStatus = 'pending' | 'failed' | 'verified';
interface DomainCreate {
    domain: string;
}
interface Domain {
    id: string;
    org_id: string;
    domain: string;
    status: DomainStatus;
    verification_txt: string;
    verification_host: string;
}

declare const MY_ORG_DETAILS_EDIT_SCOPES = "read:my_org:details update:my_org:details";
declare const MY_ORG_SSO_PROVIDER_TABLE_SCOPES = "read:my_org:details read:my_org:identity_providers create:my_org:identity_providers update:my_org:identity_providers delete:my_org:identity_providers update:my_org:identity_providers_detach";
declare const MY_ORG_SSO_PROVIDER_CREATE_SCOPES = "read:my_org:identity_providers create:my_org:identity_providers";
declare const MY_ORG_SSO_PROVIDER_EDIT_SCOPES = "read:my_org:details update:my_org:details read:my_org:identity_providers create:my_org:identity_providers update:my_org:identity_providers delete:my_org:identity_providers update:my_org:identity_providers_detach read:my_org:identity_provider_provisioning create:my_org:identity_provider_provisioning delete:my_org:identity_provider_provisioning read:my_org:identity_providers_domains create:my_org:identity_provider_domains delete:my_org:identity_provider_domains read:my_org:scim_tokens create:my_org:scim_tokens delete:my_org:scim_tokens read:my_org:domains delete:my_org:domains create:my_org:domains update:my_org:domains";
declare const MY_ORG_DOMAIN_SCOPES = "read:my_org:domains delete:my_org:domains create:my_org:domains update:my_org:domains read:my_org:identity_providers create:my_org:identity_provider_domains delete:my_org:identity_provider_domains read:my_org:identity_providers_domains";

/**
 * Schema configuration for Step 1: Provider Selection
 */
interface ProviderSelectionSchema {
    strategy?: {
        required?: boolean;
        errorMessage?: string;
    };
}
/**
 * Schema configuration for Step 2: Provider Details
 */
interface ProviderDetailsSchema {
    name?: {
        regex?: RegExp;
        errorMessage?: string;
        minLength?: number;
        maxLength?: number;
        required?: boolean;
    };
    displayName?: {
        regex?: RegExp;
        errorMessage?: string;
        minLength?: number;
        maxLength?: number;
        required?: boolean;
    };
}
/**
 * Schema configuration for Step 3: Provider Configure
 */
interface ProviderConfigureSchema {
    okta?: {
        domain?: {
            regex?: RegExp;
            errorMessage?: string;
            minLength?: number;
            maxLength?: number;
            required?: boolean;
        };
        client_id?: {
            regex?: RegExp;
            errorMessage?: string;
            minLength?: number;
            maxLength?: number;
            required?: boolean;
        };
        client_secret?: {
            regex?: RegExp;
            errorMessage?: string;
            minLength?: number;
            maxLength?: number;
            required?: boolean;
        };
        icon_url?: {
            regex?: RegExp;
            errorMessage?: string;
            minLength?: number;
            maxLength?: number;
            required?: boolean;
        };
        callback_url?: {
            regex?: RegExp;
            errorMessage?: string;
            minLength?: number;
            maxLength?: number;
            required?: boolean;
        };
    };
    adfs?: {
        meta_data_source?: {
            required?: boolean;
            errorMessage?: string;
        };
        meta_data_location_url?: {
            regex?: RegExp;
            errorMessage?: string;
            minLength?: number;
            maxLength?: number;
            required?: boolean;
        };
        adfs_server?: {
            regex?: RegExp;
            errorMessage?: string;
            minLength?: number;
            maxLength?: number;
            required?: boolean;
        };
        fedMetadataXml?: {
            regex?: RegExp;
            errorMessage?: string;
            minLength?: number;
            maxLength?: number;
            required?: boolean;
        };
    };
    'google-apps'?: {
        domain?: {
            regex?: RegExp;
            errorMessage?: string;
            minLength?: number;
            maxLength?: number;
            required?: boolean;
        };
        client_id?: {
            regex?: RegExp;
            errorMessage?: string;
            minLength?: number;
            maxLength?: number;
            required?: boolean;
        };
        client_secret?: {
            regex?: RegExp;
            errorMessage?: string;
            minLength?: number;
            maxLength?: number;
            required?: boolean;
        };
        icon_url?: {
            regex?: RegExp;
            errorMessage?: string;
            minLength?: number;
            maxLength?: number;
            required?: boolean;
        };
        callback_url?: {
            regex?: RegExp;
            errorMessage?: string;
            minLength?: number;
            maxLength?: number;
            required?: boolean;
        };
    };
    oidc?: {
        type?: {
            regex?: RegExp;
            errorMessage?: string;
            minLength?: number;
            maxLength?: number;
            required?: boolean;
        };
        client_id?: {
            regex?: RegExp;
            errorMessage?: string;
            minLength?: number;
            maxLength?: number;
            required?: boolean;
        };
        client_secret?: {
            regex?: RegExp;
            errorMessage?: string;
            minLength?: number;
            maxLength?: number;
            required?: boolean;
        };
        discovery_url?: {
            regex?: RegExp;
            errorMessage?: string;
            minLength?: number;
            maxLength?: number;
            required?: boolean;
        };
        isFrontChannel?: boolean;
    };
    pingfederate?: {
        signatureAlgorithm?: {
            regex?: RegExp;
            errorMessage?: string;
            minLength?: number;
            maxLength?: number;
            required?: boolean;
        };
        digestAlgorithm?: {
            regex?: RegExp;
            errorMessage?: string;
            minLength?: number;
            maxLength?: number;
            required?: boolean;
        };
        signSAMLRequest?: {
            errorMessage?: string;
            required?: boolean;
        };
        metadataUrl?: {
            regex?: RegExp;
            errorMessage?: string;
            minLength?: number;
            maxLength?: number;
            required?: boolean;
        };
        signingCert?: {
            regex?: RegExp;
            errorMessage?: string;
            minLength?: number;
            maxLength?: number;
            required?: boolean;
        };
        idpInitiated?: {
            errorMessage?: string;
            required?: boolean;
        };
        icon_url?: {
            regex?: RegExp;
            errorMessage?: string;
            minLength?: number;
            maxLength?: number;
            required?: boolean;
        };
    };
    samlp?: {
        meta_data_source?: {
            required?: boolean;
            errorMessage?: string;
        };
        single_sign_on_login_url?: {
            required?: boolean;
            errorMessage?: string;
        };
        signatureAlgorithm?: {
            regex?: RegExp;
            errorMessage?: string;
            minLength?: number;
            maxLength?: number;
            required?: boolean;
        };
        digestAlgorithm?: {
            regex?: RegExp;
            errorMessage?: string;
            minLength?: number;
            maxLength?: number;
            required?: boolean;
        };
        protocolBinding?: {
            regex?: RegExp;
            errorMessage?: string;
            minLength?: number;
            maxLength?: number;
            required?: boolean;
        };
        signSAMLRequest?: {
            errorMessage?: string;
            required?: boolean;
        };
        bindingMethod?: {
            regex?: RegExp;
            errorMessage?: string;
            minLength?: number;
            maxLength?: number;
            required?: boolean;
        };
        metadataUrl?: {
            regex?: RegExp;
            errorMessage?: string;
            minLength?: number;
            maxLength?: number;
            required?: boolean;
        };
        cert?: {
            regex?: RegExp;
            errorMessage?: string;
            minLength?: number;
            maxLength?: number;
            required?: boolean;
        };
        idpInitiated?: {
            errorMessage?: string;
            required?: boolean;
        };
        icon_url?: {
            regex?: RegExp;
            errorMessage?: string;
            minLength?: number;
            maxLength?: number;
            required?: boolean;
        };
    };
    waad?: {
        domain?: {
            regex?: RegExp;
            errorMessage?: string;
            minLength?: number;
            maxLength?: number;
            required?: boolean;
        };
        client_id?: {
            regex?: RegExp;
            errorMessage?: string;
            minLength?: number;
            maxLength?: number;
            required?: boolean;
        };
        client_secret?: {
            regex?: RegExp;
            errorMessage?: string;
            minLength?: number;
            maxLength?: number;
            required?: boolean;
        };
        icon_url?: {
            regex?: RegExp;
            errorMessage?: string;
            minLength?: number;
            maxLength?: number;
            required?: boolean;
        };
        callback_url?: {
            regex?: RegExp;
            errorMessage?: string;
            minLength?: number;
            maxLength?: number;
            required?: boolean;
        };
    };
}
interface SsoProviderSchema extends ProviderSelectionSchema, ProviderDetailsSchema, ProviderConfigureSchema {
}

interface OktaOptions {
    domain?: FieldOptions;
    client_id?: FieldOptions;
    client_secret?: FieldOptions;
    icon_url?: FieldOptions;
    callback_url?: FieldOptions;
}
interface AdfsOptions {
    meta_data_source?: FieldOptions;
    meta_data_location_url?: FieldOptions;
    adfs_server?: FieldOptions;
    fedMetadataXml?: FieldOptions;
}
interface GoogleAppsOptions {
    domain?: FieldOptions;
    client_id?: FieldOptions;
    client_secret?: FieldOptions;
    icon_url?: FieldOptions;
    callback_url?: FieldOptions;
}
interface OidcOptions {
    type?: FieldOptions;
    client_id?: FieldOptions;
    client_secret?: FieldOptions;
    discovery_url?: FieldOptions;
    isFrontChannel?: boolean;
}
interface PingFederateOptions {
    pingFederateBaseUrl?: FieldOptions;
    signatureAlgorithm?: FieldOptions;
    digestAlgorithm?: FieldOptions;
    signSAMLRequest?: BooleanFieldOptions;
    signingCert?: FieldOptions;
    cert?: FieldOptions;
    icon_url?: FieldOptions;
    idpInitiated?: FieldOptions;
}
interface SamlpOptions {
    signatureAlgorithm?: FieldOptions;
    digestAlgorithm?: FieldOptions;
    protocolBinding?: FieldOptions;
    signSAMLRequest?: BooleanFieldOptions;
    bindingMethod?: FieldOptions;
    metadataUrl?: FieldOptions;
    single_sign_on_login_url?: FieldOptions;
    cert?: FieldOptions;
    icon_url?: FieldOptions;
    idpInitiated?: FieldOptions;
}
interface WaadOptions {
    tenant_domain?: FieldOptions;
    client_id?: FieldOptions;
    client_secret?: FieldOptions;
    icon_url?: FieldOptions;
    callback_url?: FieldOptions;
}
declare const STRATEGY_BUILDERS: {
    readonly okta: (options?: OktaOptions) => z.ZodObject<{
        domain: z.ZodString | z.ZodEffects<z.ZodOptional<z.ZodString>, string | undefined, string | undefined>;
        client_id: z.ZodString | z.ZodEffects<z.ZodOptional<z.ZodString>, string | undefined, string | undefined>;
        client_secret: z.ZodString | z.ZodEffects<z.ZodOptional<z.ZodString>, string | undefined, string | undefined>;
        icon_url: z.ZodString | z.ZodEffects<z.ZodOptional<z.ZodString>, string | undefined, string | undefined>;
        callback_url: z.ZodString | z.ZodEffects<z.ZodOptional<z.ZodString>, string | undefined, string | undefined>;
    }, "strip", z.ZodTypeAny, {
        domain?: string | undefined;
        client_id?: string | undefined;
        client_secret?: string | undefined;
        icon_url?: string | undefined;
        callback_url?: string | undefined;
    }, {
        domain?: string | undefined;
        client_id?: string | undefined;
        client_secret?: string | undefined;
        icon_url?: string | undefined;
        callback_url?: string | undefined;
    }>;
    readonly adfs: (options?: AdfsOptions) => z.ZodEffects<z.ZodObject<{
        meta_data_source: z.ZodString;
        meta_data_location_url: z.ZodString | z.ZodEffects<z.ZodOptional<z.ZodString>, string | undefined, string | undefined>;
        adfs_server: z.ZodString | z.ZodEffects<z.ZodOptional<z.ZodString>, string | undefined, string | undefined>;
        fedMetadataXml: z.ZodString | z.ZodEffects<z.ZodOptional<z.ZodString>, string | undefined, string | undefined>;
    }, "strip", z.ZodTypeAny, {
        meta_data_source: string;
        meta_data_location_url?: string | undefined;
        adfs_server?: string | undefined;
        fedMetadataXml?: string | undefined;
    }, {
        meta_data_source: string;
        meta_data_location_url?: string | undefined;
        adfs_server?: string | undefined;
        fedMetadataXml?: string | undefined;
    }>, {
        meta_data_source: string;
        meta_data_location_url?: string | undefined;
        adfs_server?: string | undefined;
        fedMetadataXml?: string | undefined;
    }, {
        meta_data_source: string;
        meta_data_location_url?: string | undefined;
        adfs_server?: string | undefined;
        fedMetadataXml?: string | undefined;
    }>;
    readonly 'google-apps': (options?: GoogleAppsOptions) => z.ZodObject<{
        domain: z.ZodString | z.ZodEffects<z.ZodOptional<z.ZodString>, string | undefined, string | undefined>;
        client_id: z.ZodString | z.ZodEffects<z.ZodOptional<z.ZodString>, string | undefined, string | undefined>;
        client_secret: z.ZodString | z.ZodEffects<z.ZodOptional<z.ZodString>, string | undefined, string | undefined>;
        icon_url: z.ZodString | z.ZodEffects<z.ZodOptional<z.ZodString>, string | undefined, string | undefined>;
        callback_url: z.ZodString | z.ZodEffects<z.ZodOptional<z.ZodString>, string | undefined, string | undefined>;
    }, "strip", z.ZodTypeAny, {
        domain?: string | undefined;
        client_id?: string | undefined;
        client_secret?: string | undefined;
        icon_url?: string | undefined;
        callback_url?: string | undefined;
    }, {
        domain?: string | undefined;
        client_id?: string | undefined;
        client_secret?: string | undefined;
        icon_url?: string | undefined;
        callback_url?: string | undefined;
    }>;
    readonly oidc: (options?: OidcOptions) => z.ZodEffects<z.ZodObject<{
        type: z.ZodString | z.ZodEffects<z.ZodOptional<z.ZodString>, string | undefined, string | undefined>;
        client_id: z.ZodString | z.ZodEffects<z.ZodOptional<z.ZodString>, string | undefined, string | undefined>;
        client_secret: z.ZodString | z.ZodEffects<z.ZodOptional<z.ZodString>, string | undefined, string | undefined>;
        discovery_url: z.ZodString | z.ZodEffects<z.ZodOptional<z.ZodString>, string | undefined, string | undefined>;
    }, "strip", z.ZodTypeAny, {
        type?: string | undefined;
        client_id?: string | undefined;
        client_secret?: string | undefined;
        discovery_url?: string | undefined;
    }, {
        type?: string | undefined;
        client_id?: string | undefined;
        client_secret?: string | undefined;
        discovery_url?: string | undefined;
    }>, {
        type?: string | undefined;
        client_id?: string | undefined;
        client_secret?: string | undefined;
        discovery_url?: string | undefined;
    }, {
        type?: string | undefined;
        client_id?: string | undefined;
        client_secret?: string | undefined;
        discovery_url?: string | undefined;
    }>;
    readonly pingfederate: (options?: PingFederateOptions) => z.ZodObject<{
        pingFederateBaseUrl: z.ZodString | z.ZodEffects<z.ZodOptional<z.ZodString>, string | undefined, string | undefined>;
        signatureAlgorithm: z.ZodString | z.ZodEffects<z.ZodOptional<z.ZodString>, string | undefined, string | undefined>;
        digestAlgorithm: z.ZodString | z.ZodEffects<z.ZodOptional<z.ZodString>, string | undefined, string | undefined>;
        signSAMLRequest: z.ZodBoolean | z.ZodOptional<z.ZodBoolean>;
        signingCert: z.ZodString | z.ZodEffects<z.ZodOptional<z.ZodString>, string | undefined, string | undefined>;
        cert: z.ZodString | z.ZodEffects<z.ZodOptional<z.ZodString>, string | undefined, string | undefined>;
        idpInitiated: z.ZodOptional<z.ZodObject<{
            enabled: z.ZodOptional<z.ZodBoolean>;
            client_id: z.ZodOptional<z.ZodString>;
            client_protocol: z.ZodOptional<z.ZodString>;
            client_authorizequery: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            client_id?: string | undefined;
            enabled?: boolean | undefined;
            client_protocol?: string | undefined;
            client_authorizequery?: string | undefined;
        }, {
            client_id?: string | undefined;
            enabled?: boolean | undefined;
            client_protocol?: string | undefined;
            client_authorizequery?: string | undefined;
        }>>;
        icon_url: z.ZodString | z.ZodEffects<z.ZodOptional<z.ZodString>, string | undefined, string | undefined>;
    }, "strip", z.ZodTypeAny, {
        icon_url?: string | undefined;
        pingFederateBaseUrl?: string | undefined;
        signatureAlgorithm?: string | undefined;
        digestAlgorithm?: string | undefined;
        signSAMLRequest?: boolean | undefined;
        signingCert?: string | undefined;
        cert?: string | undefined;
        idpInitiated?: {
            client_id?: string | undefined;
            enabled?: boolean | undefined;
            client_protocol?: string | undefined;
            client_authorizequery?: string | undefined;
        } | undefined;
    }, {
        icon_url?: string | undefined;
        pingFederateBaseUrl?: string | undefined;
        signatureAlgorithm?: string | undefined;
        digestAlgorithm?: string | undefined;
        signSAMLRequest?: boolean | undefined;
        signingCert?: string | undefined;
        cert?: string | undefined;
        idpInitiated?: {
            client_id?: string | undefined;
            enabled?: boolean | undefined;
            client_protocol?: string | undefined;
            client_authorizequery?: string | undefined;
        } | undefined;
    }>;
    readonly samlp: (options?: SamlpOptions) => z.ZodObject<{
        meta_data_source: z.ZodString;
        single_sign_on_login_url: z.ZodString | z.ZodEffects<z.ZodOptional<z.ZodString>, string | undefined, string | undefined>;
        signatureAlgorithm: z.ZodString | z.ZodEffects<z.ZodOptional<z.ZodString>, string | undefined, string | undefined>;
        digestAlgorithm: z.ZodString | z.ZodEffects<z.ZodOptional<z.ZodString>, string | undefined, string | undefined>;
        protocolBinding: z.ZodString | z.ZodEffects<z.ZodOptional<z.ZodString>, string | undefined, string | undefined>;
        signSAMLRequest: z.ZodBoolean | z.ZodOptional<z.ZodBoolean>;
        bindingMethod: z.ZodString | z.ZodEffects<z.ZodOptional<z.ZodString>, string | undefined, string | undefined>;
        metadataUrl: z.ZodString | z.ZodEffects<z.ZodOptional<z.ZodString>, string | undefined, string | undefined>;
        cert: z.ZodString | z.ZodEffects<z.ZodOptional<z.ZodString>, string | undefined, string | undefined>;
        idpInitiated: z.ZodOptional<z.ZodObject<{
            enabled: z.ZodOptional<z.ZodBoolean>;
            client_id: z.ZodOptional<z.ZodString>;
            client_protocol: z.ZodOptional<z.ZodString>;
            client_authorizequery: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            client_id?: string | undefined;
            enabled?: boolean | undefined;
            client_protocol?: string | undefined;
            client_authorizequery?: string | undefined;
        }, {
            client_id?: string | undefined;
            enabled?: boolean | undefined;
            client_protocol?: string | undefined;
            client_authorizequery?: string | undefined;
        }>>;
        icon_url: z.ZodString | z.ZodEffects<z.ZodOptional<z.ZodString>, string | undefined, string | undefined>;
    }, "strip", z.ZodTypeAny, {
        meta_data_source: string;
        icon_url?: string | undefined;
        signatureAlgorithm?: string | undefined;
        digestAlgorithm?: string | undefined;
        signSAMLRequest?: boolean | undefined;
        cert?: string | undefined;
        idpInitiated?: {
            client_id?: string | undefined;
            enabled?: boolean | undefined;
            client_protocol?: string | undefined;
            client_authorizequery?: string | undefined;
        } | undefined;
        single_sign_on_login_url?: string | undefined;
        protocolBinding?: string | undefined;
        bindingMethod?: string | undefined;
        metadataUrl?: string | undefined;
    }, {
        meta_data_source: string;
        icon_url?: string | undefined;
        signatureAlgorithm?: string | undefined;
        digestAlgorithm?: string | undefined;
        signSAMLRequest?: boolean | undefined;
        cert?: string | undefined;
        idpInitiated?: {
            client_id?: string | undefined;
            enabled?: boolean | undefined;
            client_protocol?: string | undefined;
            client_authorizequery?: string | undefined;
        } | undefined;
        single_sign_on_login_url?: string | undefined;
        protocolBinding?: string | undefined;
        bindingMethod?: string | undefined;
        metadataUrl?: string | undefined;
    }>;
    readonly waad: (options?: WaadOptions) => z.ZodObject<{
        tenant_domain: z.ZodString | z.ZodEffects<z.ZodOptional<z.ZodString>, string | undefined, string | undefined>;
        client_id: z.ZodString | z.ZodEffects<z.ZodOptional<z.ZodString>, string | undefined, string | undefined>;
        client_secret: z.ZodString | z.ZodEffects<z.ZodOptional<z.ZodString>, string | undefined, string | undefined>;
        icon_url: z.ZodString | z.ZodEffects<z.ZodOptional<z.ZodString>, string | undefined, string | undefined>;
        callback_url: z.ZodString | z.ZodEffects<z.ZodOptional<z.ZodString>, string | undefined, string | undefined>;
    }, "strip", z.ZodTypeAny, {
        client_id?: string | undefined;
        client_secret?: string | undefined;
        icon_url?: string | undefined;
        callback_url?: string | undefined;
        tenant_domain?: string | undefined;
    }, {
        client_id?: string | undefined;
        client_secret?: string | undefined;
        icon_url?: string | undefined;
        callback_url?: string | undefined;
        tenant_domain?: string | undefined;
    }>;
};
/**
 * Creates a schema for Step 1: Provider Selection
 */
declare const createProviderSelectionSchema: (options?: ProviderSelectionSchema) => z.ZodObject<{
    strategy: z.ZodEnum<[IdpStrategy, ...IdpStrategy[]]>;
}, "strip", z.ZodTypeAny, {
    strategy: IdpStrategy;
}, {
    strategy: IdpStrategy;
}>;
/**
 * Creates a schema for Step 2: Provider Details
 */
declare const createProviderDetailsSchema: (options?: ProviderDetailsSchema) => z.ZodObject<{
    name: z.ZodString;
    display_name: z.ZodString;
}, "strip", z.ZodTypeAny, {
    name: string;
    display_name: string;
}, {
    name: string;
    display_name: string;
}>;
type StrategySchemaMap = {
    okta: ReturnType<typeof STRATEGY_BUILDERS.okta>;
    adfs: ReturnType<typeof STRATEGY_BUILDERS.adfs>;
    'google-apps': ReturnType<(typeof STRATEGY_BUILDERS)['google-apps']>;
    oidc: ReturnType<typeof STRATEGY_BUILDERS.oidc>;
    pingfederate: ReturnType<(typeof STRATEGY_BUILDERS)['pingfederate']>;
    samlp: ReturnType<typeof STRATEGY_BUILDERS.samlp>;
    waad: ReturnType<typeof STRATEGY_BUILDERS.waad>;
};
/**
 * Creates a dynamic schema for Step 3: Provider Configuration based on strategy
 */
declare function createProviderConfigureSchema<T extends IdpStrategy>(strategy: T, options?: ProviderConfigureSchema): StrategySchemaMap[T];
/**
 * Creates a complete schema for SSO provider form validation
 */
/**
 * Creates a complete schema for SSO provider form validation that combines all three steps
 */
declare const createSsoProviderSchema: (options?: SsoProviderSchema) => z.ZodObject<{
    strategy: z.ZodEnum<[IdpStrategy, ...IdpStrategy[]]>;
} & {
    name: z.ZodString;
    display_name: z.ZodString;
}, "strip", z.ZodTypeAny, {
    name: string;
    display_name: string;
    strategy: IdpStrategy;
}, {
    name: string;
    display_name: string;
    strategy: IdpStrategy;
}>;
declare const providerSelectionSchema: z.ZodObject<{
    strategy: z.ZodEnum<[IdpStrategy, ...IdpStrategy[]]>;
}, "strip", z.ZodTypeAny, {
    strategy: IdpStrategy;
}, {
    strategy: IdpStrategy;
}>;
declare const providerDetailsSchema: z.ZodObject<{
    name: z.ZodString;
    display_name: z.ZodString;
}, "strip", z.ZodTypeAny, {
    name: string;
    display_name: string;
}, {
    name: string;
    display_name: string;
}>;
declare const ssoProviderSchema: z.ZodObject<{
    strategy: z.ZodEnum<[IdpStrategy, ...IdpStrategy[]]>;
} & {
    name: z.ZodString;
    display_name: z.ZodString;
}, "strip", z.ZodTypeAny, {
    name: string;
    display_name: string;
    strategy: IdpStrategy;
}, {
    name: string;
    display_name: string;
    strategy: IdpStrategy;
}>;
type ProviderSelectionFormValues = z.infer<typeof providerSelectionSchema>;
type ProviderDetailsFormValues = z.infer<typeof providerDetailsSchema>;
type SsoProviderFormValues = z.infer<typeof ssoProviderSchema>;
type OktaConfigureFormValues = z.infer<ReturnType<typeof STRATEGY_BUILDERS.okta>>;
type AdfsConfigureFormValues = z.infer<ReturnType<typeof STRATEGY_BUILDERS.adfs>>;
type GoogleAppsConfigureFormValues = z.infer<ReturnType<(typeof STRATEGY_BUILDERS)['google-apps']>>;
type OidcConfigureFormValues = z.infer<ReturnType<typeof STRATEGY_BUILDERS.oidc>>;
type PingFederateConfigureFormValues = z.infer<ReturnType<(typeof STRATEGY_BUILDERS)['pingfederate']>>;
type SamlpConfigureFormValues = z.infer<ReturnType<typeof STRATEGY_BUILDERS.samlp>>;
type WaadConfigureFormValues = z.infer<ReturnType<typeof STRATEGY_BUILDERS.waad>>;
type ProviderConfigureFormValues = OktaConfigureFormValues | AdfsConfigureFormValues | GoogleAppsConfigureFormValues | OidcConfigureFormValues | PingFederateConfigureFormValues | SamlpConfigureFormValues | WaadConfigureFormValues;

interface SsoProviderDeleteSchema {
    providerName?: {
        required?: boolean;
        errorMessage?: string;
        exactMatch?: string;
    };
}

/**
 * Creates a schema for delete SSO provider confirmation
 */
declare const createDeleteProviderSchema: (expectedProviderName: string, options?: SsoProviderDeleteSchema) => z.ZodObject<{
    providerName: z.ZodEffects<z.ZodString, string, string>;
}, "strip", z.ZodTypeAny, {
    providerName: string;
}, {
    providerName: string;
}>;
/**
 * Default schema for delete provider validation
 */
declare const deleteProviderSchema: (expectedProviderName: string) => z.ZodObject<{
    providerName: z.ZodEffects<z.ZodString, string, string>;
}, "strip", z.ZodTypeAny, {
    providerName: string;
}, {
    providerName: string;
}>;
/**
 * Type definitions
 */
type DeleteProviderFormValues = z.infer<ReturnType<typeof deleteProviderSchema>>;

/**
 * Schema configuration for Provisioning Details
 */
interface ProvisioningDetailsSchema {
    userIdAttribute?: FieldOptions;
    scimEndpointUrl?: FieldOptions;
}
interface SsoProvisioningSchema extends ProvisioningDetailsSchema {
}

/**
 * Creates a schema for Provisioning Details form validation
 */
declare const createProvisioningDetailsSchema: (options?: ProvisioningDetailsSchema) => z.ZodObject<{
    userIdAttribute: z.ZodString | z.ZodEffects<z.ZodOptional<z.ZodString>, string | undefined, string | undefined>;
    scimEndpointUrl: z.ZodOptional<z.ZodString> | z.ZodOptional<z.ZodEffects<z.ZodOptional<z.ZodString>, string | undefined, string | undefined>>;
}, "strip", z.ZodTypeAny, {
    userIdAttribute?: string | undefined;
    scimEndpointUrl?: string | undefined;
}, {
    userIdAttribute?: string | undefined;
    scimEndpointUrl?: string | undefined;
}>;
/**
 * Creates a complete schema for SSO provisioning form validation
 */
declare const createSsoProvisioningSchema: (options?: SsoProvisioningSchema) => z.ZodObject<{
    userIdAttribute: z.ZodString | z.ZodEffects<z.ZodOptional<z.ZodString>, string | undefined, string | undefined>;
    scimEndpointUrl: z.ZodOptional<z.ZodString> | z.ZodOptional<z.ZodEffects<z.ZodOptional<z.ZodString>, string | undefined, string | undefined>>;
}, "strip", z.ZodTypeAny, {
    userIdAttribute?: string | undefined;
    scimEndpointUrl?: string | undefined;
}, {
    userIdAttribute?: string | undefined;
    scimEndpointUrl?: string | undefined;
}>;
declare const provisioningDetailsSchema: z.ZodObject<{
    userIdAttribute: z.ZodString | z.ZodEffects<z.ZodOptional<z.ZodString>, string | undefined, string | undefined>;
    scimEndpointUrl: z.ZodOptional<z.ZodString> | z.ZodOptional<z.ZodEffects<z.ZodOptional<z.ZodString>, string | undefined, string | undefined>>;
}, "strip", z.ZodTypeAny, {
    userIdAttribute?: string | undefined;
    scimEndpointUrl?: string | undefined;
}, {
    userIdAttribute?: string | undefined;
    scimEndpointUrl?: string | undefined;
}>;
declare const ssoProvisioningSchema: z.ZodObject<{
    userIdAttribute: z.ZodString | z.ZodEffects<z.ZodOptional<z.ZodString>, string | undefined, string | undefined>;
    scimEndpointUrl: z.ZodOptional<z.ZodString> | z.ZodOptional<z.ZodEffects<z.ZodOptional<z.ZodString>, string | undefined, string | undefined>>;
}, "strip", z.ZodTypeAny, {
    userIdAttribute?: string | undefined;
    scimEndpointUrl?: string | undefined;
}, {
    userIdAttribute?: string | undefined;
    scimEndpointUrl?: string | undefined;
}>;
type ProvisioningDetailsFormValues = z.infer<typeof provisioningDetailsSchema>;
type SsoProvisioningFormValues = z.infer<typeof ssoProvisioningSchema>;

interface SsoProviderDetailsSchema extends ProviderDetailsSchema, ProviderConfigureSchema {
}

interface DomainCreateSchemas {
    domainUrl?: {
        regex?: RegExp;
        errorMessage?: string;
    };
}

/**
 * Creates a schema for domain create form validation
 * @param options - Schema configuration options
 * @param defaultErrorMessage - Default error message for validation failures
 */
declare const createDomainCreateSchema: (options?: DomainCreateSchemas, defaultErrorMessage?: string) => z.ZodObject<{
    domain_url: z.ZodString | z.ZodEffects<z.ZodOptional<z.ZodString>, string | undefined, string | undefined>;
}, "strip", z.ZodTypeAny, {
    domain_url?: string | undefined;
}, {
    domain_url?: string | undefined;
}>;
/**
 * Default schema for domain create form validation
 */
declare const domainCreateSchema: z.ZodObject<{
    domain_url: z.ZodString | z.ZodEffects<z.ZodOptional<z.ZodString>, string | undefined, string | undefined>;
}, "strip", z.ZodTypeAny, {
    domain_url?: string | undefined;
}, {
    domain_url?: string | undefined;
}>;
/**
 * Type for domain create form data
 */
type InternalDomainCreateFormValues = z.infer<typeof domainCreateSchema>;

declare const AppleLogoSvg: string;
declare const GoogleLogoSvg: string;
declare const MicrosoftLogoSvg: string;
declare const OidcLogoSvg: string;
declare const OktaLogoSvg: string;
declare const PingIdLogoSvg: string;
declare const SamlpLogoSvg: string;
declare const EntraIdLogoSvg: string;

export { AVAILABLE_STRATEGY_LIST, type ActionButton, type AdfsConfigureFormValues, AppleLogoSvg, type AuthDetails, type Authenticator, type BackButton, type BasicAuth0ContextInterface, type BlockComponentSharedProps, type BooleanFieldOptions, BusinessError, type BusinessErrorData, COMMON_FIELD_CONFIGS, type ComponentAction, type ComponentStyling, type ConfirmEnrollmentOptions, type CoreClientInterface, type CreateAuthenticationMethodRequestContent, type CreateAuthenticationMethodResponseContent, type CreateDomainRequestContentPrivate, type CreateIdPProvisioningConfigResponseContent, type CreateIdentityProviderRequestContent, type CreateIdentityProviderRequestContentPrivate, type CreateIdentityProviderResponseContent, type CreateIdpDomainRequestContent, type CreateIdpDomainResponseContent, type CreateIdpProvisioningScimTokenRequestContent, type CreateIdpProvisioningScimTokenResponseContent, type CreateOrganizationDomainRequestContent, type CreateOrganizationDomainResponseContent, DEFAULT_COLORS, DOMAIN_REGEX, type DeleteProviderFormValues, type DetachIdpProviderResponseContent, type Domain, type DomainConfigureMessages, type DomainCreate, type DomainCreateMessages, type DomainCreateSchemas, type DomainDeleteMessages, type DomainTabCreateMessages, type DomainTabDeleteMessages, type DomainTabVerifyMessages, type DomainTableMessages, type DomainValidationOptions, type DomainVerifyMessages, type EmailContactForm, EmailContactSchema, type EnhancedTranslationFunction, type EnrollOptions, EntraIdLogoSvg, FACTOR_TYPE_EMAIL, FACTOR_TYPE_PHONE, FACTOR_TYPE_PUSH_NOTIFICATION, FACTOR_TYPE_RECOVERY_CODE, FACTOR_TYPE_TOTP, FACTOR_TYPE_WEBAUTHN_PLATFORM, FACTOR_TYPE_WEBAUTHN_ROAMING, type FieldConfig, type FieldOptions, type GetIdPProvisioningConfigResponseContent, type GetIdentityProviderResponseContent, type GetOrganizationDetailsResponseContent, type GetOrganizationDomainResponseContent, type GoogleAppsConfigureFormValues, GoogleLogoSvg, type I18nInitOptions, type I18nServiceInterface, I18nUtils, type IdentityProvider, type IdentityProviderAssociatedWithDomain, type IdentityProviderCreate, type IdpId, type IdpProvisioningConfig, type IdpScimTokenBase, type IdpStrategy, type IdpUpdateBase, type InternalDomainCreateFormValues, type InternalOrganizationDetailsFormValues, type LangTranslations, type ListAuthenticationMethodsResponseContent, type ListFactorsResponseContent, type ListIdentityProvidersResponseContent, type ListIdpProvisioningScimTokensResponseContent, type LogoValidationOptions, type MFAControllerInterface, type MFAFactorContent, MFAMappers, type MFAMessages, type MFAType, MY_ORG_DETAILS_EDIT_SCOPES, MY_ORG_DOMAIN_SCOPES, MY_ORG_SSO_PROVIDER_CREATE_SCOPES, MY_ORG_SSO_PROVIDER_EDIT_SCOPES, MY_ORG_SSO_PROVIDER_TABLE_SCOPES, type MergedStyles, MicrosoftLogoSvg, type OidcConfigureFormValues, OidcLogoSvg, type OktaConfigureFormValues, OktaLogoSvg, type OrgDeleteMessages, type OrgDetailsEditMessages, OrgDetailsFactory, OrgDetailsMappers, type OrgDetailsMessages, type OrgDetailsSchemas, type Organization, type OrganizationDetailsFormValues, type OrganizationPrivate, type PathAuthenticationMethodId, type PingFederateConfigureFormValues, PingIdLogoSvg, type ProviderConfigureFieldsMessages, type ProviderConfigureFormValues, type ProviderConfigureMessages, type ProviderConfigureSchema, type ProviderDetailsFormValues, type ProviderDetailsMessages, type ProviderDetailsSchema, type ProviderSelectMessages, type ProviderSelectionFormValues, type ProviderSelectionSchema, type Provisioning, type ProvisioningCreateTokenModalContentMessages, type ProvisioningCreateTokenModalMessages, type ProvisioningDeleteTokenModalContentMessages, type ProvisioningDeleteTokenModalMessages, type ProvisioningDetailsFormValues, type ProvisioningDetailsSchema, type ProvisioningField, type ProvisioningFieldMap, type ProvisioningFieldMappingsMessages, type ProvisioningManageTokenMessages, type SCIMToken, type SCIMTokenCreate, STRATEGIES, STRATEGY_DISPLAY_NAMES, SUPPORTED_FACTOR_TYPES, type SafeAny, type SamlpConfigureFormValues, SamlpLogoSvg, type SharedComponentProps, type SmsContactForm, SmsContactSchema, type SsoDomainTabMessages, type SsoProvideDeleteMessages, type SsoProvideRemoveMessages, type SsoProviderCreateMessages, type SsoProviderDeleteModalContentMessages, type SsoProviderDeleteSchema, type SsoProviderDetailsMessages, type SsoProviderDetailsSchema, type SsoProviderEditMessages, type SsoProviderFormValues, SsoProviderMappers, type SsoProviderNotificationMessages, type SsoProviderSchema, type SsoProviderTabMessages, type SsoProviderTableMessages, type SsoProvisioningDeleteMessages, type SsoProvisioningDeleteModalContentMessages, type SsoProvisioningDetailsMessages, type SsoProvisioningFormValues, type SsoProvisioningSchema, type SsoProvisioningTabMessages, type StringValidationOptions, type StylingVariables, type TFactory, type TranslationFunction, USER_MFA_SCOPES, type UpdateIdentityProviderRequestContent, type UpdateIdentityProviderRequestContentPrivate, type UpdateIdentityProviderResponseContent, type UpdateOrganizationDetailsRequestContent, type UpdateOrganizationDetailsResponseContent, type VerifyAuthenticationMethodRequestContent, type VerifyAuthenticationMethodResponseContent, type WaadConfigureFormValues, applyStyleOverrides, buildEnrollParams, createBooleanSchema, createCoreClient, createDeleteProviderSchema, createDomainCreateSchema, createDomainSchema, createEmailContactSchema, createFieldSchema, createI18nService, createLogoSchema, createOrganizationDetailSchema, createProviderConfigureSchema, createProviderDetailsSchema, createProviderSelectionSchema, createProvisioningDetailsSchema, createSmsContactSchema, createSsoProviderSchema, createSsoProvisioningSchema, createStringSchema, deleteProviderSchema, domainCreateSchema, getComponentStyles, getCoreStyles, getStatusCode, hasApiErrorBody, isApiError, isBusinessError, normalizeError, organizationDetailSchema, providerDetailsSchema, providerSelectionSchema, provisioningDetailsSchema, ssoProviderSchema, ssoProvisioningSchema, transformMyAccountFactors };

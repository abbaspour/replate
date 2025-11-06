import * as react_jsx_runtime from 'react/jsx-runtime';
import * as React from 'react';
import React__default, { ReactNode } from 'react';
import { StylingVariables, AuthDetails, SharedComponentProps, MFAMessages, MFAType, EnrollOptions, CreateAuthenticationMethodResponseContent, ConfirmEnrollmentOptions, Authenticator, ActionButton, OrganizationPrivate, OrgDetailsSchemas as OrgDetailsSchemas$1, OrgDetailsMessages, OrganizationDetailsFormValues, BlockComponentSharedProps, OrgDetailsEditMessages, ComponentAction, BackButton, SsoProviderTableMessages, SsoProviderDeleteSchema, IdentityProvider as IdentityProvider$1, SsoProviderCreateMessages, SsoProviderSchema, CreateIdentityProviderRequestContentPrivate, SsoProviderFormValues, ProviderSelectMessages, IdpStrategy, ProviderSelectionFormValues, ProviderDetailsMessages, ProviderDetailsFormValues, ProviderConfigureMessages, ProviderConfigureFormValues, ProviderConfigureFieldsMessages, DomainCreateSchemas, Domain, SsoDomainTabMessages, CreateIdPProvisioningConfigResponseContent, CreateIdpProvisioningScimTokenResponseContent, SsoProviderDetailsSchema, SsoProviderEditMessages, IdpId, DomainTableMessages, DomainCreateMessages, DomainConfigureMessages, DomainVerifyMessages, DomainDeleteMessages, IdentityProviderAssociatedWithDomain, CreateOrganizationDomainRequestContent, EnhancedTranslationFunction, CoreClientInterface, I18nInitOptions, OrgDeleteMessages, Organization } from '@auth0/web-ui-components-core';
export { Domain } from '@auth0/web-ui-components-core';
import { LucideIcon } from 'lucide-react';
import { UseFormReturn } from 'react-hook-form';

/**
 * Internationalization configuration for Auth0 components.
 */
interface I18nOptions {
    currentLanguage: string;
    fallbackLanguage?: string;
}

/**
 * Theme configuration
 * @property {('light'|'dark')} [mode] - Theme mode
 * @property {string} [primaryColor] - Primary color for theming
 */
interface ThemeSettings {
    theme?: 'default' | 'minimal' | 'rounded';
    mode?: 'light' | 'dark';
    variables?: StylingVariables;
}
/**
 * ThemeInput
 *
 * Optional props passed into the ThemeProvider.
 */
type ThemeInput = {
    theme?: 'default' | 'minimal' | 'rounded';
    mode?: 'light' | 'dark';
    variables?: StylingVariables;
    loader?: React__default.ReactNode;
};
/**
 * ThemeContextValue
 *
 * The values made available through the ThemeContext.
 */
type ThemeContextValue = {
    theme?: 'default' | 'minimal' | 'rounded';
    isDarkMode?: boolean;
    variables: StylingVariables;
    loader: React__default.ReactNode | null;
};

/**
 * Props for the Auth0ComponentProvider component.
 */
interface Auth0ComponentProviderProps {
    i18n?: I18nOptions;
    themeSettings?: ThemeSettings;
    authDetails: AuthDetails;
    loader?: React.ReactNode;
}

/**
 * Auth0ComponentProvider
 *
 * The main Auth0 context provider component that conditionally
 * renders either the Proxy Mode or SPA Mode provider based on the presence
 * of `authProxyUrl`.
 *
 * - **Proxy Mode:** Used when authentication is handled externally via a proxy server.
 * - **SPA Mode:** Used when authentication is handled client-side using the Auth0 SPA SDK.
 *
 * This component abstracts the complexity of choosing the correct mode from the end user.
 *
 * @param {Object} props - Configuration props.
 * @param {React.ReactNode} props.children - Child components that require authentication context.
 * @param {Object} [props.i18n] - Internationalization configuration (e.g., current language, fallback language).
 * @param {Object} [props.themeSettings] - Theme settings including mode, theme and style overrides.
 * @param {string} [props.themeSettings.mode] - Theme mode, either "light" or "dark". Defaults to "light".
 * @param {string} [props.themeSettings.theme] - Theme , either "default", minimal or "rounded". Defaults to "default".
 * @param {Object} [props.themeSettings.variables] - CSS variable overrides for customizing the theme.
 * @param {React.ReactNode} [props.loader] - Custom loading component to show while
 *                                           authentication is initializing.
 *                                           Defaults to a spinner.
 * @param {Object} [props.authDetails] - Authentication details, including `authProxyUrl`.
 *
 * @returns {JSX.Element} The provider component for Auth0 context.
 *
 * @example
 * ```tsx
 * <Auth0ComponentProvider
 *   authDetails={{ authProxyUrl: "/api/auth" }}
 *   i18n={{ currentLanguage: "en", fallbackLanguage: "en" }}
 *   themeSettings={{
 *     theme: 'default
 *     mode: "dark",
 *     variables: {
 *         common: {
 *           "--font-size-heading": "1.5rem",
 *           "--font-size-title": "1.25rem",
 *         },
 *         light: {
 *           "--color-primary": "blue",
 *         },
 *         dark: {
 *           "--color-primary": "red",
 *         },
 *       }
 *   }}
 *  loader={<div>Loading...</div>}
 * >
 *   <App />
 * </Auth0ComponentProvider>
 * ```
 */
declare const Auth0ComponentProvider: ({ i18n, authDetails, themeSettings, loader, children, }: Auth0ComponentProviderProps & {
    children: React.ReactNode;
}) => react_jsx_runtime.JSX.Element;

/**
 * ThemeContext
 *
 * Provides access to customer overrides and a merged theme object for convenience.
 */
declare const ThemeContext: React.Context<ThemeContextValue>;
/**
 * ThemeProvider
 *
 * Provides theme configuration via React Context to all components in the tree.
 * It merges optional styling overrides (CSS variables).
 *
 * @param themeSettings - Optional styling overrides
 * @param children - The components that will have access to the theme
 *
 * @example
 * ```tsx
 * <ThemeProvider
 *   themeSettings={{
 *     theme: "default" | "minimal" | "rounded";
 *     mode: 'dark',
 *     variables: {
 *       common: {
 *         "--font-size-heading": "1.5rem",
 *         "--font-size-title": "1.25rem",
 *       },
 *       light: {
 *         "--color-primary": "blue",
 *       },
 *       dark: {
 *         "--color-primary": "red",
 *       },
 *     },
 *     loader: <CustomSpinner />
 *   }}
 * >
 *   <App />
 * </ThemeProvider>
 * ```
 */
declare const ThemeProvider: React.FC<{
    themeSettings?: ThemeInput;
    children: React.ReactNode;
}>;

declare const ScopeManagerProvider: React__default.FC<{
    children: ReactNode;
}>;

declare const ENROLL = "enroll";
declare const CONFIRM = "confirm";

interface UserMFAMgmtClasses {
    'UserMFAMgmt-card'?: string;
    'UserMFASetupForm-dialogContent'?: string;
    'DeleteFactorConfirmation-dialogContent'?: string;
}
interface UserMFAMgmtProps extends SharedComponentProps<MFAMessages, UserMFAMgmtClasses, {
    email?: RegExp;
    phone?: RegExp;
}> {
    hideHeader?: boolean;
    showActiveOnly?: boolean;
    disableEnroll?: boolean;
    disableDelete?: boolean;
    readOnly?: boolean;
    factorConfig?: {
        [key in MFAType]?: {
            visible?: boolean;
            enabled?: boolean;
        };
    };
    onEnroll?: () => void;
    onDelete?: () => void;
    onFetch?: () => void;
    onErrorAction?: (error: Error, action: 'enroll' | 'delete' | 'confirm') => void;
    onBeforeAction?: (action: 'enroll' | 'delete' | 'confirm', factorType: MFAType) => boolean | Promise<boolean>;
}
interface ContactInputFormProps extends SharedComponentProps<MFAMessages, UserMFAMgmtClasses, {
    email?: RegExp;
    phone?: RegExp;
}> {
    factorType: MFAType;
    enrollMfa: (factorType: MFAType, options: Record<string, string>) => Promise<CreateAuthenticationMethodResponseContent>;
    confirmEnrollment: (factorType: MFAType, authSession: string, authenticationMethodId: string, options: {
        userOtpCode?: string;
    }) => Promise<unknown | null>;
    onError: (error: Error, stage: typeof ENROLL | typeof CONFIRM) => void;
    onSuccess: () => void;
    onClose: () => void;
}
interface DeleteFactorConfirmationProps extends SharedComponentProps<MFAMessages, UserMFAMgmtClasses> {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    factorToDelete: {
        id: string;
        type: MFAType;
    } | null;
    isDeletingFactor: boolean;
    onConfirm: (factorId: string) => void;
    onCancel: () => void;
}
interface OTPVerificationFormProps extends SharedComponentProps<MFAMessages, UserMFAMgmtClasses> {
    factorType: MFAType;
    authSession: string;
    authenticationMethodId: string;
    confirmEnrollment: (factorType: MFAType, authSession: string, authenticationMethodId: string, options: {
        userOtpCode?: string;
    }) => Promise<unknown | null>;
    onError: (error: Error, stage: typeof CONFIRM) => void;
    onSuccess: () => void;
    onClose: () => void;
    oobCode?: string;
    contact?: string;
    recoveryCode?: string;
    onBack?: () => void;
}
interface QRCodeEnrollmentFormProps extends SharedComponentProps<MFAMessages, UserMFAMgmtClasses> {
    factorType: MFAType;
    enrollMfa: (factorType: MFAType, options: Record<string, string>) => Promise<CreateAuthenticationMethodResponseContent>;
    confirmEnrollment: (factorType: MFAType, authSession: string, authenticationMethodId: string, options: {
        userOtpCode?: string;
    }) => Promise<unknown | null>;
    onError: (error: Error, stage: typeof ENROLL | typeof CONFIRM) => void;
    onSuccess: () => void;
    onClose: () => void;
}
interface UserMFASetupFormProps extends SharedComponentProps<MFAMessages, UserMFAMgmtClasses> {
    open: boolean;
    onClose: () => void;
    factorType: MFAType;
    enrollMfa: (factorType: MFAType, options: Record<string, string>) => Promise<CreateAuthenticationMethodResponseContent>;
    confirmEnrollment: (factorType: MFAType, authSession: string, authenticationMethodId: string, options: {
        userOtpCode?: string;
    }) => Promise<unknown | null>;
    onSuccess: () => void;
    onError: (error: Error, stage: typeof ENROLL | typeof CONFIRM) => void;
}
interface ShowRecoveryCodeProps extends SharedComponentProps<MFAMessages, UserMFAMgmtClasses> {
    recoveryCode: string;
    onSuccess: () => void;
    factorType: MFAType;
    authSession: string;
    authenticationMethodId: string;
    confirmEnrollment: (factorType: MFAType, authSession: string, authenticationMethodId: string, options: {
        userOtpCode?: string;
    }) => Promise<unknown | null>;
    onError?: (error: Error, stage: typeof CONFIRM) => void;
    onClose?: () => void;
    oobCode?: string;
    userOtp?: string;
    onBack?: () => void;
    loading?: boolean;
}
interface FactorsListProps extends SharedComponentProps<MFAMessages, UserMFAMgmtClasses> {
    factors: Authenticator[];
    factorType: MFAType;
    readOnly: boolean;
    isEnabledFactor: boolean;
    onDeleteFactor: (factorId: string, factorType: MFAType) => void;
    isDeletingFactor: boolean;
    disableDelete: boolean;
}
/**
 * Result returned by the `useMFA` hook.
 * Provides methods to fetch, enroll, and delete MFA authenticators.
 */
type UseMFAResult = {
    /**
     * Fetch the list of MFA authenticators grouped by factor type.
     * @param onlyActive - Whether to return only active authenticators.
     * @returns A promise resolving to factors grouped by type.
     */
    fetchFactors: (onlyActive?: boolean) => Promise<unknown>;
    /**
     * Enroll a new MFA factor (e.g., SMS, TOTP, Email).
     * @param factorName - The type of MFA to enroll.
     * @param options - Optional options like phone number or email.
     * @returns A promise resolving to the enrollment response.
     */
    enrollMfa: (factorType: MFAType, options?: EnrollOptions) => Promise<CreateAuthenticationMethodResponseContent>;
    /**
     * Delete an enrolled MFA authenticator by its ID.
     * @param authenticatorId - The ID of the authenticator to delete.
     * @returns A promise resolving to a success flag.
     */
    deleteMfa: (authenticatorId: string) => Promise<void>;
    confirmEnrollment: (factorType: MFAType, authSession: string, authenticationMethodId: string, options: ConfirmEnrollmentOptions) => Promise<unknown>;
};

declare const UserMFAMgmt: React.ComponentType<UserMFAMgmtProps>;

interface FormActionsProps<T = void> {
    hasUnsavedChanges?: boolean;
    isLoading?: boolean;
    nextAction?: Partial<ActionButton<T>>;
    previousAction?: Partial<ActionButton<T>>;
    showPrevious?: boolean;
    showNext?: boolean;
    showUnsavedChanges?: boolean;
    align?: 'left' | 'right';
    className?: string;
    unsavedChangesText?: string;
}

/**
 * Styling that can be used to override default styles.
 */
interface OrgDetailsClasses {
    OrgDetails_Card?: string;
    OrgDetails_FormActions?: string;
    OrgDetails_SettingsDetails?: string;
    OrgDetails_BrandingDetails?: string;
}
/**
 * Schemas that can be used to override default schemas.
 */
type OrgDetailsSchemas = OrgDetailsSchemas$1;
interface OrgDetailsFormActions extends Omit<FormActionsProps, 'nextAction'> {
    nextAction?: {
        disabled: boolean;
        onClick?: (data: OrganizationPrivate) => boolean | Promise<boolean>;
    };
}
interface OrgDetailsProps extends SharedComponentProps<OrgDetailsMessages, OrgDetailsClasses, OrgDetailsSchemas> {
    organization: OrganizationPrivate;
    isLoading?: boolean;
    formActions: OrgDetailsFormActions;
}
interface BrandingDetailsProps extends SharedComponentProps<OrgDetailsMessages, OrgDetailsClasses> {
    form: UseFormReturn<OrganizationDetailsFormValues>;
    className?: string;
}
interface SettingsDetailsProps extends SharedComponentProps<OrgDetailsMessages, OrgDetailsClasses> {
    form: UseFormReturn<OrganizationDetailsFormValues>;
    className?: string;
}

/**
 * Messages that extends both OrgDetails and OrgDelete messages.
 */
/**
 * Styling that can be used to override default styles.
 */
type OrgEditClasses = OrgDetailsClasses;
/**
 * Schemas that can be used to override default schemas.
 */
type OrgDetailsEditSchemas = {
    details?: OrgDetailsSchemas$1;
};
interface OrgEditSaveAction extends ComponentAction<OrganizationPrivate> {
}
interface OrgEditBackButton extends Omit<BackButton, 'onClick'> {
    icon?: LucideIcon;
    onClick: (e: React__default.MouseEvent<HTMLButtonElement>) => void;
}
interface OrgDetailsEditProps extends BlockComponentSharedProps<OrgDetailsEditMessages, OrgEditClasses, OrgDetailsEditSchemas> {
    saveAction?: ComponentAction<OrganizationPrivate>;
    cancelAction?: Omit<ComponentAction<OrganizationPrivate>, 'onBefore'>;
    hideHeader?: boolean;
    backButton?: OrgEditBackButton;
}
interface UseOrgDetailsEditOptions {
    saveAction?: OrgDetailsEditProps['saveAction'];
    cancelAction?: OrgDetailsEditProps['cancelAction'];
    readOnly?: OrgDetailsEditProps['readOnly'];
    customMessages?: OrgDetailsEditProps['customMessages'];
}
interface UseOrgDetailsEditResult {
    organization: OrganizationPrivate;
    isFetchLoading: boolean;
    isSaveLoading: boolean;
    isInitializing: boolean;
    formActions: OrgDetailsFormActions;
    fetchOrgDetails: () => Promise<void>;
    updateOrgDetails: (data: OrganizationPrivate) => Promise<boolean>;
}

declare const OrgDetailsEdit: React.ComponentType<OrgDetailsEditProps>;

type IdentityProvider = IdentityProvider$1;
interface SsoProviderTableSchema {
    delete?: SsoProviderDeleteSchema;
    remove?: SsoProviderDeleteSchema;
}
interface SsoProviderTableClasses {
    'SsoProviderTable-header'?: string;
    'SsoProviderTable-table'?: string;
    'SsoProviderTable-deleteProviderModal'?: string;
    'SsoProviderTable-deleteProviderFromOrgModal'?: string;
}
interface SsoProviderTableProps extends SharedComponentProps<SsoProviderTableMessages, SsoProviderTableClasses, SsoProviderTableSchema> {
    createAction: ComponentAction<void>;
    editAction: ComponentAction<IdentityProvider>;
    deleteAction?: ComponentAction<IdentityProvider>;
    deleteFromOrgAction?: ComponentAction<IdentityProvider>;
    enableProviderAction?: ComponentAction<IdentityProvider>;
}
interface UseSsoProviderTableReturn extends SharedComponentProps {
    providers: IdentityProvider[];
    organization: OrganizationPrivate | null;
    isLoading: boolean;
    isDeleting: boolean;
    isRemoving: boolean;
    isUpdating: boolean;
    fetchProviders: () => Promise<void>;
    fetchOrganizationDetails: () => Promise<OrganizationPrivate | null>;
    onDeleteConfirm: (selectedIdp: IdentityProvider) => Promise<void>;
    onRemoveConfirm: (selectedIdp: IdentityProvider) => Promise<void>;
    onEnableProvider: (selectedIdp: IdentityProvider, enabled: boolean) => Promise<boolean>;
}
interface SsoProviderTableActionsColumnProps extends SharedComponentProps<SsoProviderTableMessages, SsoProviderTableClasses, SsoProviderTableSchema> {
    provider: IdentityProvider;
    isUpdating?: boolean;
    edit?: {
        disabled?: boolean;
    };
    onToggleEnabled: (provider: IdentityProvider, enabled: boolean) => void;
    onEdit: (provider: IdentityProvider) => void;
    onDelete: (provider: IdentityProvider) => void;
    onRemoveFromOrg: (provider: IdentityProvider) => void;
}

declare const SsoProviderTable: React.ComponentType<SsoProviderTableProps>;

interface SsoProviderCreateClasses {
    'SsoProviderCreate-header'?: string;
    'SsoProviderCreate-wizard'?: string;
    'ProviderSelect-root'?: string;
    'ProviderDetails-root'?: string;
    'ProviderConfigure-root'?: string;
}
interface ProviderSelectProps extends SharedComponentProps<ProviderSelectMessages, SsoProviderCreateClasses> {
    strategyList: IdpStrategy[];
    onClickStrategy: (strategy: IdpStrategy) => void;
    selectedStrategy?: IdpStrategy | null;
    form?: UseFormReturn<ProviderSelectionFormValues>;
    className?: string;
}
interface ProviderDetailsProps extends SharedComponentProps<ProviderDetailsMessages, SsoProviderCreateClasses> {
    initialData?: Partial<ProviderDetailsFormValues>;
    className?: string;
    hideHeader?: boolean;
    onFormDirty?: (isDirty: boolean) => void;
}
interface ProviderConfigureProps extends SharedComponentProps<ProviderConfigureMessages, SsoProviderCreateClasses> {
    className?: string;
    strategy: IdpStrategy;
    initialData?: Partial<ProviderConfigureFormValues>;
}
interface ProviderConfigureFieldsProps extends SharedComponentProps<ProviderConfigureFieldsMessages, SsoProviderCreateClasses> {
    strategy: IdpStrategy;
    initialData?: Partial<ProviderConfigureFormValues>;
    className?: string;
    onFormDirty?: (isDirty: boolean) => void;
}
interface SsoProviderCreateBackButton extends Omit<BackButton, 'onClick'> {
    icon?: LucideIcon;
    onClick: (e: React__default.MouseEvent<HTMLButtonElement>) => void;
}
interface SsoProviderCreateProps extends SharedComponentProps<SsoProviderCreateMessages, SsoProviderCreateClasses, SsoProviderSchema> {
    createAction: ComponentAction<CreateIdentityProviderRequestContentPrivate, IdentityProvider$1>;
    backButton?: SsoProviderCreateBackButton;
    onPrevious?: (stepId: string, values: Partial<SsoProviderFormValues>) => boolean;
    onNext?: (stepId: string, values: Partial<SsoProviderFormValues>) => boolean;
}
interface UseSsoProviderCreateOptions {
    createAction?: SsoProviderCreateProps['createAction'];
    customMessages?: SsoProviderCreateProps['customMessages'];
}

declare const SsoProviderCreate: React__default.ComponentType<SsoProviderCreateProps>;

interface SsoDomainsTabEditProps {
    createAction?: ComponentAction<Domain>;
    verifyAction?: ComponentAction<Domain>;
    deleteAction?: ComponentAction<Domain, void>;
    associateToProviderAction?: ComponentAction<Domain, IdentityProvider$1 | null>;
    deleteFromProviderAction?: ComponentAction<Domain, IdentityProvider$1 | null>;
}
interface SsoDomainTabClasses {
    'SsoDomainsTab-header'?: string;
    'SsoDomainsTab-table'?: string;
    'SsoDomainsTab-createModal'?: string;
    'SsoDomainsTab-verifyModal'?: string;
    'SsoDomainsTab-deleteModal'?: string;
}
interface SsoProviderEditDomainsTabSchema {
    create: DomainCreateSchemas;
}
interface SsoDomainsTabProps extends SharedComponentProps<SsoDomainTabMessages, SsoDomainTabClasses, SsoProviderEditDomainsTabSchema> {
    domains: SsoDomainsTabEditProps | undefined;
    idpId: string;
    provider: IdentityProvider$1 | null;
}
interface SsoDomainTabActionColumn extends SharedComponentProps<SsoDomainTabMessages, SsoDomainTabClasses, SsoProviderEditDomainsTabSchema> {
    translatorKey?: string;
    idpDomains: string[];
    domain: Domain;
    handleVerify: (domain: Domain) => Promise<void>;
    isUpdating: boolean;
    onToggle: (domain: Domain, newCheckedValue: boolean) => Promise<void>;
}
interface UseSsoDomainTabOptions extends SharedComponentProps {
    domains: SsoDomainsTabEditProps;
    provider: IdentityProvider$1 | null;
}
interface UseSsoDomainTabReturn {
    domainsList: Domain[];
    isLoading: boolean;
    showCreateModal: boolean;
    isCreating: boolean;
    selectedDomain: Domain | null;
    showVerifyModal: boolean;
    showDeleteModal: boolean;
    isVerifying: boolean;
    verifyError: string | undefined;
    isDeleting: boolean;
    idpDomains: string[];
    isUpdating: boolean;
    setShowCreateModal: (show: boolean) => void;
    handleCreate: (domainUrl: string) => Promise<void>;
    handleCloseVerifyModal: () => void;
    handleVerify: (domain: Domain) => Promise<void>;
    handleDeleteClick: (domain: Domain) => void;
    setShowDeleteModal: (show: boolean) => void;
    handleDelete: (domain: Domain) => void;
    handleVerifyActionColumn: (domain: Domain) => Promise<void>;
    handleToggleSwitch: (domain: Domain, newCheckedValue: boolean) => Promise<void>;
}

interface SsoProvisioningTabEditProps {
    createAction?: ComponentAction<IdentityProvider$1, CreateIdPProvisioningConfigResponseContent>;
    deleteAction?: ComponentAction<IdentityProvider$1, void>;
    createScimTokenAction?: ComponentAction<IdentityProvider$1, CreateIdpProvisioningScimTokenResponseContent>;
    deleteScimTokenAction?: ComponentAction<IdentityProvider$1, void>;
}
interface SsoProvisioningTabClasses {
    'SsoProvisioningTab-root'?: string;
    'SsoProvisioningDetails-root'?: string;
    'SsoProvisioningDetails-provisioningMapping'?: string;
    'SsoProvisioningDetails-provisioningOptional'?: string;
    'SsoProvisioningDetails-formActions'?: string;
}
interface SsoProvisioningTabSchemas {
}

interface SsoProviderDeleteClasses {
    'ProviderDelete-root'?: string;
}
interface SsoProviderRemoveClasses {
    'ProviderRemove-root'?: string;
}

interface SsoProviderTabEditProps {
    updateAction?: ComponentAction<IdentityProvider$1, IdentityProvider$1>;
    deleteAction: ComponentAction<IdentityProvider$1, void>;
    deleteFromOrgAction: ComponentAction<IdentityProvider$1, void>;
}
interface SsoProviderTabClasses extends SsoProviderDetailsClasses, SsoProviderDeleteClasses, SsoProviderRemoveClasses {
}
interface SsoProviderTabSchemas extends SsoProviderDetailsSchema {
}
interface SsoProviderDetailsClasses {
    'SsoProviderDetails-formActions'?: string;
    'ProviderDetails-root'?: string;
    'ProviderConfigure-root'?: string;
    'SsoProviderDetails-FormActions'?: string;
}

interface SsoProviderEditBackButton extends Omit<BackButton, 'onClick'> {
    icon?: LucideIcon;
    onClick: (e: React__default.MouseEvent<HTMLButtonElement>) => void;
}
interface SsoProviderEditClasses extends SsoProviderTabClasses, SsoProvisioningTabClasses, SsoDomainTabClasses {
    'SsoProviderEdit-header'?: string;
    'SsoProviderEdit-tabs'?: string;
}
interface SsoProviderEditSchema {
    provider: SsoProviderTabSchemas;
    provisioning: SsoProvisioningTabSchemas;
    domains?: SsoProviderEditDomainsTabSchema;
}
interface SsoProviderEditProps extends SharedComponentProps<SsoProviderEditMessages, SsoProviderEditClasses, SsoProviderEditSchema> {
    hideHeader?: boolean;
    providerId: IdpId;
    sso?: SsoProviderTabEditProps;
    provisioning?: SsoProvisioningTabEditProps;
    domains?: SsoDomainsTabEditProps;
    backButton?: SsoProviderEditBackButton;
}

declare const SsoProviderEdit: React__default.ComponentType<SsoProviderEditProps>;

interface DomainTableClasses {
    'DomainTable-header'?: string;
    'DomainTable-table'?: string;
    'DomainTable-createModal'?: string;
    'DomainTable-configureModal'?: string;
    'DomainTable-deleteModal'?: string;
}
interface DomainTableMainMessages extends DomainTableMessages {
    create: DomainCreateMessages;
    configure: DomainConfigureMessages;
    verify: DomainVerifyMessages;
    delete: DomainDeleteMessages;
}
interface DomainTableSchema {
    create?: DomainCreateSchemas;
}
interface DomainTableProps extends SharedComponentProps<DomainTableMainMessages, DomainTableClasses, DomainTableSchema> {
    hideHeader?: boolean;
    createAction?: ComponentAction<Domain>;
    verifyAction?: ComponentAction<Domain>;
    deleteAction?: ComponentAction<Domain>;
    associateToProviderAction?: ComponentAction<Domain, IdentityProvider$1>;
    deleteFromProviderAction?: ComponentAction<Domain, IdentityProvider$1>;
    onOpenProvider?: (provider: IdentityProvider$1) => void;
    onCreateProvider?: () => void;
}
interface DomainTableActionsColumnProps {
    customMessages?: Partial<DomainTableMainMessages>;
    readOnly: boolean;
    domain: Domain;
    onView: (domain: Domain) => void;
    onConfigure: (domain: Domain) => void;
    onVerify: (domain: Domain) => void;
    onDelete: (domain: Domain) => void;
}
interface UseDomainTableOptions {
    createAction?: DomainTableProps['createAction'];
    verifyAction?: DomainTableProps['verifyAction'];
    deleteAction?: DomainTableProps['deleteAction'];
    associateToProviderAction?: DomainTableProps['associateToProviderAction'];
    deleteFromProviderAction?: DomainTableProps['deleteFromProviderAction'];
    customMessages?: DomainTableProps['customMessages'];
}
interface UseDomainTableResult extends SharedComponentProps {
    domains: Domain[];
    providers: IdentityProviderAssociatedWithDomain[];
    isFetching: boolean;
    isLoadingProviders: boolean;
    isCreating: boolean;
    isDeleting: boolean;
    isVerifying: boolean;
    fetchProviders: (domain: Domain) => Promise<void>;
    fetchDomains: () => Promise<void>;
    onCreateDomain: (data: CreateOrganizationDomainRequestContent) => Promise<Domain | null>;
    onVerifyDomain: (data: Domain) => Promise<boolean>;
    onDeleteDomain: (domain: Domain) => Promise<void>;
    onAssociateToProvider: (domain: Domain, provider: IdentityProvider$1) => Promise<void>;
    onDeleteFromProvider: (domain: Domain, provider: IdentityProvider$1) => Promise<void>;
}
interface UseDomainTableLogicOptions {
    t: EnhancedTranslationFunction;
    onCreateDomain: UseDomainTableResult['onCreateDomain'];
    onVerifyDomain: UseDomainTableResult['onVerifyDomain'];
    onDeleteDomain: UseDomainTableResult['onDeleteDomain'];
    onAssociateToProvider: UseDomainTableResult['onAssociateToProvider'];
    onDeleteFromProvider: UseDomainTableResult['onDeleteFromProvider'];
    fetchProviders: UseDomainTableResult['fetchProviders'];
    fetchDomains: UseDomainTableResult['fetchDomains'];
}
interface UseDomainTableLogicResult {
    showCreateModal: boolean;
    showConfigureModal: boolean;
    showVerifyModal: boolean;
    showDeleteModal: boolean;
    verifyError: string | undefined;
    selectedDomain: Domain | null;
    setShowCreateModal: (show: boolean) => void;
    setShowConfigureModal: (show: boolean) => void;
    setShowVerifyModal: (show: boolean) => void;
    setShowDeleteModal: (show: boolean) => void;
    handleCreate: (domainUrl: string) => Promise<void>;
    handleVerify: (domain: Domain) => Promise<void>;
    handleDelete: (domain: Domain) => void;
    handleToggleSwitch: (domain: Domain, provider: IdentityProvider$1, checked: boolean) => void;
    handleCloseVerifyModal: () => void;
    handleCreateClick: () => void;
    handleConfigureClick: (domain: Domain) => void;
    handleVerifyClick: (domain: Domain) => Promise<void>;
    handleDeleteClick: (domain: Domain) => void;
}

declare const DomainTable: React.ComponentType<DomainTableProps>;

declare const CoreClientContext: React.Context<{
    coreClient: CoreClientInterface | null;
}>;
/**
 * Hook to access the CoreClient instance from context.
 *
 * Provides access to the initialized CoreClient which handles API calls and business logic.
 *
 * @returns {{ coreClient: CoreClientInterface | null }} The current CoreClient instance or null if not initialized.
 *
 * @throws {Error} Throws if used outside of an Auth0ComponentProvider.
 */
declare const useCoreClient: () => {
    coreClient: CoreClientInterface | null;
};

/**
 * Custom hook for accessing the i18n service from CoreClient.
 *
 * This hook provides access to the i18n service from the CoreClient context,
 * including enhanced translation functions with Trans component support and language change capabilities.
 *
 * @param namespace - The translation namespace (e.g., 'mfa', 'common')
 * @param overrides - Optional translation overrides for the namespace
 * @returns An object containing the enhanced translator function and changeLanguage function
 *
 * @example
 * ```tsx
 * // Basic usage with namespace only
 * const { t, changeLanguage } = useTranslator('common');
 *
 * // Usage with overrides
 * const { t } = useTranslator('mfa', {
 *   title: 'Custom Title',
 *   'sms.title': 'Text Message'
 * });
 *
 * // Using the basic translator
 * const title = t('title');
 * const message = t('welcome', { name: 'John' });
 *
 * // Using the trans method for safe HTML rendering
 * const elements = t.trans('help.message', {
 *   components: {
 *     link: (children) => <a href="/help" target="_blank">{children}</a>,
 *     strong: (children) => <strong>{children}</strong>
 *   },
 *   vars: { name: 'John' }
 * });
 *
 * // Render the elements
 * return (
 *   <div>
 *     {elements.map((element, index) => (
 *       <Fragment key={index}>{element}</Fragment>
 *     ))}
 *   </div>
 * );
 *
 * // Changing language
 * await changeLanguage('es-ES');
 * ```
 */
declare function useTranslator(namespace: string, overrides?: Record<string, unknown>): {
    t: EnhancedTranslationFunction;
    changeLanguage: (language: string, fallbackLanguage?: string) => Promise<void>;
    currentLanguage: string;
    fallbackLanguage: string | undefined;
};

/**
 * useTheme
 *
 * Access the current theme from context. Includes:
 * - mode
 * - styling (CSS variables)
 */
declare function useTheme(): ThemeContextValue;

interface UseCoreClientInitializationProps {
    authDetails: AuthDetails;
    i18nOptions?: I18nInitOptions;
}
/**
 * Custom hook to handle CoreClient initialization
 */
declare const useCoreClientInitialization: ({ authDetails, i18nOptions, }: UseCoreClientInitializationProps) => CoreClientInterface | null;

type Audience = 'me' | 'my-org';
interface ScopeManagerContextValue {
    registerScopes: (audience: Audience, scopes: string) => void;
    isReady: boolean;
    ensured: Record<Audience, string>;
}
declare const useScopeManager: () => ScopeManagerContextValue;

interface ErrorHandlerOptions {
    fallbackMessage?: string;
    showToastNotification?: boolean;
}
/**
 * Hook for handling errors with optional toast notifications
 */
declare const useErrorHandler: () => {
    handleError: (error: unknown, options?: ErrorHandlerOptions) => string;
};

type ContactForm = {
    contact: string;
};
type UseContactEnrollmentProps = {
    factorType: MFAType;
    enrollMfa: (factor: MFAType, options: Record<string, string>) => Promise<CreateAuthenticationMethodResponseContent>;
    onError: (error: Error, stage: typeof ENROLL) => void;
};
declare function useContactEnrollment({ factorType, enrollMfa, onError, }: UseContactEnrollmentProps): {
    onSubmitContact: (data: ContactForm) => Promise<void>;
    loading: boolean;
    contactData: {
        contact: string;
        authenticationMethodId: string;
        authSession: string;
    };
    setContactData: React.Dispatch<React.SetStateAction<{
        contact: string;
        authenticationMethodId: string;
        authSession: string;
    }>>;
};

type OtpForm = {
    userOtp: string;
};
type UseOtpConfirmationProps = {
    factorType: MFAType;
    authSession: string;
    authenticationMethodId: string;
    confirmEnrollment: (factor: MFAType, authSession: string, authenticationMethodId: string, options: {
        userOtpCode?: string;
    }) => Promise<unknown | null>;
    onError: (error: Error, stage: typeof CONFIRM) => void;
    onSuccess: () => void;
    onClose: () => void;
};
declare function useOtpConfirmation({ factorType, authSession, authenticationMethodId, confirmEnrollment, onError, onSuccess, onClose, }: UseOtpConfirmationProps): {
    onSubmitOtp: (data: OtpForm) => Promise<void>;
    loading: boolean;
};

type UseOtpEnrollmentProps = {
    factorType: MFAType;
    enrollMfa: (factorType: MFAType, options: Record<string, string>) => Promise<CreateAuthenticationMethodResponseContent>;
    onError: (error: Error, stage: typeof ENROLL) => void;
    onClose: () => void;
};
declare function useOtpEnrollment({ factorType, enrollMfa, onError, onClose, }: UseOtpEnrollmentProps): {
    fetchOtpEnrollment: () => Promise<void>;
    otpData: {
        authSession: string;
        barcodeUri: string;
        authenticationMethodId: string;
        manualInputCode?: string;
    };
    resetOtpData: () => void;
    loading: boolean;
};

declare function useMFA(): UseMFAResult;

/**
 * Styling that can be used to override default styles.
 */
interface OrgDeleteClasses {
    OrgDelete_card?: string;
    OrgDelete_button?: string;
    OrgDelete_modal?: string;
}
interface OrgDeleteProps extends SharedComponentProps<OrgDeleteMessages, OrgDeleteClasses> {
    onDelete: (id: string) => void | Promise<void>;
    isLoading?: boolean;
    organization: Organization;
}
interface OrgDeleteModalProps extends SharedComponentProps<OrgDeleteMessages, OrgDeleteClasses> {
    isOpen: boolean;
    onClose: () => void;
    organizationName: string;
    onDelete: () => Promise<void>;
    isLoading: boolean;
}

/**
 * Custom hook for managing organization details form logic.
 */
declare function useOrgDetailsEdit({ saveAction, cancelAction, readOnly, customMessages, }: UseOrgDetailsEditOptions): UseOrgDetailsEditResult;

interface DomainCreateModalProps {
    translatorKey?: string;
    className?: string;
    customMessages?: Partial<DomainCreateMessages>;
    schema?: DomainCreateSchemas;
    isOpen: boolean;
    isLoading: boolean;
    onClose: () => void;
    onCreate: (domainName: string) => void | Promise<void>;
}

interface DomainConfigureProvidersModalProps {
    className?: string;
    customMessages?: Partial<DomainConfigureMessages>;
    isOpen: boolean;
    isLoading: boolean;
    isLoadingSwitch: boolean;
    domain: Domain | null;
    providers: IdentityProviderAssociatedWithDomain[];
    onClose: () => void;
    onToggleSwitch: (domain: Domain, provider: IdentityProviderAssociatedWithDomain, enable: boolean) => void;
    onOpenProvider?: (provider: IdentityProviderAssociatedWithDomain) => void;
    onCreateProvider?: () => void;
}

interface DomainDeleteModalProps {
    translatorKey?: string;
    className?: string;
    customMessages?: Partial<DomainDeleteMessages>;
    domain: Domain | null;
    isOpen: boolean;
    isLoading: boolean;
    onClose: () => void;
    onDelete: (domain: Domain) => void;
}

interface DomainVerifyModalProps {
    translatorKey?: string;
    isOpen: boolean;
    isLoading?: boolean;
    domain: Domain | null;
    error?: string;
    onClose: () => void;
    onVerify: (domain: Domain) => void;
    onDelete: (domain: Domain) => void;
    className?: string;
    customMessages?: Partial<DomainVerifyMessages>;
}

export { Auth0ComponentProvider, type BrandingDetailsProps, type ContactInputFormProps, CoreClientContext, type DeleteFactorConfirmationProps, type DomainConfigureProvidersModalProps, type DomainCreateModalProps, type DomainDeleteModalProps, DomainTable, type DomainTableActionsColumnProps, type DomainTableClasses, type DomainTableMainMessages, type DomainTableProps, type DomainTableSchema, type DomainVerifyModalProps, type FactorsListProps, type IdentityProvider, type OTPVerificationFormProps, type OrgDeleteClasses, type OrgDeleteModalProps, type OrgDeleteProps, type OrgDetailsClasses, OrgDetailsEdit, type OrgDetailsEditProps, type OrgDetailsEditSchemas, type OrgDetailsFormActions, type OrgDetailsProps, type OrgDetailsSchemas, type OrgEditBackButton, type OrgEditClasses, type OrgEditSaveAction, type ProviderConfigureFieldsProps, type ProviderConfigureProps, type ProviderDetailsProps, type ProviderSelectProps, type QRCodeEnrollmentFormProps, ScopeManagerProvider, type SettingsDetailsProps, type ShowRecoveryCodeProps, type SsoDomainTabActionColumn, type SsoDomainTabClasses, type SsoDomainsTabEditProps, type SsoDomainsTabProps, SsoProviderCreate, type SsoProviderCreateBackButton, type SsoProviderCreateClasses, type SsoProviderCreateProps, SsoProviderEdit, type SsoProviderEditDomainsTabSchema, SsoProviderTable, type SsoProviderTableActionsColumnProps, type SsoProviderTableProps, ThemeContext, ThemeProvider, type UseDomainTableLogicOptions, type UseDomainTableLogicResult, type UseDomainTableOptions, type UseDomainTableResult, type UseMFAResult, type UseOrgDetailsEditOptions, type UseOrgDetailsEditResult, type UseSsoDomainTabOptions, type UseSsoDomainTabReturn, type UseSsoProviderCreateOptions, type UseSsoProviderTableReturn, UserMFAMgmt, type UserMFAMgmtClasses, type UserMFAMgmtProps, type UserMFASetupFormProps, useContactEnrollment, useCoreClient, useCoreClientInitialization, useErrorHandler, useMFA, useOrgDetailsEdit, useOtpConfirmation, useOtpEnrollment, useScopeManager, useTheme, useTranslator };

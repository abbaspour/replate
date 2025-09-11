import React, { useEffect, useState } from 'react';
import { Admin, Resource, List, Datagrid, TextField, Show, SimpleShowLayout, Edit, SimpleForm, TextInput, Create, SelectInput, TopToolbar, CreateButton, ShowButton, EditButton, Filter, useNotify } from 'react-admin';
import { dataProvider } from './dataProvider';
import { ensureAuthenticated } from './auth';
import { authProvider } from './authProvider';

const OrgFilters = [
  <TextInput key="q" label="Search" source="q" alwaysOn />, 
  <SelectInput key="org_type" source="org_type" choices={[
    { id: 'supplier', name: 'Supplier' },
    { id: 'community', name: 'Community' },
    { id: 'logistics', name: 'Logistics' },
  ]} />, 
  <SelectInput key="sso_status" source="sso_status" choices={[
    { id: 'not_started', name: 'Not Started' },
    { id: 'invited', name: 'Invited' },
    { id: 'configured', name: 'Configured' },
    { id: 'active', name: 'Active' },
  ]} />
];

const OrganizationsList = (props: any) => (
  <List {...props} filters={OrgFilters as any}>
    <Datagrid rowClick="show">
      <TextField source="name" />
      <TextField source="org_type" />
      <TextField source="domain" />
      <TextField source="sso_status" />
      <ShowButton />
      <EditButton />
    </Datagrid>
  </List>
);

const OrganizationsShow = (props: any) => (
  <Show {...props}>
    <SimpleShowLayout>
      <TextField source="id" label="auth0_org_id" />
      <TextField source="name" />
      <TextField source="org_type" />
      <TextField source="domain" />
      <TextField source="sso_status" />
    </SimpleShowLayout>
    <div style={{ marginTop: 16 }}>
      <InvitationsSection />
    </div>
  </Show>
);

const OrganizationsEdit = (props: any) => (
  <Edit {...props}>
    <SimpleForm>
      <TextInput source="name" />
      <TextInput source="domain" />
      <SelectInput source="org_type" choices={[
        { id: 'supplier', name: 'Supplier' },
        { id: 'community', name: 'Community' },
        { id: 'logistics', name: 'Logistics' },
      ]} />
      <SelectInput source="sso_status" choices={[
        { id: 'not_started', name: 'Not Started' },
        { id: 'invited', name: 'Invited' },
        { id: 'configured', name: 'Configured' },
        { id: 'active', name: 'Active' },
      ]} />
    </SimpleForm>
  </Edit>
);

const OrganizationsCreate = (props: any) => (
  <Create {...props}>
    <SimpleForm>
      <TextInput source="name" required />
      <TextInput source="domain" required />
      <SelectInput source="org_type" required choices={[
        { id: 'supplier', name: 'Supplier' },
        { id: 'community', name: 'Community' },
        { id: 'logistics', name: 'Logistics' },
      ]} />
    </SimpleForm>
  </Create>
);

import { useListContext, useRefresh, useRecordContext } from 'react-admin';

const InvitationsList = (props: any) => (
  <List {...props}>
    <Datagrid>
      <TextField source="id" label="invitation_id" />
      <TextField source="link" />
      <TextField source="sso_status" />
      <TextField source="created_at" />
    </Datagrid>
  </List>
);

const InvitationsSection = () => {
  const record = useRecordContext<any>();
  const orgId = record?.id;
  if (!orgId) return null;
  return (
    <div>
      <h3>SSO Invitations</h3>
      <List resource="invitations" filter={{ orgId }} perPage={25} actions={false} disableSyncWithLocation>
        <Datagrid bulkActionButtons={false}>
          <TextField source="id" label="invitation_id" />
          <TextField source="link" />
          <TextField source="sso_status" />
          <TextField source="created_at" />
        </Datagrid>
      </List>
      <div style={{ marginTop: 8 }}>
        <CreateButton resource="invitations" label="Create Invitation" state={{ meta: { orgId } }} />
      </div>
    </div>
  );
};

import { BooleanInput, NumberInput, useRedirect, useCreate, Toolbar, SaveButton } from 'react-admin';

import { useLocation } from 'react-router-dom';
const InvitationCreateForm = (props: any) => {
  const record = useRecordContext<any>();
  const [create] = useCreate();
  const redirect = useRedirect();
  const location = useLocation() as any;
  const passedOrgId = location?.state?.meta?.orgId;
  const orgId = (props as any).orgId || record?.id || passedOrgId;

  const onSubmit = async (values: any) => {
    await create('invitations', { data: values, meta: { orgId } });
    redirect(`/organizations/${orgId}/show`);
  };

  return (
    <SimpleForm onSubmit={onSubmit} defaultValues={{ ttl: 432000, domain_verification: false, accept_idp_init_saml: false }}>
      <BooleanInput source="domain_verification" label="Require domain verification" />
      <NumberInput source="ttl" label="TTL (seconds)" />
      <BooleanInput source="accept_idp_init_saml" label="Accept IdP-initiated SAML" />
    </SimpleForm>
  );
};

const InvitationsCreate = (props: any) => (
  <Create {...props}>
    <InvitationCreateForm {...props} />
  </Create>
);

const App = () => {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      await ensureAuthenticated();
      setReady(true);
    })();
  }, []);

  if (!ready) return <div>Loading...</div>;

  return (
    <Admin dataProvider={dataProvider} authProvider={authProvider}>
      <Resource name="organizations" list={OrganizationsList} show={OrganizationsShow} edit={OrganizationsEdit} create={OrganizationsCreate} />
      <Resource name="invitations" create={InvitationsCreate} />
    </Admin>
  );
};

export default App;

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

const InvitationsList = (props: any) => (
  <List {...props}>
    <Datagrid>
      <TextField source="id" />
      <TextField source="name" />
      <TextField source="org_type" />
      <TextField source="domain" />
      <TextField source="sso_status" />
    </Datagrid>
  </List>
);

const InvitationsCreate = (props: any) => (
  <Create {...props}>
    <SimpleForm>
      <SelectInput source="org_type" required choices={[
        { id: 'supplier', name: 'Supplier' },
        { id: 'community', name: 'Community' },
        { id: 'logistics', name: 'Logistics' },
      ]} />
      <TextInput source="name" required />
      <TextInput source="domain" required />
      <TextInput source="admin_email" required />
    </SimpleForm>
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
      <Resource name="invitations" list={InvitationsList} create={InvitationsCreate} />
    </Admin>
  );
};

export default App;

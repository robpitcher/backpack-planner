@description('Environment name')
param environment string

@description('Azure region')
param location string

@description('GitHub repository owner/org')
param gitHubOrganization string

@description('GitHub repository name')
param gitHubRepository string

@description('Resource tags')
param tags object

var identityName = 'id-trailforge-${environment}'

resource managedIdentity 'Microsoft.ManagedIdentity/userAssignedIdentities@2023-01-31' = {
  name: identityName
  location: location
  tags: tags
}

// Federated credential for GitHub Actions OIDC — scoped to the dev environment
resource federatedCredential 'Microsoft.ManagedIdentity/userAssignedIdentities/federatedIdentityCredentials@2023-01-31' = {
  parent: managedIdentity
  name: 'github-actions-${environment}'
  properties: {
    issuer: 'https://token.actions.githubusercontent.com'
    subject: 'repo:${gitHubOrganization}/${gitHubRepository}:environment:${environment}'
    audiences: ['api://AzureADTokenExchange']
  }
}

// Contributor role on the resource group so the identity can deploy to SWA
resource contributorRoleAssignment 'Microsoft.Authorization/roleAssignments@2022-04-01' = {
  name: guid(resourceGroup().id, managedIdentity.id, 'Contributor')
  properties: {
    principalId: managedIdentity.properties.principalId
    principalType: 'ServicePrincipal'
    roleDefinitionId: subscriptionResourceId('Microsoft.Authorization/roleDefinitions', 'b24988ac-6180-42a0-ab88-20f7382dd24c')
  }
}

output clientId string = managedIdentity.properties.clientId
output principalId string = managedIdentity.properties.principalId

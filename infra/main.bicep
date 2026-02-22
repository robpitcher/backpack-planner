targetScope = 'subscription'

@description('Environment name (e.g. dev, staging, prod)')
param environment string = 'dev'

@description('Azure region for all resources')
param location string = 'eastus2'

@description('GitHub repository owner/org')
param gitHubOrganization string

@description('GitHub repository name')
param gitHubRepository string

var resourceGroupName = 'rg-trailforge-${environment}'
var tags = {
  project: 'trailforge'
  environment: environment
}

module rg 'modules/resourceGroup.bicep' = {
  name: 'resourceGroup'
  params: {
    name: resourceGroupName
    location: location
    tags: tags
  }
}

module staticWebApp 'modules/staticWebApp.bicep' = {
  name: 'staticWebApp'
  scope: resourceGroup(resourceGroupName)
  dependsOn: [rg]
  params: {
    environment: environment
    location: location
    tags: tags
  }
}

module managedIdentity 'modules/managedIdentity.bicep' = {
  name: 'managedIdentity'
  scope: resourceGroup(resourceGroupName)
  dependsOn: [rg]
  params: {
    environment: environment
    location: location
    gitHubOrganization: gitHubOrganization
    gitHubRepository: gitHubRepository
    tags: tags
  }
}

output resourceGroupName string = resourceGroupName
output staticWebAppName string = staticWebApp.outputs.name
output staticWebAppDefaultHostname string = staticWebApp.outputs.defaultHostname
output managedIdentityClientId string = managedIdentity.outputs.clientId

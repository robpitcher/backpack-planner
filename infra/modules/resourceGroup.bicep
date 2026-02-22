targetScope = 'subscription'

@description('Resource group name')
param name string

@description('Azure region')
param location string

@description('Resource tags')
param tags object

resource rg 'Microsoft.Resources/resourceGroups@2024-03-01' = {
  name: name
  location: location
  tags: tags
}

output name string = rg.name

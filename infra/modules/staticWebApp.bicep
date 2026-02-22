@description('Environment name')
param environment string

@description('Azure region')
param location string

@description('Resource tags')
param tags object

var name = 'swa-trailforge-${environment}'

resource staticWebApp 'Microsoft.Web/staticSites@2024-04-01' = {
  name: name
  location: location
  tags: tags
  sku: {
    name: 'Free'
    tier: 'Free'
  }
  properties: {}
}

output name string = staticWebApp.name
output defaultHostname string = staticWebApp.properties.defaultHostname
output id string = staticWebApp.id

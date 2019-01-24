export default `
addSystemToSimulator(simulatorId: ID!, className: String!, params: String!): String
removeSystemFromSimulator(systemId: ID, simulatorId: ID, type: String): String
updateSystemName(systemId: ID!, name: String, displayName: String): String

damageSystem(systemId: ID!, report: String, destroyed: Boolean, which: String): String
damageReport(systemId: ID!, report: String!): String
updateCurrentDamageStep(systemId: ID!, step: Int!):String
repairSystem(systemId: ID!): String
requestDamageReport(systemId: ID!): String
systemReactivationCode(systemId: ID!, station: String!, code: String!): String
systemReactivationCodeResponse(systemId: ID!, response: Boolean!): String
changePower(systemId: ID!, power: Int!): String
changeSystemPowerLevels(systemId: ID!, powerLevels: [Int]!): String
updateSystemRooms(systemId: ID!, locations:[ID]): String
addSystemDamageStep(systemId: ID!, step: DamageStepInput!): String
updateSystemDamageStep(systemId: ID!, step: DamageStepInput!): String
removeSystemDamageStep(systemId: ID!, step: ID!):String
generateDamageReport(systemId: ID!, steps: Int): String

addSystemDamageTask(systemId: ID!, task: DamageTaskInput!): String
removeSystemDamageTask(systemId: ID!, taskId: ID!): String
updateSystemDamageTask(systemId: ID!, task: DamageTaskInput!): String

#Macro: Damage Control: Break system
breakSystem(simulatorId: ID!, type: String!, name: String): String

#Macro: Damage Control: Fix system
fixSystem(simulatorId: ID!, type: String!, name: String): String

setDamageStepValidation(id:ID!, validation:Boolean!):String
validateDamageStep(id:ID!):String
changeSystemDefaultPowerLevel(id:ID!, level:Int!):String

#Macro: Systems: Flux Power
fluxSystemPower(id:ID, all:Boolean, simulatorId: ID, type: String, name: String):String
`;

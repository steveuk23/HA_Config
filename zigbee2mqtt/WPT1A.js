const fz = require('zigbee-herdsman-converters/converters/fromZigbee');
const exposes = require('zigbee-herdsman-converters/lib/exposes');
const reporting = require('zigbee-herdsman-converters/lib/reporting');
const e = exposes.presets;

const definition = {
    zigbeeModel: ['WPT1A'],
    model: 'WPT1A',
    vendor: 'Hive',
    description: 'Heating thermostat remote control',
    fromZigbee: [fz.battery],
    toZigbee: [],
    exposes: [e.battery()],
    configure: async (device, coordinatorEndpoint, logger) => {
        const endpoint = device.getEndpoint(9);
        await reporting.bind(endpoint, coordinatorEndpoint, ['genPowerCfg']);
        await reporting.batteryPercentageRemaining(endpoint);
    },
};

module.exports = definition;

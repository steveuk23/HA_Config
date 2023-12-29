const fz = require('zigbee-herdsman-converters/converters/fromZigbee');
const tz = require('zigbee-herdsman-converters/converters/toZigbee');
const exposes = require('zigbee-herdsman-converters/lib/exposes');
const reporting = require('zigbee-herdsman-converters/lib/reporting');
const constants = require('zigbee-herdsman-converters/lib/constants');
const e = exposes.presets;
const ea = exposes.access;

const definition = {
    zigbeeModel: ['SLR1'],
    model: 'SLR1',
    vendor: 'Hive',
    description: 'Heating thermostat',
    fromZigbee: [fz.thermostat, fz.thermostat_weekly_schedule],
    toZigbee: [tz.thermostat_local_temperature, tz.thermostat_system_mode, tz.thermostat_running_state,
        tz.thermostat_occupied_heating_setpoint, tz.thermostat_control_sequence_of_operation, tz.thermostat_weekly_schedule,
        tz.thermostat_clear_weekly_schedule, tz.thermostat_temperature_setpoint_hold, tz.thermostat_temperature_setpoint_hold_duration],
    exposes: [
        exposes.climate().withSetpoint('occupied_heating_setpoint', 5, 32, 0.5).withLocalTemperature()
            .withSystemMode(['off', 'auto', 'heat']).withRunningState(['idle', 'heat']),
        exposes.binary('temperature_setpoint_hold', ea.ALL, true, false)
            .withDescription('Prevent changes. `false` = run normally. `true` = prevent from making changes.' +
                ' Must be set to `false` when system_mode = off or `true` for heat'),
        exposes.numeric('temperature_setpoint_hold_duration', ea.ALL).withValueMin(0).withValueMax(65535)
            .withDescription('Period in minutes for which the setpoint hold will be active. 65535 = attribute not' +
                ' used. 0 to 360 to match the remote display')],
    meta: {disableDefaultResponse: true},
    configure: async (device, coordinatorEndpoint, logger) => {
        const endpoint = device.getEndpoint(5);
        const binds = ['genBasic', 'genIdentify', 'genAlarms', 'genTime', 'hvacThermostat'];
        await reporting.bind(endpoint, coordinatorEndpoint, binds);
        await reporting.thermostatTemperature(endpoint, {min: 0, max: constants.repInterval.HOUR, change: 5});
        await reporting.thermostatRunningState(endpoint, {min: 0, max: constants.repInterval.HOUR, change: 1});
        await reporting.thermostatSystemMode(endpoint, {min: 0, max: constants.repInterval.HOUR, change: 1});
        await reporting.thermostatOccupiedHeatingSetpoint(endpoint, {min: 0, max: constants.repInterval.HOUR, change: 5});
        await reporting.thermostatTemperatureSetpointHold(endpoint, {min: 0, max: constants.repInterval.HOUR, change: 1});
        await reporting.thermostatTemperatureSetpointHoldDuration(endpoint, {min: 0, max: constants.repInterval.HOUR, change: 1});
    },
};

module.exports = definition;


'use strict';

/*
 * Created with @iobroker/create-adapter v1.31.0
 */

// The adapter-core module gives you access to the core ioBroker functions
// you need to create an adapter
const utils = require('@iobroker/adapter-core');

// Load your modules here, e.g.:
// const fs = require("fs");

var request = require("request");

/**
 * The adapter instance
 * @type {ioBroker.Adapter}
 */
let adapter;
const adapterName = require('./package.json').name.split('.').pop();

/**
 * Starts the adapter instance
 * @param {Partial<utils.AdapterOptions>} [options]
 */
function startAdapter(options) {
/*    
    options = options || {};
    Object.assign(options, { name: adapterName });

    adapter = new utils.Adapter(options);
*/
    // Create the adapter and define its methods
    return adapter = utils.adapter(Object.assign({}, options, {
        name: adapterName,

        // The ready callback is called when databases are connected and adapter received configuration.
        // start here!
        ready: main, // Main method defined below for readability

        // is called when adapter shuts down - callback has to be called under any circumstances!
        unload: (callback) => {
            try {
                // Here you must clear all timeouts or intervals that may still be active
                // clearTimeout(timeout1);
                // clearTimeout(timeout2);
                // ...
                // clearInterval(interval1);

                callback();
            } catch (e) {
                callback();
            }
        },

        // If you need to react to object changes, uncomment the following method.
        // You also need to subscribe to the objects with `adapter.subscribeObjects`, similar to `adapter.subscribeStates`.
        objectChange: (id, obj) => {
             if (obj) {
                 // The object was changed
                 adapter.log.info(`object ${id} changed: ${JSON.stringify(obj)}`);
             } else {
                 // The object was deleted
                 adapter.log.info(`object ${id} deleted`);
             }
        },

        // is called if a subscribed state changes
        stateChange: (id, state) => {
            if (state) {
                // The state was changed
                adapter.log.info(`state ${id} changed: ${state.val} (ack = ${state.ack})`);
                switch(id) {
                    case adapter.namespace+".SwitchDay":
                        adapter.log.debug(`SwitchDay state ${id} changed: ${state.val} (ack = ${state.ack})`);
                        adapter.getState('Wochentag.'+state.val+'.Link', function (err, state) {
                            if(err){
                                adapter.log.error(err);
                                return;
                            }else{
                                adapter.log.debug(
                                    'State ' + adapter.namespace + '.Wochentag.X.Link -' +
                                    '  Value: '    + state.val +
                                    ', ack: '      + state.ack +
                                    ', time stamp: '   + state.ts  +
                                    ', last changed: ' + state.lc
                                );
                                adapter.setState('AktTag.Link',state.val);
                            }
                        });
                        adapter.getState('Wochentag.'+state.val+'.Name', function (err, state) {
                            if(err){
                                adapter.log.error(err);
                                return;
                            }else{
                                adapter.log.debug(
                                    'State ' + adapter.namespace + '.Wochentag.X.Name -' +
                                    '  Value: '    + state.val +
                                    ', ack: '      + state.ack +
                                    ', time stamp: '   + state.ts  +
                                    ', last changed: ' + state.lc
                                );
                                adapter.setState('AktTag.Name',state.val);
                            }
                        });
                        adapter.getState('Wochentag.'+state.val+'.Portionen', function (err, state) {
                            if(err){
                                adapter.log.error(err);
                                return;
                            }else{
                                adapter.log.debug(
                                    'State ' + adapter.namespace + '.Wochentag.X.Portionen -' +
                                    '  Value: '    + state.val +
                                    ', ack: '      + state.ack +
                                    ', time stamp: '   + state.ts  +
                                    ', last changed: ' + state.lc
                                );
                                adapter.setState('AktTag.Portionen',state.val);
                            }
                        });
                        adapter.getState('Wochentag.'+state.val+'.Zubereitung', function (err, state) {
                            if(err){
                                adapter.log.error(err);
                                return;
                            }else{
                                adapter.log.debug(
                                    'State ' + adapter.namespace + '.Wochentag.X.Zubereitung -' +
                                    '  Value: '    + state.val +
                                    ', ack: '      + state.ack +
                                    ', time stamp: '   + state.ts  +
                                    ', last changed: ' + state.lc
                                );
                                adapter.setState('AktTag.Zubereitung',state.val);
                            }
                        });
                        adapter.getState('Wochentag.'+state.val+'.Zutaten', function (err, state) {
                            if(err){
                                adapter.log.error(err);
                                return;
                            }else{
                                adapter.log.debug(
                                    'State ' + adapter.namespace + '.Wochentag.X.Zutaten -' +
                                    '  Value: '    + state.val +
                                    ', ack: '      + state.ack +
                                    ', time stamp: '   + state.ts  +
                                    ', last changed: ' + state.lc
                                );
                                adapter.setState('AktTag.Zutaten',state.val);
                            }
                        });

                        break;
                 }

            } else {
                // The state was deleted
                adapter.log.info(`state ${id} deleted`);
            }
        },

        // If you need to accept messages in your adapter, uncomment the following block.
        // /**
        //  * Some message was sent to this instance over message box. Used by email, pushover, text2speech, ...
        //  * Using this method requires "common.messagebox" property to be set to true in io-package.json
        //  */
        // message: (obj) => {
        //     if (typeof obj === 'object' && obj.message) {
        //         if (obj.command === 'send') {
        //             // e.g. send email or pushover or whatever
        //             adapter.log.info('send command');

        //             // Send response in callback if required
        //             if (obj.callback) adapter.sendTo(obj.from, obj.command, 'Message received', obj.callback);
        //         }
        //     }
        // },
    }));
}

async function main() {

    //adapter.log.info('Hallo Welt! Mein erster ioBroker-Adapter meldet sich hier :-)');

    // The adapters config (in the instance object everything under the attribute "native") is accessible via
    // adapter.config:
    adapter.log.info('config WithChefkoch: ' + adapter.config.WithChefkoch);
    adapter.log.info('config WithShoppingList: ' + adapter.config.WithShoppingList);
    adapter.log.info('config WithAlexa: ' + adapter.config.WithAlexa);
    adapter.log.info('config WithSpeak: ' + adapter.config.WithSpeak);
    adapter.log.info('config AlexaDevice: ' + adapter.config.AlexaDevice);

 
    // In order to get state updates, you need to subscribe to them. The following line adds a subscription for our variable we have created above.
    //adapter.subscribeStates('testVariable');
    // You can also add a subscription for multiple states. The following line watches all states starting with "lights."
    // adapter.subscribeStates('lights.*');
    // Or, if you really must, you can also watch all states. Don't do this if you don't need to. Otherwise this will cause a lot of unnecessary load on the system:
    //adapter.subscribeStates('*');
    adapter.subscribeStates('AktTag.*');
    adapter.subscribeStates('PlanSave');
    adapter.subscribeStates('SwitchDay');
    
    //    setState examples
    //    you will notice that each setState will cause the stateChange event to fire (because of above subscribeStates cmd)
    
    // the variable testVariable is set to true as command (ack=false)
    //await adapter.setStateAsync('testVariable', true);
    await adapter.setStateAsync('SwitchDay', 1);

    // same thing, but the value is flagged "ack"
    // ack should be always set to true if the value is received from or acknowledged from the target system
    //await adapter.setStateAsync('testVariable', { val: true, ack: true });

    // same thing, but the state is deleted after 30s (getState will return null afterwards)
    //await adapter.setStateAsync('testVariable', { val: true, ack: true, expire: 30 });
    
    // examples for the checkPassword/checkGroup functions
    adapter.checkPassword('admin', 'iobroker', (res) => {
        adapter.log.info('check user admin pw iobroker: ' + res);
    });
    
    adapter.checkGroup('admin', 'admin', (res) => {
        adapter.log.info('check group user admin group admin: ' + res);
    });
}

// @ts-ignore parent is a valid property on module
if (module.parent) {
    // Export startAdapter in compact mode
    module.exports = startAdapter;
} else {
    // otherwise start the instance directly
    startAdapter();
}